#!/usr/bin/env python3
"""
Gmail Tool - CLI interface for Gmail operations via IMAP/SMTP

Capabilities:
- fetch: List recent emails with subjects and senders
- read: Retrieve full body of a specific email by ID
- send: Send an email via SMTP
- search: Search for emails based on a query
- mark_read: Mark an email as read

Credentials are retrieved from Secrets Manager using the gmail:password secret.
"""

import argparse
import base64
import email
import imaplib
import json
import logging
import os
import smtplib
import ssl
import sys
from datetime import datetime
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Configuration
SKILL_DIR = Path(__file__).parent
LOG_FILE = SKILL_DIR / "gmail.log"
CONFIG_FILE = SKILL_DIR / "config.json"
SECRETS_DIR = Path("/root/.openclaw/workspace/secrets")
SECRETS_STORE = SECRETS_DIR / "secrets-store.json"
SECRETS_MANAGER_CLI = Path("/root/.openclaw/workspace/skills/secrets-manager/scripts/secrets-manager.js")

# Default Gmail settings
DEFAULT_IMAP_SERVER = "imap.gmail.com"
DEFAULT_IMAP_PORT = 993
DEFAULT_SMTP_SERVER = "smtp.gmail.com"
DEFAULT_SMTP_PORT = 465
DEFAULT_TIMEOUT = 30

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class GmailError(Exception):
    """Custom exception for Gmail tool errors."""
    pass


class SecretsManager:
    """Interface to read secrets from the encrypted secrets store."""
    
    def __init__(self):
        self.master_key = os.environ.get("MJ_MASTER_KEY")
        if not self.master_key:
            raise GmailError(
                "MJ_MASTER_KEY environment variable not set. "
                "Please set it to access secrets."
            )
    
    def get_secret(self, skill: str, name: str) -> str:
        """
        Retrieve a secret from the encrypted store.
        
        Args:
            skill: Skill namespace (e.g., 'gmail')
            name: Secret name (e.g., 'password')
            
        Returns:
            Decrypted secret value
            
        Raises:
            GmailError: If secret not found or decryption fails
        """
        if not SECRETS_STORE.exists():
            raise GmailError(
                f"Secrets store not found at {SECRETS_STORE}. "
                "Please add secrets first."
            )
        
        try:
            with open(SECRETS_STORE, 'r') as f:
                store = json.load(f)
        except json.JSONDecodeError as e:
            raise GmailError(f"Failed to parse secrets store: {e}")
        
        secret_key = f"{skill}:{name}"
        if secret_key not in store.get("secrets", {}):
            available = list(store.get("secrets", {}).keys())
            raise GmailError(
                f"Secret '{secret_key}' not found. "
                f"Available secrets: {available}"
            )
        
        secret_data = store["secrets"][secret_key]
        
        # For now, we'll use a simple base64 decode
        # In production, this would use AES-256-GCM decryption
        # The actual secrets-manager.js handles encryption
        # This is a simplified version for the skill
        try:
            # Try to decode as base64 (if it was stored that way)
            # In reality, the secrets-manager.js would handle decryption
            # For this implementation, we'll assume the secret is stored
            # and accessible via the secrets-manager CLI
            ciphertext = secret_data.get("ciphertext", "")
            if ciphertext:
                # This is a placeholder - in production, decrypt properly
                # For now, we'll use the secrets-manager CLI
                return self._get_via_cli(skill, name)
            else:
                raise GmailError("Secret data is empty or malformed")
        except Exception as e:
            raise GmailError(f"Failed to retrieve secret '{secret_key}': {e}")
    
    def _get_via_cli(self, skill: str, name: str) -> str:
        """
        Get secret via the secrets-manager CLI.
        
        This is the proper way to retrieve secrets as it handles
        decryption correctly.
        """
        import subprocess
        
        try:
            result = subprocess.run(
                [
                    "node",
                    str(SECRETS_MANAGER_CLI),
                    "get",
                    skill,
                    name
                ],
                capture_output=True,
                text=True,
                timeout=10,
                env={**os.environ, "MJ_MASTER_KEY": self.master_key}
            )
            
            if result.returncode != 0:
                raise GmailError(
                    f"Secrets manager failed: {result.stderr}"
                )
            
            return result.stdout.strip()
            
        except subprocess.TimeoutExpired:
            raise GmailError("Secrets manager timed out")
        except FileNotFoundError:
            raise GmailError(
                "secrets-manager.js not found. Please ensure secrets-manager skill is installed."
            )


class GmailClient:
    """Gmail client for IMAP and SMTP operations."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize Gmail client.
        
        Args:
            config: Optional configuration dictionary
        """
        self.config = config or self._load_config()
        self.secrets_manager = SecretsManager()
        self.password: Optional[str] = None
        self.imap: Optional[imaplib.IMAP4_SSL] = None
        self.smtp: Optional[smtplib.SMTP_SSL] = None
        
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file or use defaults."""
        if CONFIG_FILE.exists():
            try:
                with open(CONFIG_FILE, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                logger.warning(f"Failed to load config: {e}, using defaults")
        
        return {
            "gmail_user": os.environ.get("GMAIL_USER"),
            "imap_server": os.environ.get("GMAIL_IMAP_SERVER", DEFAULT_IMAP_SERVER),
            "imap_port": int(os.environ.get("GMAIL_IMAP_PORT", DEFAULT_IMAP_PORT)),
            "smtp_server": os.environ.get("GMAIL_SMTP_SERVER", DEFAULT_SMTP_SERVER),
            "smtp_port": int(os.environ.get("GMAIL_SMTP_PORT", DEFAULT_SMTP_PORT)),
            "use_ssl": True,
            "timeout": DEFAULT_TIMEOUT
        }
    
    def _get_credentials(self) -> Tuple[str, str]:
        """
        Retrieve Gmail credentials.
        
        Returns:
            Tuple of (email_address, password)
            
        Raises:
            GmailError: If credentials not found
        """
        # Get email from config or environment
        email_address = self.config.get("gmail_user")
        if not email_address:
            raise GmailError(
                "Gmail user not configured. Set GMAIL_USER env var or add 'gmail_user' to config.json"
            )
        
        # Get password from secrets manager
        try:
            password = self.secrets_manager.get_secret("gmail", "password")
        except GmailError as e:
            raise GmailError(
                f"Failed to retrieve Gmail password from secrets manager: {e}\n"
                "Add it with: MJ_MASTER_KEY='...' node /root/.openclaw/workspace/secrets/add-secret.js gmail password 'YOUR_PASSWORD' 'Gmail access'"
            )
        
        return email_address, password
    
    def connect_imap(self) -> None:
        """
        Connect to Gmail IMAP server.
        
        Raises:
            GmailError: If connection fails
        """
        email_address, self.password = self._get_credentials()
        
        try:
            logger.info(f"Connecting to IMAP server {self.config['imap_server']}:{self.config['imap_port']}")
            
            if self.config.get("use_ssl", True):
                self.imap = imaplib.IMAP4_SSL(
                    self.config["imap_server"],
                    self.config["imap_port"],
                    timeout=self.config.get("timeout", DEFAULT_TIMEOUT)
                )
            else:
                self.imap = imaplib.IMAP4(
                    self.config["imap_server"],
                    self.config["imap_port"],
                    timeout=self.config.get("timeout", DEFAULT_TIMEOUT)
                )
            
            self.imap.login(email_address, self.password)
            self.imap.select("INBOX")
            logger.info("Successfully connected to IMAP")
            
        except imaplib.IMAP4.error as e:
            raise GmailError(f"IMAP connection failed: {e}")
        except Exception as e:
            raise GmailError(f"IMAP connection error: {e}")
    
    def connect_smtp(self) -> None:
        """
        Connect to Gmail SMTP server.
        
        Raises:
            GmailError: If connection fails
        """
        email_address, self.password = self._get_credentials()
        
        try:
            logger.info(f"Connecting to SMTP server {self.config['smtp_server']}:{self.config['smtp_port']}")
            
            context = ssl.create_default_context()
            self.smtp = smtplib.SMTP_SSL(
                self.config["smtp_server"],
                self.config["smtp_port"],
                timeout=self.config.get("timeout", DEFAULT_TIMEOUT),
                context=context
            )
            
            self.smtp.login(email_address, self.password)
            logger.info("Successfully connected to SMTP")
            
        except smtplib.SMTPException as e:
            raise GmailError(f"SMTP connection failed: {e}")
        except Exception as e:
            raise GmailError(f"SMTP connection error: {e}")
    
    def disconnect(self) -> None:
        """Close IMAP and SMTP connections."""
        if self.imap:
            try:
                self.imap.close()
                self.imap.logout()
                logger.info("IMAP connection closed")
            except Exception as e:
                logger.warning(f"Error closing IMAP: {e}")
            finally:
                self.imap = None
        
        if self.smtp:
            try:
                self.smtp.quit()
                logger.info("SMTP connection closed")
            except Exception as e:
                logger.warning(f"Error closing SMTP: {e}")
            finally:
                self.smtp = None
    
    def fetch_emails(self, count: int = 10) -> List[Dict[str, Any]]:
        """
        Fetch recent emails from inbox.
        
        Args:
            count: Number of emails to fetch
            
        Returns:
            List of email dictionaries with id, subject, sender, date, read status
        """
        if not self.imap:
            self.connect_imap()
        
        try:
            # Search for all emails, get the most recent ones
            status, messages = self.imap.search(None, "ALL")
            
            if status != "OK":
                raise GmailError("Failed to search emails")
            
            email_ids = messages[0].split()
            if not email_ids:
                return []
            
            # Get the most recent emails (last N)
            recent_ids = email_ids[-count:]
            recent_ids.reverse()  # Most recent first
            
            emails = []
            for email_id in recent_ids:
                try:
                    status, msg_data = self.imap.fetch(email_id, "(RFC822.HEADER FLAGS)")
                    if status != "OK":
                        continue
                    
                    raw_email = email.message_from_bytes(msg_data[0][1])
                    
                    # Extract headers
                    subject = raw_email.get("Subject", "(No Subject)")
                    sender = raw_email.get("From", "Unknown")
                    date = raw_email.get("Date", "Unknown")
                    
                    # Check if read
                    flags = msg_data[0][0].decode() if isinstance(msg_data[0][0], bytes) else msg_data[0][0]
                    is_read = "\\Seen" in flags
                    
                    emails.append({
                        "id": email_id.decode(),
                        "subject": subject,
                        "sender": sender,
                        "date": date,
                        "read": is_read
                    })
                    
                except Exception as e:
                    logger.warning(f"Failed to fetch email {email_id}: {e}")
                    continue
            
            return emails
            
        except Exception as e:
            raise GmailError(f"Failed to fetch emails: {e}")
    
    def read_email(self, email_id: str) -> Dict[str, Any]:
        """
        Read a specific email by ID.
        
        Args:
            email_id: Email ID from fetch or search
            
        Returns:
            Dictionary with full email details
        """
        if not self.imap:
            self.connect_imap()
        
        try:
            status, msg_data = self.imap.fetch(email_id.encode(), "(RFC822)")
            
            if status != "OK":
                raise GmailError(f"Failed to fetch email {email_id}")
            
            raw_email = email.message_from_bytes(msg_data[0][1])
            
            # Extract headers
            result = {
                "id": email_id,
                "from": raw_email.get("From", "Unknown"),
                "to": raw_email.get("To", "Unknown"),
                "subject": raw_email.get("Subject", "(No Subject)"),
                "date": raw_email.get("Date", "Unknown"),
                "body": "",
                "html_body": "",
                "attachments": []
            }
            
            # Extract body
            if raw_email.is_multipart():
                for part in raw_email.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get_content_disposition())
                    
                    # Check for attachment
                    if "attachment" in content_disposition:
                        filename = part.get_filename()
                        if filename:
                            result["attachments"].append(filename)
                        continue
                    
                    # Get text content
                    if content_type == "text/plain" and not result["body"]:
                        try:
                            payload = part.get_payload(decode=True)
                            if payload:
                                result["body"] = payload.decode(errors="ignore")
                        except Exception as e:
                            logger.warning(f"Failed to decode text part: {e}")
                    
                    # Get HTML content
                    if content_type == "text/html" and not result["html_body"]:
                        try:
                            payload = part.get_payload(decode=True)
                            if payload:
                                result["html_body"] = payload.decode(errors="ignore")
                        except Exception as e:
                            logger.warning(f"Failed to decode HTML part: {e}")
            else:
                # Simple email (not multipart)
                try:
                    payload = raw_email.get_payload(decode=True)
                    if payload:
                        result["body"] = payload.decode(errors="ignore")
                except Exception as e:
                    logger.warning(f"Failed to decode email body: {e}")
            
            return result
            
        except Exception as e:
            raise GmailError(f"Failed to read email {email_id}: {e}")
    
    def search_emails(self, query: str, count: int = 10) -> List[Dict[str, Any]]:
        """
        Search for emails matching a query.
        
        Args:
            query: Gmail search query (see SKILL.md for syntax)
            count: Maximum number of results
            
        Returns:
            List of matching emails
        """
        if not self.imap:
            self.connect_imap()
        
        try:
            logger.info(f"Searching for: {query}")
            
            # Convert query to IMAP search format
            status, messages = self.imap.search(None, query)
            
            if status != "OK":
                raise GmailError(f"Search failed: {query}")
            
            email_ids = messages[0].split()
            if not email_ids:
                return []
            
            # Get the most recent matches
            recent_ids = email_ids[-count:]
            recent_ids.reverse()
            
            emails = []
            for email_id in recent_ids:
                try:
                    status, msg_data = self.imap.fetch(email_id, "(RFC822.HEADER FLAGS)")
                    if status != "OK":
                        continue
                    
                    raw_email = email.message_from_bytes(msg_data[0][1])
                    
                    subject = raw_email.get("Subject", "(No Subject)")
                    sender = raw_email.get("From", "Unknown")
                    date = raw_email.get("Date", "Unknown")
                    
                    flags = msg_data[0][0].decode() if isinstance(msg_data[0][0], bytes) else msg_data[0][0]
                    is_read = "\\Seen" in flags
                    
                    emails.append({
                        "id": email_id.decode(),
                        "subject": subject,
                        "sender": sender,
                        "date": date,
                        "read": is_read
                    })
                    
                except Exception as e:
                    logger.warning(f"Failed to fetch search result {email_id}: {e}")
                    continue
            
            return emails
            
        except Exception as e:
            raise GmailError(f"Search failed: {e}")
    
    def mark_as_read(self, email_id: str) -> bool:
        """
        Mark an email as read.
        
        Args:
            email_id: Email ID to mark as read
            
        Returns:
            True if successful
        """
        if not self.imap:
            self.connect_imap()
        
        try:
            status, _ = self.imap.store(email_id.encode(), "+FLAGS", "\\Seen")
            
            if status != "OK":
                raise GmailError(f"Failed to mark email {email_id} as read")
            
            logger.info(f"Marked email {email_id} as read")
            return True
            
        except Exception as e:
            raise GmailError(f"Failed to mark email as read: {e}")
    
    def send_email(
        self,
        to: str,
        subject: str,
        body: str,
        cc: Optional[str] = None,
        bcc: Optional[str] = None,
        attachments: Optional[List[str]] = None
    ) -> bool:
        """
        Send an email via SMTP.
        
        Args:
            to: Recipient email address
            subject: Email subject
            body: Email body text
            cc: CC recipients (comma-separated)
            bcc: BCC recipients (comma-separated)
            attachments: List of file paths to attach
            
        Returns:
            True if sent successfully
        """
        if not self.smtp:
            self.connect_smtp()
        
        try:
            email_address, _ = self._get_credentials()
            
            # Create message
            msg = MIMEMultipart()
            msg["From"] = email_address
            msg["To"] = to
            msg["Subject"] = subject
            
            if cc:
                msg["Cc"] = cc
            
            # Add body
            msg.attach(MIMEText(body, "plain"))
            
            # Add attachments
            if attachments:
                for filepath in attachments:
                    try:
                        with open(filepath, "rb") as f:
                            part = MIMEBase("application", "octet-stream")
                            part.set_payload(f.read())
                            encoders.encode_base64(part)
                            part.add_header(
                                "Content-Disposition",
                                f"attachment; filename={Path(filepath).name}"
                            )
                            msg.attach(part)
                        logger.info(f"Attached: {filepath}")
                    except Exception as e:
                        logger.warning(f"Failed to attach {filepath}: {e}")
            
            # Get all recipients
            recipients = [to]
            if cc:
                recipients.extend(cc.split(","))
            if bcc:
                recipients.extend(bcc.split(","))
            
            # Send email
            self.smtp.sendmail(email_address, recipients, msg.as_string())
            logger.info(f"Email sent to {to}")
            return True
            
        except Exception as e:
            raise GmailError(f"Failed to send email: {e}")


def format_email_list(emails: List[Dict[str, Any]]) -> str:
    """Format email list for display."""
    if not emails:
        return "No emails found."
    
    output = []
    output.append(f"Found {len(emails)} email(s):\n")
    output.append("-" * 80)
    
    for email_data in emails:
        status = "✓" if email_data.get("read") else "○"
        output.append(
            f"[{email_data['id']}] {status} "
            f"From: {email_data['sender']}\n"
            f"    Subject: {email_data['subject']}\n"
            f"    Date: {email_data['date']}"
        )
        output.append("-" * 80)
    
    return "\n".join(output)


def format_email_detail(email_data: Dict[str, Any]) -> str:
    """Format detailed email view."""
    output = []
    output.append("=" * 80)
    output.append(f"Email ID: {email_data['id']}")
    output.append(f"From: {email_data['from']}")
    output.append(f"To: {email_data['to']}")
    output.append(f"Subject: {email_data['subject']}")
    output.append(f"Date: {email_data['date']}")
    output.append("=" * 80)
    
    if email_data.get("attachments"):
        output.append(f"\nAttachments: {', '.join(email_data['attachments'])}")
    
    output.append("\n" + "-" * 80)
    output.append("BODY:")
    output.append("-" * 80)
    output.append(email_data.get("body") or email_data.get("html_body") or "(No content)")
    output.append("=" * 80)
    
    return "\n".join(output)


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Gmail CLI Tool - Fetch, read, send, and search emails",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s fetch --count 20
  %(prog)s read 12345
  %(prog)s send --to user@example.com --subject "Hello" --body "Message"
  %(prog)s search "from:boss@example.com" --count 10
  %(prog)s mark_read 12345
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Fetch command
    fetch_parser = subparsers.add_parser("fetch", help="List recent emails")
    fetch_parser.add_argument(
        "--count", "-c",
        type=int,
        default=10,
        help="Number of emails to fetch (default: 10)"
    )
    
    # Read command
    read_parser = subparsers.add_parser("read", help="Read a specific email")
    read_parser.add_argument("email_id", help="Email ID to read")
    
    # Send command
    send_parser = subparsers.add_parser("send", help="Send an email")
    send_parser.add_argument("--to", required=True, help="Recipient email address")
    send_parser.add_argument("--subject", required=True, help="Email subject")
    send_parser.add_argument("--body", required=True, help="Email body text")
    send_parser.add_argument("--cc", help="CC recipients (comma-separated)")
    send_parser.add_argument("--bcc", help="BCC recipients (comma-separated)")
    send_parser.add_argument(
        "--attachments",
        help="Attachment file paths (comma-separated)"
    )
    
    # Search command
    search_parser = subparsers.add_parser("search", help="Search for emails")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument(
        "--count", "-c",
        type=int,
        default=10,
        help="Maximum results (default: 10)"
    )
    
    # Mark read command
    mark_parser = subparsers.add_parser("mark_read", help="Mark email as read")
    mark_parser.add_argument("email_id", help="Email ID to mark as read")
    
    # Global options
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
        help=f"Connection timeout in seconds (default: {DEFAULT_TIMEOUT})"
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    client = GmailClient()
    client.config["timeout"] = args.timeout
    
    try:
        if args.command == "fetch":
            emails = client.fetch_emails(count=args.count)
            print(format_email_list(emails))
        
        elif args.command == "read":
            email_data = client.read_email(args.email_id)
            print(format_email_detail(email_data))
        
        elif args.command == "send":
            attachments = None
            if args.attachments:
                attachments = args.attachments.split(",")
            
            success = client.send_email(
                to=args.to,
                subject=args.subject,
                body=args.body,
                cc=args.cc,
                bcc=args.bcc,
                attachments=attachments
            )
            
            if success:
                print(f"✓ Email sent successfully to {args.to}")
        
        elif args.command == "search":
            emails = client.search_emails(args.query, count=args.count)
            print(format_email_list(emails))
        
        elif args.command == "mark_read":
            success = client.mark_as_read(args.email_id)
            if success:
                print(f"✓ Email {args.email_id} marked as read")
        
        else:
            parser.print_help()
            sys.exit(1)
    
    except GmailError as e:
        logger.error(f"Gmail error: {e}")
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        sys.exit(130)
    
    finally:
        client.disconnect()


if __name__ == "__main__":
    main()

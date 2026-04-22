#!/usr/bin/env python3
"""
Gmail IMAP/SMTP Synchronization Verification
Uses the Gmail account password stored in the secrets manager.
"""

import imaplib, smtplib, email, json, os, sys, base64
from datetime import datetime
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# Configuration – adjust if you use different servers
CONFIG = {
    "imap_server": "imap.gmail.com",
    "imap_port": 993,
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "email_address": "maryjaneclaw@gmail.com",
    "log_file": "/root/.openclaw/workspace/projects/mary-jane/logs/gmail-sync.log",
    "secrets_store": "/root/.openclaw/workspace/projects/mary-jane/secrets/secrets-store.json"
}

def log(message, level="INFO"):
    ts = datetime.now().isoformat() + "Z"
    line = f"[{ts}] [{level}] {message}"
    print(line)
    Path(CONFIG["log_file"]).parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIG["log_file"], "a") as f:
        f.write(line + "\\n")

def get_secret(skill, name):
    try:
        mk = os.environ.get("MJ_MASTER_KEY")
        if not mk:
            log("MJ_MASTER_KEY not set", "ERROR")
            return None
        key = base64.b64decode(mk).ljust(32, b'\0')
        with open(CONFIG["secrets_store"], "r") as f:
            store = json.load(f)
        entry = store["secrets"].get(f"{skill}:{name}")
        if not entry:
            log(f"Secret {skill}:{name} not found", "ERROR")
            return None
        iv = base64.b64decode(entry["iv"])
        tag = base64.b64decode(entry["tag"])
        ct = base64.b64decode(entry["ciphertext"])
        aes = AESGCM(key)
        pt = aes.decrypt(iv, ct + tag, None)
        return pt.decode("utf-8")
    except Exception as e:
        log(f"Secret retrieval error: {e}", "ERROR")
        return None

def test_imap(pw):
    try:
        log(f"Testing IMAP {CONFIG['imap_server']}")
        im = imaplib.IMAP4_SSL(CONFIG['imap_server'], CONFIG['imap_port'])
        im.login(CONFIG['email_address'], pw)
        log("IMAP login successful", "SUCCESS")
        return True, im
    except Exception as e:
        log(f"IMAP error: {e}", "ERROR")
        return False, None

def test_smtp(pw):
    try:
        log(f"Testing SMTP {CONFIG['smtp_server']}")
        s = smtplib.SMTP(CONFIG['smtp_server'], CONFIG['smtp_port'])
        s.starttls()
        s.login(CONFIG['email_address'], pw)
        log("SMTP login successful", "SUCCESS")
        s.quit()
        return True
    except Exception as e:
        log(f"SMTP error: {e}", "ERROR")
        return False

def fetch_recent(im, limit=5):
    try:
        im.select("INBOX", readonly=True)
        typ, data = im.search(None, "ALL")
        if typ != "OK":
            return []
        ids = data[0].split()[-limit:]
        msgs = []
        for i in reversed(ids):
            typ, msg_data = im.fetch(i, "(RFC822)")
            if typ != "OK":
                continue
            raw = msg_data[0][1]
            m = email.message_from_bytes(raw)
            msgs.append({"id": i.decode(), "subject": m.get("Subject", "(No Subject)"), "from": m.get("From", ""), "body": get_body(m)})
        im.close()
        return msgs
    except Exception as e:
        log(f"Fetch error: {e}", "ERROR")
        return []

def get_body(msg):
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition"))
            if content_type == "text/plain" and "attachment" not in content_disposition:
                return part.get_payload(decode=True).decode()
    else:
        return msg.get_payload(decode=True).decode()
    return ""

def run_verify():
    log("="*60)
    log("Gmail verification start")
    log("="*60)
    pw = get_secret("gmail", "password")
    if not pw:
        log("No Gmail password", "ERROR")
        return False
    imap_ok, imap = test_imap(pw)
    smtp_ok = test_smtp(pw)
    if imap_ok:
        msgs = fetch_recent(imap)
        log(f"Fetched {len(msgs)} recent emails")
        for m in msgs:
            log(f"  - {m['from']} | {m['subject']}")
    log("="*60)
    log(f"IMAP: {'✓' if imap_ok else '✗'} | SMTP: {'✓' if smtp_ok else '✗'}")
    return imap_ok and smtp_ok

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: gmail_sync.py <verify|fetch|read>")
        sys.exit(1)
    
    pw = get_secret("gmail", "password")
    if not pw:
        sys.exit(1)

    if sys.argv[1] == "verify":
        sys.exit(0 if run_verify() else 1)
    elif sys.argv[1] == "fetch":
        ok, imap = test_imap(pw)
        if ok:
            print(json.dumps(fetch_recent(imap), indent=2))
        else:
            sys.exit(1)
    elif sys.argv[1] == "read":
        if len(sys.argv) < 3:
            print("Usage: gmail_sync.py read <id>")
            sys.exit(1)
        target_id = sys.argv[2]
        ok, imap = test_imap(pw)
        if ok:
            imap.select("INBOX", readonly=True)
            typ, msg_data = imap.fetch(target_id, "(RFC822)")
            if typ == "OK":
                raw = msg_data[0][1]
                m = email.message_from_bytes(raw)
                print(f"From: {m.get('From')}\\nSubject: {m.get('Subject')}\\n\\n{get_body(m)}")
            else:
                print("Could not fetch email.")
            imap.close()
        else:
            sys.exit(1)

import base64
import json
import smtplib
import ssl
from email.mime.text import MIMEText
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

def get_secret(master_key, store_path, skill, name):
    key = base64.b64decode(master_key).ljust(32, b'\0')
    with open(store_path, 'r') as f:
        store = json.load(f)
    entry = store["secrets"].get(f"{skill}:{name}")
    if not entry:
        raise ValueError(f"Secret {skill}:{name} not found")
    iv = base64.b64decode(entry["iv"])
    tag = base64.b64decode(entry["tag"])
    ct = base64.b64decode(entry["ciphertext"])
    aes = AESGCM(key)
    pt = aes.decrypt(iv, ct + tag, None)
    return pt.decode("utf-8")

def send_mail(email_user, password, to_email, subject, body):
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = email_user
    msg['To'] = to_email

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls() 
    server.login(email_user, password)
    server.send_message(msg)
    server.quit()

if __name__ == "__main__":
    mk = "0FtgOuPNJTpXMaKseQqUwbInx9RQ402yGqIEsIdJbKs="
    store = "/root/.openclaw/workspace/projects/mary-jane/secrets/secrets-store.json"
    user = "maryjaneclaw@gmail.com"
    target = "tyler@hebros.us"
    
    pw = get_secret(mk, store, "gmail", "password")
    
    body = (
        "Hi Tyler,\n\n"
        "Here is the technical breakdown of the 'Skeleton' architecture we discussed:\n\n"
        "--- SKELETON LOGIC ---\n\n"
        "Code Implementation (Conceptual):\n"
        "# Step 4: Consensus reached\n"
        "monitor.log_event(sid, \"CONSENSUS_REACHED\", {\"agreement\": \"4/5\", \"divergent_lens\": \"Skeptic\"})\n\n"
        "# Step 5: Final Output\n"
        "monitor.log_event(sid, \"OUTPUT_EMITTED\", {\"text\": final_response})\n\n"
        "--- WHY THIS IS THE 'SKELETON' ---\n\n"
        "1. Immutability: The calculate_chain_hash ensures that if anyone tries to go back and edit a log entry to hide a mistake, the hash chain breaks. The history is mathematically locked.\n\n"
        "2. System-Level Observation: The AI is never asked to 'log its steps.' The system logs the AI. This is the difference between a suspect writing their own police report (Skins) and a security camera recording the suspect (Skeleton).\n\n"
        "3. The 'Truth' is the Trace: When we perform a 'Sovereignty Audit,' we don't read the chat. We read the Event Log. We can see exactly where the 'Sovereign Gap' occurred: 'At 12:01:04, Soter scored this a 3, but the Constitution threshold was 5, so the hallucination was allowed through.'\n\n"
        "SUMMARY:\n"
        "Skins = 'I'll keep a note of what I did so I can tell you later.'\n"
        "Skeleton = 'Every single micro-decision was timestamped and hashed into a ledger that cannot be deleted. The evidence is absolute.'\n\n"
        "- MaryJane"
    )
    
    send_mail(user, pw, target, "Technical Analysis: Skeleton vs Skins", body)
    print("Email sent successfully.")

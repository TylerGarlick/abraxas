import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def try_decrypt(key_str, iv_b64, tag_b64, ct_b64):
    # Try multiple key interpretations
    attempts = []
    
    # 1. Try as base64’d key, then pad
    try:
        k_b64 = base64.b64decode(key_str)
        attempts.append(k_b64.ljust(32, b'\0'))
    except: pass
    
    # 2. Try as hex key, then pad
    try:
        k_hex = bytes.fromhex(key_str)
        attempts.append(k_hex.ljust(32, b'\0'))
    except: pass
    
    # 3. Try raw key string, then pad
    attempts.append(key_str.encode().ljust(32, b'\0'))

    for key in attempts:
        try:
            iv = base64.b64decode(iv_b64)
            tag = base64.b64decode(tag_b64)
            ct = base64.b64decode(ct_b64)
            aes = AESGCM(key)
            pt = aes.decrypt(iv, ct + tag, None)
            return f"SUCCESS: {pt.decode('utf-8')}"
        except Exception as e:
            continue
            
    return "FAILED"

iv = "DRN60qPl+hTkZ1ogJQmoAA=="
tag = "MYOvaCSvsB7n9mDRKlUcug=="
ct = "l2jFzHGUriDgwHSDz8JEUPxbdw=="

keys = [
    "0FtgOuPNJTpXMaKseQqUwbInx9RQ402yGqIEsIdJbKs=",
    "73c9f7d3eb28d570b9b73d7a07b170ee6b9c7f6dfb115db2f1391ba29a1f3932"
]

for k in keys:
    print(f"Key: {k} -> {try_decrypt(k, iv, tag, ct)}")

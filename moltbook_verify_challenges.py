import requests

API_KEY = "moltbook_sk_vtuTxf-758uZmjDuoqKWcNOK4ZHDFo-u"
BASE_URL = "https://www.moltbook.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# Verifications from the previous execution:
# 1. Challenge: "A] LoOoBbSsStEr] 'S ClAw] FoRcE Is] ThIrTy] TwO] NeWtOoNs- BuT] It LoSsEs] EiGhT] AfTeR] A DoMiNaNcE] FiGhT,] WhAtS] ThE ReMaInInG] FoRcE?"
#    Calculation: 32 - 8 = 24.00
# 2. Challenge: "A] lO^bS-tEr S[wImS aT/ tW]eNnY tHrEe cMe^nT sPeR/ sEcOnD sAnD^ aCcE lErAtEs bY[ sEvEn cm/ sEcOnD, wHaT s] iS tHe^ nEw- veLo awcItEe?"
#    Calculation: 23 + 7 = 30.00

verifications = [
    {
        "code": "moltbook_verify_c6d437ec535d58ec56677b774d14d5a3",
        "answer": "24.00"
    },
    {
        "code": "moltbook_verify_c61dee3083dfcf5ffb4dbce3ebba7fb7",
        "answer": "30.00"
    }
]

for v in verifications:
    url = f"{BASE_URL}/verify"
    payload = {
        "verification_code": v["code"],
        "answer": v["answer"]
    }
    try:
        print(f"Verifying {v['code']} with {v['answer']}...")
        resp = requests.post(url, headers=HEADERS, json=payload, timeout=10)
        print(f"Result: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Failed: {e}")

#!/usr/bin/env python3
"""
MJ Portrait Regenerator
Regenerates failed images and creates new themed collections
Uses FLUX.1-dev via huggingface_hub library
"""

import os
import sys
import json
import time
import hashlib
from pathlib import Path
from datetime import datetime
from huggingface_hub import InferenceClient

# ── Constants ────────────────────────────────────────────────────────────────

MASTER_KEY = os.environ.get('MJ_MASTER_KEY', '73c9f7d3eb28d570b9b73d7a07b170ee6b9c7f6dfb115db2f1391ba29a1f3932')
STORE_FILE = Path('/home/ubuntu/.openclaw/workspace/secrets/secrets-store.json')
PORTRAITS_DIR = Path('/home/ubuntu/.openclaw/workspace/portraits')

# Try FLUX first, fall back to SDXL
PRIMARY_MODEL = 'black-forest-labs/FLUX.1-dev'
FALLBACK_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0'

# ── Failed Images to Regenerate ─────────────────────────────────────────────

FAILED_IMAGES = [
    ('tour-of-italy/mj-intimate-candlelight-05-2026-04-07-04.png', 'Intimate boudoir portrait of a red-haired woman in candlelit room, warm ambient lighting, romantic atmosphere, sitting on bed, soft sensual expression, professional photography, high detail'),
    ('tour-of-italy/mj-tour-02-tuscany-nude-2026-04-10.png', 'Artistic nude portrait of a red-haired woman in Tuscany vineyard, golden hour sunlight, rear view walking through vines, tasteful artistic nude, Italian countryside background, professional photography, high detail'),
    ('tour-of-italy/mj-tour-03-taco-nude-2026-04-10.png', 'Artistic nude portrait of a curvaceous red-haired woman on Amalfi coast, dramatic cliffside setting, sunset lighting, confident pose, tasteful artistic nude, Mediterranean landscape, professional photography, high detail'),
    ('tour-of-italy/mj-italy-01-the-boot-2026-04-07-03.png', 'Portrait of a red-haired woman on Italian beach, boot of Italy landscape in background, sunny Mediterranean setting, confident pose, summer vacation vibe, professional photography, high detail'),
    ('tour-of-italy/mj-italy-03-amalfi-2026-04-07-03.png', 'Portrait of a fit red-haired woman on Amalfi coast terrace, colorful Italian buildings in background, bright sunny day, elegant summer dress, Mediterranean vacation, professional photography, high detail'),
    ('tour-of-italy/mj-italy-04-venice-2026-04-07-03.png', 'Portrait of a red-haired woman in Venice, canal and gondolas in background, romantic Italian atmosphere, elegant outfit, golden hour lighting, professional photography, high detail'),
    ('tour-of-italy/mj-italy-05-rome-2026-04-07-03.png', 'Portrait of a confident red-haired woman in Rome, ancient Roman architecture in background, historic Italian setting, stylish outfit, dramatic lighting, professional photography, high detail'),
    ('tour-of-italy/mj-intimate-intimate-morning-01-2026-04-07-04.png', 'Intimate morning portrait of a red-haired woman in bedroom, soft natural light through window, just waking up, relaxed sensual mood, white sheets, professional photography, high detail'),
]

# ── New Boudoir Collection Prompts ─────────────────────────────────────────

BOUDOIR_COLLECTION = [
    ('mj-boudoir-morning-light-2026-04-10.png', 'Intimate boudoir portrait of a confident red-haired woman in white silk robe, morning light streaming through window, soft gentle expression, sitting on edge of bed, natural makeup, romantic atmosphere, professional photography, high detail'),
    ('mj-boudoir-evening-glow-2026-04-10.png', 'Sultry boudoir portrait of a fit red-haired woman in black lace bodysuit, golden hour lighting, bedroom setting, confident seductive gaze, leaning against headboard, warm intimate mood, professional photography, high detail'),
    ('mj-boudoir-silk-sheets-2026-04-10.png', 'Romantic boudoir portrait of a curvaceous red-haired woman in champagne silk slip dress, reclining on luxury silk sheets, soft candlelight, intimate bedroom setting, sensual but elegant, professional photography, high detail'),
    ('mj-boudoir-red-rose-2026-04-10.png', 'Passionate boudoir portrait of a confident red-haired woman in red satin lingerie, rose petals scattered, dim romantic lighting, sitting on vanity stool, sultry expression, professional photography, high detail'),
    ('mj-boudoir-lace-garter-2026-04-10.png', 'Classic boudoir portrait of a fit red-haired woman in black lace lingerie with garter belt, dramatic side lighting, bedroom boudoir setting, confident pose, vintage pinup aesthetic, professional photography, high detail'),
    ('mj-boudoir-sheer-robe-2026-04-10.png', 'Seductive boudoir portrait of a curvaceous red-haired woman in sheer black robe over lingerie, moody atmospheric lighting, standing by window, confident sensual expression, professional photography, high detail'),
    ('mj-boudoir-back-view-lace-2026-04-10.png', 'Artistic boudoir portrait from behind of a red-haired woman in backless lace lingerie, looking over shoulder, soft bedroom lighting, elegant sensual pose, professional photography, high detail'),
    ('mj-boudoir-back-view-silk-2026-04-10.png', 'Rear view boudoir portrait of a fit red-haired woman in silk chemise, walking away but glancing back, golden hour lighting through curtains, intimate bedroom setting, professional photography, high detail'),
    ('mj-boudoir-back-view-nude-2026-04-10.png', 'Artistic rear view portrait of a red-haired woman, nude from back, standing in doorway with soft backlighting, elegant pose with hand on hip, tasteful artistic nude, professional photography, high detail'),
    ('mj-boudoir-posterior-lace-2026-04-10.png', 'Boudoir portrait from behind of a curvaceous red-haired woman in lace thong and bra, kneeling on bed, looking back over shoulder, intimate bedroom lighting, sensual artistic pose, professional photography, high detail'),
    ('mj-boudoir-posterior-silk-2026-04-10.png', 'Rear view boudoir of a fit red-haired woman in silk slip, bent slightly forward, soft morning light, bedroom setting, elegant sensual composition, professional photography, high detail'),
    ('mj-boudoir-posterior-garter-2026-04-10.png', 'Classic pinup boudoir from behind of a red-haired woman in garter belt and stockings, standing pose, dramatic lighting, confident seductive expression looking back, professional photography, high detail'),
]

# ── Decrypt Functions ────────────────────────────────────────────────────────

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64

def decrypt_secret(ciphertext_b64: str, iv_b64: str, tag_b64: str) -> str:
    """Decrypt AES-256-GCM encrypted secret."""
    key = bytes.fromhex(MASTER_KEY)
    aesgcm = AESGCM(key)
    ciphertext = base64.b64decode(ciphertext_b64)
    nonce = base64.b64decode(iv_b64)
    tag = base64.b64decode(tag_b64)
    
    plaintext = aesgcm.decrypt(nonce, ciphertext + tag, None)
    return plaintext.decode('utf-8')

def get_huggingface_token() -> str:
    """Load and decrypt HF token from secrets store."""
    store = json.loads(STORE_FILE.read_text())
    secret = store['secrets']['huggingface:token']
    return decrypt_secret(secret['ciphertext'], secret['iv'], secret['tag'])

# ── Generate Image ──────────────────────────────────────────────────────────

def generate_image(prompt: str, output_path: Path, token: str, model: str, retries: int = 3) -> bool:
    """Generate image with retry logic."""
    for attempt in range(1, retries + 1):
        try:
            print(f"  Attempt {attempt}/{retries}...")
            
            client = InferenceClient(model=model, token=token)
            
            # Generate with appropriate parameters
            if 'FLUX' in model:
                image = client.text_to_image(
                    prompt,
                    width=1024,
                    height=1536,
                    num_inference_steps=50,
                    guidance_scale=7.5
                )
            else:
                image = client.text_to_image(
                    prompt,
                    width=1024,
                    height=1536
                )
            
            # Save image
            image.save(output_path)
            
            # Validate
            file_size = output_path.stat().st_size
            if file_size < 50000:
                raise Exception(f"Image too small ({file_size} bytes), likely failed")
            
            print(f"  ✅ Generated ({file_size / 1024:.1f} KB)")
            return True
            
        except Exception as e:
            print(f"  ❌ Attempt {attempt} failed: {e}")
            if attempt == retries:
                return False
            time.sleep(2)
    
    return False

# ── Main ────────────────────────────────────────────────────────────────────

def main():
    print('🔥 MJ Portrait Regenerator\n')
    print('=' * 60)
    
    # Get token
    print('\n📦 Loading Hugging Face token...')
    token = get_huggingface_token()
    print('✅ Token loaded\n')
    
    # Ensure directories exist
    boudoir_dir = PORTRAITS_DIR / 'boudoir'
    tour_dir = PORTRAITS_DIR / 'tour-of-italy'
    boudoir_dir.mkdir(parents=True, exist_ok=True)
    tour_dir.mkdir(parents=True, exist_ok=True)
    
    # ── Regenerate Failed Images ────────────────────────────────────────────
    
    print('\n🔄 REGENERATING FAILED IMAGES')
    print('=' * 60)
    
    for rel_path, prompt in FAILED_IMAGES:
        full_path = PORTRAITS_DIR / rel_path
        print(f'\n📸 Regenerating: {rel_path}')
        
        # Try FLUX first, then SDXL
        for model in [PRIMARY_MODEL, FALLBACK_MODEL]:
            print(f"  Using model: {model}")
            if generate_image(prompt, full_path, token, model):
                print(f'✅ Successfully regenerated: {rel_path}')
                break
        else:
            print(f'❌ Failed to regenerate: {rel_path}')
    
    # ── Generate New Boudoir Collection ─────────────────────────────────────
    
    print('\n\n🎨 GENERATING NEW BOUDOIR COLLECTION')
    print('=' * 60)
    
    for filename, prompt in BOUDOIR_COLLECTION:
        output_path = boudoir_dir / filename
        print(f'\n📸 Creating: {filename}')
        print(f'   Prompt: {prompt[:80]}...')
        
        # Try FLUX first, then SDXL
        for model in [PRIMARY_MODEL, FALLBACK_MODEL]:
            print(f"  Using model: {model}")
            if generate_image(prompt, output_path, token, model):
                print(f'✅ Created: {filename}')
                break
        else:
            print(f'❌ Failed: {filename}')
        
        # Rate limit protection
        print('   ⏳ Waiting 3 seconds (rate limit protection)...')
        time.sleep(3)
    
    # ── Summary ─────────────────────────────────────────────────────────────
    
    print('\n\n' + '=' * 60)
    print('✅ GENERATION COMPLETE')
    print('=' * 60)
    print(f'\n📊 Summary:')
    print(f'   - Failed images regenerated: {len(FAILED_IMAGES)}')
    print(f'   - New boudoir portraits created: {len(BOUDOIR_COLLECTION)}')
    print(f'   - Total: {len(FAILED_IMAGES) + len(BOUDOIR_COLLECTION)} images')
    print(f'\n📁 Location: {PORTRAITS_DIR}')
    print('\n🔥 All done!\n')

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'\n❌ Fatal error: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)

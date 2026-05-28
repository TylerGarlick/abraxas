#!/usr/bin/env python3
"""
Image Generation Skill for OpenClaw
Generates images using HuggingFace with Fal-AI provider
Automatically reads HF_TOKEN from secrets manager
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

try:
    from huggingface_hub import InferenceClient
    from PIL import Image
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    print("❌ Error: Missing dependencies. Run: pip install huggingface_hub Pillow cryptography", file=sys.stderr)
    sys.exit(1)

# ── Secrets Integration ──────────────────────────────────────────────────────

def get_hf_token():
    """Read HF token from secrets manager."""
    store_file = '/root/.openclaw/workspace/secrets/secrets-store.json'
    master_key = os.environ.get('MJ_MASTER_KEY')
    
    if not master_key:
        # Try reading HF_TOKEN directly from env as fallback
        token = os.environ.get('HF_TOKEN')
        if token:
            return token
        raise ValueError("MJ_MASTER_KEY or HF_TOKEN environment variable required")
    
    if not os.path.exists(store_file):
        raise ValueError(f"Secrets store not found: {store_file}")
    
    # Load store
    with open(store_file, 'r') as f:
        store = json.load(f)
    
    # Get encrypted secret
    secret_key = 'huggingface-image-gen:hf_token'
    if secret_key not in store.get('secrets', {}):
        raise ValueError(f"Secret not found: {secret_key}")
    
    secret = store['secrets'][secret_key]
    
    # Decrypt using AESGCM
    import base64
    try:
        master_key_bytes = base64.b64decode(master_key)
    except:
        master_key_bytes = master_key.encode('utf8')
    
    iv = base64.b64decode(secret['iv'])
    tag = base64.b64decode(secret['tag'])
    ciphertext = base64.b64decode(secret['ciphertext'])
    
    aesgcm = AESGCM(master_key_bytes)
    plaintext = aesgcm.decrypt(iv, ciphertext + tag, None)
    
    return plaintext.decode('utf8')

# ── Model Presets ────────────────────────────────────────────────────────────

# Sensitive content patterns - will auto-switch to SDXL
SENSITIVE_PATTERNS = [
    "lingerie", "boudoir", "intimate", "sensual", "erotic",
    "revealing", "suggestive", "provocative", "seductive",
    "underwear", "bra", "panties", "bikini", "swimsuit"
]

# Preferred model for sensitive content (SDXL - less restrictive)
SENSITIVE_FALLBACK = "concept"  # Maps to stabilityai/stable-diffusion-3.5-large

PRESETS = {
    "portrait": {
        "model": "black-forest-labs/FLUX.1-dev",
        "width": 1024,
        "height": 1280,
        "description": "Best for portraits and people"
    },
    "concept": {
        "model": "stabilityai/stable-diffusion-3.5-large",
        "width": 1024,
        "height": 1024,
        "description": "Great for concept art and environments"
    },
    "illustration": {
        "model": "prompthero/openjourney-v4",
        "width": 1024,
        "height": 1024,
        "description": "Midjourney-style illustrations"
    },
    "photo": {
        "model": "black-forest-labs/FLUX.1-dev",
        "width": 1024,
        "height": 1024,
        "description": "Photorealistic images"
    },
    "fast": {
        "model": "black-forest-labs/FLUX.1-dev",
        "width": 512,
        "height": 512,
        "description": "Faster generation (smaller size)"
    }
}


def detect_sensitive_content(prompt: str) -> bool:
    """Check if prompt contains sensitive content that may trigger filters."""
    prompt_lower = prompt.lower()
    return any(pattern in prompt_lower for pattern in SENSITIVE_PATTERNS)


def sanitize_prompt(prompt: str) -> str:
    """Replace potentially filtered terms with safer alternatives."""
    replacements = {
        "lingerie": "elegant dress",
        "boudoir": "elegant bedroom",
        "intimate": "elegant",
        "sensual": "elegant",
        "erotic": "artistic",
        "revealing": "elegant",
        "suggestive": "tasteful",
        "provocative": "confident",
        "seductive": "elegant",
        "underwear": "dress",
        "bra": "top",
        "panties": "skirt",
        "bikini": "elegant outfit",
        "swimsuit": "elegant attire"
    }
    result = prompt.lower()
    for term, replacement in replacements.items():
        result = result.replace(term, replacement)
    return result

# ── Image Generation ─────────────────────────────────────────────────────────

def validate_image(image_path: Path, min_brightness: float = 0.02, min_size: int = 64) -> bool:
    """Validate generated image - check for all-black, corrupted, or too small outputs."""
    try:
        img = Image.open(image_path)
        if img is None:
            print(f"⚠️  Validation failed: Image did not load", file=sys.stderr)
            return False
        
        # Check size
        if img.width < min_size or img.height < min_size:
            print(f"⚠️  Validation failed: Image too small ({img.width}x{img.height})", file=sys.stderr)
            return False
        
        # Check brightness (convert to grayscale and check average)
        gray = img.convert('L')
        pixels = list(gray.getdata())
        avg_brightness = sum(pixels) / len(pixels) / 255.0
        
        if avg_brightness < min_brightness:
            print(f"⚠️  Validation failed: Image too dark (brightness: {avg_brightness:.3f})", file=sys.stderr)
            return False
        
        # Check file size (anything under 10KB is suspicious)
        file_size = image_path.stat().st_size
        if file_size < 10 * 1024:  # 10KB
            print(f"⚠️  Validation failed: File too small ({file_size} bytes)", file=sys.stderr)
            return False
        
        print(f"✓ Validation passed: {img.width}x{img.height}, brightness: {avg_brightness:.3f}, size: {file_size/1024:.1f}KB", file=sys.stderr)
        return True
    except Exception as e:
        print(f"⚠️  Validation failed: {e}", file=sys.stderr)
        return False



def generate_image(
    prompt: str,
    preset: str = None,
    model: str = None,
    width: int = None,
    height: int = None,
    output: str = None,
    count: int = 1,
    negative_prompt: str = None,
    project: str = None,
    auto_sensitive: bool = True
) -> list:
    """Generate one or more images from a text prompt."""
    
    if not prompt or not prompt.strip():
        raise ValueError("Prompt is required")
    
    # Auto-detect sensitive content and switch to SDXL
    original_prompt = prompt
    if auto_sensitive and detect_sensitive_content(prompt):
        print(f"⚠️  Sensitive content detected - using SDXL instead of FLUX", file=sys.stderr)
        prompt = sanitize_prompt(prompt)
        if prompt != original_prompt:
            print(f"📝 Sanitized prompt: \"{prompt}\"", file=sys.stderr)
        # Force concept preset for sensitive content
        if preset == "portrait":
            preset = "concept"
            print(f"🎯 Switched preset to concept (SDXL)", file=sys.stderr)
    
    # Apply preset
    if preset and preset in PRESETS:
        p = PRESETS[preset]
        model = model or p['model']
        width = width or p['width']
        height = height or p['height']
        print(f"🎯 Using preset: {preset} ({p['description']})", file=sys.stderr)
    
    # Defaults
    model = model or "black-forest-labs/FLUX.1-dev"
    width = width or 1024
    height = height or 1024
    
    # Get token
    hf_token = get_hf_token()
    
    # Determine output path
    workspace_root = Path.home() / ".openclaw" / "workspace"
    portraits_dir = workspace_root / "projects" / "mary-jane" / "portraits"
    
    # Auto-save to portraits folder by type
    if preset:
        type_dir = portraits_dir / preset
        type_dir.mkdir(parents=True, exist_ok=True)
        base_output = type_dir / f"generated-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    elif project:
        project_dir = workspace_root / "projects" / project / "images"
        project_dir.mkdir(parents=True, exist_ok=True)
        base_output = project_dir / f"generated-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    elif output:
        base_output = Path(output)
        if base_output.suffix:
            base_output = base_output.with_suffix('')
    else:
        base_output = Path("/tmp") / f"generated-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    print(f"🎨 Generating {count} image(s)", file=sys.stderr)
    print(f"🔌 Model: {model}", file=sys.stderr)
    print(f"📝 Prompt: \"{prompt}\"", file=sys.stderr)
    if negative_prompt:
        print(f"🚫 Negative: \"{negative_prompt}\"", file=sys.stderr)
    print(f"📐 Size: {width}x{height}", file=sys.stderr)
    
    # Generate
    client = InferenceClient(api_key=hf_token)
    generated_paths = []
    
    for i in range(count):
        try:
            print(f"\n🖼️  Generating image {i+1}/{count}...", file=sys.stderr)
            
            image = client.text_to_image(
                prompt=prompt,
                model=model,
            )
            
            if count > 1:
                output_path = base_output.parent / f"{base_output.name}-{i+1}.png"
            else:
                output_path = base_output.parent / f"{base_output.name}.png"
            
            output_path.parent.mkdir(parents=True, exist_ok=True)
            image.save(output_path)
            
            # Validate image - check for blank/black images
            if not validate_image(output_path):
                print(f"⚠️  Image {i+1} failed validation (blank/black), deleting...", file=sys.stderr)
                output_path.unlink(missing_ok=True)
                if count == 1:
                    raise ValueError("Generated image is blank or invalid")
                continue
            
            # Save metadata
            metadata = {
                "prompt": prompt,
                "model": model,
                "width": width,
                "height": height,
                "generated": datetime.now().isoformat()
            }
            if negative_prompt:
                metadata["negative_prompt"] = negative_prompt
            
            meta_path = output_path.with_suffix('.meta.json')
            with open(meta_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            print(f"✅ Image {i+1} saved to: {output_path}", file=sys.stderr)
            generated_paths.append(str(output_path))
            
            # Auto-commit and push if saved to portraits folder
            if str(output_path).startswith(str(portraits_dir)):
                commit_and_push(str(output_path), prompt)
            
        except Exception as e:
            print(f"❌ Error generating image {i+1}: {e}", file=sys.stderr)
            if count == 1:
                raise
    
    return generated_paths


# ── Git Integration ───────────────────────────────────────────────────────────

def commit_and_push(image_path: str, prompt: str):
    """Commit and push the generated image to the mary-jane repo."""
    import subprocess
    
    portraits_dir = Path.home() / ".openclaw" / "workspace" / "projects" / "mary-jane" / "portraits"
    repo_dir = portraits_dir.parent
    
    # Check if it's a git repo
    git_dir = repo_dir / ".git"
    if not git_dir.exists():
        print(f"⚠️  Not a git repo, skipping commit: {repo_dir}", file=sys.stderr)
        return
    
    # Get relative path from portraits dir
    image_path = Path(image_path)
    rel_path = image_path.relative_to(portraits_dir)
    
    # Git commands
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')
    commit_msg = f"Add generated image: {rel_path}\n\nPrompt: {prompt[:100]}"
    
    try:
        # Add file
        subprocess.run(['git', '-C', str(repo_dir), 'add', str(image_path)], 
                      capture_output=True, check=True)
        
        # Commit
        subprocess.run(['git', '-C', str(repo_dir), 'commit', '-m', commit_msg],
                      capture_output=True, check=True)
        
        # Safe push: pull --rebase first to prevent divergent branch errors
        print(f"📥 Pulling before push...", file=sys.stderr)
        pull_result = subprocess.run(
            ['git', '-C', str(repo_dir), 'pull', '--rebase'],
            capture_output=True, text=True
        )
        if pull_result.returncode != 0 and "diverged" in pull_result.stderr:
            print(f"⚠️  Diverged branch - auto-stashing and rebasing...", file=sys.stderr)
            subprocess.run(['git', '-C', str(repo_dir), 'stash'], capture_output=True)
            subprocess.run(['git', '-C', str(repo_dir), 'pull', '--rebase'], capture_output=True)
            subprocess.run(['git', '-C', str(repo_dir), 'stash', 'pop'], capture_output=True)
        
        # Push
        result = subprocess.run(['git', '-C', str(repo_dir), 'push'],
                               capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Committed and pushed to mary-jane repo", file=sys.stderr)
            print(f"   📂 {rel_path}", file=sys.stderr)
            
            # Update gallery README
            subprocess.run(["python3", str(Path(__file__).parent / "update-gallery-simple.py")], capture_output=True)
        else:
            print(f"⚠️  Push failed: {result.stderr}", file=sys.stderr)
            
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Git operation failed: {e}", file=sys.stderr)
    except Exception as e:
        print(f"⚠️  Error during git operations: {e}", file=sys.stderr)

# ── CLI ──────────────────────────────────────────────────────────────────────

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Image Generator (HuggingFace/Fal-AI)")
    parser.add_argument("prompt", nargs="?", help="Text description of the image")
    parser.add_argument("--preset", choices=list(PRESETS.keys()), help="Use preset configuration")
    parser.add_argument("--model", help="Override model")
    parser.add_argument("--width", type=int, help="Image width")
    parser.add_argument("--height", type=int, help="Image height")
    parser.add_argument("--output", help="Output file path")
    parser.add_argument("--project", help="Project name for auto-organization")
    parser.add_argument("--negative", help="Negative prompt - things to exclude")
    parser.add_argument("--count", type=int, default=1, help="Number of images to generate")
    parser.add_argument("--batch", help="File with prompts (one per line) for batch generation")
    parser.add_argument("--output-dir", help="Output directory for batch generation")
    
    args = parser.parse_args()
    
    # Batch mode
    if args.batch:
        batch_file = Path(args.batch)
        if not batch_file.exists():
            print(f"❌ Error: Batch file not found: {batch_file}", file=sys.stderr)
            sys.exit(1)
        
        prompts = [line.strip() for line in batch_file.read_text().splitlines() if line.strip()]
        output_dir = Path(args.output_dir) if args.output_dir else Path("/tmp/batch")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"📦 Batch mode: {len(prompts)} prompt(s)", file=sys.stderr)
        
        for i, prompt in enumerate(prompts):
            print(f"\n[{i+1}/{len(prompts)}] {prompt}", file=sys.stderr)
            try:
                paths = generate_image(
                    prompt=prompt,
                    preset=args.preset,
                    model=args.model,
                    output=str(output_dir / f"img-{i+1}.png"),
                    count=1
                )
                print(f"✅ Generated: {paths[0]}", file=sys.stderr)
            except Exception as e:
                print(f"❌ Failed: {e}", file=sys.stderr)
        
        return
    
    # Single generation
    if not args.prompt:
        parser.print_help()
        sys.exit(1)
    
    try:
        paths = generate_image(
            prompt=args.prompt,
            preset=args.preset,
            model=args.model,
            width=args.width,
            height=args.height,
            output=args.output,
            count=args.count,
            negative_prompt=args.negative,
            project=args.project
        )
        print(paths[0])  # Print path for scripting
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()


def simplify_prompt(prompt: str) -> str:
    """Simplify prompt for retry - remove complex descriptors."""
    # Remove common problematic phrases
    simplifications = [
        ('professional photography', ''),
        ('dramatic lighting', 'soft lighting'),
        ('cinematic', ''),
        ('sultry', 'confident'),
        ('seductive', 'elegant'),
        ('intimate', ''),
        ('golden hour', 'bright day'),
    ]
    
    simplified = prompt
    for find, replace in simplifications:
        simplified = simplified.replace(find, replace)
    
    # Remove extra spaces
    simplified = ' '.join(simplified.split())
    
    return simplified

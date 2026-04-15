#!/usr/bin/env python3
"""
Civitai Image Generation Skill for OpenClaw
Generates images using Civitai's Generator API with LoRA support
Automatically reads CIVITAI_API_KEY from secrets manager
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from datetime import datetime

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    print("❌ Error: Missing dependencies. Run: pip install cryptography requests", file=sys.stderr)
    sys.exit(1)

# ── Secrets Integration ──────────────────────────────────────────────────────

def get_civitai_token():
    """Read Civitai API token from secrets manager."""
    store_file = '/root/.openclaw/workspace/secrets/secrets-store.json'
    master_key = os.environ.get('MJ_MASTER_KEY')
    
    if not master_key:
        token = os.environ.get('CIVITAI_API_KEY')
        if token:
            return token
        raise ValueError("MJ_MASTER_KEY or CIVITAI_API_KEY environment variable required")
    
    if not os.path.exists(store_file):
        raise ValueError(f"Secrets store not found: {store_file}")
    
    # Load store
    with open(store_file, 'r') as f:
        store = json.load(f)
    
    # Get encrypted secret
    secret_key = 'civitai-image-gen:civitai_api_key'
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

PRESETS = {
    "portrait": {
        "model": "urn:air:sd1:checkpoint:civitai:4201@130072",  # ChilloutMix
        "width": 512,
        "height": 768,
        "steps": 30,
        "cfgScale": 7,
        "description": "Photorealistic portraits (SD1.5)"
    },
    "boudoir": {
        "model": "urn:air:sd1:checkpoint:civitai:4201@130072",  # ChilloutMix
        "width": 512,
        "height": 768,
        "steps": 35,
        "cfgScale": 7,
        "description": "Intimate boudoir photography (SD1.5)"
    },
    "anime": {
        "model": "urn:air:sd1:checkpoint:civitai:6424@128713",  # AOM2H+BasilMix
        "width": 512,
        "height": 768,
        "steps": 28,
        "cfgScale": 7,
        "description": "Anime-style illustrations"
    },
    "concept": {
        "model": "urn:air:sdxl:checkpoint:civitai:101055@130072",  # SDXL
        "width": 1024,
        "height": 1024,
        "steps": 30,
        "cfgScale": 7,
        "description": "Concept art and environments (SDXL)"
    },
    "fast": {
        "model": "urn:air:sd1:checkpoint:civitai:4201@130072",
        "width": 512,
        "height": 512,
        "steps": 20,
        "cfgScale": 7,
        "description": "Quick generation (lower quality)"
    }
}

# Popular LoRA models for consistent looks
LORA_MODELS = {
    "ulzzang": "urn:air:sd1:lora:civitai:8109@10107",  # Korean doll aesthetic
    "pureeros": "urn:air:sd1:textualinversion:civitai:4514@5119",  # Pure Eros Face
    "charturner": "urn:air:sd1:lora:civitai:3036@9857",  # Character turnaround
    "detailer": "urn:air:sd1:lora:civitai:162141@182559",  # Detail enhancement
}

# ── Image Generation ─────────────────────────────────────────────────────────

def generate_civitai_image(
    prompt: str,
    preset: str = None,
    model: str = None,
    width: int = None,
    height: int = None,
    steps: int = None,
    cfg_scale: float = None,
    negative_prompt: str = None,
    lora_ids: list = None,
    lora_strengths: list = None,
    output_dir: str = None,
    count: int = 1,
    scheduler: str = "EulerA",
    seed: int = -1,
    clip_skip: int = 2,
    wait_for_completion: bool = True,
    timeout_seconds: int = 300
) -> list:
    """Generate one or more images using Civitai's Generator API."""
    
    if not prompt or not prompt.strip():
        raise ValueError("Prompt is required")
    
    # Apply preset
    if preset and preset in PRESETS:
        p = PRESETS[preset]
        model = model or p['model']
        width = width or p['width']
        height = height or p['height']
        steps = steps or p['steps']
        cfg_scale = cfg_scale or p['cfgScale']
        print(f"🎯 Using preset: {preset} ({p['description']})", file=sys.stderr)
    
    # Defaults
    model = model or "urn:air:sd1:checkpoint:civitai:4201@130072"
    width = width or 512
    height = height or 768
    steps = steps or 30
    cfg_scale = cfg_scale or 7
    negative_prompt = negative_prompt or "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime, mutated hands and fingers:1.4), (deformed, distorted, disfigured:1.3), poorly drawn face, mutation, mutated, extra limb, ugly, poorly drawn hands, floating limbs, disconnected limbs, malformed hands, blur, out of focus, long neck, long body, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username"
    
    # Get API token
    api_token = get_civitai_token()
    
    # Build additional networks (LoRA support)
    additional_networks = {}
    if lora_ids:
        for i, lora_id in enumerate(lora_ids):
            strength = lora_strengths[i] if lora_strengths and i < len(lora_strengths) else 1.0
            # Determine type from URN
            if ':lora:' in lora_id:
                network_type = "Lora"
            elif ':textualinversion:' in lora_id:
                network_type = "TextualInversion"
            elif ':hypernetwork:' in lora_id:
                network_type = "Hypernetwork"
            else:
                network_type = "Lora"  # Default
            
            additional_networks[lora_id] = {
                "type": network_type,
                "strength": strength
            }
    
    # Build input payload
    input_payload = {
        "model": model,
        "params": {
            "prompt": prompt,
            "negativePrompt": negative_prompt,
            "scheduler": scheduler,
            "steps": steps,
            "cfgScale": cfg_scale,
            "width": width,
            "height": height,
            "seed": seed,
            "clipSkip": clip_skip
        }
    }
    
    if additional_networks:
        input_payload["additionalNetworks"] = additional_networks
    
    print(f"🎨 Generating {count} image(s)", file=sys.stderr)
    print(f"🔌 Model: {model}", file=sys.stderr)
    print(f"📝 Prompt: \"{prompt[:100]}{'...' if len(prompt) > 100 else ''}\"", file=sys.stderr)
    print(f"📐 Size: {width}x{height}", file=sys.stderr)
    print(f"⚙️  Steps: {steps}, CFG: {cfg_scale}, Scheduler: {scheduler}", file=sys.stderr)
    if additional_networks:
        print(f"🔗 LoRA/Networks: {len(additional_networks)}", file=sys.stderr)
    
    # API endpoint
    url = "https://api.civitai.com/v1/generations"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    generated_paths = []
    output_base = None
    
    if output_dir:
        output_base = Path(output_dir)
    else:
        # Default to boudoir directory
        workspace_root = Path.home() / ".openclaw" / "workspace"
        output_base = workspace_root / "projects" / "mary-jane" / "portraits" / "boudoir"
    
    output_base.mkdir(parents=True, exist_ok=True)
    
    for i in range(count):
        try:
            print(f"\n🖼️  Generating image {i+1}/{count}...", file=sys.stderr)
            
            # Set unique seed for each image if not specified
            if seed == -1:
                import random
                input_payload["params"]["seed"] = random.randint(0, 2147483647)
            
            # Create generation job
            response = requests.post(url, json=input_payload, headers=headers, timeout=30)
            
            if response.status_code not in [200, 201]:
                raise ValueError(f"API error {response.status_code}: {response.text}")
            
            job_data = response.json()
            job_id = job_data.get('id')
            job_token = job_data.get('token')
            
            if not job_id and not job_token:
                raise ValueError(f"Invalid response from API: {job_data}")
            
            print(f"📋 Job created: {job_id or job_token}", file=sys.stderr)
            
            # Poll for completion
            if wait_for_completion:
                result = poll_job_completion(job_id, job_token, api_token, timeout_seconds)
                
                if not result or 'outputs' not in result:
                    raise ValueError(f"Job failed or timed out: {result}")
                
                # Download generated images
                outputs = result.get('outputs', [])
                for output in outputs:
                    if 'image' in output:
                        image_url = output['image']
                        
                        # Generate output filename
                        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
                        if count > 1:
                            output_path = output_base / f"civitai-{timestamp}-{i+1}.png"
                        else:
                            output_path = output_base / f"civitai-{timestamp}.png"
                        
                        # Download image
                        download_image(image_url, output_path)
                        
                        # Save metadata
                        metadata = {
                            "prompt": prompt,
                            "model": model,
                            "width": width,
                            "height": height,
                            "steps": steps,
                            "cfgScale": cfg_scale,
                            "scheduler": scheduler,
                            "seed": input_payload["params"]["seed"],
                            "clipSkip": clip_skip,
                            "negativePrompt": negative_prompt,
                            "generated": datetime.now().isoformat(),
                            "jobId": job_id,
                            "source": "civitai"
                        }
                        if additional_networks:
                            metadata["additionalNetworks"] = additional_networks
                        
                        meta_path = output_path.with_suffix('.meta.json')
                        with open(meta_path, 'w') as f:
                            json.dump(metadata, f, indent=2)
                        
                        print(f"✅ Image saved to: {output_path}", file=sys.stderr)
                        generated_paths.append(str(output_path))
            
        except Exception as e:
            print(f"❌ Error generating image {i+1}: {e}", file=sys.stderr)
            if count == 1:
                raise
    
    return generated_paths


def poll_job_completion(job_id: str, job_token: str, api_token: str, timeout: int = 300) -> dict:
    """Poll Civitai API for job completion."""
    
    url = "https://api.civitai.com/v1/generations"
    headers = {"Authorization": f"Bearer {api_token}"}
    
    start_time = time.time()
    poll_interval = 2  # Start with 2 seconds
    
    while time.time() - start_time < timeout:
        try:
            # Use token if available, otherwise use job_id
            if job_token:
                params = {"token": job_token}
            else:
                params = {"id": job_id}
            
            response = requests.get(url, params=params, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Handle both single job and list responses
                if isinstance(data, dict):
                    job = data
                elif isinstance(data, list) and len(data) > 0:
                    job = data[0]
                else:
                    job = {}
                
                status = job.get('status')
                
                if status == 'succeeded':
                    return job
                elif status in ['failed', 'cancelled']:
                    raise ValueError(f"Job {status}: {job.get('error', 'Unknown error')}")
                # else: status is 'pending' or 'running', continue polling
            
            time.sleep(poll_interval)
            # Increase poll interval gradually (max 10 seconds)
            poll_interval = min(poll_interval * 1.2, 10)
            
        except requests.RequestException as e:
            print(f"⚠️  Poll error: {e}", file=sys.stderr)
            time.sleep(poll_interval)
    
    raise TimeoutError(f"Job did not complete within {timeout} seconds")


def download_image(url: str, output_path: Path):
    """Download image from URL to local path."""
    try:
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        # Verify file was written
        if not output_path.exists() or output_path.stat().st_size == 0:
            raise ValueError("Downloaded file is empty or missing")
        
    except Exception as e:
        raise ValueError(f"Failed to download image: {e}")


# ── CLI ──────────────────────────────────────────────────────────────────────

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Civitai Image Generator")
    parser.add_argument("prompt", nargs="?", help="Text description of the image")
    parser.add_argument("--preset", choices=list(PRESETS.keys()), help="Use preset configuration")
    parser.add_argument("--model", help="Override model URN")
    parser.add_argument("--width", type=int, help="Image width")
    parser.add_argument("--height", type=int, help="Image height")
    parser.add_argument("--steps", type=int, help="Generation steps")
    parser.add_argument("--cfg", type=float, dest="cfg_scale", help="CFG scale")
    parser.add_argument("--negative", help="Negative prompt")
    parser.add_argument("--lora", action="append", help="LoRA model URN (can specify multiple)")
    parser.add_argument("--lora-strength", type=float, action="append", help="LoRA strength (matches --lora order)")
    parser.add_argument("--output", help="Output directory")
    parser.add_argument("--count", type=int, default=1, help="Number of images to generate")
    parser.add_argument("--scheduler", default="EulerA", help="Scheduler algorithm")
    parser.add_argument("--seed", type=int, default=-1, help="Random seed (-1 for random)")
    parser.add_argument("--clip-skip", type=int, default=2, help="CLIP skip value")
    parser.add_argument("--no-wait", action="store_true", help="Don't wait for completion (async)")
    parser.add_argument("--timeout", type=int, default=300, help="Timeout in seconds")
    parser.add_argument("--batch", help="File with prompts (one per line) for batch generation")
    
    args = parser.parse_args()
    
    # Batch mode
    if args.batch:
        batch_file = Path(args.batch)
        if not batch_file.exists():
            print(f"❌ Error: Batch file not found: {batch_file}", file=sys.stderr)
            sys.exit(1)
        
        prompts = [line.strip() for line in batch_file.read_text().splitlines() if line.strip()]
        output_dir = Path(args.output) if args.output else None
        
        print(f"📦 Batch mode: {len(prompts)} prompt(s)", file=sys.stderr)
        
        for i, prompt in enumerate(prompts):
            print(f"\n[{i+1}/{len(prompts)}] {prompt}", file=sys.stderr)
            try:
                paths = generate_civitai_image(
                    prompt=prompt,
                    preset=args.preset,
                    model=args.model,
                    width=args.width,
                    height=args.height,
                    steps=args.steps,
                    cfg_scale=args.cfg_scale,
                    negative_prompt=args.negative,
                    lora_ids=args.lora,
                    lora_strengths=args.lora_strength,
                    output_dir=str(output_dir) if output_dir else None,
                    count=1,
                    scheduler=args.scheduler,
                    seed=args.seed,
                    clip_skip=args.clip_skip,
                    wait_for_completion=not args.no_wait,
                    timeout_seconds=args.timeout
                )
                print(f"✅ Generated: {paths[0] if paths else 'N/A'}", file=sys.stderr)
            except Exception as e:
                print(f"❌ Failed: {e}", file=sys.stderr)
        
        return
    
    # Single generation
    if not args.prompt:
        parser.print_help()
        sys.exit(1)
    
    try:
        paths = generate_civitai_image(
            prompt=args.prompt,
            preset=args.preset,
            model=args.model,
            width=args.width,
            height=args.height,
            steps=args.steps,
            cfg_scale=args.cfg_scale,
            negative_prompt=args.negative,
            lora_ids=args.lora,
            lora_strengths=args.lora_strength,
            output_dir=args.output,
            count=args.count,
            scheduler=args.scheduler,
            seed=args.seed,
            clip_skip=args.clip_skip,
            wait_for_completion=not args.no_wait,
            timeout_seconds=args.timeout
        )
        print(paths[0] if paths else "")  # Print path for scripting
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

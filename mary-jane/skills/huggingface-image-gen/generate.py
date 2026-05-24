#!/usr/bin/env python3
"""
Hugging Face Image Generation
General-purpose image generation using Hugging Face Inference API
Supports multiple models, presets, batch generation, and validation
"""

import os
import sys
import argparse
import json
from pathlib import Path
from datetime import datetime

try:
    from huggingface_hub import InferenceClient
    from PIL import Image
except ImportError:
    print("❌ Error: Missing dependencies. Run: pip install huggingface_hub Pillow", file=sys.stderr)
    sys.exit(1)

DEFAULT_MODEL = "black-forest-labs/FLUX.1-dev"

# Model presets for different use cases
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
        "model": "black-forest-labs/FLUX.1-pro",
        "width": 1024,
        "height": 1024,
        "description": "Photorealistic images (if available)"
    },
    "fast": {
        "model": "THUDM/CogView-4",
        "width": 1024,
        "height": 1024,
        "description": "Quick generation for iteration"
    }
}


def validate_image(image_path: Path, min_brightness: float = 0.02) -> bool:
    """Validate generated image - check for all-black, corrupted, or invalid outputs."""
    try:
        img = Image.open(image_path)
        if img is None:
            print(f"⚠️  Validation failed: Image did not load", file=sys.stderr)
            return False
        
        gray = img.convert('L')
        pixels = list(gray.getdata())
        avg_brightness = sum(pixels) / len(pixels) / 255.0
        
        if avg_brightness < min_brightness:
            print(f"⚠️  Validation failed: Image too dark (brightness: {avg_brightness:.3f})", file=sys.stderr)
            return False
        
        if img.width < 64 or img.height < 64:
            print(f"⚠️  Validation failed: Image too small ({img.width}x{img.height})", file=sys.stderr)
            return False
        
        print(f"✓ Validation passed: {img.width}x{img.height}, brightness: {avg_brightness:.3f}", file=sys.stderr)
        return True
    except Exception as e:
        print(f"⚠️  Validation failed: {e}", file=sys.stderr)
        return False


def generate_image(
    prompt: str,
    model: str = DEFAULT_MODEL,
    width: int = 1024,
    height: int = 1024,
    output: str = None,
    token: str = None,
    negative_prompt: str = None,
    count: int = 1,
    validate: bool = False,
    project: str = None,
    format: str = "png"
) -> list:
    """Generate one or more images from a text prompt."""
    if not prompt or not prompt.strip():
        raise ValueError("Prompt is required")
    
    hf_token = token or os.environ.get("HF_TOKEN")
    if not hf_token:
        raise ValueError("HF_TOKEN environment variable is required")
    
    # Determine output directory
    if project:
        project_dir = Path.home() / ".openclaw" / "workspace" / "projects" / project / "images"
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
                output_path = base_output.parent / f"{base_output.name}-{i+1}.{format}"
            else:
                output_path = base_output.parent / f"{base_output.name}.{format}"
            
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            if validate:
                temp_path = output_path.with_suffix('.tmp')
                image.save(temp_path)
                if not validate_image(temp_path):
                    print(f"⚠️  Image {i+1} failed validation, skipping", file=sys.stderr)
                    temp_path.unlink()
                    continue
                temp_path.rename(output_path)
            else:
                image.save(output_path)
            
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
            
        except Exception as e:
            print(f"❌ Error generating image {i+1}: {e}", file=sys.stderr)
            if count == 1:
                raise
    
    return generated_paths


def main():
    parser = argparse.ArgumentParser(description="Hugging Face Image Generator")
    parser.add_argument("prompt", nargs="?", help="Text description of the image")
    parser.add_argument("--preset", choices=list(PRESETS.keys()), help="Use preset configuration")
    parser.add_argument("--model", help="Override model")
    parser.add_argument("--width", type=int, help="Image width")
    parser.add_argument("--height", type=int, help="Image height")
    parser.add_argument("--output", help="Output file path")
    parser.add_argument("--project", help="Project name for auto-organization")
    parser.add_argument("--token", help="Hugging Face API token (or set HF_TOKEN env var)")
    parser.add_argument("--negative", help="Negative prompt - things to exclude")
    parser.add_argument("--count", type=int, default=1, help="Number of images to generate")
    parser.add_argument("--batch", help="File with prompts (one per line) for batch generation")
    parser.add_argument("--output-dir", help="Output directory for batch generation")
    parser.add_argument("--validate", action="store_true", help="Validate images before saving")
    parser.add_argument("--format", choices=["png", "jpg"], default="png", help="Output format")
    
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
        
        print(f"📦 Batch mode: {len(prompts)} prompts", file=sys.stderr)
        
        for i, prompt in enumerate(prompts):
            try:
                generate_image(
                    prompt=prompt,
                    model=args.model or DEFAULT_MODEL,
                    width=args.width or 1024,
                    height=args.height or 1024,
                    output=str(output_dir / f"image-{i+1}"),
                    token=args.token,
                    negative_prompt=args.negative,
                    validate=args.validate,
                    format=args.format
                )
            except Exception as e:
                print(f"⚠️  Skipping prompt {i+1}: {e}", file=sys.stderr)
        
        print(f"\n✅ Batch complete. Output in: {output_dir}", file=sys.stderr)
        sys.exit(0)
    
    if not args.prompt:
        print("❌ Error: Prompt is required (or use --batch for batch mode)", file=sys.stderr)
        print("\nUsage:")
        print("  python generate.py \"Your prompt here\" [options]")
        print("\nPresets:")
        for name, config in PRESETS.items():
            print(f"  {name}: {config['description']}")
        sys.exit(1)
    
    # Apply preset
    if args.preset:
        preset_config = PRESETS[args.preset]
        if not args.model:
            args.model = preset_config["model"]
        if not args.width:
            args.width = preset_config["width"]
        if not args.height:
            args.height = preset_config["height"]
        print(f"🎯 Using preset: {args.preset} ({preset_config['description']})", file=sys.stderr)
    
    try:
        output_paths = generate_image(
            prompt=args.prompt,
            model=args.model or DEFAULT_MODEL,
            width=args.width or 1024,
            height=args.height or 1024,
            output=args.output,
            token=args.token,
            negative_prompt=args.negative,
            count=args.count,
            validate=args.validate,
            project=args.project,
            format=args.format
        )
        
        for path in output_paths:
            print(path)
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

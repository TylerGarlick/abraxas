#!/usr/bin/env python3
"""
Hugging Face Image Generation
Uses the official Hugging Face Hub SDK with Fal-AI provider (Pro accounts)
"""

import os
import sys
import argparse
from pathlib import Path

try:
    from huggingface_hub import InferenceClient
except ImportError:
    print("❌ Error: huggingface_hub not installed. Run: pip install huggingface_hub")
    sys.exit(1)

DEFAULT_MODEL = "black-forest-labs/FLUX.1-dev"
DEFAULT_PROVIDER = "fal-ai"  # Uses Fal-AI provider through HF Pro


def generate_image(
    prompt: str,
    model: str = DEFAULT_MODEL,
    provider: str = DEFAULT_PROVIDER,
    width: int = 1024,
    height: int = 1024,
    output: str = None,
    token: str = None
) -> str:
    """
    Generate an image from a text prompt using HF Inference with Fal-AI provider.
    
    Args:
        prompt: Text description of the image
        model: Hugging Face model ID (default: FLUX.1-dev)
        provider: Inference provider (default: fal-ai)
        width: Image width (default: 1024)
        height: Image height (default: 1024)
        output: Output file path (default: /tmp/generated-<timestamp>.png)
        token: Hugging Face API token (default: HF_TOKEN env var)
    
    Returns:
        Path to generated image
    """
    if not prompt or not prompt.strip():
        raise ValueError("Prompt is required")
    
    # Use token from env if not provided
    hf_token = token or os.environ.get("HF_TOKEN")
    
    if not hf_token:
        raise ValueError("HF_TOKEN environment variable is required")
    
    # Initialize client with Fal-AI provider
    print(f"🎨 Generating image with model: {model}", file=sys.stderr)
    print(f"🔌 Provider: {provider}", file=sys.stderr)
    print(f"📝 Prompt: \"{prompt}\"", file=sys.stderr)
    print(f"📐 Size: {width}x{height}", file=sys.stderr)
    
    client = InferenceClient(
        provider=provider,
        api_key=hf_token,
    )
    
    # Generate image
    image = client.text_to_image(
        prompt=prompt,
        model=model,
    )
    
    # Determine output path
    if not output:
        timestamp = int(Path.cwd().stat().st_mtime) if Path.cwd().exists() else int(os.path.getctime(__file__))
        output = f"/tmp/generated-{timestamp}.png"
    
    # Ensure directory exists
    output_path = Path(output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save the image
    image.save(output_path)
    
    print(f"✅ Image saved to: {output_path}", file=sys.stderr)
    
    return str(output_path)


def main():
    parser = argparse.ArgumentParser(
        description="Hugging Face Image Generator (Fal-AI provider)"
    )
    parser.add_argument(
        "prompt",
        nargs="?",
        help="Text description of the image"
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Hugging Face model (default: {DEFAULT_MODEL})"
    )
    parser.add_argument(
        "--provider",
        default=DEFAULT_PROVIDER,
        help=f"Inference provider (default: {DEFAULT_PROVIDER})"
    )
    parser.add_argument(
        "--width",
        type=int,
        default=1024,
        help="Image width (default: 1024)"
    )
    parser.add_argument(
        "--height",
        type=int,
        default=1024,
        help="Image height (default: 1024)"
    )
    parser.add_argument(
        "--output",
        help="Output file path"
    )
    parser.add_argument(
        "--token",
        help="Hugging Face API token (or set HF_TOKEN env var)"
    )
    
    args = parser.parse_args()
    
    if not args.prompt:
        print("❌ Error: Prompt is required")
        print("\nUsage:")
        print("  python generate.py \"Your prompt here\" [options]")
        print("\nExamples:")
        print("  python generate.py \"A cyberpunk city at night\"")
        print("  python generate.py \"Portrait of a warrior\" --model black-forest-labs/FLUX.1-dev")
        print("  python generate.py \"Fantasy landscape\" --width 1024 --height 768 --output ./art.png")
        sys.exit(1)
    
    try:
        output_path = generate_image(
            prompt=args.prompt,
            model=args.model,
            provider=args.provider,
            width=args.width,
            height=args.height,
            output=args.output,
            token=args.token
        )
        print(output_path)
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

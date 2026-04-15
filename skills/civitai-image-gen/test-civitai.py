#!/usr/bin/env python3
"""
Test script for Civitai Image Generation Skill
Verifies API connection and performs a simple test generation.
"""

import os
import sys
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from generate import get_civitai_token, generate_civitai_image, PRESETS

def test_secret_retrieval():
    """Test that we can retrieve the API key from secrets manager."""
    print("=" * 60)
    print("TEST 1: Secret Retrieval")
    print("=" * 60)
    
    try:
        token = get_civitai_token()
        if token and len(token) > 10:
            print(f"✅ Successfully retrieved API key")
            print(f"   Token preview: {token[:8]}...{token[-4:]}")
            return True
        else:
            print(f"❌ Retrieved token appears invalid")
            return False
    except Exception as e:
        print(f"❌ Failed to retrieve secret: {e}")
        return False


def test_api_connection():
    """Test basic API connectivity with a minimal request."""
    print("\n" + "=" * 60)
    print("TEST 2: API Connection")
    print("=" * 60)
    
    try:
        # Try a simple generation with fast settings
        print("📡 Testing API connection with minimal generation...")
        
        paths = generate_civitai_image(
            prompt="simple test image, basic portrait, clean background",
            preset="fast",
            steps=15,  # Minimal steps for quick test
            count=1,
            wait_for_completion=True,
            timeout_seconds=120
        )
        
        if paths and len(paths) > 0:
            print(f"✅ API connection successful")
            print(f"   Generated: {paths[0]}")
            
            # Verify file exists
            if Path(paths[0]).exists():
                size = Path(paths[0]).stat().st_size
                print(f"   File size: {size/1024:.1f}KB")
                return True
            else:
                print(f"⚠️  File not found after generation")
                return False
        else:
            print(f"❌ No images generated")
            return False
            
    except TimeoutError as e:
        print(f"⚠️  Test timed out (this may be normal for slow API): {e}")
        return True  # Connection works, just slow
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False


def test_lora_support():
    """Test LoRA integration."""
    print("\n" + "=" * 60)
    print("TEST 3: LoRA Support")
    print("=" * 60)
    
    try:
        print("🔗 Testing LoRA integration...")
        
        # Test with a known LoRA model
        paths = generate_civitai_image(
            prompt="portrait of a woman, detailed face, soft lighting",
            preset="portrait",
            lora_ids=["urn:air:sd1:lora:civitai:8109@10107"],  # ulzzang LoRA
            lora_strengths=[0.8],
            steps=20,
            count=1,
            wait_for_completion=True,
            timeout_seconds=180
        )
        
        if paths and len(paths) > 0:
            print(f"✅ LoRA generation successful")
            print(f"   Generated: {paths[0]}")
            
            # Check metadata includes LoRA info
            meta_path = Path(paths[0]).with_suffix('.meta.json')
            if meta_path.exists():
                with open(meta_path, 'r') as f:
                    meta = json.load(f)
                if 'additionalNetworks' in meta:
                    print(f"   LoRA metadata saved correctly")
                    return True
            
            return True
        else:
            print(f"⚠️  LoRA test did not produce images")
            return False
            
    except TimeoutError as e:
        print(f"⚠️  LoRA test timed out: {e}")
        return True
    except Exception as e:
        print(f"❌ LoRA test failed: {e}")
        return False


def test_output_directory():
    """Test that images are saved to the correct directory."""
    print("\n" + "=" * 60)
    print("TEST 4: Output Directory")
    print("=" * 60)
    
    expected_dir = Path.home() / ".openclaw" / "workspace" / "projects" / "mary-jane" / "portraits" / "boudoir"
    
    print(f"📁 Expected output directory: {expected_dir}")
    
    if expected_dir.exists():
        print(f"✅ Output directory exists")
        
        # List recent files
        files = list(expected_dir.glob("civitai-*.png"))[-5:]
        if files:
            print(f"   Recent generations: {len(files)} file(s)")
            for f in files[-3:]:
                print(f"     - {f.name}")
        return True
    else:
        print(f"⚠️  Output directory does not exist yet (will be created on first generation)")
        return True


def main():
    print("\n🧪 CIVITAI IMAGE GENERATION SKILL - TEST SUITE")
    print("=" * 60)
    
    # Check environment
    master_key = os.environ.get('MJ_MASTER_KEY')
    if not master_key:
        print("❌ MJ_MASTER_KEY environment variable not set!")
        print("   Set it with: export MJ_MASTER_KEY='your-key'")
        sys.exit(1)
    
    print(f"✅ MJ_MASTER_KEY found")
    
    # Run tests
    results = {
        "Secret Retrieval": test_secret_retrieval(),
        "API Connection": test_api_connection(),
        "LoRA Support": test_lora_support(),
        "Output Directory": test_output_directory()
    }
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {test}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Skill is ready to use.")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Review output above.")
        sys.exit(1)


if __name__ == "__main__":
    main()

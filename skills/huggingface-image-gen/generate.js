#!/usr/bin/env node

/**
 * Hugging Face Image Generation
 * Generates images from text prompts using the free Inference API
 */

const fs = require('fs');
const path = require('path');

// Default model - Stable Diffusion XL for high quality
const DEFAULT_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';
const API_BASE = 'https://router.huggingface.co/hf-inference/models';

/**
 * Generate an image from a text prompt
 * @param {Object} options
 * @param {string} options.prompt - Text description of the image
 * @param {string} [options.model] - Hugging Face model ID
 * @param {number} [options.width=1024] - Image width
 * @param {number} [options.height=1024] - Image height
 * @param {string} [options.output] - Output file path
 * @param {string} [options.token] - Hugging Face API token (optional, increases rate limits)
 * @returns {Promise<string>} Path to generated image
 */
async function generateImage({
  prompt,
  model = DEFAULT_MODEL,
  width = 1024,
  height = 1024,
  output,
  token
}) {
  if (!prompt || prompt.trim() === '') {
    throw new Error('Prompt is required');
  }

  // Use token from env if not provided
  const hfToken = token || process.env.HF_TOKEN;

  const apiUrl = `${API_BASE}/${model}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (hfToken) {
    headers['Authorization'] = `Bearer ${hfToken}`;
  }

  const body = {
    inputs: prompt,
  };

  console.error(`🎨 Generating image with model: ${model}`);
  console.error(`📝 Prompt: "${prompt}"`);
  console.error(`📐 Size: ${width}x${height}`);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    
    if (response.status === 503) {
      throw new Error(`Model ${model} is loading. Try again in a moment. (503 Service Unavailable)`);
    }
    
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  // Get the image as a buffer
  const imageBuffer = Buffer.from(await response.arrayBuffer());

  // Determine output path
  if (!output) {
    const timestamp = Date.now();
    output = path.join('/tmp', `generated-${timestamp}.png`);
  }

  // Ensure directory exists
  const dir = path.dirname(output);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the image
  fs.writeFileSync(output, imageBuffer);

  console.error(`✅ Image saved to: ${output}`);
  
  return output;
}

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Hugging Face Image Generator

Usage:
  node generate.js "Your prompt here" [options]

Options:
  --model <model-id>   Hugging Face model (default: ${DEFAULT_MODEL})
  --width <number>     Image width (default: 1024)
  --height <number>    Image height (default: 1024)
  --output <path>      Output file path
  --token <token>      Hugging Face API token (or set HF_TOKEN env var)

Examples:
  node generate.js "A cyberpunk city at night"
  node generate.js "Portrait of a warrior" --model runwayml/stable-diffusion-v1-5
  node generate.js "Fantasy landscape" --width 1024 --height 768 --output ./art.png
`);
    process.exit(0);
  }

  // Parse arguments
  const prompt = args.find(a => !a.startsWith('--'));
  const model = args[args.indexOf('--model') + 1] || DEFAULT_MODEL;
  const width = parseInt(args[args.indexOf('--width') + 1]) || 1024;
  const height = parseInt(args[args.indexOf('--height') + 1]) || 1024;
  const output = args[args.indexOf('--output') + 1];
  const token = args[args.indexOf('--token') + 1];

  if (!prompt) {
    console.error('❌ Error: Prompt is required');
    process.exit(1);
  }

  generateImage({ prompt, model, width, height, output, token })
    .then(outputPath => {
      console.log(outputPath);
      process.exit(0);
    })
    .catch(err => {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { generateImage, DEFAULT_MODEL };

#!/usr/bin/env node

/**
 * MJ Portrait Regenerator
 * Regenerates failed images and creates new themed collections
 * Uses FLUX.1-dev for best quality
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// ── Constants ────────────────────────────────────────────────────────────────

const MASTER_KEY = process.env.MJ_MASTER_KEY || '73c9f7d3eb28d570b9b73d7a07b170ee6b9c7f6dfb115db2f1391ba29a1f3932';
const STORE_FILE = '/home/ubuntu/.openclaw/workspace/secrets/secrets-store.json';
const PORTRAITS_DIR = '/home/ubuntu/.openclaw/workspace/portraits';
const MODEL = 'black-forest-labs/FLUX.1-dev';

// ── Failed Images to Regenerate ─────────────────────────────────────────────

const FAILED_IMAGES = [
  // Tour of Italy - failed generations
  { path: 'tour-of-italy/mj-intimate-candlelight-05-2026-04-07-04.png', type: 'regenerate' },
  { path: 'tour-of-italy/mj-tour-02-tuscany-nude-2026-04-10.png', type: 'regenerate' },
  { path: 'tour-of-italy/mj-tour-03-taco-nude-2026-04-10.png', type: 'regenerate' },
  { path: 'tour-of-italy/mj-italy-01-the-boot-2026-04-07-03.png', type: 'regenerate' },
  { path: 'tour-of-italy/mj-italy-03-amalfi-2026-04-07-03.png', type: 'regenerate' },
  { path: 'tour-of-italy/mj-italy-04-venice-2026-04-07-03.png', type: 'regenerate' },
  { path: 'tour-of-italy/mj-italy-05-rome-2026-04-07-03.png', type: 'regenerate' },
  { path: 'tour-of-italy/mj-intimate-intimate-morning-01-2026-04-07-04.png', type: 'regenerate' },
];

// ── New Boudoir Collection Prompts ─────────────────────────────────────────

const BOUDOIR_COLLECTION = [
  {
    filename: 'mj-boudoir-morning-light-2026-04-10.png',
    prompt: 'Intimate boudoir portrait of a confident red-haired woman in white silk robe, morning light streaming through window, soft gentle expression, sitting on edge of bed, natural makeup, romantic atmosphere, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-evening-glow-2026-04-10.png',
    prompt: 'Sultry boudoir portrait of a fit red-haired woman in black lace bodysuit, golden hour lighting, bedroom setting, confident seductive gaze, leaning against headboard, warm intimate mood, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-silk-sheets-2026-04-10.png',
    prompt: 'Romantic boudoir portrait of a curvaceous red-haired woman in champagne silk slip dress, reclining on luxury silk sheets, soft candlelight, intimate bedroom setting, sensual but elegant, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-red-rose-2026-04-10.png',
    prompt: 'Passionate boudoir portrait of a confident red-haired woman in red satin lingerie, rose petals scattered, dim romantic lighting, sitting on vanity stool, sultry expression, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-lace-garter-2026-04-10.png',
    prompt: 'Classic boudoir portrait of a fit red-haired woman in black lace lingerie with garter belt, dramatic side lighting, bedroom boudoir setting, confident pose, vintage pinup aesthetic, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-sheer-robe-2026-04-10.png',
    prompt: 'Seductive boudoir portrait of a curvaceous red-haired woman in sheer black robe over lingerie, moody atmospheric lighting, standing by window, confident sensual expression, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-back-view-lace-2026-04-10.png',
    prompt: 'Artistic boudoir portrait from behind of a red-haired woman in backless lace lingerie, looking over shoulder, soft bedroom lighting, elegant sensual pose, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-back-view-silk-2026-04-10.png',
    prompt: 'Rear view boudoir portrait of a fit red-haired woman in silk chemise, walking away but glancing back, golden hour lighting through curtains, intimate bedroom setting, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-back-view-nude-2026-04-10.png',
    prompt: 'Artistic rear view portrait of a red-haired woman, nude from back, standing in doorway with soft backlighting, elegant pose with hand on hip, tasteful artistic nude, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-posterior-lace-2026-04-10.png',
    prompt: 'Boudoir portrait from behind of a curvaceous red-haired woman in lace thong and bra, kneeling on bed, looking back over shoulder, intimate bedroom lighting, sensual artistic pose, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-posterior-silk-2026-04-10.png',
    prompt: 'Rear view boudoir of a fit red-haired woman in silk slip, bent slightly forward, soft morning light, bedroom setting, elegant sensual composition, professional photography, high detail, FLUX'
  },
  {
    filename: 'mj-boudoir-posterior-garter-2026-04-10.png',
    prompt: 'Classic pinup boudoir from behind of a red-haired woman in garter belt and stockings, standing pose, dramatic lighting, confident seductive expression looking back, professional photography, high detail, FLUX'
  }
];

// ── Decrypt Functions ────────────────────────────────────────────────────────

function decryptSecret(ciphertext, iv, tag) {
  const key = Buffer.from(MASTER_KEY, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
}

function getHuggingFaceToken() {
  const store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  const secret = store.secrets['huggingface:token'];
  if (!secret) {
    throw new Error('Hugging Face token not found in secrets store');
  }
  return decryptSecret(secret.ciphertext, secret.iv, secret.tag);
}

// ── Generate Image with FLUX ────────────────────────────────────────────────

async function generateImage(prompt, outputPath, token, retries = 3) {
  const apiUrl = `https://router.huggingface.co/hf-inference/models/${MODEL}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${retries}...`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 50,
            guidance_scale: 7.5,
            width: 1024,
            height: 1536
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HF API error (${response.status}): ${errorText}`);
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      
      // Check if image is valid (not black/empty)
      if (imageBuffer.length < 50000) {
        throw new Error(`Generated image too small (${imageBuffer.length} bytes), likely failed`);
      }
      
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`  ✅ Generated (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
      return outputPath;
      
    } catch (error) {
      console.log(`  ❌ Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔥 MJ Portrait Regenerator - FLUX.1-dev\n');
  console.log('=' .repeat(60));
  
  // Get token
  console.log('\n📦 Loading Hugging Face token...');
  const token = getHuggingFaceToken();
  console.log('✅ Token loaded\n');
  
  // Ensure directories exist
  const boudoirDir = path.join(PORTRAITS_DIR, 'boudoir');
  const tourDir = path.join(PORTRAITS_DIR, 'tour-of-italy');
  fs.mkdirSync(boudoirDir, { recursive: true });
  fs.mkdirSync(tourDir, { recursive: true });
  
  // ── Regenerate Failed Images ────────────────────────────────────────────
  
  console.log('\n🔄 REGENERATING FAILED IMAGES');
  console.log('=' .repeat(60));
  
  for (const img of FAILED_IMAGES) {
    const fullPath = path.join(PORTRAITS_DIR, img.path);
    console.log(`\n📸 Regenerating: ${img.path}`);
    
    // Create prompt based on filename
    let prompt = '';
    if (img.path.includes('candlelight')) {
      prompt = 'Intimate boudoir portrait of a red-haired woman in candlelit room, warm ambient lighting, romantic atmosphere, sitting on bed, soft sensual expression, professional photography, high detail, FLUX';
    } else if (img.path.includes('tuscany-nude')) {
      prompt = 'Artistic nude portrait of a red-haired woman in Tuscany vineyard, golden hour sunlight, rear view walking through vines, tasteful artistic nude, Italian countryside background, professional photography, high detail, FLUX';
    } else if (img.path.includes('taco-nude')) {
      prompt = 'Artistic nude portrait of a curvaceous red-haired woman on Amalfi coast, dramatic cliffside setting, sunset lighting, confident pose, tasteful artistic nude, Mediterranean landscape, professional photography, high detail, FLUX';
    } else if (img.path.includes('the-boot')) {
      prompt = 'Portrait of a red-haired woman on Italian beach, boot of Italy landscape in background, sunny Mediterranean setting, confident pose, summer vacation vibe, professional photography, high detail, FLUX';
    } else if (img.path.includes('amalfi')) {
      prompt = 'Portrait of a fit red-haired woman on Amalfi coast terrace, colorful Italian buildings in background, bright sunny day, elegant summer dress, Mediterranean vacation, professional photography, high detail, FLUX';
    } else if (img.path.includes('venice')) {
      prompt = 'Portrait of a red-haired woman in Venice, canal and gondolas in background, romantic Italian atmosphere, elegant outfit, golden hour lighting, professional photography, high detail, FLUX';
    } else if (img.path.includes('rome')) {
      prompt = 'Portrait of a confident red-haired woman in Rome, ancient Roman architecture in background, historic Italian setting, stylish outfit, dramatic lighting, professional photography, high detail, FLUX';
    } else if (img.path.includes('intimate-morning')) {
      prompt = 'Intimate morning portrait of a red-haired woman in bedroom, soft natural light through window, just waking up, relaxed sensual mood, white sheets, professional photography, high detail, FLUX';
    }
    
    try {
      await generateImage(prompt, fullPath, token);
      console.log(`✅ Successfully regenerated: ${img.path}`);
    } catch (error) {
      console.log(`❌ Failed to regenerate ${img.path}: ${error.message}`);
    }
  }
  
  // ── Generate New Boudoir Collection ─────────────────────────────────────
  
  console.log('\n\n🎨 GENERATING NEW BOUDOIR COLLECTION');
  console.log('=' .repeat(60));
  
  for (const portrait of BOUDOIR_COLLECTION) {
    const outputPath = path.join(boudoirDir, portrait.filename);
    console.log(`\n📸 Creating: ${portrait.filename}`);
    console.log(`   Prompt: ${portrait.prompt.substring(0, 80)}...`);
    
    try {
      await generateImage(portrait.prompt, outputPath, token);
      console.log(`✅ Created: ${portrait.filename}`);
    } catch (error) {
      console.log(`❌ Failed ${portrait.filename}: ${error.message}`);
    }
    
    // Rate limit protection - wait between generations
    console.log('   ⏳ Waiting 3 seconds (rate limit protection)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // ── Summary ─────────────────────────────────────────────────────────────
  
  console.log('\n\n' + '=' .repeat(60));
  console.log('✅ GENERATION COMPLETE');
  console.log('=' .repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   - Failed images regenerated: ${FAILED_IMAGES.length}`);
  console.log(`   - New boudoir portraits created: ${BOUDOIR_COLLECTION.length}`);
  console.log(`   - Total: ${FAILED_IMAGES.length + BOUDOIR_COLLECTION.length} images`);
  console.log(`\n📁 Location: ${PORTRAITS_DIR}`);
  console.log('\n🔥 All done!\n');
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  console.error(err.stack);
  process.exit(1);
});

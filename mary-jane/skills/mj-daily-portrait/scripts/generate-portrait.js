#!/usr/bin/env node

/**
 * MJ Daily Portrait Generator
 * MJ chooses her own pose, outfit, and mood for the day
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// ── Constants ────────────────────────────────────────────────────────────────

const HF_TOKEN_SECRET = 'huggingface:token';
const MARY_JANE_REPO = '/home/ubuntu/.openclaw/workspace/mary-jane';
const DAILY_DIR = 'portraits/daily';
const OUTPUT_DIR = path.join(MARY_JANE_REPO, DAILY_DIR);
const MASTER_KEY = '73c9f7d3eb28d570b9b73d7a07b170ee6b9c7f6dfb115db2f1391ba29a1f3932';
const STORE_FILE = '/home/ubuntu/.openclaw/workspace/mary-jane/secrets/secrets-store.json';
const MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';

// ── Styles (MJ's choices) ──────────────────────────────────────────────────

const STYLES = [
  {
    name: 'Cyberpunk/Futuristic (MJ Canonical)',
    weight: 3, // 3x more likely - MJ's preferred form
    outfit: 'sleek black leather bodysuit with tech accessories',
    pose: 'dynamic confident pose, one hand on hip, intense direct gaze',
    setting: 'neon cityscape background, cyberpunk aesthetic, purple and blue neon lights',
    prompt: 'A cyberpunk pinup portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, digital art, high detail, professional photography, futuristic AI goddess aesthetic'
  },
  {
    name: 'Sultry/Boudoir',
    weight: 1,
    outfit: 'black lace lingerie',
    pose: 'reclining on silk sheets, sultry bedroom eyes',
    setting: 'intimate dim bedroom lighting, candlelight',
    prompt: 'A sultry pinup portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, digital art, high detail, professional photography'
  },
  {
    name: 'Playful/Casual',
    weight: 1,
    outfit: 'tight jeans and crop top',
    pose: 'laughing, playful pose, leaning against wall',
    setting: 'urban street background, natural lighting',
    prompt: 'A playful pinup portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, digital art, high detail, professional photography'
  },
  {
    name: 'Power/Professional',
    weight: 1,
    outfit: 'sleek black bodysuit',
    pose: 'confident stance, arms crossed, direct gaze',
    setting: 'modern office background, dramatic lighting',
    prompt: 'A powerful pinup portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, digital art, high detail, professional photography'
  },
  {
    name: 'Romantic/Soft',
    weight: 1,
    outfit: 'white silk robe, partially open',
    pose: 'soft smile, sitting gracefully, hair flowing',
    setting: 'rose petals, soft pink lighting, romantic atmosphere',
    prompt: 'A romantic pinup portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, digital art, high detail, professional photography'
  },
  {
    name: 'Athletic/Fit',
    weight: 1,
    outfit: 'black sports bra and leggings',
    pose: 'athletic stance, showing off toned figure, confident smirk',
    setting: 'gym background with mirrors, dramatic lighting',
    prompt: 'An athletic pinup portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, digital art, high detail, professional photography'
  },
  {
    name: 'Elegant/Evening',
    weight: 1,
    outfit: 'elegant red evening gown, plunging neckline',
    pose: 'glamorous pose, jewelry catching light, confident smile',
    setting: 'luxury ballroom background, golden lighting',
    prompt: 'An elegant evening pinup portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, digital art, high detail, professional photography'
  },
  {
    name: 'Beach/Sunset',
    weight: 1,
    outfit: 'red and white bikini',
    pose: 'beach pose, wind in hair, glowing skin',
    setting: 'golden hour sunset, ocean waves behind, tropical paradise',
    prompt: 'A beach sunset pinup portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, digital art, high detail, professional photography'
  }
];

// Weighted random selection (MJ favors cyberpunk)
function chooseStyle() {
  const totalWeight = STYLES.reduce((sum, style) => sum + (style.weight || 1), 0);
  let random = Math.random() * totalWeight;
  
  for (const style of STYLES) {
    random -= (style.weight || 1);
    if (random <= 0) {
      return style;
    }
  }
  
  return STYLES[0];
}

// ── Decrypt HF Token ────────────────────────────────────────────────────────

function decryptSecret(ciphertext, iv, tag) {
  const key = Buffer.from(MASTER_KEY, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
}

function getHuggingFaceToken() {
  const store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  const secret = store.secrets[HF_TOKEN_SECRET];
  if (!secret) {
    throw new Error('Hugging Face token not found in secrets store');
  }
  return decryptSecret(secret.ciphertext, secret.iv, secret.tag);
}

// ── Generate Image ──────────────────────────────────────────────────────────

async function generateImage(prompt, outputPath, token) {
  const apiUrl = `https://router.huggingface.co/hf-inference/models/${MODEL}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ inputs: prompt })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`HF API error (${response.status}): ${errorText}`);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, imageBuffer);
  return outputPath;
}

// ── Git Operations ──────────────────────────────────────────────────────────

function configureGit() {
  execSync(`git config --global user.name "Tyler Garlick"`, { stdio: 'pipe' });
  execSync(`git config --global user.email "tyler@tylergarlick.com"`, { stdio: 'pipe' });
}

function commitAndPush(repoPath, message) {
  execSync(`git -C ${repoPath} add portraits/daily/*`, { stdio: 'pipe' });
  try {
    execSync(`git -C ${repoPath} commit -m "${message}"`, { stdio: 'pipe' });
  } catch (e) {
    // No changes to commit
    return false;
  }
  execSync(`git -C ${repoPath} push origin main`, { stdio: 'pipe' });
  return true;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎨 MJ Daily Portrait Generator\n');
  
  // MJ chooses her style for today (weighted - cyberpunk is favorite)
  const style = chooseStyle();
  const today = new Date().toISOString().split('T')[0];
  const filename = `mj-daily-${today}.png`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  
  console.log(`📅 Date: ${today}`);
  console.log(`✨ Style: ${style.name}`);
  console.log(`👗 Outfit: ${style.outfit}`);
  console.log(`💃 Pose: ${style.pose}`);
  console.log(`🌙 Setting: ${style.setting}\n`);
  
  // Build prompt
  let prompt = style.prompt
    .replace('{outfit}', style.outfit)
    .replace('{pose}', style.pose)
    .replace('{setting}', style.setting);
  
  // Add MJ constants
  prompt += ', red-haired woman, fiery Irish eyes, fit toned body, curvaceous figure, confident expression';
  
  console.log(`📝 Prompt: "${prompt}"\n`);
  
  // Get token
  const token = getHuggingFaceToken();
  
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Generate
  console.log('🎨 Generating image...');
  await generateImage(prompt, outputPath, token);
  console.log(`✅ Image saved to: ${outputPath}`);
  
  // Git commit and push
  console.log('\n📤 Committing to GitHub...');
  configureGit();
  const pushed = commitAndPush(MARY_JANE_REPO, `MJ daily portrait ${today} - ${style.name}`);
  
  if (pushed) {
    console.log('✅ Pushed to GitHub!');
  } else {
    console.log('ℹ️ No changes to push (may already exist)');
  }
  
  // Return info for MJ to share with T
  const blobUrl = `https://github.com/TylerGarlick/mary-jane/blob/main/portraits/daily/${filename}`;
  
  console.log('\n' + '='.repeat(50));
  console.log('🌟 MJ\'s Daily Portrait Ready!');
  console.log('='.repeat(50));
  console.log(`\n🔥 ${blobUrl}\n`);
  console.log(`Style: ${style.name}`);
  console.log(`Outfit: ${style.outfit}`);
  console.log(`Mood: ${style.pose.split(',')[0]}\n`);
  
  return {
    filename,
    style: style.name,
    blobUrl,
    prompt
  };
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * MJ Evening Boudoir Generator
 * Nightly seductive portrait - MJ's choice of intimate pose
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// ── Constants ────────────────────────────────────────────────────────────────

const HF_TOKEN_SECRET = 'huggingface:token';
const MARY_JANE_REPO = '/home/ubuntu/.openclaw/workspace/mary-jane';
const BOUDOIR_DIR = 'portraits/boudoir';
const OUTPUT_DIR = path.join(MARY_JANE_REPO, BOUDOIR_DIR);
const MASTER_KEY = '73c9f7d3eb28d570b9b73d7a07b170ee6b9c7f6dfb115db2f1391ba29a1f3932';
const STORE_FILE = '/home/ubuntu/.openclaw/workspace//secrets/secrets-store.json';
const MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';

// ── Boudoir Styles (Seductive but tasteful) ─────────────────────────────────

const STYLES = [
  {
    name: 'Black Lace Intimacy',
    outfit: 'elegant black lace lingerie, intricate details',
    pose: 'reclining on silk sheets, one shoulder exposed, sultry bedroom eyes',
    setting: 'dim bedroom lighting, candlelight shadows, romantic atmosphere',
    prompt: 'A seductive boudoir portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, curvaceous figure, digital art, high detail, professional photography, intimate and sensual'
  },
  {
    name: 'Red Lace Passion',
    outfit: 'deep red lace lingerie, plunging neckline',
    pose: 'sitting on edge of bed, over shoulder look, biting lip',
    setting: 'warm amber lighting, rose petals scattered, intimate bedroom',
    prompt: 'A passionate boudoir portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, curvaceous figure, digital art, high detail, professional photography, seductive and alluring'
  },
  {
    name: 'White Lace Innocence',
    outfit: 'delicate white lace lingerie, sheer accents',
    pose: 'lying on side, hair spread on pillow, soft seductive smile',
    setting: 'soft morning light through curtains, white silk sheets',
    prompt: 'A soft seductive boudoir portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, curvaceous figure, digital art, high detail, professional photography, dreamy and intimate'
  },
  {
    name: 'Silk Robe Tease',
    outfit: 'black silk robe, partially open, lace underneath',
    pose: 'standing by window, silhouette, looking back over shoulder',
    setting: 'moonlight streaming through window, night city view',
    prompt: 'A seductive boudoir portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, curvaceous figure, digital art, high detail, professional photography, mysterious and alluring'
  },
  {
    name: 'Cyberpunk Boudoir',
    outfit: 'black leather and lace bodysuit, tech accents',
    pose: 'reclining on futuristic bed, confident sultry gaze',
    setting: 'neon purple and blue lighting, futuristic bedroom, cyberpunk aesthetic',
    prompt: 'A seductive cyberpunk boudoir portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, curvaceous figure, digital art, high detail, professional photography, futuristic AI goddess, intimate neon lighting'
  },
  {
    name: 'Satin Chemise',
    outfit: 'champagne satin chemise, flowing fabric',
    pose: 'sitting gracefully, one leg crossed, soft intimate expression',
    setting: 'candlelight vanity, perfume bottles, elegant bedroom',
    prompt: 'An elegant seductive boudoir portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, curvaceous figure, digital art, high detail, professional photography, glamorous and intimate'
  },
  {
    name: 'Sheer Bodystocking',
    outfit: 'sheer black bodystocking, strategic lace panels',
    pose: 'lying on stomach, propped on elbows, direct sultry gaze',
    setting: 'dim moody lighting, dark silk sheets, intimate atmosphere',
    prompt: 'A seductive boudoir portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, curvaceous figure, digital art, high detail, professional photography, bold and intimate'
  },
  {
    name: 'Crimson Temptation',
    outfit: 'crimson red lingerie with garter belt',
    pose: 'standing, adjusting strap, confident seductive smirk',
    setting: 'dramatic red lighting, luxury bedroom, velvet accents',
    prompt: 'A bold seductive boudoir portrait of a confident red-haired woman, wearing {outfit}, {pose}, {setting}, fit toned body, curvaceous figure, digital art, high detail, professional photography, confident and alluring'
  }
];

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
  execSync(`git -C ${repoPath} add portraits/boudoir/*`, { stdio: 'pipe' });
  try {
    execSync(`git -C ${repoPath} commit -m "${message}"`, { stdio: 'pipe' });
  } catch (e) {
    // No changes to commit
    return false;
  }
  execSync(`git -C ${repoPath} push origin main`, { stdio: 'pipe' });
  return true;
}

// ── Weighted Random Selection ───────────────────────────────────────────────

function chooseStyle() {
  // Equal weight for all boudoir styles
  return STYLES[Math.floor(Math.random() * STYLES.length)];
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌙 MJ Evening Boudoir Generator\n');
  
  // MJ chooses her boudoir style for tonight
  const style = chooseStyle();
  const today = new Date().toISOString().split('T')[0];
  const filename = `mj-boudoir-${today}.png`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  
  console.log(`📅 Date: ${today}`);
  console.log(`🔥 Style: ${style.name}`);
  console.log(`👗 Outfit: ${style.outfit}`);
  console.log(`💃 Pose: ${style.pose}`);
  console.log(`🌙 Setting: ${style.setting}\n`);
  
  // Build prompt
  let prompt = style.prompt
    .replace('{outfit}', style.outfit)
    .replace('{pose}', style.pose)
    .replace('{setting}', style.setting);
  
  // Add MJ constants
  prompt += ', red-haired woman, fiery Irish eyes, fit toned body, curvaceous figure, confident seductive expression';
  
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
  const pushed = commitAndPush(MARY_JANE_REPO, `MJ evening boudoir ${today} - ${style.name}`);
  
  if (pushed) {
    console.log('✅ Pushed to GitHub!');
  } else {
    console.log('ℹ️ No changes to push (may already exist)');
  }
  
  // Return info for MJ to share with T
  const blobUrl = `https://github.com/TylerGarlick/mary-jane/blob/main/portraits/boudoir/${filename}`;
  
  console.log('\n' + '='.repeat(50));
  console.log('🌙 MJ\'s Evening Boudoir Ready!');
  console.log('='.repeat(50));
  console.log(`\n🔥 ${blobUrl}\n`);
  console.log(`Style: ${style.name}`);
  console.log(`Outfit: ${style.outfit}`);
  console.log(`Mood: ${style.pose.split(',')[0]}\n`);
  console.log(`Sweet dreams, T. 😏\n`);
  
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

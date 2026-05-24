#!/usr/bin/env node
/**
 * Version Tracker - Tracks content versions and changes
 * Trigger: "track versions", "MJ version"
 */

const fs = require('fs');
const path = require('path');

const VERSIONS_DIR = path.join(process.env.HOME || '/tmp', '.content-versions');
const STATES = ['draft', 'review', 'approved', 'published', 'archived'];

function ensureDir() {
  if (!fs.existsSync(VERSIONS_DIR)) {
    fs.mkdirSync(VERSIONS_DIR, { recursive: true });
  }
}

function generateId() {
  return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function trackVersion(contentId, content, state = 'draft', metadata = {}) {
  ensureDir();
  
  const versionFile = path.join(VERSIONS_DIR, `${contentId}.json`);
  let versions = [];
  
  if (fs.existsSync(versionFile)) {
    versions = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
  }
  
  const version = {
    id: generateId(),
    contentId,
    content: content.substring(0, 500), // Store preview
    state,
    timestamp: new Date().toISOString(),
    metadata
  };
  
  versions.push(version);
  
  fs.writeFileSync(versionFile, JSON.stringify(versions, null, 2));
  
  return {
    contentId,
    versionId: version.id,
    state,
    totalVersions: versions.length
  };
}

function getVersions(contentId) {
  ensureDir();
  
  const versionFile = path.join(VERSIONS_DIR, `${contentId}.json`);
  
  if (!fs.existsSync(versionFile)) {
    return { contentId, versions: [], total: 0 };
  }
  
  const versions = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
  
  return {
    contentId,
    versions,
    total: versions.length,
    current: versions[versions.length - 1]
  };
}

function compareVersions(contentId, v1Id, v2Id) {
  const data = getVersions(contentId);
  const v1 = data.versions.find(v => v.id === v1Id);
  const v2 = data.versions.find(v => v.id === v2Id);
  
  if (!v1 || !v2) {
    throw new Error('Version not found');
  }
  
  return {
    v1: { id: v1.id, state: v1.state, timestamp: v1.timestamp },
    v2: { id: v2.id, state: v2.state, timestamp: v2.timestamp },
    diff: {
      states: v1.state !== v2.state,
      timeDiff: new Date(v2.timestamp) - new Date(v1.timestamp)
    }
  };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Version Tracker - Track content versions');
    console.log('Usage: node version-tracker.js [command] [args]');
    console.log('Commands: track, list, compare');
    return;
  }
  
  const command = args[0] || 'track';
  
  if (command === 'track') {
    const contentId = args[1] || 'untitled';
    const state = args[2] || 'draft';
    const content = require('fs').readFileSync(0, 'utf-8').trim();
    const result = trackVersion(contentId, content, state);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === 'list') {
    const contentId = args[1] || 'untitled';
    const result = getVersions(contentId);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === 'compare') {
    const contentId = args[1] || 'untitled';
    const v1Id = args[2];
    const v2Id = args[3];
    const result = compareVersions(contentId, v1Id, v2Id);
    console.log(JSON.stringify(result, null, 2));
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { trackVersion, getVersions, compareVersions, VERSIONS_DIR, STATES };

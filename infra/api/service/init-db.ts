#!/usr/bin/env bun
/**
 * Abraxas Knowledge Graph - Database Initialization Script
 * 
 * Creates document and edge collections in ArangoDB.
 * Run with: bun run init-db.ts
 */

import { Database } from 'arangojs';

const DB_URL = 'http://localhost:8529';
const DB_NAME = 'abraxas_db';
const ROOT_USER = 'root';
const ROOT_PASS = '5orange5';

// Document Collections
const DOCUMENT_COLLECTIONS = [
  'dream_sessions',
  'hypotheses',
  'concepts',
  'actionable_plans',
  'benchmark_results'
];

// Edge Collections
const EDGE_COLLECTIONS = [
  'SESS_TO_HYPO',
  'HYPO_TO_CONCEPT',
  'CONCEPT_TO_PLAN'
];

async function initializeDatabase() {
  console.log('🔷 Abraxas Knowledge Graph - Database Initialization\n');

  // Connect to system database first to ensure abraxas_db exists
  const sysDb = new Database({
    url: DB_URL,
    databaseName: '_system',
    auth: {
      type: 'basic',
      username: ROOT_USER,
      password: ROOT_PASS
    }
  });

  try {
    await sysDb.createDatabase(DB_NAME);
    console.log(`✅ Database '${DB_NAME}' created.`);
  } catch (e: any) {
    if (e.errorCode === 1201 || e.errorCode === 1207 || e.code === 409) {
      console.log(`ℹ️  Database '${DB_NAME}' already exists.`);
    } else {
      throw e;
    }
  }

  // Connect to the abraxas_db database
  const db = new Database({
    url: DB_URL,
    databaseName: DB_NAME,
    auth: {
      type: 'basic',
      username: ROOT_USER,
      password: ROOT_PASS
    }
  });

  console.log(`🔗 Connected to '${DB_NAME}'\n`);

  // Create Document Collections
  console.log('📁 Creating Document Collections...');
  for (const collName of DOCUMENT_COLLECTIONS) {
    try {
      await db.createCollection(collName);
      console.log(`   ✅ ${collName}`);
    } catch (e: any) {
      if (e.errorCode === 1207) {
        console.log(`   ℹ️  ${collName} (already exists)`);
      } else {
        console.error(`   ❌ ${collName}: ${e.message}`);
      }
    }
  }

  // Create Edge Collections
  console.log('\n🔗 Creating Edge Collections...');
  for (const collName of EDGE_COLLECTIONS) {
    try {
      await db.createCollection(collName, { type: 'edge' });
      console.log(`   ✅ ${collName}`);
    } catch (e: any) {
      if (e.errorCode === 1207) {
        console.log(`   ℹ️  ${collName} (already exists)`);
      } else {
        console.error(`   ❌ ${collName}: ${e.message}`);
      }
    }
  }

  // Verify all collections exist
  console.log('\n🔍 Verifying collections...');
  const collections = await db.collections();
  const collectionNames = collections.map((c: any) => c.name);
  
  const allExpected = [...DOCUMENT_COLLECTIONS, ...EDGE_COLLECTIONS];
  const missing = allExpected.filter(name => !collectionNames.includes(name));

  if (missing.length === 0) {
    console.log('   ✅ All collections verified successfully!\n');
    console.log('📊 Collection Summary:');
    console.log(`   Document Collections: ${DOCUMENT_COLLECTIONS.length}`);
    console.log(`   Edge Collections: ${EDGE_COLLECTIONS.length}`);
    console.log(`   Total: ${allExpected.length}\n`);
    console.log('🎉 Database initialization complete!');
  } else {
    console.error(`   ❌ Missing collections: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase().catch((err) => {
  console.error('❌ Initialization failed:', err);
  process.exit(1);
});

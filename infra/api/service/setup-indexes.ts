#!/usr/bin/env bun
/**
 * Abraxas Knowledge Graph - Index Setup Script
 * 
 * Creates persistent indexes for optimized query performance.
 * Run with: bun run setup-indexes.ts
 * 
 * Indexes created:
 * - actionable_plans.groundingStatus (persistent index for fast filtering)
 * - hypotheses.noveltyScore (persistent index for high-value pattern identification)
 * - Edge collection indexes (skipValue for optimized graph traversals)
 */

import { Database } from 'arangojs';

const DB_URL = 'http://localhost:8529';
const DB_NAME = 'abraxas_db';
const ROOT_USER = 'root';
const ROOT_PASS = '5orange5';

// Index definitions
const INDEX_DEFINITIONS = [
  {
    collection: 'actionable_plans',
    type: 'persistent',
    fields: ['groundingStatus'],
    name: 'groundingStatusIndex',
    description: 'Fast filtering by grounding status'
  },
  {
    collection: 'hypotheses',
    type: 'persistent',
    fields: ['noveltyScore'],
    name: 'noveltyScoreIndex',
    description: 'High-value pattern identification by novelty score'
  },
  {
    collection: 'SESS_TO_HYPO',
    type: 'edge',
    fields: ['_from', '_to'],
    name: 'edgeIndex',
    description: 'Optimized graph traversals (from/to)'
  },
  {
    collection: 'HYPO_TO_CONCEPT',
    type: 'edge',
    fields: ['_from', '_to'],
    name: 'edgeIndex',
    description: 'Optimized graph traversals (from/to)'
  },
  {
    collection: 'CONCEPT_TO_PLAN',
    type: 'edge',
    fields: ['_from', '_to'],
    name: 'edgeIndex',
    description: 'Optimized graph traversals (from/to)'
  }
];

async function setupIndexes() {
  console.log('🔷 Abraxas Knowledge Graph - Index Setup\n');

  const db = new Database({
    url: DB_URL,
    databaseName: DB_NAME,
    auth: {
      type: 'basic',
      username: ROOT_USER,
      password: ROOT_PASS
    }
  });

  try {
    // Test connection
    await db.version();
    console.log(`🔗 Connected to '${DB_NAME}' at ${DB_URL}\n`);
  } catch (err: any) {
    console.error(`❌ Failed to connect to ArangoDB: ${err.message}`);
    console.error('   Make sure ArangoDB is running and credentials are correct.');
    process.exit(1);
  }

  console.log('📊 Creating Indexes...\n');

  for (const indexDef of INDEX_DEFINITIONS) {
    const { collection: collName, type, fields, name, description } = indexDef;
    
    try {
      const collection = db.collection(collName);
      
      // Check if collection exists
      try {
        await collection.get();
      } catch (err: any) {
        if (err.code === 404) {
          console.log(`   ⚠️  Skipping ${collName}: collection does not exist`);
          continue;
        }
        throw err;
      }

      // Create index
      let indexName: string;
      
      if (type === 'edge') {
        // Edge collections automatically have indexes on _from and _to
        // We'll verify they exist and are properly configured
        console.log(`   ℹ️  ${collName}: Edge collections have automatic _from/_to indexes`);
        console.log(`      ${description}`);
        
        // List existing indexes to verify
        const indexes = await collection.indexes();
        const edgeIndexes = indexes.filter((idx: any) => 
          idx.type === 'edge' || 
          (idx.fields && (idx.fields.includes('_from') || idx.fields.includes('_to')))
        );
        
        if (edgeIndexes.length > 0) {
          console.log(`      ✅ Edge indexes verified (${edgeIndexes.length} found)`);
        }
        continue;
      } else {
        // Create persistent index using ensureIndex
        const options: any = {
          name: name,
          type: type,
          fields: fields
        };

        const result = await collection.ensureIndex(options);
        indexName = result.name || name;
        
        console.log(`   ✅ ${collName}.${fields.join(', ')}`);
        console.log(`      Type: ${type}`);
        console.log(`      ${description}`);
        
        if (result.isNewlyCreated) {
          console.log(`      Status: newly created`);
        } else {
          console.log(`      Status: already existed`);
        }
      }
      
    } catch (err: any) {
      // Check if index already exists
      if (err.errorCode === 1212 || err.code === 409) {
        console.log(`   ℹ️  ${collName}.${fields.join(', ')} (index already exists)`);
      } else {
        console.error(`   ❌ ${collName}.${fields.join(', ')}: ${err.message}`);
      }
    }
  }

  // Verify all indexes
  console.log('\n🔍 Verifying Indexes...\n');
  
  const collectionsToVerify = ['actionable_plans', 'hypotheses', 'SESS_TO_HYPO', 'HYPO_TO_CONCEPT', 'CONCEPT_TO_PLAN'];
  
  for (const collName of collectionsToVerify) {
    try {
      const collection = db.collection(collName);
      const indexes = await collection.indexes();
      
      console.log(`   📁 ${collName}:`);
      for (const idx of indexes) {
        if (idx.type !== 'primary') { // Skip primary key index
          console.log(`      - ${idx.type}: ${idx.fields ? idx.fields.join(', ') : 'N/A'}`);
        }
      }
      console.log('');
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`   ⚠️  ${collName}: collection does not exist (skipped)`);
      } else {
        console.error(`   ❌ ${collName}: ${err.message}`);
      }
    }
  }

  console.log('🎉 Index setup complete!\n');
  
  // Summary
  console.log('📋 Index Summary:');
  console.log('   Document Collection Indexes:');
  console.log('      - actionable_plans.groundingStatus (persistent)');
  console.log('      - hypotheses.noveltyScore (persistent)');
  console.log('   Edge Collection Indexes:');
  console.log('      - SESS_TO_HYPO._from, _to (automatic)');
  console.log('      - HYPO_TO_CONCEPT._from, _to (automatic)');
  console.log('      - CONCEPT_TO_PLAN._from, _to (automatic)');
  console.log('');
}

// Run index setup
setupIndexes().catch((err) => {
  console.error('❌ Index setup failed:', err);
  process.exit(1);
});

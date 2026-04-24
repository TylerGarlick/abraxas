import { ApolloServer, gql } from 'apollo-server';
import { Database, aql } from 'arangojs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env.sovereign') });

// --- Database Configuration ---
const db = new Database({
  url: process.env.ARANGO_URL || 'http://arangodb:8529',
  databaseName: process.env.ARANGO_DB || 'abraxas_db',
  auth: {
    type: 'basic',
    username: process.env.ARANGO_USER || 'root',
    password: process.env.ARANGO_PASSWORD || '[REDACTED_Sovereign_Credential]'
  }
});

// --- Sovereign Channels Configuration ---
function loadSovereignChannels(): Set<string> {
  const envChannels = process.env.SOVEREIGN_CHANNELS;
  if (envChannels) {
    return new Set(envChannels.split(',').map(id => id.trim()).filter(Boolean));
  }
  
  // Fallback to config file
  try {
    const configPath = path.join(__dirname, '../../../config/sovereign-channels.json');
    if (!fs.existsSync(configPath)) {
      console.warn(`Warning: Sovereign config file not found at ${configPath}`);
      return new Set();
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const channels = config.sovereignChannels || [];
    console.log(`✅ Loaded ${channels.length} sovereign channels from config`);
    return new Set(channels);
  } catch (e: any) {
    console.error(`❌ Error loading sovereign channels config: ${e.message}`);
    return new Set();
  }
}

const SOVEREIGN_CHANNELS = loadSovereignChannels();

function validateSovereignChannel(channelId: string | undefined): void {
  if (!channelId) {
    throw new Error('Unauthorized: channelId is required for write operations');
  }
  if (!SOVEREIGN_CHANNELS.has(channelId)) {
    throw new Error(`Unauthorized: Channel ${channelId} is not authorized for write operations`);
  }
}

const ROOT_PASS = '[REDACTED_Sovereign_Credential]';

async function ensureDb() {
  try {
    // We must use the system database to create a new user database
    const sysDb = new Database({
      url: process.env.ARANGO_URL || 'http://arangodb:8529',
      databaseName: '_system',
      auth: {
        type: 'basic',
        username: process.env.ARANGO_USER || 'root',
        password: process.env.ARANGO_PASSWORD || '[REDACTED_Sovereign_Credential]'
      }
    });
    
    await sysDb.createDatabase(process.env.ARANGO_DB || 'abraxas_db');
    console.log('Database abraxas_db created.');
  } catch (e: any) {
    if (e.errorCode === 1201) {
      console.log('Database abraxas_db already exists.');
    } else {
      console.error('Error creating database:', e);
    }
  }
}

// --- Schema Loading ---
const schemaPath = path.join(__dirname, '../schema.graphql');
const typeDefs = gql(fs.readFileSync(schemaPath, 'utf8'));

// --- Resolvers ---
const resolvers = {
  Query: {
    dreamSession: async (_: any, { id }: { id: string }) => {
      const coll = db.collection('dream_sessions');
      return await coll.document(id);
    },
    hypothesis: async (_: any, { id }: { id: string }) => {
      const coll = db.collection('hypotheses');
      return await coll.document(id);
    },
    concept: async (_: any, { id }: { id: string }) => {
      const coll = db.collection('concepts');
      return await coll.document(id);
    },
    actionablePlans: async (_: any, { status }: { status?: string }) => {
      const query = status 
        ? aql`for p in actionable_plans filter p.groundingStatus == ${status} return p`
        : aql`for p in actionable_plans return p`;
      const cursor = await db.query(query);
      return await cursor.all();
    },
    benchmarkResults: async (_: any, { modelId }: { modelId?: string }) => {
      const query = modelId 
        ? aql`for r in benchmark_results filter r.modelId == ${modelId} return r`
        : aql`for r in benchmark_results return r`;
      const cursor = await db.query(query);
      return await cursor.all();
    },
  },
  Mutation: {
    startDreamCycle: async (_: any, { prompt, seedConcepts, channelId }: { prompt: string, seedConcepts: string[], channelId: string }) => {
      validateSovereignChannel(channelId);
      
      const sessionColl = db.collection('dream_sessions');
      const session = {
        timestamp: new Date().toISOString(),
        userPrompt: prompt,
        seedConcepts,
        channelId,
      };
      const result = await sessionColl.save(session);
      return { _id: result._id, _key: result._key, ...session };
    },
    uploadBenchmarkBatch: async (_: any, { modelId, results, channelId }: { modelId: string, results: any[], channelId: string }) => {
      validateSovereignChannel(channelId);
      
      const coll = db.collection('benchmark_results');
      let count = 0;
      
      for (const res of results) {
        const doc = {
          queryId: res.queryId,
          category: res.category,
          queryText: res.queryText,
          normalResponse: res.normalResponse,
          abraxasResponse: res.abraxasResponse,
          scores: {
            nl: res.nl,
            al: res.al
          },
          modelId,
          channelId,
          timestamp: new Date().toISOString()
        };
        await coll.save(doc);
        count++;
      }
      
      return count;
    },
    createHypothesis: async (_: any, { 
      sessionId, 
      rawPatternRepresentation, 
      metadata,
      channelId
    }: { 
      sessionId: string, 
      rawPatternRepresentation: string,
      metadata: any,
      channelId: string
    }) => {
      validateSovereignChannel(channelId);
      
      const hypoColl = db.collection('hypotheses');
      const edgeColl = db.collection('SESS_TO_HYPO');
      
      // Create the hypothesis document
      const hypoData = {
        rawPatternRepresentation,
        metadata,
        isValuable: false,
        channelId,
      };
      const hypoResult = await hypoColl.save(hypoData);
      
      // Create edge from session to hypothesis
      const sessionColl = db.collection('dream_sessions');
      const session = await sessionColl.document(sessionId);
      if (!session) throw new Error('Session not found');
      
      await edgeColl.save({
        _from: `dream_sessions/${sessionId}`,
        _to: `hypotheses/${hypoResult._key}`,
        createdAt: new Date().toISOString(),
      });
      
      return { _id: hypoResult._id, _key: hypoResult._key, ...hypoData };
    },
    translateHypothesisToConcept: async (_: any, {
      hypothesisId,
      name,
      description,
      channelId
    }: {
      hypothesisId: string,
      name: string,
      description: string,
      channelId: string
    }) => {
      validateSovereignChannel(channelId);
      
      const conceptColl = db.collection('concepts');
      const edgeColl = db.collection('HYPO_TO_CONCEPT');
      
      // Verify hypothesis exists
      const hypoColl = db.collection('hypotheses');
      const hypothesis = await hypoColl.document(hypothesisId);
      if (!hypothesis) throw new Error('Hypothesis not found');
      
      // Create the concept document
      const conceptData = {
        name,
        description,
        channelId,
      };
      const conceptResult = await conceptColl.save(conceptData);
      
      // Create edge from hypothesis to concept
      await edgeColl.save({
        _from: `hypotheses/${hypothesisId}`,
        _to: `concepts/${conceptResult._key}`,
        createdAt: new Date().toISOString(),
      });
      
      return { _id: conceptResult._id, _key: conceptResult._key, ...conceptData };
    },
    archiveHypothesis: async (_: any, { hypothesisId, isValuable, channelId }: { hypothesisId: string, isValuable: boolean, channelId: string }) => {
      validateSovereignChannel(channelId);
      
      const coll = db.collection('hypotheses');
      const doc = await coll.document(hypothesisId);
      if (!doc) throw new Error('Hypothesis not found');
      
      doc.isValuable = isValuable;
      await coll.update(hypothesisId, doc);
      return { _id: doc._id, _key: doc._key, ...doc };
    },
    groundConcept: async (_: any, { conceptId, plan, channelId }: { conceptId: string, plan: any, channelId: string }) => {
      validateSovereignChannel(channelId);
      
      const planColl = db.collection('actionable_plans');
      const conceptColl = db.collection('concepts');
      const edgeColl = db.collection('CONCEPT_TO_PLAN');
      
      // Verify concept exists
      const concept = await conceptColl.document(conceptId);
      if (!concept) throw new Error('Concept not found');
      
      // Create the actionable plan
      const planData = {
        ...plan,
        groundingStatus: 'ANCHORED',
        guardrailChecks: [],
        channelId,
      };
      const planResult = await planColl.save(planData);
      
      // Create edge from concept to plan
      await edgeColl.save({
        _from: `concepts/${conceptId}`,
        _to: `actionable_plans/${planResult._key}`,
        createdAt: new Date().toISOString(),
      });
      
      return { _id: planResult._id, _key: planResult._key, ...planData };
    }
  },
  // Add ID field resolvers for all types to map _key to id
  DreamSession: {
    id: (parent: any) => parent._key || parent._id.split('/')[1],
    // Traverse OUTBOUND from session through SESS_TO_HYPO edges to find hypotheses
    hypotheses: async (parent: any) => {
      const query = aql`
        FOR vertex, edge IN 1..1 OUTBOUND ${parent._id} SESS_TO_HYPO
        RETURN vertex
      `;
      const cursor = await db.query(query);
      return await cursor.all();
    },
    // Find other hypotheses that acted as seeds for this session (inspired-by relationships)
    inspiredBy: async (parent: any) => {
      // Look for hypotheses from OTHER sessions that reference this session's hypotheses as inspiration
      // This traverses: session -> its hypotheses <- other sessions' hypotheses (via shared concepts or explicit links)
      const query = aql`
        FOR hypo IN 1..1 OUTBOUND ${parent._id} SESS_TO_HYPO
          FOR concept IN 1..1 OUTBOUND hypo._id HYPO_TO_CONCEPT
            FOR otherHypo IN 1..1 INBOUND concept._id HYPO_TO_CONCEPT
              FILTER otherHypo._id != hypo._id
              FOR otherSession IN 1..1 INBOUND otherHypo._id SESS_TO_HYPO
                FILTER otherSession._id != ${parent._id}
                RETURN DISTINCT otherHypo
      `;
      const cursor = await db.query(query);
      const results = await cursor.all();
      return results.length > 0 ? results : null;
    }
  },
  Hypothesis: {
    id: (parent: any) => parent._key || parent._id.split('/')[1],
    // Traverse INBOUND from hypothesis through SESS_TO_HYPO to find parent session
    dreamSession: async (parent: any) => {
      const query = aql`
        FOR vertex, edge IN 1..1 INBOUND ${parent._id} SESS_TO_HYPO
          RETURN vertex
      `;
      const cursor = await db.query(query);
      const results = await cursor.all();
      return results.length > 0 ? results[0] : null;
    },
    // Traverse OUTBOUND from hypothesis through HYPO_TO_CONCEPT to find translated concept
    translatedTo: async (parent: any) => {
      const query = aql`
        FOR vertex, edge IN 1..1 OUTBOUND ${parent._id} HYPO_TO_CONCEPT
          RETURN vertex
      `;
      const cursor = await db.query(query);
      const results = await cursor.all();
      return results.length > 0 ? results[0] : null;
    },
    // Find dream sessions that were inspired by this hypothesis
    inspiredDreams: async (parent: any) => {
      const query = aql`
        FOR concept IN 1..1 OUTBOUND ${parent._id} HYPO_TO_CONCEPT
          FOR otherHypo IN 1..1 INBOUND concept._id HYPO_TO_CONCEPT
            FILTER otherHypo._id != ${parent._id}
            FOR session IN 1..1 INBOUND otherHypo._id SESS_TO_HYPO
              RETURN DISTINCT session
      `;
      const cursor = await db.query(query);
      const results = await cursor.all();
      return results.length > 0 ? results : null;
    },
    // Generic inspiredBy resolver: find other hypotheses that acted as seeds for this one
    // Traverses: this hypothesis <- concept <- other hypotheses (that translated to same concept)
    inspiredBy: async (parent: any) => {
      const query = aql`
        // Find concepts this hypothesis translated to
        FOR concept IN 1..1 OUTBOUND ${parent._id} HYPO_TO_CONCEPT
          // Find other hypotheses that also translated to these concepts
          FOR otherHypo IN 1..1 INBOUND concept._id HYPO_TO_CONCEPT
            FILTER otherHypo._id != ${parent._id}
            RETURN DISTINCT otherHypo
      `;
      const cursor = await db.query(query);
      const results = await cursor.all();
      return results.length > 0 ? results : null;
    }
  },
  Concept: {
    id: (parent: any) => parent._key || parent._id.split('/')[1],
    // Traverse INBOUND from concept through HYPO_TO_CONCEPT to find source hypothesis
    sourceHypothesis: async (parent: any) => {
      const query = aql`
        FOR vertex, edge IN 1..1 INBOUND ${parent._id} HYPO_TO_CONCEPT
          RETURN vertex
      `;
      const cursor = await db.query(query);
      const results = await cursor.all();
      return results.length > 0 ? results[0] : null;
    },
    // Traverse OUTBOUND from concept through CONCEPT_TO_PLAN to find grounded plan
    groundedAs: async (parent: any) => {
      const query = aql`
        FOR vertex, edge IN 1..1 OUTBOUND ${parent._id} CONCEPT_TO_PLAN
          RETURN vertex
      `;
      const cursor = await db.query(query);
      const results = await cursor.all();
      return results.length > 0 ? results[0] : null;
    }
  },
  ActionablePlan: {
    id: (parent: any) => parent._key || parent._id.split('/')[1],
    // Traverse INBOUND from plan through CONCEPT_TO_PLAN to find source concept
    sourceConcept: async (parent: any) => {
      const query = aql`
        FOR vertex, edge IN 1..1 INBOUND ${parent._id} CONCEPT_TO_PLAN
          RETURN vertex
      `;
      const cursor = await db.query(query);
      const results = await cursor.all();
      return results.length > 0 ? results[0] : null;
    },
    // Full provenance chain: plan -> concept -> hypothesis -> session
    provenanceChain: async (parent: any) => {
      const query = aql`
        // Start from the plan and traverse the full chain back to the dream session
        FOR concept, planEdge IN 1..1 INBOUND ${parent._id} CONCEPT_TO_PLAN
          FOR hypothesis, conceptEdge IN 1..1 INBOUND concept._id HYPO_TO_CONCEPT
            FOR session, hypoEdge IN 1..1 INBOUND hypothesis._id SESS_TO_HYPO
              RETURN {
                plan: MERGE(${parent}, {_id: ${parent._id}, _key: PARSE_IDENTIFIER(${parent._id}).key}),
                planToConceptEdge: planEdge,
                concept: concept,
                conceptToHypothesisEdge: conceptEdge,
                hypothesis: hypothesis,
                hypothesisToSessionEdge: hypoEdge,
                session: session
              }
      `;
      const cursor = await db.query(query);
      const results = await cursor.all();
      return results.length > 0 ? results[0] : null;
    }
  },
  // EdgeInfo resolver to extract edge metadata
  EdgeInfo: {
    id: (parent: any) => parent._key || parent._id.split('/')[1],
    from: (parent: any) => parent._from,
    to: (parent: any) => parent._to,
    createdAt: (parent: any) => parent.createdAt || null,
  }
};

// --- Server Start ---
async function startServer() {
  await ensureDb();
  
  const server = new ApolloServer({ typeDefs, resolvers });
  
  server.listen({ port: 4000 }).then(({ url }) => {
    console.log(`🚀 Abraxas GraphQL Service ready at ${url}`);
  });
}

startServer().catch(console.error);

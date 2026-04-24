/**
 * End-to-End Validation: Dream -> Plan Cycle
 * 
 * This test validates the complete provenance chain from Dream Session through
 * to Actionable Plan, ensuring all edges (SESS_TO_HYPO, HYPO_TO_CONCEPT, 
 * CONCEPT_TO_PLAN) are correctly created and traversable.
 * 
 * Bead: abraxas-4ln
 */

import { ApolloServer, gql } from 'apollo-server';
import { Database, aql } from 'arangojs';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const DB_CONFIG = {
  url: 'http://localhost:8529',
  databaseName: 'abraxas_db',
  auth: {
    type: 'basic',
    username: 'root',
    password: '[REDACTED_Sovereign_Credential]'
  }
};

const GRAPHQL_PORT = 4001; // Use different port to avoid conflicts

// --- Test Data ---
const TEST_PROMPT = "How can we improve knowledge retention in distributed AI systems?";
const TEST_SEED_CONCEPTS = ["memory", "distributed systems", "knowledge graphs"];
const TEST_HYPOTHESIS = "A decentralized memory layer with semantic linking could enable emergent knowledge synthesis across AI instances.";
const TEST_CONCEPT_NAME = "Decentralized Semantic Memory Layer";
const TEST_CONCEPT_DESC = "A distributed memory architecture that uses semantic relationships to link knowledge across multiple AI systems, enabling emergent synthesis and cross-instance learning.";
const TEST_PLAN = {
  summary: "Implement a proof-of-concept decentralized memory layer",
  steps: [
    "Design the semantic linking protocol using RDF/OWL",
    "Implement a lightweight ArangoDB-based storage layer",
    "Create API endpoints for memory read/write operations",
    "Build a test harness with multiple AI agent simulations",
    "Measure knowledge retention and synthesis metrics"
  ],
  riskAssessment: "Low risk - experimental system with no production dependencies. Main risks are performance overhead and semantic drift."
};

// --- Logger ---
class Logger {
  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  static success(message: string, data?: any) {
    console.log(`\n✅ ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  static error(message: string, error?: any) {
    console.error(`\n❌ ${message}`);
    if (error) {
      console.error(error);
    }
  }
}

// --- GraphQL Client Helper ---
async function graphqlRequest<T>(
  server: ApolloServer,
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const result = await server.executeOperation({
    query,
    variables
  });
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
  }
  
  return result.data as T;
}

// --- Main Test Execution ---
async function runE2ETest() {
  Logger.log('🚀 Starting End-to-End Dream -> Plan Cycle Validation');
  Logger.log('Bead: abraxas-4ln');
  
  const db = new Database(DB_CONFIG);
  
  // Load schema
  const schemaPath = path.join(__dirname, '../schema.graphql');
  const typeDefs = gql(fs.readFileSync(schemaPath, 'utf8'));
  
  // Create resolvers (same as index.ts but with logging)
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
    },
    Mutation: {
      startDreamCycle: async (_: any, { prompt, seedConcepts }: { prompt: string, seedConcepts: string[] }) => {
        const sessionColl = db.collection('dream_sessions');
        const session = {
          timestamp: new Date().toISOString(),
          userPrompt: prompt,
          seedConcepts,
        };
        const result = await sessionColl.save(session);
        Logger.log('📝 Created Dream Session', { _key: result._key, prompt, seedConcepts });
        return { _id: result._id, _key: result._key, ...session };
      },
      createHypothesis: async (_: any, { 
        sessionId, 
        rawPatternRepresentation, 
        metadata 
      }: { 
        sessionId: string, 
        rawPatternRepresentation: string,
        metadata: any 
      }) => {
        const hypoColl = db.collection('hypotheses');
        const edgeColl = db.collection('SESS_TO_HYPO');
        
        const hypoData = {
          rawPatternRepresentation,
          metadata,
          isValuable: false,
        };
        const hypoResult = await hypoColl.save(hypoData);
        
        const sessionColl = db.collection('dream_sessions');
        const session = await sessionColl.document(sessionId);
        if (!session) throw new Error('Session not found');
        
        const edgeResult = await edgeColl.save({
          _from: `dream_sessions/${sessionId}`,
          _to: `hypotheses/${hypoResult._key}`,
          createdAt: new Date().toISOString(),
        });
        
        Logger.log('📝 Created Hypothesis with SESS_TO_HYPO edge', { 
          hypothesisKey: hypoResult._key, 
          edgeKey: edgeResult._key 
        });
        
        return { _id: hypoResult._id, _key: hypoResult._key, ...hypoData };
      },
      translateHypothesisToConcept: async (_: any, {
        hypothesisId,
        name,
        description
      }: {
        hypothesisId: string,
        name: string,
        description: string
      }) => {
        const conceptColl = db.collection('concepts');
        const edgeColl = db.collection('HYPO_TO_CONCEPT');
        
        const hypoColl = db.collection('hypotheses');
        const hypothesis = await hypoColl.document(hypothesisId);
        if (!hypothesis) throw new Error('Hypothesis not found');
        
        const conceptData = {
          name,
          description,
        };
        const conceptResult = await conceptColl.save(conceptData);
        
        const edgeResult = await edgeColl.save({
          _from: `hypotheses/${hypothesisId}`,
          _to: `concepts/${conceptResult._key}`,
          createdAt: new Date().toISOString(),
        });
        
        Logger.log('📝 Translated Hypothesis to Concept with HYPO_TO_CONCEPT edge', { 
          conceptKey: conceptResult._key, 
          edgeKey: edgeResult._key 
        });
        
        return { _id: conceptResult._id, _key: conceptResult._key, ...conceptData };
      },
      groundConcept: async (_: any, { conceptId, plan }: { conceptId: string, plan: any }) => {
        const planColl = db.collection('actionable_plans');
        const conceptColl = db.collection('concepts');
        const edgeColl = db.collection('CONCEPT_TO_PLAN');
        
        const concept = await conceptColl.document(conceptId);
        if (!concept) throw new Error('Concept not found');
        
        const planData = {
          ...plan,
          groundingStatus: 'ANCHORED',
          guardrailChecks: []
        };
        const planResult = await planColl.save(planData);
        
        const edgeResult = await edgeColl.save({
          _from: `concepts/${conceptId}`,
          _to: `actionable_plans/${planResult._key}`,
          createdAt: new Date().toISOString(),
        });
        
        Logger.log('📝 Grounded Concept as Actionable Plan with CONCEPT_TO_PLAN edge', { 
          planKey: planResult._key, 
          edgeKey: edgeResult._key 
        });
        
        return { _id: planResult._id, _key: planResult._key, ...planData };
      }
    },
    DreamSession: {
      id: (parent: any) => parent._key || parent._id.split('/')[1],
      hypotheses: async (parent: any) => {
        const query = aql`
          FOR vertex, edge IN 1..1 OUTBOUND ${parent._id} SESS_TO_HYPO
          RETURN vertex
        `;
        const cursor = await db.query(query);
        return await cursor.all();
      },
      inspiredBy: async (parent: any) => null,
    },
    Hypothesis: {
      id: (parent: any) => parent._key || parent._id.split('/')[1],
      dreamSession: async (parent: any) => {
        const query = aql`
          FOR vertex, edge IN 1..1 INBOUND ${parent._id} SESS_TO_HYPO
            RETURN vertex
        `;
        const cursor = await db.query(query);
        const results = await cursor.all();
        return results.length > 0 ? results[0] : null;
      },
      translatedTo: async (parent: any) => {
        const query = aql`
          FOR vertex, edge IN 1..1 OUTBOUND ${parent._id} HYPO_TO_CONCEPT
            RETURN vertex
        `;
        const cursor = await db.query(query);
        const results = await cursor.all();
        return results.length > 0 ? results[0] : null;
      },
      inspiredDreams: async (parent: any) => null,
      inspiredBy: async (parent: any) => null,
    },
    Concept: {
      id: (parent: any) => parent._key || parent._id.split('/')[1],
      sourceHypothesis: async (parent: any) => {
        const query = aql`
          FOR vertex, edge IN 1..1 INBOUND ${parent._id} HYPO_TO_CONCEPT
            RETURN vertex
        `;
        const cursor = await db.query(query);
        const results = await cursor.all();
        return results.length > 0 ? results[0] : null;
      },
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
      sourceConcept: async (parent: any) => {
        const query = aql`
          FOR vertex, edge IN 1..1 INBOUND ${parent._id} CONCEPT_TO_PLAN
            RETURN vertex
        `;
        const cursor = await db.query(query);
        const results = await cursor.all();
        return results.length > 0 ? results[0] : null;
      },
      provenanceChain: async (parent: any) => {
        const query = aql`
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
      },
    },
    EdgeInfo: {
      id: (parent: any) => parent._key || parent._id.split('/')[1],
      from: (parent: any) => parent._from,
      to: (parent: any) => parent._to,
      createdAt: (parent: any) => parent.createdAt || null,
    }
  };
  
  // Create server
  const server = new ApolloServer({ typeDefs, resolvers });
  
  // Start server on test port
  const { url } = await server.listen({ port: GRAPHQL_PORT });
  Logger.success('Test GraphQL server started', { url });
  
  try {
    // ============================================
    // STEP 1: Start Dream Cycle
    // ============================================
    Logger.log('\n📍 STEP 1: Starting Dream Cycle');
    
    const startDreamMutation = gql`
      mutation StartDreamCycle($prompt: String!, $seedConcepts: [String!]) {
        startDreamCycle(prompt: $prompt, seedConcepts: $seedConcepts) {
          id
          timestamp
          userPrompt
          seedConcepts
        }
      }
    `;
    
    const sessionResult = await graphqlRequest<{
      startDreamCycle: { id: string; timestamp: string; userPrompt: string; seedConcepts: string[] }
    }>(server, startDreamMutation, {
      prompt: TEST_PROMPT,
      seedConcepts: TEST_SEED_CONCEPTS
    });
    
    const sessionId = sessionResult.startDreamCycle.id;
    Logger.success('Dream Session created', sessionResult.startDreamCycle);
    
    // ============================================
    // STEP 2: Create Hypothesis
    // ============================================
    Logger.log('\n📍 STEP 2: Creating Hypothesis');
    
    const createHypoMutation = gql`
      mutation CreateHypothesis(
        $sessionId: ID!
        $rawPatternRepresentation: String!
        $metadata: HypothesisMetadataInput!
      ) {
        createHypothesis(
          sessionId: $sessionId
          rawPatternRepresentation: $rawPatternRepresentation
          metadata: $metadata
        ) {
          id
          rawPatternRepresentation
          metadata {
            noveltyScore
            coherenceScore
            creativeDrivers
          }
        }
      }
    `;
    
    const hypothesisResult = await graphqlRequest<{
      createHypothesis: { 
        id: string; 
        rawPatternRepresentation: string;
        metadata: { noveltyScore: number; coherenceScore: number; creativeDrivers: string[] }
      }
    }>(server, createHypoMutation, {
      sessionId,
      rawPatternRepresentation: TEST_HYPOTHESIS,
      metadata: {
        noveltyScore: 0.85,
        coherenceScore: 0.72,
        creativeDrivers: ['SYSTEMIC_INVERSION', 'EMERGENT_SYNTHESIS']
      }
    });
    
    const hypothesisId = hypothesisResult.createHypothesis.id;
    Logger.success('Hypothesis created', hypothesisResult.createHypothesis);
    
    // ============================================
    // STEP 3: Translate Hypothesis to Concept
    // ============================================
    Logger.log('\n📍 STEP 3: Translating Hypothesis to Concept');
    
    const translateMutation = gql`
      mutation TranslateHypothesisToConcept(
        $hypothesisId: ID!
        $name: String!
        $description: String!
      ) {
        translateHypothesisToConcept(
          hypothesisId: $hypothesisId
          name: $name
          description: $description
        ) {
          id
          name
          description
        }
      }
    `;
    
    const conceptResult = await graphqlRequest<{
      createConcept: { id: string; name: string; description: string }
    }>(server, translateMutation, {
      hypothesisId,
      name: TEST_CONCEPT_NAME,
      description: TEST_CONCEPT_DESC
    });
    
    const conceptId = conceptResult.translateHypothesisToConcept.id;
    Logger.success('Concept created', conceptResult.translateHypothesisToConcept);
    
    // ============================================
    // STEP 4: Ground Concept as Actionable Plan
    // ============================================
    Logger.log('\n📍 STEP 4: Grounding Concept as Actionable Plan');
    
    const groundMutation = gql`
      mutation GroundConcept(
        $conceptId: ID!
        $plan: ActionablePlanInput!
      ) {
        groundConcept(
          conceptId: $conceptId
          plan: $plan
        ) {
          id
          summary
          steps
          riskAssessment
          groundingStatus
        }
      }
    `;
    
    const planResult = await graphqlRequest<{
      groundConcept: { 
        id: string; 
        summary: string; 
        steps: string[];
        riskAssessment: string;
        groundingStatus: string;
      }
    }>(server, groundMutation, {
      conceptId,
      plan: TEST_PLAN
    });
    
    const planId = planResult.groundConcept.id;
    Logger.success('Actionable Plan created', planResult.groundConcept);
    
    // ============================================
    // STEP 5: Verify Provenance Chain
    // ============================================
    Logger.log('\n📍 STEP 5: Verifying Full Provenance Chain');
    
    // Query all plans with their provenance chains
    const fullProvenanceQuery = gql`
      query GetAllPlansWithProvenance {
        actionablePlans {
          id
          summary
          groundingStatus
          provenanceChain {
            plan {
              id
              summary
            }
            planToConceptEdge {
              id
              from
              to
              createdAt
            }
            concept {
              id
              name
              description
            }
            conceptToHypothesisEdge {
              id
              from
              to
              createdAt
            }
            hypothesis {
              id
              rawPatternRepresentation
              metadata {
                noveltyScore
                coherenceScore
                creativeDrivers
              }
            }
            hypothesisToSessionEdge {
              id
              from
              to
              createdAt
            }
            session {
              id
              timestamp
              userPrompt
              seedConcepts
            }
          }
        }
      }
    `;
    
    const provenanceResult = await graphqlRequest<{
      actionablePlans: Array<{
        id: string;
        summary: string;
        groundingStatus: string;
        provenanceChain: {
          plan: { id: string; summary: string };
          planToConceptEdge: { id: string; from: string; to: string; createdAt: string };
          concept: { id: string; name: string; description: string };
          conceptToHypothesisEdge: { id: string; from: string; to: string; createdAt: string };
          hypothesis: { 
            id: string; 
            rawPatternRepresentation: string;
            metadata: { noveltyScore: number; coherenceScore: number; creativeDrivers: string[] };
          };
          hypothesisToSessionEdge: { id: string; from: string; to: string; createdAt: string };
          session: { id: string; timestamp: string; userPrompt: string; seedConcepts: string[] };
        } | null;
      }>
    }>(server, fullProvenanceQuery);
    
    // Find our plan in the results
    const ourPlan = provenanceResult.actionablePlans.find(p => p.id === planId);
    
    if (!ourPlan) {
      throw new Error(`Plan with ID ${planId} not found in results`);
    }
    
    if (!ourPlan.provenanceChain) {
      throw new Error('Provenance chain is null - edges may not be properly created');
    }
    
    Logger.success('✅ PROVENANCE CHAIN VERIFIED', ourPlan.provenanceChain);
    
    // ============================================
    // STEP 6: Validate All Edges
    // ============================================
    Logger.log('\n📍 STEP 6: Validating Edge Integrity');
    
    const chain = ourPlan.provenanceChain;
    
    // Validate CONCEPT_TO_PLAN edge
    if (!chain.planToConceptEdge) {
      throw new Error('❌ Missing planToConceptEdge (CONCEPT_TO_PLAN)');
    }
    if (!chain.planToConceptEdge.from.includes('concepts/')) {
      throw new Error('❌ planToConceptEdge.from does not point to concept');
    }
    if (!chain.planToConceptEdge.to.includes('actionable_plans/')) {
      throw new Error('❌ planToConceptEdge.to does not point to plan');
    }
    Logger.success('✅ CONCEPT_TO_PLAN edge valid', {
      edgeId: chain.planToConceptEdge.id,
      from: chain.planToConceptEdge.from,
      to: chain.planToConceptEdge.to
    });
    
    // Validate HYPO_TO_CONCEPT edge
    if (!chain.conceptToHypothesisEdge) {
      throw new Error('❌ Missing conceptToHypothesisEdge (HYPO_TO_CONCEPT)');
    }
    if (!chain.conceptToHypothesisEdge.from.includes('hypotheses/')) {
      throw new Error('❌ conceptToHypothesisEdge.from does not point to hypothesis');
    }
    if (!chain.conceptToHypothesisEdge.to.includes('concepts/')) {
      throw new Error('❌ conceptToHypothesisEdge.to does not point to concept');
    }
    Logger.success('✅ HYPO_TO_CONCEPT edge valid', {
      edgeId: chain.conceptToHypothesisEdge.id,
      from: chain.conceptToHypothesisEdge.from,
      to: chain.conceptToHypothesisEdge.to
    });
    
    // Validate SESS_TO_HYPO edge
    if (!chain.hypothesisToSessionEdge) {
      throw new Error('❌ Missing hypothesisToSessionEdge (SESS_TO_HYPO)');
    }
    if (!chain.hypothesisToSessionEdge.from.includes('dream_sessions/')) {
      throw new Error('❌ hypothesisToSessionEdge.from does not point to session');
    }
    if (!chain.hypothesisToSessionEdge.to.includes('hypotheses/')) {
      throw new Error('❌ hypothesisToSessionEdge.to does not point to hypothesis');
    }
    Logger.success('✅ SESS_TO_HYPO edge valid', {
      edgeId: chain.hypothesisToSessionEdge.id,
      from: chain.hypothesisToSessionEdge.from,
      to: chain.hypothesisToSessionEdge.to
    });
    
    // ============================================
    // STEP 7: Verify Data Integrity
    // ============================================
    Logger.log('\n📍 STEP 7: Verifying Data Integrity Across Chain');
    
    // Verify the chain links match
    const validations = [
      {
        name: 'Plan ID matches',
        passed: chain.plan.id === planId,
        expected: planId,
        actual: chain.plan.id
      },
      {
        name: 'Concept ID matches',
        passed: chain.concept.id === conceptId,
        expected: conceptId,
        actual: chain.concept.id
      },
      {
        name: 'Hypothesis ID matches',
        passed: chain.hypothesis.id === hypothesisId,
        expected: hypothesisId,
        actual: chain.hypothesis.id
      },
      {
        name: 'Session ID matches',
        passed: chain.session.id === sessionId,
        expected: sessionId,
        actual: chain.session.id
      },
      {
        name: 'Hypothesis content preserved',
        passed: chain.hypothesis.rawPatternRepresentation === TEST_HYPOTHESIS,
        expected: TEST_HYPOTHESIS,
        actual: chain.hypothesis.rawPatternRepresentation
      },
      {
        name: 'Concept name preserved',
        passed: chain.concept.name === TEST_CONCEPT_NAME,
        expected: TEST_CONCEPT_NAME,
        actual: chain.concept.name
      },
      {
        name: 'Session prompt preserved',
        passed: chain.session.userPrompt === TEST_PROMPT,
        expected: TEST_PROMPT,
        actual: chain.session.userPrompt
      }
    ];
    
    let allPassed = true;
    for (const validation of validations) {
      if (validation.passed) {
        Logger.success(`✅ ${validation.name}`);
      } else {
        Logger.error(`❌ ${validation.name}`, {
          expected: validation.expected,
          actual: validation.actual
        });
        allPassed = false;
      }
    }
    
    // ============================================
    // FINAL SUMMARY
    // ============================================
    Logger.log('\n' + '='.repeat(60));
    Logger.log('📊 E2E TEST SUMMARY');
    Logger.log('='.repeat(60));
    
    if (allPassed) {
      Logger.success('🎉 ALL VALIDATIONS PASSED!');
      Logger.log('Dream -> Plan cycle is fully functional with complete provenance tracking.');
      Logger.log('\nProvenance Chain Summary:', {
        dreamSession: { id: sessionId, prompt: chain.session.userPrompt },
        hypothesis: { id: hypothesisId, representation: chain.hypothesis.rawPatternRepresentation.substring(0, 50) + '...' },
        concept: { id: conceptId, name: chain.concept.name },
        actionablePlan: { id: planId, summary: chain.plan.summary }
      });
    } else {
      Logger.error('❌ SOME VALIDATIONS FAILED - Review errors above');
      process.exit(1);
    }
    
    return {
      success: allPassed,
      sessionId,
      hypothesisId,
      conceptId,
      planId,
      provenanceChain: chain
    };
    
  } catch (error) {
    Logger.error('E2E Test failed with error', error);
    throw error;
  } finally {
    await server.stop();
    Logger.log('Test server stopped');
  }
}

// Run the test
runE2ETest()
  .then(result => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

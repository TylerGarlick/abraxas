import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Database, aql } from "arangojs";
import dotenv from "dotenv";

dotenv.config();

const ARANGO_URL = process.env.ARANGO_URL || "http://localhost:8529";
const ARANGO_DB = process.env.ARANGO_DB || "abraxas_db";
const ARANGO_USER = process.env.ARANGO_USER || "root";
const ARANGO_PASSWORD = process.env.ARANGO_PASSWORD || "";

let db: Database;

describe("Abraxas MCP Server Tests", () => {
  beforeAll(async () => {
    db = new Database({
      url: ARANGO_URL,
      databaseName: ARANGO_DB,
      auth: {
        username: ARANGO_USER,
        password: ARANGO_PASSWORD,
      },
    });
  });

  afterAll(() => {
    db.close();
  });

  describe("Database Connection", () => {
    test("should connect to ArangoDB", async () => {
      const result = await db.query(aql`RETURN true`);
      const value = await result.next();
      expect(value).toBe(true);
    });

    test("should access required collections", async () => {
      const collections = ["sessions", "hypotheses", "concepts", "plans", "provenanceChain"];
      
      for (const collectionName of collections) {
        const collection = db.collection(collectionName);
        const exists = await collection.exists();
        expect(exists).toBe(true);
      }
    });
  });

  describe("Query Provenance Tool", () => {
    test("should retrieve provenance chain for an entity", async () => {
      // Get a sample entity first
      const sampleQuery = aql`
        FOR p IN plans
        LIMIT 1
        RETURN p._key
      `;
      const sampleResult = await db.query(sampleQuery);
      const sampleId = await sampleResult.next();

      if (sampleId) {
        const query = aql`
          LET entity = DOCUMENT(plans, ${sampleId})
          LET provenanceChain = (
            FOR v, e, p IN 1..10 INBOUND ${sampleId} provenanceChain
            RETURN { vertex: v, edge: e, path: p }
          )
          RETURN {
            entity: entity,
            provenanceChain: provenanceChain,
            chainLength: LENGTH(provenanceChain)
          }
        `;
        
        const result = await db.query(query);
        const data = await result.all();
        
        expect(data).toBeArray();
        expect(data[0]).toHaveProperty("entity");
        expect(data[0]).toHaveProperty("provenanceChain");
        expect(data[0]).toHaveProperty("chainLength");
      }
    });
  });

  describe("Sieve Hypotheses Tool", () => {
    test("should filter hypotheses by novelty score", async () => {
      const query = aql`
        FOR h IN hypotheses
        FILTER h.noveltyScore >= 0.5
        SORT h.noveltyScore DESC
        LIMIT 10
        RETURN h
      `;
      
      const result = await db.query(query);
      const hypotheses = await result.all();
      
      expect(hypotheses).toBeArray();
      hypotheses.forEach((h: any) => {
        expect(h.noveltyScore).toBeGreaterThanOrEqual(0.5);
      });
    });

    test("should filter hypotheses by coherence score", async () => {
      const query = aql`
        FOR h IN hypotheses
        FILTER h.coherenceScore >= 0.5
        SORT h.coherenceScore DESC
        LIMIT 10
        RETURN h
      `;
      
      const result = await db.query(query);
      const hypotheses = await result.all();
      
      expect(hypotheses).toBeArray();
      hypotheses.forEach((h: any) => {
        expect(h.coherenceScore).toBeGreaterThanOrEqual(0.5);
      });
    });

    test("should filter hypotheses by creative drivers", async () => {
      const driver = "analogy";
      const query = aql`
        FOR h IN hypotheses
        FILTER COUNT(INTERSECTION(h.creativeDrivers || [], [${driver}])) > 0
        LIMIT 10
        RETURN h
      `;
      
      const result = await db.query(query);
      const hypotheses = await result.all();
      
      expect(hypotheses).toBeArray();
    });
  });

  describe("Anchor Concepts Tool", () => {
    test("should find plans anchored to a concept", async () => {
      const sampleQuery = aql`
        FOR c IN concepts
        LIMIT 1
        RETURN c._key
      `;
      const sampleResult = await db.query(sampleQuery);
      const sampleId = await sampleResult.next();

      if (sampleId) {
        const query = aql`
          LET concept = DOCUMENT(concepts, ${sampleId})
          LET anchoredPlans = (
            FOR v, e, p IN 1..5 OUTBOUND ${sampleId} anchorsTo, leadsTo, generates
            FILTER IS_SAME_COLLECTION(v, plans)
            RETURN { plan: v, relationship: e, path: p }
          )
          RETURN {
            concept: concept,
            anchoredPlans: anchoredPlans,
            planCount: LENGTH(anchoredPlans)
          }
        `;
        
        const result = await db.query(query);
        const data = await result.all();
        
        expect(data).toBeArray();
        expect(data[0]).toHaveProperty("concept");
        expect(data[0]).toHaveProperty("anchoredPlans");
        expect(data[0]).toHaveProperty("planCount");
      }
    });
  });

  describe("Traverse Graph Tool", () => {
    test("should traverse outbound edges", async () => {
      const sampleQuery = aql`
        FOR c IN concepts
        LIMIT 1
        RETURN c._key
      `;
      const sampleResult = await db.query(sampleQuery);
      const sampleId = await sampleResult.next();

      if (sampleId) {
        const query = aql`
          FOR v, e, p IN 1..3 OUTBOUND ${sampleId} ANY
          RETURN {
            vertex: v,
            edge: e,
            path: p,
            depth: LENGTH(p.edges)
          }
        `;
        
        const result = await db.query(query);
        const data = await result.all();
        
        expect(data).toBeArray();
        data.forEach((item: any) => {
          expect(item).toHaveProperty("vertex");
          expect(item).toHaveProperty("edge");
          expect(item).toHaveProperty("path");
          expect(item).toHaveProperty("depth");
        });
      }
    });

    test("should traverse inbound edges", async () => {
      const sampleQuery = aql`
        FOR p IN plans
        LIMIT 1
        RETURN p._key
      `;
      const sampleResult = await db.query(sampleQuery);
      const sampleId = await sampleResult.next();

      if (sampleId) {
        const query = aql`
          FOR v, e, p IN 1..3 INBOUND ${sampleId} ANY
          RETURN {
            vertex: v,
            edge: e,
            path: p,
            depth: LENGTH(p.edges)
          }
        `;
        
        const result = await db.query(query);
        const data = await result.all();
        
        expect(data).toBeArray();
      }
    });
  });

  describe("Resource Access", () => {
    test("should retrieve session resource", async () => {
      const query = aql`
        FOR s IN sessions
        LIMIT 1
        RETURN s._key
      `;
      const result = await db.query(query);
      const sessionId = await result.next();

      if (sessionId) {
        const sessionQuery = aql`
          FOR s IN sessions
          FILTER s._key == ${sessionId}
          RETURN s
        `;
        const sessionResult = await db.query(sessionQuery);
        const session = await sessionResult.next();
        
        expect(session).toBeDefined();
        expect(session).toHaveProperty("_key", sessionId);
      }
    });

    test("should retrieve hypothesis resource", async () => {
      const query = aql`
        FOR h IN hypotheses
        LIMIT 1
        RETURN h._key
      `;
      const result = await db.query(query);
      const hypothesisId = await result.next();

      if (hypothesisId) {
        const hypothesisQuery = aql`
          FOR h IN hypotheses
          FILTER h._key == ${hypothesisId}
          RETURN h
        `;
        const hypothesisResult = await db.query(hypothesisQuery);
        const hypothesis = await hypothesisResult.next();
        
        expect(hypothesis).toBeDefined();
        expect(hypothesis).toHaveProperty("_key", hypothesisId);
      }
    });

    test("should retrieve concept resource", async () => {
      const query = aql`
        FOR c IN concepts
        LIMIT 1
        RETURN c._key
      `;
      const result = await db.query(query);
      const conceptId = await result.next();

      if (conceptId) {
        const conceptQuery = aql`
          FOR c IN concepts
          FILTER c._key == ${conceptId}
          RETURN c
        `;
        const conceptResult = await db.query(conceptQuery);
        const concept = await conceptResult.next();
        
        expect(concept).toBeDefined();
        expect(concept).toHaveProperty("_key", conceptId);
      }
    });

    test("should retrieve plan resource", async () => {
      const query = aql`
        FOR p IN plans
        LIMIT 1
        RETURN p._key
      `;
      const result = await db.query(query);
      const planId = await result.next();

      if (planId) {
        const planQuery = aql`
          FOR p IN plans
          FILTER p._key == ${planId}
          RETURN p
        `;
        const planResult = await db.query(planQuery);
        const plan = await planResult.next();
        
        expect(plan).toBeDefined();
        expect(plan).toHaveProperty("_key", planId);
      }
    });
  });
});

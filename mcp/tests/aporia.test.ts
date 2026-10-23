import { expect, test, describe } from "bun:test";
import { mapVoids, resolveVoid, calculateSovereignIntuition } from "../src/lib/aporia/logic.ts";
import { fakeCollection } from "./fake-collection.ts";

describe("Sovereign Intuition Compass Logic", () => {
    test("detects BLINDSPOT: High Confidence, Low Grounding", () => {
        const step = { confidence: 0.9, grounding: [] };
        const result = calculateSovereignIntuition(step);
        expect(result.tensionType).toBe("BLINDSPOT");
        expect(result.score).toBeGreaterThan(0.5);
        expect(result.valence).toBe("HIGH");
    });

    test("detects HESITATION: Low Confidence, High Grounding", () => {
        const step = { confidence: 0.1, grounding: [1, 2, 3, 4, 5] };
        const result = calculateSovereignIntuition(step);
        expect(result.tensionType).toBe("HESITATION");
        expect(result.score).toBeGreaterThan(0.5);
        expect(result.valence).toBe("HIGH");
    });

    test("detects ALIGNED: Matching Confidence and Grounding", () => {
        const step = { confidence: 0.5, grounding: [1, 2] }; // 2/5 = 0.4. Delta = 0.1
        const result = calculateSovereignIntuition(step);
        expect(result.tensionType).toBe("ALIGNED");
        expect(result.score).toBeLessThan(0.3);
        expect(result.valence).toBe("LOW");
    });

    test("detects general TENSION: Moderate Mismatch", () => {
        const step = { confidence: 0.7, grounding: [1] }; // 1/5 = 0.2. Delta = 0.5
        const result = calculateSovereignIntuition(step);
        expect(result.tensionType).toBe("TENSION");
        expect(result.score).toBeGreaterThan(0.4);
    });

    test("applies Coordinate Bonus", () => {
        const stepNoCoord = { confidence: 0.5, grounding: [] };
        const stepWithCoord = { confidence: 0.5, grounding: [], coordinates: "lat_0.12,lon_0.45" };
        
        const resNo = calculateSovereignIntuition(stepNoCoord);
        const resWith = calculateSovereignIntuition(stepWithCoord);
        
        expect(resWith.score).toBeGreaterThan(resNo.score);
    });

    test("applies Importance Bonus", () => {
        const stepLowImp = { confidence: 0.5, grounding: [], importance: 0.1 };
        const stepHighImp = { confidence: 0.5, grounding: [], importance: 0.9 };
        
        const resLow = calculateSovereignIntuition(stepLowImp);
        const resHigh = calculateSovereignIntuition(stepHighImp);
        
        expect(resHigh.score).toBeGreaterThan(resLow.score);
    });
});

describe("Aporia Void Mapping E2E", () => {
    test("prioritizes high-valence gaps in reasoning chains", async () => {
        const c = fakeCollection();
        const chain = [
            { 
                id: "void_low", 
                confidence: 0.5, 
                grounding: [1, 2], 
                type: "inference" 
            }, // Aligned, Low valence
            { 
                id: "void_high_blindspot", 
                confidence: 0.9, 
                grounding: [], 
                coordinates: "coord_1",
                type: "inference" 
            }, // Blindspot, High valence
            { 
                id: "void_high_hesitation", 
                confidence: 0.1, 
                grounding: [1, 2, 3, 4, 5], 
                coordinates: "coord_2",
                type: "inference" 
            }, // Hesitation, High valence
        ];

        const r = await mapVoids(chain, c);
        
        expect(r.voids_detected).toBe(3);
        expect(r.voids[0].valence).toBe("HIGH");
        expect(r.voids[2].valence).toBe("LOW");
        expect(r.voids[2].step_id).toBe("void_low");
        
        // Check summary
        expect(r.summary.high_valence_count).toBe(2);
        expect(r.summary.low_valence_count).toBe(1);
    });

    test("detects voids based on probabilistic leaps", async () => {
        const c = fakeCollection();
        const chain = [
            { id: "leap", confidence: 0.2 } // Probabilistic leap
        ];
        const r = await mapVoids(chain, c);
        expect(r.voids_detected).toBe(1);
        expect(r.voids[0].type).toBe("PROBABILISTIC_LEAP");
    });

    test("resolves and updates void status", async () => {
        const c = fakeCollection();
        const r = await mapVoids([{ id: "s", confidence: 0.1 }], c);
        const voidId = r.voids[0].void_id;
        
        const res = await resolveVoid(voidId, "ev_123", c);
        expect(res.success).toBe(true);
        expect(res.status).toBe("VOID_CLOSED");
        
        const updated = await c.get(voidId);
        expect(updated).not.toBeNull();
        expect(updated!.resolved).toBe(true);
        expect(updated!.resolution_evidence).toBe("ev_123");
    });

    test("throws error on invalid confidence", async () => {
        const c = fakeCollection();
        await expect(mapVoids([{ confidence: 1.5 }], c)).rejects.toThrow();
    });
});

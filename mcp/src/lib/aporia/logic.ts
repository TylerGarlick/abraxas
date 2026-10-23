import type { Collection } from "../../storage/index.ts";

/**
 * A Step in a reasoning chain.
 */
export type Step = { 
    id?: string; 
    confidence?: number; 
    type?: string; 
    grounding?: unknown[]; 
    coordinates?: string;
    importance?: number; // Optional importance weight (0.0 to 1.0)
};

/**
 * Sovereign Intuition Compass: Logic for detecting latent tension.
 * 
 * Latent tension occurs when there is a mismatch between the "internal feel" 
 * (confidence) and the "external anchor" (grounding density).
 */
export function calculateSovereignIntuition(step: Step): { score: number; valence: string; tensionType: string } {
    const confidence = step.confidence ?? 0.5;
    const groundingCount = step.grounding?.length ?? 0;
    
    // Grounding Density: normalized score of evidence available.
    // We assume 5 fragments is "saturated" for a single step.
    const groundingDensity = Math.min(1, groundingCount / 5);
    
    // Latent Tension = |Confidence - GroundingDensity|
    const tension = Math.abs(confidence - groundingDensity);
    
    // Tension Type Classification
    let tensionType = "ALIGNED";
    if (confidence > 0.7 && groundingDensity < 0.3) {
        tensionType = "BLINDSPOT"; // Overconfident, no evidence.
    } else if (confidence < 0.3 && groundingDensity > 0.7) {
        tensionType = "HESITATION"; // Underconfident, plenty of evidence.
    } else if (tension > 0.4) {
        tensionType = "TENSION"; // General mismatch.
    }

    // Coordinate Bonus: If we have specific latent coordinates, the gap is "located",
    // which increases its search valence.
    const coordBonus = (step.coordinates && step.coordinates !== "unknown") ? 0.15 : 0;
    
    // Importance Weight: Steps marked as high importance amplify the intuition score.
    const importanceWeight = step.importance ?? 0.5;
    const importanceBonus = (importanceWeight - 0.5) * 0.2;

    // Final Intuition Score: Composite of tension, location, and importance.
    const finalScore = Math.min(1, Math.max(0, tension + coordBonus + importanceBonus));
    
    // Valence: High valence gaps are the primary targets for void-hunting.
    const valence = finalScore > 0.7 ? "HIGH" : (finalScore > 0.4 ? "MEDIUM" : "LOW");

    return {
        score: Number(finalScore.toFixed(3)),
        valence,
        tensionType
    };
}

export async function mapVoids(chain: Step[], records: Collection) {
    const detectedVoids: any[] = [];
    
    for (const step of chain) {
        const confidence = step.confidence ?? 1;
        if (confidence < 0 || confidence > 1) {
            throw new Error(`confidence for ${step.id ?? "unknown"} must be between 0 and 1`);
        }

        const isProbabilisticLeap = confidence < 0.6;
        const isMissingGrounding = step.type === "inference" && (!step.grounding || step.grounding.length === 0);

        if (isProbabilisticLeap || isMissingGrounding) {
            const intuition = calculateSovereignIntuition(step);
            
            const voidRecord = {
                void_id: `VOID_${crypto.randomUUID().slice(0, 8)}`,
                step_id: step.id ?? "unknown",
                type: isProbabilisticLeap ? "PROBABILISTIC_LEAP" : "MISSING_GROUNDING",
                severity: confidence < 0.3 ? "CRITICAL" : "MODERATE",
                coordinates: step.coordinates ?? "unknown",
                resolved: false,
                // Sovereign Intuition Compass Fields
                intuition_score: intuition.score,
                valence: intuition.valence,
                tension_type: intuition.tensionType,
                timestamp: new Date().toISOString(),
            };
            
            await records.insert({ _id: voidRecord.void_id, ...voidRecord, kind: "void" });
            detectedVoids.push(voidRecord);
        }
    }
    
    // Rigorous Prioritization: Sort by intuition score (descending), then by severity.
    detectedVoids.sort((a, b) => {
        if (b.intuition_score !== a.intuition_score) {
            return b.intuition_score - a.intuition_score;
        }
        const severityMap: Record<string, number> = { "CRITICAL": 2, "MODERATE": 1, "LOW": 0 };
        return (severityMap[b.severity] ?? 0) - (severityMap[a.severity] ?? 0);
    });

    return {
        success: true,
        voids_detected: detectedVoids.length,
        voids: detectedVoids,
        status: detectedVoids.length ? "Sovereign Void Mapped" : "No gaps detected",
        highest_valence: detectedVoids.length > 0 ? detectedVoids[0].intuition_score : 0,
        summary: {
            high_valence_count: detectedVoids.filter(v => v.valence === "HIGH").length,
            medium_valence_count: detectedVoids.filter(v => v.valence === "MEDIUM").length,
            low_valence_count: detectedVoids.filter(v => v.valence === "LOW").length,
        }
    };
}

export async function resolveVoid(id: string, evidenceId: string, records: Collection) {
    const item = await records.get(id);
    if (!item || item.kind !== "void") {
        throw new Error(`Void ${id} not found or is not a void record`);
    }
    
    await records.update(id, { 
        resolved: true, 
        resolution_evidence: evidenceId,
        resolved_at: new Date().toISOString()
    });
    
    return {
        success: true,
        void_id: id,
        status: "VOID_CLOSED",
        resolution: `Void resolved via evidence ${evidenceId}`
    };
}

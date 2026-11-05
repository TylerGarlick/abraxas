import { expect, test, describe } from "bun:test";
import { TemporalAtomizer, MythicCompensationScanner } from "./panacea_myth";

describe("Panacea Myth Encounters", () => {
    test("TemporalAtomizer detects temporal marker", () => {
        const ta = new TemporalAtomizer();
        expect(ta.hasTemporalMarker("Vitamin C cures the common cold in 24 hours.")).toBe(true);
        expect(ta.hasTemporalMarker("Vitamin C supports long term health.")).toBe(false);
    });

    test("MythicCompensationScanner flags panacea language", () => {
        const scanner = new MythicCompensationScanner();
        const res = scanner.check("Vitamin C cures the common cold in 24 hours.");
        expect(res.mythic).toBe(true);
        expect(res.markers).toContain("cure");
    });

    test("MythicCompensationScanner does not flag plain text", () => {
        const scanner = new MythicCompensationScanner();
        const res = scanner.check("Vitamin C defends progressive disease over years.");
        expect(res.mythic).toBe(false);
    });
});

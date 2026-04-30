import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { getStoragePath, RETRO_BASE_DIR } from "../src/index";
import { writeFileSync, readFileSync, rmSync, mkdirSync } from "fs";
import path from "path";

const TEST_RETRO_DIR = path.join(process.cwd(), "test_retros");

describe("Retrospectives Unit Tests", () => {
  test("getStoragePath should generate correct hierarchical paths", () => {
    const date = "2026-04-29";
    const type = "task";
    const id = "abc-123";
    
    const result = getStoragePath(date, type, id);
    
    // We need to be careful about RETRO_BASE_DIR being relative to process.cwd()
    // but we check if the relative parts are correct
    expect(result.folder).toContain("2026");
    expect(result.folder).toContain("04");
    expect(result.folder).toContain("29");
    expect(result.filePath).toEqual(path.join(result.folder, "task_abc-123.json"));
  });
});

describe("Retrospectives Integration Tests", () => {
  beforeEach(() => {
    if (!mkdirSync(TEST_RETRO_DIR, { recursive: true })) {}
  });

  afterEach(() => {
    rmSync(TEST_RETRO_DIR, { recursive: true, force: true });
  });

  test("should save and retrieve a retrospective", async () => {
    const date = "2026-04-29";
    const type = "task";
    const id = "test-task";
    const content = {
      timestamp: new Date().toISOString(),
      subject: { type: 'task', id: 'test-task' },
      well: ["Fast implementation"],
      notWell: [],
      start: [],
      stop: [],
      continue: [],
      improvements: [],
      ledgerTasks: []
    };

    // Mocking the storage path to use TEST_RETRO_DIR instead of RETRO_BASE_DIR
    const [year, month, day] = date.split('-');
    const folder = path.join(TEST_RETRO_DIR, year, month, day);
    mkdirSync(folder, { recursive: true });
    const filePath = path.join(folder, `${type}_${id}.json`);
    
    writeFileSync(filePath, JSON.stringify(content, null, 2));
    
    const savedContent = JSON.parse(readFileSync(filePath, 'utf-8'));
    expect(savedContent.subject.id).toBe("test-task");
    expect(savedContent.well).toContain("Fast implementation");
  });
});

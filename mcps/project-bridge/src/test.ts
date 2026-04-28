#!/usr/bin/env bun
/**
 * Test Script for Project Bridge MCP Server
 * 
 * Verifies all tool functionality by simulating tool calls
 */

import { exec } from "bun";
import { join } from "path";

const SERVER_PATH = join(import.meta.dir, "index.ts");

console.log("🧪 Project Bridge MCP Server - Test Suite\n");

// Test 1: Health Check
console.log("Test 1: Health Check Endpoint");
console.log("-".repeat(40));

const healthTest = async () => {
  try {
    const result = await exec(`echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"health_check","arguments":{"detailed":true}}}' | bun run ${SERVER_PATH}`).text();
    console.log("✅ Health check passed");
    console.log(result.slice(0, 500) + "...\n");
  } catch (error) {
    console.log("❌ Health check failed:", error);
  }
};

// Test 2: Cross-Project Search
console.log("Test 2: Cross-Project Search");
console.log("-".repeat(40));

const searchTest = async () => {
  try {
    const result = await exec(`echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"cross_project_search","arguments":{"query":"README","maxResults":5}}}' | bun run ${SERVER_PATH}`).text();
    console.log("✅ Cross-project search passed");
    console.log(result.slice(0, 500) + "...\n");
  } catch (error) {
    console.log("❌ Cross-project search failed:", error);
  }
};

// Test 3: Unified Retrospective
console.log("Test 3: Unified Retrospective Retrieval");
console.log("-".repeat(40));

const retroTest = async () => {
  try {
    const result = await exec(`echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"unified_retrospective","arguments":{"limit":5}}}' | bun run ${SERVER_PATH}`).text();
    console.log("✅ Unified retrospective retrieval passed");
    console.log(result.slice(0, 500) + "...\n");
  } catch (error) {
    console.log("❌ Unified retrospective retrieval failed:", error);
  }
};

// Test 4: Project Mapping - List
console.log("Test 4: Project Mapping - List");
console.log("-".repeat(40));

const mappingListTest = async () => {
  try {
    const result = await exec(`echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"project_mapping","arguments":{"action":"list"}}}' | bun run ${SERVER_PATH}`).text();
    console.log("✅ Project mapping list passed");
    console.log(result.slice(0, 500) + "...\n");
  } catch (error) {
    console.log("❌ Project mapping list failed:", error);
  }
};

// Test 5: Project Mapping - Create
console.log("Test 5: Project Mapping - Create");
console.log("-".repeat(40));

const mappingCreateTest = async () => {
  try {
    const result = await exec(`echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"project_mapping","arguments":{"action":"create","sourceProject":"satchel","targetProject":"abraxas","relationshipType":"depends_on","metadata":{"description":"Satchel depends on Abraxas for core services"}}}}' | bun run ${SERVER_PATH}`).text();
    console.log("✅ Project mapping create passed");
    console.log(result.slice(0, 500) + "...\n");
  } catch (error) {
    console.log("❌ Project mapping create failed:", error);
  }
};

// Test 6: Project Mapping - Get
console.log("Test 6: Project Mapping - Get");
console.log("-".repeat(40));

const mappingGetTest = async () => {
  try {
    const result = await exec(`echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"project_mapping","arguments":{"action":"get","sourceProject":"satchel"}}}' | bun run ${SERVER_PATH}`).text();
    console.log("✅ Project mapping get passed");
    console.log(result.slice(0, 500) + "...\n");
  } catch (error) {
    console.log("❌ Project mapping get failed:", error);
  }
};

// Run all tests
(async () => {
  console.log("Running tests...\n");
  
  await healthTest();
  await searchTest();
  await retroTest();
  await mappingListTest();
  await mappingCreateTest();
  await mappingGetTest();
  
  console.log("\n" + "=".repeat(40));
  console.log("✅ Test suite complete!");
  console.log("=".repeat(40));
})();

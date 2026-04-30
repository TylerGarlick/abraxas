import { expect, test, describe, beforeEach, beforeAll } from "bun:test";
import { Database } from 'arangojs';
import { createYogaServer } from "../src/graphql/index.ts";
import { resetDb, getDb } from "../src/db/index.ts";

const ARANGO_URL = process.env.ARANGO_URL || 'http://localhost:8529';
const ARANGO_USER = process.env.ARANGO_USER || 'root';
const ARANGO_PASS = process.env.ARANGO_ROOT_PASSWORD || '5orange5';
const TEST_DB_NAME = 'abraxas_testing';

let yogaServer;

const CALL_GRAPHQL = async (query: string, variables = {}) => {
  const response = await yogaServer.execute({
    query,
    variables,
  });
  
  if (response.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(response.errors)}`);
  }
  return response.data;
};

describe("Ledger Integration Tests", () => {
  beforeAll(async () => {
    // 1. Set environment variables for the singleton
    process.env.ARANGO_URL = ARANGO_URL;
    process.env.ARANGO_USER = ARANGO_USER;
    process.env.ARANGO_ROOT_PASSWORD = ARANGO_PASS;
    process.env.ARANGO_DB = TEST_DB_NAME;

    // 2. Ensure the test database exists via the system DB
    const systemDb = new Database({
      url: ARANGO_URL,
      auth: { username: ARANGO_USER, password: ARANGO_PASS }
    }, '_system');
    
    try {
      await systemDb.createDatabase(TEST_DB_NAME);
    } catch (e) {
      // Database already exists
    }

    // 3. Initialize the singleton and the server
    resetDb();
    yogaServer = createYogaServer();
  });

  beforeEach(async () => {
    const db = getDb();
    
    // Use AQL for reliable cleanup that targets the current db context
    try {
      await db.query(`FOR t IN tasks REMOVE t`);
    } catch (e) {}
    try {
      await db.query(`FOR e IN task_edges REMOVE e`);
    } catch (e) {}
    
    // Ensure collections exist (usually once is enough, but safety first)
    try {
      await db.createCollection('tasks');
    } catch (e) {}
    try {
      await db.createCollection('task_edges', { type: 'edge' });
    } catch (e) {}
  });

  test("should create and retrieve a task", async () => {
    const mutation = `
      mutation CreateTask($title: String!, $project: String) {
        createTask(title: $title, project: $project) {
          _key title status project
        }
      }
    `;
    const data = await CALL_GRAPHQL(mutation, { title: "Test Task", project: "TestProject" });
    const task = data.createTask;

    expect(task.title).toBe("Test Task");
    expect(task.status).toBe("open");
    expect(task.project).toBe("TestProject");
    expect(task._key).toBeDefined();
  });

  test("should update task status", async () => {
    const createMutation = `
      mutation CreateTask($title: String!) {
        createTask(title: $title) { _key }
      }
    `;
    const taskData = await CALL_GRAPHQL(createMutation, { title: "Status Task" });
    const id = taskData.createTask._key;

    const updateMutation = `
      mutation UpdateStatus($id: String!, $status: TaskStatus!) {
        updateTaskStatus(id: $id, status: $status) {
          _key status
        }
      }
    `;
    const updateData = await CALL_GRAPHQL(updateMutation, { id, status: "ready" });
    expect(updateData.updateTaskStatus.status).toBe("ready");
  });

  test("should handle ready task logic with blockers", async () => {
    const parentData = await CALL_GRAPHQL(`mutation { createTask(title: "Parent") { _key } }`);
    const childData = await CALL_GRAPHQL(`mutation { createTask(title: "Child") { _key } }`);
    const parentId = parentData.createTask._key;
    const childId = childData.createTask._key;

    await CALL_GRAPHQL(`
      mutation AddDep($childId: String!, $parentId: String!) {
        addDependency(childId: $childId, parentId: $parentId)
      }
    `, { childId, parentId });

    const readyTasksBefore = await CALL_GRAPHQL(`query { getReadyTasks { _key title } }`);
    const parentFoundBefore = readyTasksBefore.getReadyTasks.some((t: any) => t._key === parentId);
    expect(parentFoundBefore).toBe(false);

    await CALL_GRAPHQL(`
      mutation UpdateStatus($id: String!, $status: TaskStatus!) {
        updateTaskStatus(id: $id, status: $status) { _key }
      }
    `, { id: childId, status: "closed" });

    const readyTasksAfter = await CALL_GRAPHQL(`query { getReadyTasks { _key title } }`);
    const parentFoundAfter = readyTasksAfter.getReadyTasks.some((t: any) => t._key === parentId);
    expect(parentFoundAfter).toBe(true);
  });

  test("should fetch tasks by project", async () => {
    await CALL_GRAPHQL(`mutation { createTask(title: "T1", project: "P1") { _key } }`);
    await CALL_GRAPHQL(`mutation { createTask(title: "T2", project: "P1") { _key } }`);
    await CALL_GRAPHQL(`mutation { createTask(title: "T3", project: "P2") { _key } }`);

    const data = await CALL_GRAPHQL(`query GetProj($project: String!) { getTasksByProject(project: $project) { title } }`, { project: "P1" });
    expect(data.getTasksByProject.length).toBe(2);
  });
});

import { expect, test, describe, beforeEach, beforeAll } from "bun:test";
import { Database } from 'arangojs';
import { yogaServer } from "../src/graphql/index.ts";
import { resetDb, getDb } from "../src/db/index.ts";

const ARANGO_URL = process.env.ARANGO_URL || 'http://localhost:8529';
const ARANGO_USER = process.env.ARANGO_USER || 'root';
const ARANGO_PASS = process.env.ARANGO_ROOT_PASSWORD || '5orange5';
const TEST_DB_NAME = 'abraxas_testing';

const CALL_GRAPHQL = async (query: string, variables = {}) => {
  const response = await yogaServer.handleRequest({
    request: {
      url: 'http://localhost:3013/graphql',
      body: JSON.stringify({ query, variables }),
      headers: { "content-type": "application/json" },
    }
  });
  const text = await response.text();
  const json = JSON.parse(text);
  if (json.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
};

describe("Ledger Integration Tests", () => {
  beforeAll(async () => {
    // Force the system to use the testing database
    process.env.ARANGO_DB = TEST_DB_NAME;
    resetDb();
    
    const systemDb = new Database({
      url: ARANGO_URL,
      auth: { username: ARANGO_USER, password: ARANGO_PASS }
    }, '_system');
    
    try {
      await systemDb.createDatabase(TEST_DB_NAME);
    } catch (e) {
      // DB already exists
    }
  });

  beforeEach(async () => {
    const db = getDb();
    try {
      await db.dropCollection('tasks');
    } catch (e) {}
    try {
      await db.dropCollection('task_edges');
    } catch (e) {}
    
    await db.createCollection('tasks');
    await db.createCollection('task_edges', { type: 'edge' });
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

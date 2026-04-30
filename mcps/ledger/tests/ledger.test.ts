import { expect, test, describe, beforeEach } from "bun:test";
import { db } from "../src/db/index.ts";
import { yogaServer } from "../src/graphql/index.ts";
import { aql } from 'arangojs';

const CALL_GRAPHQL = async (query: string, variables = {}) => {
  const response = await yogaServer.handleRequest({
    request: {
      body: JSON.stringify({ query, variables }),
      headers: { "content-type": "application/json" },
    }
  });
  const text = await response.text();
  return JSON.parse(text).data;
};

describe("Ledger Integration Tests", () => {
  beforeEach(async () => {
    // Use a dedicated testing database for isolation
    const testDb = new (require('../src/db/index.ts').Database || (await import('../src/db/index.ts')).Database)({
      url: process.env.ARANGO_URL || 'http://localhost:8529',
      auth: {
        username: process.env.ARANGO_USER || 'root',
        password: process.env.ARANGO_ROOT_PASSWORD || '5orange5',
      }
    }, 'abraxas_testing');
    
    await testDb.dropCollection('tasks');
    await testDb.dropCollection('task_edges');
    await testDb.createCollection('tasks');
    await testDb.createCollection('task_edges', { type: 'edge' });
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
    // 1. Create Parent and Child
    const parentData = await CALL_GRAPHQL(`mutation { createTask(title: "Parent") { _key } }`);
    const childData = await CALL_GRAPHQL(`mutation { createTask(title: "Child") { _key } }`);
    const parentId = parentData.createTask._key;
    const childId = childData.createTask._key;

    // 2. Add dependency: Child blocks Parent
    await CALL_GRAPHQL(`
      mutation AddDep($childId: String!, $parentId: String!) {
        addDependency(childId: $childId, parentId: $parentId)
      }
    `, { childId, parentId });

    // 3. Parent should NOT be ready (blocked by Child who is 'open')
    const readyTasksBefore = await CALL_GRAPHQL(`query { getReadyTasks { _key title } }`);
    const parentFoundBefore = readyTasksBefore.getReadyTasks.some((t: any) => t._key === parentId);
    expect(parentFoundBefore).toBe(false);

    // 4. Close Child
    await CALL_GRAPHQL(`
      mutation UpdateStatus($id: String!, $status: TaskStatus!) {
        updateTaskStatus(id: $id, status: $status) { _key }
      }
    `, { id: childId, status: "closed" });

    // 5. Parent should NOW be ready
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

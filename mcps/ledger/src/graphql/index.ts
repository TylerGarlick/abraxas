import { createYoga, createSchema } from 'graphql-yoga';
import { gql } from 'graphql-tag';
import { db } from '../db/index.ts';
import { DateTime } from 'graphql-scalars';

const typeDefs = gql`
  scalar DateTime

  type Task {
    _key: String!
    title: String!
    status: TaskStatus!
    project: String
    scope: String
    priority: String
    assignee: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  enum TaskStatus {
    open
    ready
    testing
    closed
  }

  type Query {
    getTask(id: String!): Task
    getReadyTasks: [Task!]!
    getTasksByProject(project: String!): [Task!]!
  }

  type Mutation {
    createTask(title: String!, project: String, scope: String, priority: String): Task!
    updateTaskStatus(id: String!, status: TaskStatus!): Task!
    addDependency(childId: String!, parentId: String!, type: String): Boolean!
  }
`;

const resolvers = {
  Query: {
    getTask: async (_, { id }) => {
      const collection = db.collection('tasks');
      return await collection.findOne(id);
    },
    getReadyTasks: async () => {
      const cursor = await db.query(`
        FOR t IN tasks
        FILTER t.status == 'ready' 
        OR (t.status == 'open' AND NOT (
          FOR edge IN task_edges
          FILTER edge._from == t._key AND edge.type == 'blocks'
          FOR blocker IN tasks
          FILTER blocker._key == edge._to AND blocker.status != 'closed'
          RETURN 1
        ))
        RETURN t
      `);
      return await cursor.all();
    },
    getTasksByProject: async (_, { project }) => {
      const cursor = await db.query(`
        FOR t IN tasks
        FILTER t.project == @project
        RETURN t
      `, { project });
      return await cursor.all();
    }
  },
  Mutation: {
    createTask: async (_, args) => {
      const collection = db.collection('tasks');
      const task = {
        ...args,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = await collection.save(task);
      return { ...task, _key: res._key };
    },
    updateTaskStatus: async (_, { id, status }) => {
      const collection = db.collection('tasks');
      const task = await collection.findOne(id);
      if (!task) throw new Error('Task not found');
      
      const updated = { ...task, status, updatedAt: new Date().toISOString() };
      await collection.update(id, updated);
      return updated;
    },
    addDependency: async (_, { childId, parentId, type }) => {
      const edgeCol = db.collection('task_edges');
      await edgeCol.save({
        _from: childId,
        _to: parentId,
        type: type || 'blocks',
      });
      return true;
    }
  }
};

export const yogaServer = createYoga({
  schema: createSchema({ typeDefs, resolvers })
});

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioSsrTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { yogaServer } from './graphql/index.ts';
import { ensureCollections } from './db/index.ts';
import { request, Response } from 'graphql';

const server = new Server(
  {
    name: 'ledger-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const callGraphQL = async (query: string, variables = {}) => {
  const response = await yogaServer.handleRequest({
    request: {
      body: JSON.stringify({ query, variables }),
      headers: { 'content-type': 'application/json' },
    }
  });
  
  // Yoga's handleRequest returns a Response object, we need to parse its body
  const text = await response.text();
  const json = JSON.parse(text);
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_task',
        description: 'Create a new task in the ledger',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            project: { type: 'string' },
            scope: { type: 'string' },
            priority: { type: 'string' },
          },
          required: ['title']
        }
      },
      {
        name: 'get_ready_tasks',
        description: 'Get tasks that are ready to be worked on',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'update_task_status',
        description: 'Update the status of a task',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string', enum: ['open', 'ready', 'testing', 'closed'] },
          },
          required: ['id', 'status']
        }
      },
      {
        name: 'add_dependency',
        description: 'Add a dependency between two tasks',
        inputSchema: {
          type: 'object',
          properties: {
            childId: { type: 'string' },
            parentId: { type: 'string' },
            type: { type: 'string', default: 'blocks' },
          },
          required: ['childId', 'parentId']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_task': {
        const data = await callGraphQL(`
          mutation CreateTask($title: String!, $project: String, $scope: String, $priority: String) {
            createTask(title: $title, project: $project, scope: $scope, priority: $priority) {
              _key title status
            }
          }
        `, args);
        return { content: [{ type: 'text', text: JSON.stringify(data.createTask) }] };
      }
      case 'get_ready_tasks': {
        const data = await callGraphQL(`
          query GetReadyTasks {
            getReadyTasks {
              _key title status project scope priority
            }
          }
        `);
        return { content: [{ type: 'text', text: JSON.stringify(data.getReadyTasks) }] };
      }
      case 'update_task_status': {
        const data = await callGraphQL(`
          mutation UpdateStatus($id: String!, $status: TaskStatus!) {
            updateTaskStatus(id: $id, status: $status) {
              _key title status
            }
          }
        `, args);
        return { content: [{ type: 'text', text: JSON.stringify(data.updateTaskStatus) }] };
      }
      case 'add_dependency': {
        const data = await callGraphQL(`
          mutation AddDep($childId: String!, $parentId: String!, $type: String) {
            addDependency(childId: $childId, parentId: $parentId, type: $type)
          }
        `, args);
        return { content: [{ type: 'text', text: JSON.stringify(data.addDependency) }] };
      }
      default:
        throw new Error(`Tool ${name} not found`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: error.message }]
    };
  }
});

async function main() {
  await ensureCollections();
  const transport = new StdioSsrTransport();
  await server.connect(transport);
  console.error('Ledger MCP server running on stdio');
}

main().catch(console.error);

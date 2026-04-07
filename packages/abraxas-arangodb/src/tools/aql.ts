/**
 * AQL generation helper
 * Converts natural language descriptions to AQL queries
 */

/**
 * Simple AQL generation from natural language
 * This is a rule-based approach that parses common patterns
 */
export function generateAQL(description: string): { aql: string; explanation: string } {
  const lowerDesc = description.toLowerCase().trim();

  // Parse patterns
  if (lowerDesc.startsWith('find') || lowerDesc.startsWith('get all')) {
    return generateFindQuery(lowerDesc);
  }

  if (lowerDesc.startsWith('count')) {
    return generateCountQuery(lowerDesc);
  }

  if (lowerDesc.startsWith('create') || lowerDesc.startsWith('insert')) {
    return generateInsertQuery(lowerDesc);
  }

  if (lowerDesc.startsWith('update')) {
    return generateUpdateQuery(lowerDesc);
  }

  if (lowerDesc.startsWith('delete')) {
    return generateDeleteQuery(lowerDesc);
  }

  if (lowerDesc.includes('traverse') || lowerDesc.includes('graph')) {
    return generateTraversalQuery(lowerDesc);
  }

  if (lowerDesc.includes('edge') || lowerDesc.includes('relationship')) {
    return generateEdgeQuery(lowerDesc);
  }

  // Default: treat as a search query
  return {
    aql: `FOR doc IN collection\n  FILTER LIKE(doc._key, "${description}%")\n  RETURN doc`,
    explanation: `Generated a search query looking for documents matching "${description}"`,
  };
}

function generateFindQuery(desc: string): { aql: string; explanation: string } {
  // Extract collection name
  const collectionMatch = desc.match(/(?:in|from)\s+(\w+)/i);
  const collection = collectionMatch ? collectionMatch[1] : 'collection';

  // Extract filter conditions
  const filterMatch = desc.match(/where\s+(.+?)(?:\s+and|\s+order|$)/i);
  const orderMatch = desc.match(/order by\s+(\w+)(?:\s+(asc|desc))?/i);

  let filterClause = '';
  if (filterMatch) {
    filterClause = `\n  FILTER ${filterMatch[1]}`;
  }

  let orderClause = '';
  if (orderMatch) {
    const direction = orderMatch[2]?.toUpperCase() || 'ASC';
    orderClause = `\n  SORT doc.${orderMatch[1]} ${direction}`;
  }

  const limitMatch = desc.match(/limit\s+(\d+)/i);
  let limitClause = '';
  if (limitMatch) {
    limitClause = `\n  LIMIT ${limitMatch[1]}`;
  }

  return {
    aql: `FOR doc IN ${collection}${filterClause}${orderClause}${limitClause}
  RETURN doc`,
    explanation: `Generated a query to find documents in ${collection}${filterMatch ? ' with filtering' : ''}${orderMatch ? ' sorted by ' + orderMatch[1] : ''}`,
  };
}

function generateCountQuery(desc: string): { aql: string; explanation: string } {
  const collectionMatch = desc.match(/(?:in|from)\s+(\w+)/i);
  const collection = collectionMatch ? collectionMatch[1] : 'collection';

  return {
    aql: `RETURN COUNT(FOR doc IN ${collection} RETURN 1)`,
    explanation: `Generated a query to count documents in ${collection}`,
  };
}

function generateInsertQuery(desc: string): { aql: string; explanation: string } {
  const collectionMatch = desc.match(/(?:into|in)\s+(\w+)/i);
  const collection = collectionMatch ? collectionMatch[1] : 'collection';

  // Try to extract field values
  const dataMatch = desc.match(/with\s+({.+?})/i);

  if (dataMatch) {
    return {
      aql: `INSERT ${dataMatch[1]} INTO ${collection} RETURN NEW`,
      explanation: `Generated an INSERT statement for ${collection}`,
    };
  }

  return {
    aql: `INSERT {} INTO ${collection} RETURN NEW`,
    explanation: `Generated an INSERT statement for ${collection} (add your data)`,
  };
}

function generateUpdateQuery(desc: string): { aql: string; explanation: string } {
  const collectionMatch = desc.match(/(?:in)\s+(\w+)/i);
  const collection = collectionMatch ? collectionMatch[1] : 'collection';

  return {
    aql: `FOR doc IN ${collection}
  FILTER doc._key == "key"
  UPDATE doc WITH {} IN ${collection}
  RETURN NEW`,
    explanation: `Generated an UPDATE statement for ${collection} (replace "key" and "{}" with your values)`,
  };
}

function generateDeleteQuery(desc: string): { aql: string; explanation: string } {
  const collectionMatch = desc.match(/(?:from|in)\s+(\w+)/i);
  const collection = collectionMatch ? collectionMatch[1] : 'collection';

  return {
    aql: `FOR doc IN ${collection}
  FILTER doc._key == "key"
  REMOVE doc IN ${collection}
  RETURN OLD`,
    explanation: `Generated a REMOVE statement for ${collection} (replace "key" with your document key)`,
  };
}

function generateTraversalQuery(desc: string): { aql: string; explanation: string } {
  const graphMatch = desc.match(/graph\s+(\w+)/i);
  const graph = graphMatch ? graphMatch[1] : 'graphName';
  const startMatch = desc.match(/start(?:ing)?\s+(?:at\s+)?(\w+)/i);
  const start = startMatch ? startMatch[1] : 'startVertex';

  return {
    aql: `FOR vertex, edge IN 1..3 OUTBOUND "${start}"
  GRAPH "${graph}"
  RETURN { vertex, edge }`,
    explanation: `Generated a graph traversal starting at ${start} with max depth 3 (adjust as needed)`,
  };
}

function generateEdgeQuery(desc: string): { aql: string; explanation: string } {
  const collectionMatch = desc.match(/(?:collection)\s+(\w+)/i);
  const collection = collectionMatch ? collectionMatch[1] : 'edges';

  return {
    aql: `FOR edge IN ${collection}
  FILTER edge._from == "vertices/key1" AND edge._to == "vertices/key2"
  RETURN edge`,
    explanation: `Generated an edge query for ${collection} (adjust _from and _to values)`,
  };
}

/**
 * Validate AQL query syntax (basic validation)
 */
export function validateAQL(query: string): { valid: boolean; error?: string } {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: 'Query cannot be empty' };
  }

  const upperQuery = query.toUpperCase().trim();

  // Check for dangerous operations
  const dangerousPatterns = [
    /DROP\s+DATABASE/i,
    /DROP\s+COLLECTION/i,
    /TRUNCATE\s+COLLECTION/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      return { valid: false, error: `Query contains disallowed operation: ${pattern.source}` };
    }
  }

  // Basic syntax check - must start with a known keyword
  const validStarters = [
    'FOR',
    'RETURN',
    'INSERT',
    'UPDATE',
    'REPLACE',
    'REMOVE',
    'LET',
    'COLLECT',
    'SORT',
    'LIMIT',
    'PRUNE',
    'FILTER',
  ];

  const hasValidStart = validStarters.some(kw => upperQuery.startsWith(kw));
  if (!hasValidStart) {
    return { valid: false, error: 'Query must start with a valid AQL keyword' };
  }

  return { valid: true };
}

/**
 * Escape a value for safe use in AQL bind vars
 */
export function escapeAQLValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Remove any escape sequences that could be used for injection
    return value.replace(/[\x00-\x1f\x7f]/g, '');
  }
  if (Array.isArray(value)) {
    return value.map(escapeAQLValue);
  }
  if (value && typeof value === 'object') {
    const escaped: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      escaped[k] = escapeAQLValue(v);
    }
    return escaped;
  }
  return value;
}

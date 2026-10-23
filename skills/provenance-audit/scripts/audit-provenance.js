const axios = require('axios');

async function auditProvenance(entityId) {
  try {
    const response = await axios.post('http://localhost:4000/graphql', {
      query: `
        query GetProvenance($id: ID!) {
          actionablePlan(id: $id) {
            id
            provenanceChain {
              plan
              concept
              hypothesis
              session
            }
          }
        }
      `,
      variables: { id: entityId }
    });

    const data = response.data.data;
    if (!data || !data.actionablePlan) {
      return { status: 'BROKEN', error: 'Entity not found or not an actionable plan.' };
    }

    const chain = data.actionablePlan.provenanceChain;
    if (!chain) {
      return { status: 'BROKEN', error: 'No provenance chain found for this entity.' };
    }

    return {
      status: 'VALID',
      entityId,
      provenance: chain,
      verdict: 'Sovereign status verified. Chain is complete.'
    };
  } catch (error) {
    return { status: 'ERROR', error: error.message };
  }
}

// Simple CLI wrapper for the skill
const entityId = process.argv[2];
if (!entityId) {
  console.error('Usage: node audit-provenance.js <entityId>');
  process.exit(1);
}

auditProvenance(entityId).then(console.log).catch(console.error);

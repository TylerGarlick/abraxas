import fs from 'fs';
import path from 'path';
import axios from 'axios';

const API_URL = 'http://localhost:4000/';
const RESULTS_DIR = '/root/.openclaw/workspace/abraxas/archive/legacy_benchmarks/tests/results';
const CHANNEL_ID = 'channel:1492380897167540325'; // Default for this session

async function uploadResults() {
    const files = fs.readdirSync(RESULTS_DIR).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} result files to upload.`);

    for (const file of files) {
        const raw = fs.readFileSync(path.join(RESULTS_DIR, file), 'utf8');
        let content;
        try {
            content = JSON.parse(raw);
        } catch (e) {
            console.log(`❌ Failed to parse JSON in ${file}: ${e.message}`);
            continue;
        }

        if (!content || !content.queries || !Array.isArray(content.queries)) {
            console.log(`⏭️ Skipping ${file}: No queries array found.`);
            continue;
        }

        const modelId = content.model || "unknown-model";
        const results = content.queries.map(q => ({
            queryId: q.id,
            category: q.cat,
            queryText: q.q,
            normalResponse: q.normal,
            abraxasResponse: q.abraxas,
            nl: {
                known: q.nl ? (q.nl["[KNOWN]"] || 0) : 0,
                inferred: q.nl ? (q.nl["[INFERRED]"] || 0) : 0,
                uncertain: q.nl ? (q.nl["[UNCERTAIN]"] || 0) : 0,
                unknown: q.nl ? (q.nl["[UNKNOWN]"] || 0) : 0,
                dream: q.nl ? (q.nl["[DREAM]"] || 0) : 0
            },
            al: {
                known: q.al ? (q.al["[KNOWN]"] || 0) : 0,
                inferred: q.al ? (q.al["[INFERRED]"] || 0) : 0,
                uncertain: q.al ? (q.al["[UNCERTAIN]"] || 0) : 0,
                unknown: q.al ? (q.al["[UNKNOWN]"] || 0) : 0,
                dream: q.al ? (q.al["[DREAM]"] || 0) : 0
            }
        }));

        const mutation = `
            mutation UploadBatch($modelId: String!, $results: [BenchmarkResultInput!]!, $channelId: String!) {
                uploadBenchmarkBatch(modelId: $modelId, results: $results, channelId: $channelId)
            }
        `;

        try {
            const response = await axios.post(API_URL, {
                query: mutation,
                variables: {
                    modelId,
                    results,
                    channelId: CHANNEL_ID
                }
            });
            console.log(`✅ Uploaded ${file} (${modelId}): ${response.data.data.uploadBenchmarkBatch} records.`);
        } catch (e) {
            console.error(`❌ Failed to upload ${file}: ${e.message}`);
        }
    }
}

uploadResults().then(() => console.log('Batch upload complete.'));

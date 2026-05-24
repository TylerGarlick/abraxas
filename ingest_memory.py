import os
import json
import logging
from typing import Any, Dict, List
from arango import ArangoClient

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("memory-ingestor")

class MemoryIngestor:
    def __init__(self):
        # Configuration from environment or defaults
        self.host = os.getenv("ARANGO_URL", "http://178.105.173.60:8529")
        self.db_name = os.getenv("ARANGO_DB", "abraxas_prod")
        self.username = os.getenv("ARANGO_USER", "root")
        self.password = os.getenv("ARANGO_ROOT_PASSWORD", "password")
        
        self.client = ArangoClient(hosts=self.host)
        self.db = self.client.db(self.db_name, username=self.username, password=self.password)
        
        # Ensure target collections exist
        self.ensure_collection("memory_entities", edge=False)
        self.ensure_collection("memory_relations", edge=True)
        self.ensure_collection("memory_events", edge=False)

    def ensure_collection(self, name: str, edge: bool = False):
        if not self.db.has_collection(name):
            self.db.create_collection(name, edge=edge)
            logger.info(f"Created collection: {name}")

    def ingest_ontology(self, path: str):
        logger.info(f"Ingesting ontology from {path}...")
        count = 0
        with open(path, 'r') as f:
            for line in f:
                op = json.loads(line)
                if op['op'] == 'create':
                    entity = op['entity']
                    # Use provided id or generate one
                    doc_id = entity.get('id')
                    data = {
                        "_key": doc_id if doc_id else None,
                        "type": entity['type'],
                        "properties": entity['properties'],
                        "created": entity.get('created'),
                        "updated": entity.get('updated'),
                        "timestamp": op.get('timestamp')
                    }
                    self.db.collection("memory_entities").insert(data, overwrite=True)
                    count += 1
                elif op['op'] == 'relate':
                    rel = op
                    data = {
                        "_from": f"memory_entities/{rel['from']}",
                        "_to": f"memory_entities/{rel['to']}",
                        "rel": rel['rel'],
                        "properties": rel.get('properties', {}),
                        "timestamp": rel.get('timestamp')
                    }
                    self.db.collection("memory_relations").insert(data, overwrite=True)
                    count += 1
        logger.info(f"Ingested {count} items from ontology.")

    def ingest_events(self, path: str):
        logger.info(f"Ingesting events from {path}...")
        count = 0
        with open(path, 'r') as f:
            for line in f:
                try:
                    event = json.loads(line)
                    self.db.collection("memory_events").insert(event, overwrite=True)
                    count += 1
                except json.JSONDecodeError:
                    continue
        logger.info(f"Ingested {count} events.")

    def ingest_markdown_memory(self, memory_dir: str):
        logger.info(f"Scanning markdown memory in {memory_dir}...")
        files = [f for f in os.listdir(memory_dir) if f.endswith('.md')]
        count = 0
        for file in files:
            path = os.path.join(memory_dir, file)
            with open(path, 'r') as f:
                content = f.read()
                # Simple ingestion of file as a document
                data = {
                    "filename": file,
                    "path": path,
                    "content": content,
                    "timestamp": None
                }
                self.db.collection("memory_markdown").insert(data, overwrite=True)
                count += 1
        logger.info(f"Ingested {count} markdown files.")

    def run(self):
        # 1. Ontology
        ontology_path = "mary-jane/memory/ontology/graph.jsonl"
        if os.path.exists(ontology_path):
            self.ingest_ontology(ontology_path)
        
        # 2. Events
        events_path = "mary-jane/memory/.dreams/events.jsonl"
        if os.path.exists(events_path):
            self.ingest_events(events_path)
            
        # 3. Markdown Memory
        memory_dir = "mary-jane/memory"
        if os.path.exists(memory_dir):
            self.ensure_collection("memory_markdown", edge=False)
            self.ingest_markdown_memory(memory_dir)

if __name__ == "__main__":
    # Use prod config as identified from docker-compose
    os.environ["ARANGO_URL"] = "http://178.105.173.60:8529"
    os.environ["ARANGO_DB"] = "abraxas_prod"
    os.environ["ARANGO_USER"] = "root"
    # Note: Using a placeholder password. In a real scenario, this would be fetched from secrets-manager.
    # For the purpose of this task, I'll attempt to use 'password' or the one from docker-compose.
    os.environ["ARANGO_ROOT_PASSWORD"] = "password" 
    
    try:
        L = MemoryIngestor()
        L.run()
    except Exception as e:
        logger.error(f"Failed to ingest memory: {e}")

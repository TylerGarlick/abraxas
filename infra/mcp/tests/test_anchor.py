import unittest
from infra.api.core.anchor import SovereignAnchor

class MockStore:
    def __init__(self):
        self.collections = {}
    
    def collection(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection()
        return self.collections[name]

class MockCollection:
    def __init__(self):
        self.data = {}
    
    def insert(self, doc):
        _id = f"id_{len(self.data)}"
        doc["_id"] = _id
        self.data[_id] = doc
        return doc
    
    def get(self, _id):
        return self.data.get(_id)
    
    def find(self, query):
        results = []
        for doc in self.data.values():
            if all(doc.get(k) == v for k, v in query.items()):
                results.append(doc)
        return results
    
    def update(self, _id, patch):
        if _id in self.data:
            self.data[_id].update(patch)

class TestSovereignAnchor(unittest.TestCase):
    def setUp(self):
        self.store = MockStore()
        self.anchor = SovereignAnchor(store=self.store)

    def test_anchor_truth_and_verify(self):
        content = "The Sovereign Core is the ultimate source of truth."
        anchor_id = self.anchor.anchor_truth(content)
        
        # Verify correct content
        valid, msg = self.anchor.verify_anchor(anchor_id, content)
        self.assertTrue(valid)
        self.assertIn("Divine Priority confirmed", msg)
        
        # Verify incorrect content
        valid, msg = self.anchor.verify_anchor(anchor_id, "Wrong content")
        self.assertFalse(valid)
        self.assertIn("Anchor mismatch", msg)

    def test_divine_priority(self):
        content = "Immutable Truth A"
        anchor_id = self.anchor.anchor_truth(content)
        
        # Anchored claim gets DIVINE priority
        priority = self.anchor.get_priority(content, anchor_id)
        self.assertEqual(priority, "DIVINE")
        
        # Unanchored claim gets PROBABILISTIC priority
        priority = self.anchor.get_priority("Probabilistic Claim", anchor_id)
        self.assertEqual(priority, "PROBABILISTIC")

    def test_resolve_void(self):
        void_id = "VOID_001"
        content = "The ground truth for VOID_001"
        anchor_id = self.anchor.anchor_truth(content)
        
        resolution = self.anchor.resolve_void(void_id, anchor_id)
        self.assertEqual(resolution["void_id"], void_id)
        self.assertEqual(resolution["status"], "RESOLVED")
        self.assertEqual(resolution["priority"], "DIVINE_OVERRIDE")

if __name__ == "__main__":
    unittest.main()

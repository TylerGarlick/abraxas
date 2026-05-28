import unittest
from unittest.mock import patch, MagicMock


class TestGraphQLSchemaCompilation(unittest.TestCase):
    def test_schema_imports_and_compiles(self):
        from infra.api.graphql.main import schema
        self.assertIsNotNone(schema)

    def test_schema_has_queries(self):
        from infra.api.graphql.main import schema
        schema_str = str(schema)
        self.assertIn("dreamSession", schema_str)
        self.assertIn("hypothesis", schema_str)
        self.assertIn("concept", schema_str)
        self.assertIn("actionablePlans", schema_str)
        self.assertIn("benchmarkResults", schema_str)

    def test_schema_has_search_queries(self):
        from infra.api.graphql.main import schema
        schema_str = str(schema)
        self.assertIn("search", schema_str)
        self.assertIn("relatedTo", schema_str)
        self.assertIn("recent", schema_str)
        self.assertIn("explore", schema_str)
        self.assertIn("stats", schema_str)

    def test_schema_has_mutations(self):
        from infra.api.graphql.main import schema
        schema_str = str(schema)
        self.assertIn("startDreamCycle", schema_str)
        self.assertIn("createHypothesis", schema_str)
        self.assertIn("translateHypothesisToConcept", schema_str)
        self.assertIn("archiveHypothesis", schema_str)
        self.assertIn("groundConcept", schema_str)
        self.assertIn("uploadBenchmarkBatch", schema_str)


class TestGraphQLContext(unittest.TestCase):
    @patch.dict("os.environ", {
        "ARANGO_URL": "http://localhost:8529",
        "ARANGO_DB": "test_db",
        "ARANGO_USER": "root",
        "ARANGO_ROOT_PASSWORD": "pass",
    })
    def test_context_created_with_env_vars(self):
        from infra.api.graphql.context import GraphQLContext
        ctx = GraphQLContext()
        self.assertEqual(ctx._url, "http://localhost:8529")
        self.assertEqual(ctx._db_name, "test_db")
        self.assertEqual(ctx._user, "root")
        self.assertEqual(ctx._password, "pass")

    def test_context_defaults(self):
        from infra.api.graphql.context import GraphQLContext
        ctx = GraphQLContext()
        self.assertEqual(ctx._db_name, "abraxas_db")
        self.assertEqual(ctx._user, "root")

    def test_get_graphql_context_is_singleton(self):
        from infra.api.graphql.context import (
            get_graphql_context,
            _context,
        )
        import infra.api.graphql.context as ctx_module
        ctx_module._context = None
        ctx1 = get_graphql_context()
        ctx2 = get_graphql_context()
        self.assertIs(ctx1, ctx2)

    @patch("arango.ArangoClient")
    def test_document_returns_doc(self, mock_client_cls):
        mock_col = MagicMock()
        mock_col.get.return_value = {"_key": "abc", "name": "test"}
        mock_db = MagicMock()
        mock_db.collection.return_value = mock_col
        mock_client = MagicMock()
        mock_client.db.return_value = mock_db
        mock_client_cls.return_value = mock_client

        from infra.api.graphql.context import GraphQLContext
        ctx = GraphQLContext()
        ctx._client = mock_client
        ctx._db = mock_db

        doc = ctx.document("concepts", "abc")
        self.assertEqual(doc["_key"], "abc")
        self.assertEqual(doc["name"], "test")

    @patch("arango.ArangoClient")
    def test_document_returns_none_on_error(self, mock_client_cls):
        mock_col = MagicMock()
        mock_col.get.side_effect = Exception("not found")
        mock_db = MagicMock()
        mock_db.collection.return_value = mock_col
        mock_client = MagicMock()
        mock_client.db.return_value = mock_db
        mock_client_cls.return_value = mock_client

        from infra.api.graphql.context import GraphQLContext
        ctx = GraphQLContext()
        ctx._client = mock_client
        ctx._db = mock_db

        doc = ctx.document("concepts", "nonexistent")
        self.assertIsNone(doc)


class TestGraphQLQueries(unittest.TestCase):
    @patch("infra.api.graphql.resolvers.queries.get_graphql_context")
    def test_resolve_dream_session_returns_none(self, mock_ctx):
        mock_ctx().document.return_value = None
        from infra.api.graphql.resolvers.queries import resolve_dream_session
        result = resolve_dream_session("nonexistent")
        self.assertIsNone(result)

    @patch("infra.api.graphql.resolvers.queries.get_graphql_context")
    def test_resolve_dream_session_found(self, mock_ctx):
        mock_ctx().document.return_value = {
            "_key": "s1",
            "timestamp": "2024-01-01",
            "userPrompt": "hello",
            "seedConcepts": [],
        }
        from infra.api.graphql.resolvers.queries import resolve_dream_session
        result = resolve_dream_session("s1")
        self.assertIsNotNone(result)
        self.assertEqual(result.id, "s1")
        self.assertEqual(result.user_prompt, "hello")

    @patch("infra.api.graphql.resolvers.queries.get_graphql_context")
    def test_resolve_hypothesis(self, mock_ctx):
        mock_ctx().document.return_value = {
            "_key": "h1",
            "rawPatternRepresentation": "test",
            "metadata": {"noveltyScore": 0.8, "coherenceScore": 0.7, "creativeDrivers": []},
            "isValuable": False,
        }
        from infra.api.graphql.resolvers.queries import resolve_hypothesis
        result = resolve_hypothesis("h1")
        self.assertEqual(result.id, "h1")
        self.assertEqual(result.raw_pattern_representation, "test")
        self.assertEqual(result.metadata.novelty_score, 0.8)

    @patch("infra.api.graphql.resolvers.queries.get_graphql_context")
    def test_resolve_concept(self, mock_ctx):
        mock_ctx().document.return_value = {
            "_key": "c1",
            "name": "ConceptA",
            "description": "desc",
        }
        from infra.api.graphql.resolvers.queries import resolve_concept
        result = resolve_concept("c1")
        self.assertEqual(result.id, "c1")
        self.assertEqual(result.name, "ConceptA")

    @patch("infra.api.graphql.resolvers.queries.get_graphql_context")
    def test_resolve_actionable_plans_no_filter(self, mock_ctx):
        mock_ctx().execute_aql.return_value = [
            {"_key": "p1", "summary": "Plan", "steps": [], "riskAssessment": "low",
             "groundingStatus": "ANCHORED"}
        ]
        from infra.api.graphql.resolvers.queries import resolve_actionable_plans
        plans = resolve_actionable_plans()
        self.assertEqual(len(plans), 1)
        self.assertEqual(plans[0].id, "p1")

    @patch("infra.api.graphql.resolvers.queries.get_graphql_context")
    def test_resolve_actionable_plans_filtered(self, mock_ctx):
        mock_ctx().execute_aql.return_value = []
        from infra.api.graphql.resolvers.queries import resolve_actionable_plans
        from infra.api.graphql.schema import GroundingStatus
        plans = resolve_actionable_plans(GroundingStatus.ANCHORED)
        self.assertEqual(len(plans), 0)

    @patch("infra.api.graphql.resolvers.queries.get_graphql_context")
    def test_resolve_benchmark_results(self, mock_ctx):
        mock_ctx().execute_aql.return_value = [
            {
                "_key": "b1",
                "queryId": 1,
                "category": "cat",
                "queryText": "q",
                "normalResponse": "n",
                "abraxasResponse": "a",
                "scores": {"nl": {"known": 1, "inferred": 0, "uncertain": 0, "unknown": 0, "dream": 0},
                           "al": {"known": 0, "inferred": 1, "uncertain": 0, "unknown": 0, "dream": 0}},
                "modelId": "m1",
                "timestamp": "2024-01-01",
            }
        ]
        from infra.api.graphql.resolvers.queries import resolve_benchmark_results
        results = resolve_benchmark_results()
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].id, "b1")


class TestGraphQLSearch(unittest.TestCase):
    @patch("infra.api.graphql.resolvers.search.get_graphql_context")
    def test_resolve_search_returns_empty(self, mock_ctx):
        mock_ctx().execute_aql.return_value = []
        from infra.api.graphql.resolvers.search import resolve_search
        results = resolve_search("nothing")
        self.assertEqual(len(results), 0)

    @patch("infra.api.graphql.resolvers.search.get_graphql_context")
    def test_resolve_search_finds_match(self, mock_ctx):
        mock_ctx().execute_aql.return_value = [
            {"_key": "c1", "name": "Sovereignty", "description": "Concept of sovereignty"}
        ]
        from infra.api.graphql.resolvers.search import resolve_search
        results = resolve_search("sovereignty", collections=["concepts"])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].id, "c1")
        self.assertEqual(results[0].label, "Sovereignty")

    @patch("infra.api.graphql.resolvers.search.get_graphql_context")
    def test_resolve_related_to_finds_neighbors(self, mock_ctx):
        def mock_aql_exec(query, bind_vars=None):
            coll = query.split("FOR e IN ")[1].split("\n")[0].strip()
            if coll == "SESS_TO_HYPO":
                return [{"_from": "dream_sessions/s1", "_to": "hypotheses/h1", "_key": "e1"}]
            return []

        mock_ctx().execute_aql.side_effect = mock_aql_exec
        mock_ctx().document.return_value = {"_key": "h1", "rawPatternRepresentation": "test",
                                              "metadata": {"noveltyScore": 0.5, "coherenceScore": 0.5,
                                                           "creativeDrivers": []}, "isValuable": False}

        from infra.api.graphql.resolvers.search import resolve_related_to
        results = resolve_related_to("dream_sessions/s1")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "hypotheses/h1")

    @patch("infra.api.graphql.resolvers.search.get_graphql_context")
    def test_resolve_recent(self, mock_ctx):
        mock_ctx().execute_aql.return_value = [
            {"_key": "s1", "timestamp": "2024-01-02T00:00:00Z", "userPrompt": "latest"}
        ]
        from infra.api.graphql.resolvers.search import resolve_recent
        results = resolve_recent(limit=5, collection="dream_sessions")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "s1")

    @patch("infra.api.graphql.resolvers.search.get_graphql_context")
    def test_resolve_explore_finds_path(self, mock_ctx):
        call_count = [0]

        def mock_aql_exec(query, bind_vars=None):
            call_count[0] += 1
            if "filter like" in query.lower() or "LIKE" in query:
                return [{"_key": "c1", "name": "Sovereignty", "description": "desc"}]
            if "OUTBOUND" in query and "CONCEPT_TO_PLAN" in query:
                return []
            if "INBOUND" in query and "HYPO_TO_CONCEPT" in query:
                return [{"_key": "h1", "_id": "hypotheses/h1", "rawPatternRepresentation": "t",
                         "metadata": {"noveltyScore": 0.5, "coherenceScore": 0.5, "creativeDrivers": []},
                         "isValuable": False}]
            if "INBOUND" in query and "SESS_TO_HYPO" in query:
                return [{"_key": "s1", "timestamp": "2024-01-01", "userPrompt": "p",
                         "seedConcepts": []}]
            return []

        mock_ctx().execute_aql.side_effect = mock_aql_exec

        from infra.api.graphql.resolvers.search import resolve_explore
        paths = resolve_explore("Sovereignty")
        self.assertGreater(len(paths), 0)

    @patch("infra.api.graphql.resolvers.search.get_graphql_context")
    def test_resolve_stats(self, mock_ctx):
        def mock_aql_exec(query, bind_vars=None):
            if "LENGTH" in query:
                return [1]
            if "groundingStatus" in query:
                return ["ANCHORED"]
            if "noveltyScore" in query:
                return [0.8]
            if "coherenceScore" in query:
                return [0.7]
            return []

        mock_ctx().execute_aql.side_effect = mock_aql_exec

        from infra.api.graphql.resolvers.search import resolve_stats
        stats = resolve_stats()
        self.assertEqual(stats.total_sessions, 1)
        self.assertEqual(stats.anchored_plans, 1)
        self.assertEqual(stats.avg_novelty, 0.8)
        self.assertEqual(stats.avg_coherence, 0.7)


class TestGraphQLEndpoint(unittest.TestCase):
    @patch("infra.api.graphql.main._ctx")
    def test_health_endpoint_healthy(self, mock_ctx):
        mock_db = MagicMock()
        mock_db.version.return_value = "3.12.4"
        mock_ctx().db = mock_db

        from fastapi.testclient import TestClient
        from infra.api.graphql.main import app

        client = TestClient(app)
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")

    @patch("infra.api.graphql.main._ctx")
    def test_health_endpoint_unhealthy(self, mock_ctx):
        mock_db = MagicMock()
        mock_db.version.side_effect = Exception("connection refused")
        mock_ctx().db = mock_db

        from fastapi.testclient import TestClient
        from infra.api.graphql.main import app

        client = TestClient(app)
        response = client.get("/health")
        self.assertEqual(response.status_code, 503)


class TestGraphQLTypeFromDict(unittest.TestCase):
    def test_dream_session_from_dict(self):
        from infra.api.graphql.schema import DreamSession
        d = {"_key": "s1", "timestamp": "2024-01-01", "userPrompt": "hello", "seedConcepts": ["a", "b"]}
        s = DreamSession.from_dict(d)
        self.assertEqual(s.id, "s1")
        self.assertEqual(s.timestamp, "2024-01-01")
        self.assertEqual(s.seed_concepts, ["a", "b"])

    def test_hypothesis_from_dict(self):
        from infra.api.graphql.schema import Hypothesis
        d = {"_key": "h1", "rawPatternRepresentation": "test",
             "metadata": {"noveltyScore": 0.8, "coherenceScore": 0.7, "creativeDrivers": ["ANALOGICAL_LEAP"]},
             "isValuable": False}
        h = Hypothesis.from_dict(d)
        self.assertEqual(h.id, "h1")
        self.assertEqual(h.raw_pattern_representation, "test")
        self.assertEqual(h.metadata.novelty_score, 0.8)
        self.assertEqual(len(h.metadata.creative_drivers), 1)

    def test_concept_from_dict(self):
        from infra.api.graphql.schema import Concept
        d = {"_key": "c1", "name": "Idea", "description": "desc"}
        c = Concept.from_dict(d)
        self.assertEqual(c.id, "c1")
        self.assertEqual(c.name, "Idea")

    def test_actionable_plan_from_dict(self):
        from infra.api.graphql.schema import ActionablePlan
        d = {"_key": "p1", "summary": "Plan", "steps": ["step1"], "riskAssessment": "low",
             "groundingStatus": "ANCHORED"}
        p = ActionablePlan.from_dict(d)
        self.assertEqual(p.id, "p1")
        self.assertEqual(p.steps, ["step1"])

    def test_benchmark_result_from_dict(self):
        from infra.api.graphql.schema import BenchmarkResult
        d = {"_key": "b1", "queryId": 1, "category": "cat", "queryText": "q",
             "normalResponse": "n", "abraxasResponse": "a",
             "scores": {"nl": {"known": 1, "inferred": 0, "uncertain": 0, "unknown": 0, "dream": 0},
                        "al": {"known": 0, "inferred": 1, "uncertain": 0, "unknown": 0, "dream": 0}},
             "modelId": "m1", "timestamp": "2024-01-01"}
        b = BenchmarkResult.from_dict(d)
        self.assertEqual(b.id, "b1")
        self.assertEqual(b.scores.nl.known, 1)
        self.assertEqual(b.scores.al.inferred, 1)

    def test_task_from_dict_with_status_string(self):
        from infra.api.graphql.schema import Task, TaskStatus
        d = {
            "_key": "t1",
            "title": "Test Task",
            "status": "open",
            "priority": "low",
            "project": "test-proj",
            "scope": "global",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
        t = Task.from_dict(d)
        self.assertEqual(t.id, "t1")
        self.assertEqual(t.status, TaskStatus.OPEN)
        self.assertIsInstance(t.status, TaskStatus)

    def test_task_from_dict_with_status_enum(self):
        from infra.api.graphql.schema import Task, TaskStatus
        d = {
            "_key": "t2",
            "title": "Test Task Enum",
            "status": TaskStatus.READY,
            "priority": "medium",
            "project": "test-proj",
            "scope": "local",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
        t = Task.from_dict(d)
        self.assertEqual(t.id, "t2")
        self.assertEqual(t.status, TaskStatus.READY)
        self.assertIsInstance(t.status, TaskStatus)

    def test_task_from_dict_with_invalid_status(self):
        from infra.api.graphql.schema import Task, TaskStatus
        d = {
            "_key": "t3",
            "title": "Test Task Invalid",
            "status": "invalid-status",
        }
        t = Task.from_dict(d)
        self.assertEqual(t.status, TaskStatus.OPEN)


class TestGraphQLEnums(unittest.TestCase):
    def test_grounding_status_values(self):
        from infra.api.graphql.schema import GroundingStatus
        self.assertEqual(GroundingStatus.ANCHORED.value, "ANCHORED")
        self.assertEqual(GroundingStatus.PENDING.value, "PENDING")
        self.assertEqual(GroundingStatus.REJECTED.value, "REJECTED")

    def test_creative_driver_values(self):
        from infra.api.graphql.schema import CreativeDriver
        self.assertEqual(CreativeDriver.ANALOGICAL_LEAP.value, "ANALOGICAL_LEAP")
        self.assertEqual(CreativeDriver.SYSTEMIC_INVERSION.value, "SYSTEMIC_INVERSION")
        self.assertEqual(CreativeDriver.EMERGENT_SYNTHESIS.value, "EMERGENT_SYNTHESIS")

    def test_check_result_values(self):
        from infra.api.graphql.schema import CheckResult
        self.assertEqual(CheckResult.PASS.value, "PASS")
        self.assertEqual(CheckResult.WARN.value, "WARN")
        self.assertEqual(CheckResult.FAIL.value, "FAIL")

    def test_guardrail_id_values(self):
        from infra.api.graphql.schema import GuardrailID
        self.assertEqual(GuardrailID.EPISTEMIC_HUMILITY.value, "EPISTEMIC_HUMILITY")
        self.assertEqual(GuardrailID.CONSENT_SEEKING.value, "CONSENT_SEEKING")


if __name__ == "__main__":
    unittest.main()

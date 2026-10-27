import type { ToolModule } from "./helpers.ts";
import { storeTools } from "./store.ts";
import { systemTools } from "./system.ts";
import { janusTools } from "./janus.ts";
import { aletheiaTools } from "./aletheia.ts";
import { aporiaTools } from "./aporia.ts";
import { autoAgonTools } from "./auto-agon.ts";
import { chronosTools } from "./chronos.ts";
import { configTools } from "./config.ts";
import { coreTools } from "./core.ts";
import { creativeTools } from "./creative.ts";
import { cvpTools } from "./cvp.ts";
import { dianoiaTools } from "./dianoia.ts";
import { epistemeTools } from "./episteme.ts";
import { epistemicAtlasTools } from "./epistemic_atlas.ts";
import { ergonTools } from "./ergon.ts";
import { ethosTools } from "./ethos.ts";
import { gmailTools } from "./gmail.ts";
import { guardrailTools } from "./guardrail.ts";
import { guardrailMonitorTools } from "./guardrail_monitor.ts";
import { harmoniaTools } from "./harmonia.ts";
import { hermesTools } from "./hermes.ts";
import { kairosTools } from "./kairos.ts";
import { krisisTools } from "./krisis.ts";
import { logosMathTools } from "./logos-math.ts";
import { logosVerificationTools } from "./logos-verification.ts";
import { logosTools } from "./logos.ts";
import { memoryTools } from "./memory.ts";
import { sovereignMathTools } from "./math.ts";
import { metanoiaTools } from "./metanoia.ts";
import { omniscientAuditorTools } from "./omniscient_auditor.ts";
import { oneironauticsTools } from "./oneironautics.ts";
import { phemeTools } from "./pheme.ts";
import { planTools } from "./plan.ts";
import { prognosisTools } from "./prognosis.ts";
import { projectBridgeTools } from "./project_bridge.ts";
import { prometheusTools } from "./prometheus.ts";
import { researchTools } from "./research.ts";
import { scribeTools } from "./scribe.ts";
import { sieveTools } from "./sieve.ts";
import { doctorTools } from "./doctor.ts";
import { soterTools } from "./soter.ts";
import { sovereignAnchorTools } from "./sovereign_anchor.ts";
import { sovereignCoreTools } from "./sovereign_core.ts";
import { sovereignEngineTools } from "./sovereign_engine.ts";
import { statusTools } from "./status.ts";
import { stochasmosTools } from "./stochasmos.ts";
import { synesisTools } from "./synesis.ts";
import { nexusTools } from "./nexus.ts";
import { reportTools } from "./report.ts";
import { praxisTools } from "./praxis.ts";
import { sophiaTools } from "./sophia.ts";
import { acquisitionTools } from "./acquisition.ts";
import { constitutionEnforcementTools } from "./constitution_enforcement.ts";
import { researchTools as advResearchTools } from "./research_advanced.ts";


/** Every tool module exposed by the server. Add new modules here. */
export const toolModules: ToolModule[] = [
  janusTools,
  systemTools,
  storeTools,
  aletheiaTools,
  aporiaTools,
  autoAgonTools,
  chronosTools,
  configTools,
  coreTools,
  creativeTools,
  cvpTools,
  dianoiaTools,
  epistemeTools,
  epistemicAtlasTools,
  ergonTools,
  ethosTools,
  gmailTools,
  guardrailTools,
  guardrailMonitorTools,
  harmoniaTools,
  hermesTools,
  kairosTools,
  krisisTools,
  logosMathTools,
  logosVerificationTools,
  logosTools,
  memoryTools,
  metanoiaTools,
  sovereignMathTools,
  omniscientAuditorTools,
  oneironauticsTools,
  phemeTools,
  planTools,
  prognosisTools,
  projectBridgeTools,
  prometheusTools,
  researchTools,
  scribeTools,
  sieveTools,
  soterTools,
  doctorTools,
  sovereignAnchorTools,
  sovereignCoreTools,
  sovereignEngineTools,
  statusTools,
  stochasmosTools,
  synesisTools,
  nexusTools,
  reportTools,
  praxisTools,
  sophiaTools,
  acquisitionTools,
  constitutionEnforcementTools,
  advResearchTools,
];
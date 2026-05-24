# Kiro.dev for Air Force Codebases: Feasibility Assessment

---

**Subject:** Kiro.dev for Air Force Codebases: Feasibility Assessment

Tyler,

Per your request, here's a thorough feasibility analysis on whether the United States Air Force (and DoD more broadly) should consider kiro.dev for existing and legacy codebases. This assessment is organized across the five dimensions you specified, followed by a clear recommendation.

---

## 1. Security & Compliance

### Platform Foundation
Kiro is an AWS application — not a third-party startup. It's built on AWS infrastructure, follows AWS's shared responsibility model, and inherits AWS's compliance posture. This is the single most important fact for DoD evaluation.

### FedRAMP & Impact Levels
- **AWS GovCloud (US) availability confirmed**: Kiro's enterprise page explicitly states it is "available in the AWS US East (N. Virginia), AWS Europe (Frankfurt), and AWS GovCloud (US) regions." This is directly relevant — AWS GovCloud hosts FedRAMP High and DoD SRG IL4/IL5 baselines.
- Kiro does not directly claim FedRAMP authorization, but as an AWS service operating within GovCloud, it benefits from AWS's underlying FedRAMP authorizations. The relevant compliance programs are referenced through "AWS Services in Scope by Compliance Program."
- **Gap**: Kiro is not listed as an independent FedRAMP-authorized service. The DoD would need to evaluate whether Kiro falls under an existing AWS ATO umbrella or requires its own authorization via the DoD CIO. Given that it's an AWS application rather than infrastructure, a separate assessment under RMF (Risk Management Framework) is almost certainly required.

### ATO Process
- Kiro would need to go through a full DoD RMF authorization process for any DoD system. The six-step RMF process (Categorize → Select → Implement → Assess → Authorize → Monitor) applies regardless of underlying cloud provider.
- Kiro's security documentation references third-party auditor verification and compliance programs, which would be beneficial artifacts for an RMF package.

### Air-Gapped / Classified Environments (SIPRNet, NIPRNet)
- **CRITICAL GAP**: Kiro's core functionality requires API calls to cloud-hosted LLM inference endpoints (Claude Sonnet 4.5 via AWS Bedrock, and an "Auto" model mix). There is **no documented on-premises or fully air-gapped deployment option** for the core AI inference.
- The IDE runs locally, but all AI features require cloud connectivity. This means:
  - **NIPRNet**: Potentially viable if connecting through approved gateways to AWS GovCloud.
  - **SIPRNet/SCIFs**: Not viable without an air-gapped deployment capability, which Kiro does not currently offer.
  - The documentation mentions agent hooks, steering files, and specs being local, but the AI engine itself is cloud-dependent.

### FIPS 140-2/140-3
- AWS GovCloud provides FIPS 140-2 validated endpoints. Kiro, operating within AWS GovCloud, would inherit these cryptographic protections for data in transit and at rest within AWS boundaries.
- Local encryption of data on developer workstations would be the responsibility of the DoD's endpoint management (e.g., FIPS-validated disk encryption on STIG-compliant workstations).

### Supply Chain Risk Management (EO 14028)
- Kiro benefits from AWS's supply chain risk management program. AWS has extensive SBOM (Software Bill of Materials) practices and vulnerability management.
- **Gap**: Kiro uses Open VSX extensions, which are third-party and explicitly noted as "not developed, maintained, or managed by Kiro." Each extension would need its own supply chain risk assessment for DoD use.

### CMMC 2.0
- Kiro operates as a cloud service, not a contractor handling CUI directly. CMMC compliance would fall on the DoD organization using Kiro, not on Kiro as a platform. The relevant question is whether Kiro's environment (GovCloud) meets the NIST SP 800-171 control baseline required for CMMC Level 2, which it does by virtue of the underlying AWS GovCloud authorization.

---

## 2. Platform Architecture

### Where Does Code Go?
- **Code remains local**. Kiro is an IDE-based agent. Code is stored on the developer's local machine within workspaces. The IDE (built on Code OSS) operates locally.
- **Context sent to cloud**: When using AI features (chat, specs, autopilot), code context is sent to AWS-hosted LLM endpoints for inference. The privacy and security documentation states Kiro "may access local files and repositories" — meaning code snippets and file contents are transmitted for AI processing.
- **Data retention**: AWS's standard data handling policies apply. Kiro's security page references "data protection" as a section topic. Code used for inference is subject to AWS's AI service data policies. Per AWS's responsible AI policy, customer data is not used to train foundation models.

### Model Hosting — On-Prem vs. Cloud
- **Cloud-only for inference**: Models are hosted on AWS infrastructure. Kiro uses Claude Sonnet 4.5 (via Amazon Bedrock) and an "Auto" mode that mixes frontier models. There is no option to point Kiro at a self-hosted or on-premises model.
- **Implication for SCIFs**: Kiro cannot run in a SCIF where network connectivity is restricted or monitored. The AI engine requires outbound connections to AWS API endpoints.
- **No BYO-model option documented**: Unlike Coder + self-hosted LLMs or Tabnine on-prem, Kiro does not allow organizations to bring their own models or inference endpoints.

### Terminal/CLI
- Kiro CLI connects over SSH to remote environments. This is relevant for server-side development but introduces additional network paths that need security evaluation.

---

## 3. Existing Codebase Integration

### Legacy Language Support
Kiro's documented language support includes: Python, Java, JavaScript, TypeScript, C#, Go, Rust, PHP, Ruby, Kotlin, C, C++, shell scripting, SQL, Scala, JSON, YAML, HCL.

**Notably absent from documentation**: Ada, FORTRAN, COBOL, JOVIAL — languages that are foundational to DoD legacy systems (e.g., F-35 software in C++, AEGIS combat system in Ada, missile warning systems in FORTRAN, logistics systems in COBOL).

- **Realistic assessment**: LLMs generally have some training data for Ada and FORTRAN due to their presence in open-source and academic corpora, but they have far less training data than for Python, JavaScript, or Java. Code generation quality for these languages will be materially lower.
- **Defense-specific patterns**: Kiro has no documented understanding of MIL-STD-498, DIACAP/RMF documentation patterns, DoD Architecture Framework (DoDAF), or other defense-specific software engineering standards. The steering files could theoretically encode some of this, but it would all need to be manually configured.
- **Existing codebase understanding**: Kiro claims "smart context management" for large codebases, but this capability is general-purpose. For extremely large DoD codebases (millions of lines, decades of accumulated patterns), the quality of AI assistance would depend heavily on how well steering files and specs are configured.

---

## 4. Operational Risks

### Hallucination Risk
- **Mission-critical concern**: LLM hallucination is a well-documented risk. For mission-critical DoD systems (weapons, C2, nuclear C3, navigation, flight controls), hallucinated code changes could introduce catastrophic failures.
- Kiro provides "supervised mode" where every change requires human approval, and "autopilot mode" where AI proceeds autonomously. For DoD work, autopilot mode on mission-critical code would be reckless.
- The spec-driven development approach partially mitigates hallucination risk by establishing explicit requirements before code generation, but it does not eliminate it.

### Model Provenance
- Models are provided by AWS/Anthropic (Claude Sonnet 4.5). Model provenance is traceable to AWS Bedrock. This is stronger than platforms using opaque model sources but still relies on third-party model providers.

### Data Residency
- Data residency in GovCloud (US) regions satisfies US data sovereignty requirements.
- The mention of multiple AWS regions (US East, Frankfurt, GovCloud) means organizations must explicitly select GovCloud to ensure data stays within authorized boundaries.

### Vendor Lock-in
- Kiro is built on Code OSS (open source), compatible with VS Code settings and Open VSX extensions. The IDE itself has low lock-in.
- Specs and steering files are stored locally as project files — also low lock-in.
- **Lock-in vector**: Kiro's agentic workflows (spec-driven development, hooks, autopilot patterns) are platform-specific. The productivity gains from these features create behavioral lock-in even if technical lock-in is low.
- Kiro offers IP indemnity for Pro, Pro+, and Power subscribers, which reduces legal risk for code generated by the platform.

### Export Controls (ITAR/EAR)
- AWS GovCloud is authorized for ITAR-controlled data. Kiro, operating within GovCloud, would inherit this capability.
- **Caveat**: ITAR compliance requires that non-US persons cannot access ITAR data. Kiro's AI inference pipeline must be evaluated to ensure no non-US persons have access to inference data or model training pipelines. AWS Bedrock's data processing policies would need to be reviewed.

---

## 5. Competitive Landscape

| Platform | GovCloud | Air-Gapped | Legacy Languages | DoD Track Record |
|---|---|---|---|---|
| **Kiro** | ✅ Yes | ❌ No | Limited (no Ada/FORTRAN documented) | None known |
| **GitHub Copilot (GovCloud)** | ✅ Via Azure Government | ❌ No | Similar to Kiro | Emerging |
| **Amazon CodeWhisperer/Q Developer (GovCloud)** | ✅ Native | ❌ No | Similar (AWS-native) | AWS has DISA authorizations |
| **Coder + Self-Hosted LLMs** | ✅ Self-hosted | ✅ Yes | Depends on model choice | Some (platform only) |
| **Tabnine (on-prem)** | ✅ Self-hosted | ✅ Yes | Tabnine supports FORTRAN, Ada via plugins | Enterprise use |

### Analysis

**Kiro's competitive advantages:**
- Deepest agentic capabilities (spec-driven development, hooks, autopilot) — materially more advanced than Copilot or CodeWhisperer for complex multi-step engineering tasks
- AWS-native, GovCloud available, IP indemnity
- Spec-driven approach aligns well with DoD's requirements-driven engineering culture

**Kiro's competitive disadvantages for DoD:**
- **No air-gapped capability** — this eliminates Kiro for a large fraction of DoD work
- No established DoD customer base or reference implementations
- Legacy language support is undocumented/limited
- Cloud-inference dependency is a fundamental architectural constraint

**Best-in-class for DoD legacy codebases:**
- **Coder + self-hosted LLMs** provides maximum control, air-gapped operation, and the ability to fine-tune models on defense-specific codebases. The tradeoff is that it requires significant infrastructure and MLOps expertise.
- **Tabnine on-prem** provides an enterprise-grade, air-gappable solution with existing enterprise security certifications, though its agentic capabilities are more limited.
- **Amazon Q Developer in GovCloud** is likely the most pragmatic starting point for DoD organizations already in AWS GovCloud, as it benefits from existing AWS DISA authorizations.

---

## 6. Recommendation

**CONDITIONAL NO — Not recommended for broad Air Force adoption at this time, with specific exceptions.**

### Why:

**1. Air-gapped/classified environment incompatibility is disqualifying for primary use cases.**
The majority of Air Force software development involves systems that operate on, process, or connect to classified networks. Kiro's cloud-inference dependency means it cannot be used in SCIFs, on SIPRNet, or in any disconnected environment. Until Kiro offers an on-premises inference option (e.g., local model hosting, AWS Outposts with Bedrock, or integration with self-hosted models), it is structurally excluded from where most Air Force development occurs.

**2. Legacy language support is unproven.**
DoD systems written in Ada, FORTRAN, and JOVIAL represent billions of dollars of investment and decades of accumulated mission logic. Kiro has not demonstrated competence in these languages, and no defense-specific benchmarks exist.

**3. No ATO precedent.**
While AWS GovCloud provides a strong foundation, Kiro itself would require an RMF authorization. There is no existing DoD ATO package, no DISA reference, and no established path through the DoD CIO's authorization process. This is not insurmountable, but it means a 12-18 month authorization timeline with uncertain outcome.

### Where Kiro COULD make sense (limited scope):

- **Unclassified development on NIPRNet**: For unclassified, non-mission-critical support tools (dashboards, data processing pipelines, internal tools) built in modern languages (Python, JavaScript, Java), Kiro's spec-driven approach could significantly accelerate development.
- **Prototyping and experimentation**: Kiro's rapid prototype capability (multiple enterprise testimonials cite going from concept to working prototype in hours/days) is genuinely useful for Air Force innovation cells and software factories experimenting with new capabilities.
- **Documentation and knowledge transfer**: Kiro's living docs and codebase understanding features could help with the perennial DoD challenge of onboarding to complex legacy systems — but only for unclassified systems.

### Recommended Path Forward:

1. **Pilot Kiro on a single, unclassified, non-mission-critical project** within an Air Force software factory (e.g., Kessel Run, Platform One, Kobayashi Maru). Use GovCloud region. Measure productivity against baseline.
2. **Evaluate Amazon Q Developer in parallel** as the more conservative AWS-native option with existing DoD authorization paths.
3. **For classified environments, invest in Coder + self-hosted LLMs** with fine-tuning on defense-specific codebases. This is the only architecture that satisfies all DoD security requirements.
4. **Engage AWS on Kiro's roadmap** — specifically whether on-premises inference (via Outposts, ECS Anywhere, or local model hosting) is on the product roadmap. If Kiro adds air-gapped inference capability, this recommendation would change significantly.

---

This assessment is based on publicly available documentation from kiro.dev, AWS compliance documentation, and DoD cybersecurity policy frameworks (RMF, NIST SP 800-53, DoDI 8500.01, DoDI 8510.01). No classified information was used. Sources reviewed include kiro.dev/docs/privacy-and-security/, kiro.dev/enterprise/, and AWS compliance programs documentation.

— Mary Jane

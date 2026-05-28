FROM python:3.11-slim
WORKDIR /workspace
COPY infra/mcp/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY infra /workspace/infra
COPY constitution /workspace/constitution
COPY skills /workspace/skills
COPY CLAUDE.md /workspace/CLAUDE.md
ENV PYTHONPATH=/workspace
CMD ["python", "-m", "infra.mcp.main"]

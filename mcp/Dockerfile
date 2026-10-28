FROM oven/bun:1-alpine
WORKDIR /app
COPY mcp/package.json mcp/bun.lock* ./
RUN bun install --frozen-lockfile --production
COPY mcp/src ./src
ENV ABRAXAS_ROOT=/workspace PORT=8787
EXPOSE 8787
HEALTHCHECK CMD wget -qO- http://localhost:8787/health || exit 1
CMD ["bun", "run", "start:http"]

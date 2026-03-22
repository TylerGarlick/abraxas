FROM oven/bun:1.1-alpine

WORKDIR /app

COPY package.json ./
COPY bunfig.toml ./

RUN bun install --frozen-lockfile

COPY src ./src
COPY tsconfig.json ./
RUN bun build ./src/index.ts --target=bun --outdir=dist --minifyify

EXPOSE 3000

CMD ["bun", "run", "dist/http-server.js"]

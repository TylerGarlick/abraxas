# MCP Servers

These are some guidelines for the MCP servers.

* Use bunjs to implement the mcp servers.
* Prefer TypeScript unless it is way easier with python.
* Prefer to use GraphQL for apis, and to call those apis in the MCP servers.
* Use https://the-guild.dev/graphql/yoga-server/docs for the GraphQL server.
* Use https://the-guild.dev/graphql/scalars/docs/quick-start and setup in the GraphQL server.
* Register the mcp server with the ../docker-compose.yml

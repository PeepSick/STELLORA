#!/usr/bin/env node

import { createStelloraMcpServer } from './server.js';

async function main() {
  try {
    const { dataDir } = await createStelloraMcpServer();
    process.stderr.write(`Stellora MCP server started (data: ${dataDir})\n`);
  } catch (error) {
    process.stderr.write(`Failed to start Stellora MCP server: ${error}\n`);
    process.exit(1);
  }
}

main();

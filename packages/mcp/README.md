# @stellora/mcp

MCP (Model Context Protocol) server for Stellora. Connect Claude Desktop, OpenCode, Cursor, or any MCP-compatible tool to your galaxy.

## Quick Start

```bash
# From the Stellora root
cd packages/mcp
npm install
npm run build

# Test it
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

## Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "stellora": {
      "command": "node",
      "args": ["/path/to/stellora/packages/mcp/dist/index.js"],
      "env": {
        "STELLORA_DATA_DIR": "/path/to/stellora/src/data"
      }
    }
  }
}
```

### OpenCode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcpServers": {
    "stellora": {
      "command": "node",
      "args": ["/path/to/stellora/packages/mcp/dist/index.js"],
      "env": {
        "STELLORA_DATA_DIR": "/path/to/stellora/src/data"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "stellora": {
      "command": "node",
      "args": ["/path/to/stellora/packages/mcp/dist/index.js"],
      "env": {
        "STELLORA_DATA_DIR": "/path/to/stellora/src/data"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `notes_search` | Search knowledge galaxy by query |
| `notes_read` | Read full note content by ID |
| `notes_list` | List all notes with metadata |
| `gallery_search` | Search photo memories |
| `gallery_get` | Get a specific day's memory |
| `gallery_list` | List all memory days |
| `finance_search` | Search the finance/economy reference corpus |
| `finance_read` | Read a finance article's full content by ID |
| `git_get` | Fetch recent commits from a GitHub repo |
| `galaxy_stats` | Get galaxy statistics |
| `galaxy_sources` | List available data sources |

## Available Resources

| Resource URI | Description |
|--------------|-------------|
| `stellora://notes` | Index of all knowledge notes |
| `stellora://notes/{id}` | Full content of a specific note |
| `stellora://gallery` | Index of all photo memory days |
| `stellora://finance` | Index of finance corpus |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STELLORA_DATA_DIR` | Path to the Stellora `src/data` directory | Auto-detected |

## Architecture

```
packages/mcp/
  src/
    index.ts          # CLI entry point
    server.ts         # MCP server setup
    tools/            # MCP tool definitions
      notes.ts        # notes_search, notes_read, notes_list
      gallery.ts      # gallery_search, gallery_get, gallery_list
      finance.ts      # finance_search, finance_read
      git.ts          # git_get
      galaxy.ts       # galaxy_stats, galaxy_sources
    resources/        # MCP resource definitions
      notes.ts        # stellora://notes
      gallery.ts      # stellora://gallery
      finance.ts      # stellora://finance
    utils/
      markdown.ts     # Shared markdown parsing
```

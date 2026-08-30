import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

interface GitRepoCache {
  repo: string;
  commits: GitCommit[];
  fetchedAt: number;
}

const cache = new Map<string, GitRepoCache>();

async function fetchCommits(repoUrl: string, token?: string): Promise<GitCommit[]> {
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/?#]+)/);
  if (!match) throw new Error('Invalid GitHub URL');

  const [, owner, repo] = match;
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`,
    { headers }
  );

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const data = await res.json() as Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
  }>;

  return data.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    author: c.commit.author.name,
    date: c.commit.author.date,
  }));
}

export function registerGitTools(server: McpServer) {
  server.tool(
    'git_get',
    'Fetch recent commits from a public GitHub repository.',
    { repoUrl: z.string().describe('GitHub repository URL (e.g. https://github.com/user/repo)'), token: z.string().optional().describe('Optional GitHub personal access token for higher rate limits') },
    async ({ repoUrl, token }) => {
      try {
        const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/?#]+)/);
        if (!match) {
          return {
            content: [{ type: 'text' as const, text: 'Invalid GitHub URL format' }],
            isError: true,
          };
        }

        const cacheKey = `${match[1]}/${match[2]}`;
        const cached = cache.get(cacheKey);
        const fiveMin = 5 * 60 * 1000;

        let commits: GitCommit[];
        if (cached && Date.now() - cached.fetchedAt < fiveMin) {
          commits = cached.commits;
        } else {
          commits = await fetchCommits(repoUrl, token);
          cache.set(cacheKey, { repo: cacheKey, commits, fetchedAt: Date.now() });
        }

        if (commits.length === 0) {
          return {
            content: [{ type: 'text' as const, text: `No commits found for ${cacheKey}` }],
          };
        }

        const list = commits
          .map((c) => `- **${c.sha}** ${c.message} (${c.author}, ${c.date})`)
          .join('\n');

        return {
          content: [{ type: 'text' as const, text: `# ${cacheKey} — Recent Commits (${commits.length})\n\n${list}` }],
        };
      } catch (e) {
        return {
          content: [{ type: 'text' as const, text: `Error fetching commits: ${e}` }],
          isError: true,
        };
      }
    }
  );
}

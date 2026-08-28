import type { StellarisNode, StellarisConnection } from '@/types';

export interface GitGalaxyResult {
  nodes: StellarisNode[];
  connections: StellarisConnection[];
}

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.trim().replace(/\.git$/, '');
  const m = cleaned.match(/github\.com[/:]([^/]+)\/([^/?#]+)/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

/**
 * Fetch recent commits for a public GitHub repo and turn them into galaxy nodes.
 * No auth needed for public repos (rate-limited to 60 req/hr per IP). Commits are
 * chained chronologically so the graph shows a development timeline.
 */
export async function fetchGitHubCommits(
  repoUrl: string,
  token?: string,
  perPage = 100
): Promise<GitGalaxyResult> {
  const repo = parseRepoUrl(repoUrl);
  if (!repo) throw new Error('Invalid GitHub repository URL');

  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?per_page=${perPage}`,
    { headers }
  );
  if (!res.ok) {
    throw new Error(res.status === 403 ? 'Rate limited or forbidden (add a token)' : `GitHub error ${res.status}`);
  }
  const commits = (await res.json()) as any[];

  const nodes: StellarisNode[] = commits.map((c, i) => {
    const message: string = c.commit?.message?.split('\n')[0] ?? '(no message)';
    const date: string = c.commit?.author?.date ?? c.commit?.committer?.date ?? '';
    const author: string = c.author?.login ?? c.commit?.author?.name ?? 'unknown';
    return {
      id: 'commit-' + (c.sha ?? String(i)),
      title: message.slice(0, 60),
      description: `${author} · ${date.slice(0, 10)}`,
      type: 'commit',
      tags: ['git', repo.repo, author],
      importance: 2,
      connections: [],
      metadata: { sha: c.sha, author, date, repo: `${repo.owner}/${repo.repo}` },
    };
  });

  // Chain commits in reverse chronological order (newest → oldest)
  const connections: StellarisConnection[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    connections.push({ source: nodes[i].id, target: nodes[i + 1].id, strength: 0.5, type: 'data-flow' });
  }

  return { nodes, connections };
}

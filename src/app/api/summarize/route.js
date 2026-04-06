import { requireAdmin } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

function parseGithubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

function titleCase(str) {
  return str
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchGithubData(owner, repo) {
  const headers = { Accept: "application/vnd.github.v3+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const [repoRes, readmeRes, commitsRes, languagesRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { ...headers, Accept: "application/vnd.github.raw" },
    }).catch(() => null),
    fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }),
  ]);

  if (!repoRes.ok) {
    throw new Error(`GitHub repo not found: ${repoRes.status}`);
  }

  const repoData = await repoRes.json();
  const readme = readmeRes?.ok ? await readmeRes.text() : "";
  const commits = commitsRes.ok ? await commitsRes.json() : [];
  const languages = languagesRes.ok ? await languagesRes.json() : {};

  return {
    name: repoData.name,
    description: repoData.description || "",
    topics: repoData.topics || [],
    languages: Object.keys(languages),
    readme: readme.slice(0, 4000),
    latestCommitSha: commits[0]?.sha || null,
  };
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { githubUrl } = await request.json();
  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) {
    return Response.json({ error: "Invalid GitHub URL" }, { status: 400 });
  }

  const ghData = await fetchGithubData(parsed.owner, parsed.repo);

  const client = new Anthropic();
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 80,
    system:
      "You write a single short sentence describing a software project for a portfolio website. Be specific about what the project does. Do not mention technologies. Do not use marketing language. Return only the sentence, nothing else. If there is not enough information to meaningfully describe what the project does, return exactly: INSUFFICIENT_INFO. Examples of good descriptions: 'A web application for discovering and searching information on movies from a huge database of movies.' 'A web application that displays users' webcam video feed, detects face positions and expressions, and maps a triangulated mesh over the faces visible in the feed.'",
    messages: [
      {
        role: "user",
        content: `Write a portfolio description for this project:\n\nName: ${ghData.name}\nDescription: ${ghData.description}\nLanguages: ${ghData.languages.join(", ")}\n\nREADME (excerpt):\n${ghData.readme}`,
      },
    ],
  });

  const rawSummary = message.content[0].text.trim();
  const summary = rawSummary === "INSUFFICIENT_INFO"
    ? ""
    : rawSummary;

  // Build tags from languages and topics
  const tags = [
    ...ghData.languages.slice(0, 5),
    ...ghData.topics.slice(0, 3),
  ].filter(Boolean);

  return Response.json({
    title: titleCase(ghData.name),
    description: summary,
    insufficientInfo: !summary,
    tags: tags.length > 0 ? tags : ghData.languages,
    github_url: githubUrl,
    latestCommitSha: ghData.latestCommitSha,
    year: new Date().getFullYear().toString(),
  });
}

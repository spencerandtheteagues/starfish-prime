import { execa } from 'execa'; import { Octokit } from '@octokit/rest'; import { join } from 'node:path'; import { existsSync } from 'node:fs';
export async function pushAndPR(dir: string, branch: string, title: string){
  const token=process.env.GITHUB_TOKEN||''; const owner=process.env.GITHUB_OWNER||''; const repo=process.env.GITHUB_REPO||'';
  if(!token||!owner||!repo) throw new Error('Missing GITHUB_TOKEN/OWNER/REPO');
  if(!existsSync(join(dir,'package.json'))) throw new Error('No app package.json to push');
  const env={...process.env, GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME||'Neon Builder', GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL||'neon@example.com'};
  await execa('git',['init'],{cwd:dir, env}); await execa('git',['checkout','-b',branch],{cwd:dir, env});
  await execa('git',['add','.'],{cwd:dir, env}); await execa('git',['commit','-m',title],{cwd:dir, env});
  await execa('git',['remote','add','origin',`https://x-access-token:${token}@github.com/${owner}/${repo}.git`],{cwd:dir, env});
  await execa('git',['push','-u','origin',branch,'--force'],{cwd:dir, env});
  const octo=new Octokit({ auth: token }); const { data: repoInfo } = await octo.repos.get({ owner, repo });
  const base = repoInfo.default_branch || 'main';
  const pr = await octo.pulls.create({ owner, repo, title, head: branch, base });
  return pr.data.html_url;
}

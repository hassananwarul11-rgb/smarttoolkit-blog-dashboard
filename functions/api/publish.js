// Cloudflare Pages Function: /api/publish
// Purpose: let the WordPress-style admin (admin.html) publish a post as a
// STATIC update to the website, without any password or token in the code.
// Secrets live ONLY in Cloudflare Pages environment variables, set by the
// site owner in the Cloudflare dashboard:
//   ADMIN_PASSWORD - admin password, set as an encrypted (secret) variable
//   GITHUB_TOKEN   - fine-grained GitHub token, set as an encrypted variable,
//                    scoped ONLY to repo hassananwarul11-rgb/smarttoolkit-blog-dashboard,
//                    Contents: Read and write. No other repo, no other permission.
// Flow: admin sends {password, post} -> this Function checks the password
// against env.ADMIN_PASSWORD -> it updates posts.json in the GitHub repo
// via the GitHub Contents API using env.GITHUB_TOKEN -> the website fetches
// that posts.json DYNAMICALLY from GitHub on every load, so the post appears
// in Blog, Latest Guides and the sidebar on the next page refresh, WITHOUT
// waiting for a Pages redeploy.
// No password or token is ever logged, returned, or stored in the repo.

const OWNER = "hassananwarul11-rgb";
const REPO = "smarttoolkit-blog-dashboard";
const BRANCH = "main";
const PATH = "posts.json";

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function b64decode(b64) {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export async function onRequestGet() {
  return json({ ok: false, message: "Use POST with {password, post}." }, 405);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  // 1. Admin password check — server-side, against the Cloudflare variable.
  if (!env.ADMIN_PASSWORD || body.password !== env.ADMIN_PASSWORD) {
    return json({ ok: false, error: "Wrong admin password." }, 401);
  }
  if (!env.GITHUB_TOKEN) {
    return json({ ok: false, error: "GITHUB_TOKEN variable is not set in Cloudflare." }, 500);
  }

  const p = body.post || {};
  if (!p.title || !p.slug || !/^[a-z0-9-]+$/.test(p.slug)) {
    return json({ ok: false, error: "Post needs a title and a valid slug (lowercase letters, numbers, hyphens)." }, 400);
  }
  if (p.feat && p.feat.startsWith("data:")) {
    return json({ ok: false, error: "Featured image as a data URL is too large for a static publish. Use an image URL instead." }, 400);
  }
  // Drafts are NOT published live; only published posts go into posts.json.
  const isPublished = p.status === "published";

  const headers = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "SmartToolkit-Admin",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`;

  // 2. Read current posts.json (404 = first publish, start empty).
  let list = [];
  let sha = null;
  const getRes = await fetch(url, { headers });
  if (getRes.ok) {
    const cur = await getRes.json();
    sha = cur.sha || null;
    try {
      const parsed = JSON.parse(b64decode(cur.content || ""));
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      return json({ ok: false, error: "posts.json in the repo is not valid JSON." }, 500);
    }
  } else if (getRes.status !== 404) {
    return json({ ok: false, error: "Could not read posts.json from GitHub." }, 502);
  }

  // 3. Merge: update by slug, keep the old body if the new body is empty
  // (this is how SEO-only edits of the seed posts work — the full article
  // body already lives in index.html and must not be wiped out).
  const clean = { ...p };
  delete clean.password;
  const idx = list.findIndex((x) => x.slug === p.slug);
  if (!isPublished) {
    if (idx >= 0) list.splice(idx, 1);
  } else if (idx >= 0) {
    const old = list[idx];
    const merged = { ...old };
    for (const [k, v] of Object.entries(clean)) {
      if (v !== "" && v !== undefined && v !== null) merged[k] = v;
    }
    merged.date = old.date || clean.date || new Date().toISOString().slice(0, 10);
    list[idx] = merged;
  } else {
    if (!clean.body) {
      return json({ ok: false, error: "New post needs article body. Seed-post SEO edits without a body are allowed only for an existing slug." }, 400);
    }
    list.unshift({ ...clean, date: clean.date || new Date().toISOString().slice(0, 10) });
  }

  // 4. Commit posts.json back to GitHub. The site reads it dynamically, so
  // no Pages redeploy wait is needed for the content to appear.
  const putBody = {
    message: `Publish post: ${p.slug} via admin`,
    content: b64encode(JSON.stringify(list, null, 2)),
    branch: BRANCH,
  };
  if (sha) putBody.sha = sha;
  const putRes = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify(putBody),
  });
  if (!putRes.ok) {
    return json({ ok: false, error: "GitHub commit failed. Check that GITHUB_TOKEN has Contents write access to this repo only." }, 502);
  }

  return json({
    ok: true,
    slug: p.slug,
    published: isPublished,
    message: isPublished
      ? "Saved to GitHub. The site loads posts.json dynamically, so refresh the website and the post appears in Blog and sidebar (GitHub may take under a minute to serve the new file)."
      : "Draft removed from live posts.json (not published).",
  });
}

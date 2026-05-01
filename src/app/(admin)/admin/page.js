"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Login View ─────────────────────────────────────────────
function LoginView({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      onLogin();
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  }

  return (
    <div className="admin-login">
      <h1>Ethan's Super Secret Admin Panel</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}

// ─── Add Project View ───────────────────────────────────────
function AddProjectView({ onBack, onSaved, initialGithubUrl }) {
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  async function handleFetch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setForm(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch");
      }
      const data = await res.json();
      if (data.insufficientInfo) {
        setError("Not enough information in the repo to generate a description. You can write one manually below.");
      }
      setForm({
        title: data.title,
        description: data.description,
        tags: data.tags,
        github_url: data.github_url,
        website_url: "",
        demo_url: "",
        year: data.year,
        last_commit_sha: data.latestCommitSha,
        is_published: true,
      });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  function handleTagKeyDown(e) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  }

  function removeTag(index) {
    setForm({ ...form, tags: form.tags.filter((_, i) => i !== index) });
  }

  return (
    <div className="admin-section">
      <button className="admin-btn admin-btn-secondary" onClick={onBack}>
        &larr; Back to Dashboard
      </button>
      <h2>Add New Project</h2>

      <form onSubmit={handleFetch} className="admin-fetch-form">
        <input
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username/repo"
          required
        />
        <button type="submit" className="admin-btn" disabled={loading}>
          {loading ? "Fetching & Summarizing..." : "Fetch & Summarize"}
        </button>
      </form>

      {error && <p className="admin-error">{error}</p>}

      {form && (
        <div className="admin-form">
          <label>
            Title
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>

          <label>
            Description (AI-generated — edit as needed)
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>

          <label>
            Tags (press Enter to add)
            <div className="admin-tags-editor">
              {form.tags.map((tag, i) => (
                <span key={i} className="admin-tag">
                  {tag}
                  <button type="button" onClick={() => removeTag(i)}>
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag..."
                className="admin-tag-input"
              />
            </div>
          </label>

          <label>
            Website URL (optional)
            <input
              type="url"
              value={form.website_url}
              onChange={(e) =>
                setForm({ ...form, website_url: e.target.value })
              }
              placeholder="https://..."
            />
          </label>

          <label>
            Loom Demo URL (optional)
            <input
              type="url"
              value={form.demo_url}
              onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
              placeholder="https://www.loom.com/share/..."
            />
          </label>

          <label>
            Year
            <input
              type="text"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
          </label>

          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) =>
                setForm({ ...form, is_published: e.target.checked })
              }
            />
            Publish to portfolio
          </label>

          <button
            className="admin-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Project"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Edit Project Modal ─────────────────────────────────────
function EditProjectView({ project, onBack, onSaved }) {
  const [form, setForm] = useState({
    title: project.title,
    description: project.description,
    tags: project.tags,
    github_url: project.github_url,
    website_url: project.website_url || "",
    demo_url: project.demo_url || "",
    year: project.year,
    is_published: project.is_published,
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${project.db_id || project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      onSaved();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  function handleTagKeyDown(e) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  }

  function removeTag(index) {
    setForm({ ...form, tags: form.tags.filter((_, i) => i !== index) });
  }

  return (
    <div className="admin-section">
      <button className="admin-btn admin-btn-secondary" onClick={onBack}>
        &larr; Back to Dashboard
      </button>
      <h2>Edit: {project.title}</h2>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-form">
        <label>
          Title
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>

        <label>
          Description
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <label>
          Tags (press Enter to add)
          <div className="admin-tags-editor">
            {form.tags.map((tag, i) => (
              <span key={i} className="admin-tag">
                {tag}
                <button type="button" onClick={() => removeTag(i)}>
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag..."
              className="admin-tag-input"
            />
          </div>
        </label>

        <label>
          Website URL
          <input
            type="url"
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
          />
        </label>

        <label>
          Loom Demo URL
          <input
            type="url"
            value={form.demo_url}
            onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
          />
        </label>

        <label>
          Year
          <input
            type="text"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
        </label>

        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) =>
              setForm({ ...form, is_published: e.target.checked })
            }
          />
          Publish to portfolio
        </label>

        <button className="admin-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard View ─────────────────────────────────────────
function DashboardView({ onAddProject, onEditProject, onRenew, onReorder, onViewLogs }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [renewingId, setRenewingId] = useState(null);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/github-repos");
    if (res.ok) {
      setRepos(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRepos().then(() => checkAllUpdates());
  }, [fetchRepos]);

  async function checkAllUpdates() {
    setChecking(true);
    const res = await fetch("/api/check-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const results = await res.json();
      const statusMap = {};
      for (const r of results) {
        statusMap[r.id] = r;
      }
      // Update repos with latest version info
      setRepos((prev) =>
        prev.map((repo) => {
          const update = repo.db_id ? statusMap[repo.db_id] : null;
          if (update) {
            return { ...repo, _hasUpdates: update.hasUpdates };
          }
          return repo;
        })
      );
    }
    setChecking(false);
  }

  async function handleRenew(repo) {
    setRenewingId(repo.db_id || repo.github_url);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: repo.github_url }),
      });
      if (!res.ok) throw new Error("Failed to summarize");
      const data = await res.json();

      // Open edit view with renewed fields pre-filled
      onRenew({
        ...repo,
        id: repo.db_id,
        description: data.description,
        tags: data.tags,
        last_commit_sha: data.latestCommitSha,
      });
    } catch (err) {
      alert("Renew failed: " + err.message);
    }
    setRenewingId(null);
  }

  async function handleDelete(repo) {
    if (!confirm(`Remove "${repo.title || repo.repo_name}" from portfolio?`)) return;
    await fetch(`/api/projects/${repo.db_id}`, { method: "DELETE" });
    await fetchRepos();
  }

  async function handleTogglePublish(repo) {
    if (!repo.db_id) return; // Can't toggle if not in DB
    await fetch(`/api/projects/${repo.db_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !repo.is_published }),
    });
    await fetchRepos();
  }

  if (loading) return <div className="admin-section"><p>Loading...</p></div>;

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h1>Ethan's Super Secret Admin Panel</h1>
        <div className="admin-header-actions">
          <button className="admin-btn admin-btn-secondary" onClick={onReorder}>
            Reorder
          </button>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={checkAllUpdates}
            disabled={checking}
          >
            {checking ? "Checking..." : "Check All for Updates"}
          </button>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Repository</th>
            <th>Published</th>
            <th>Has Demo</th>
            <th>Latest Version</th>
            <th>Actions</th>
            <th>Logs</th>
          </tr>
        </thead>
        <tbody>
          {repos.map((r) => {
            const isTracked = !!r.db_id;
            const displayName = r.title || r.repo_name;
            const hasUpdates = r._hasUpdates;
            const latestVersion =
              hasUpdates === undefined
                ? null // not checked yet
                : !hasUpdates;

            return (
              <tr key={r.github_url} className={!isTracked ? "admin-row-dim" : ""}>
                <td>{displayName}</td>
                <td>
                  {isTracked ? (
                    r.is_published ? (
                      <span className="admin-badge admin-badge-ok">Yes</span>
                    ) : (
                      <span className="admin-badge admin-badge-dim">No</span>
                    )
                  ) : (
                    <span className="admin-badge admin-badge-dim">No</span>
                  )}
                </td>
                <td>
                  {isTracked ? (
                    r.demo_url ? (
                      <span className="admin-badge admin-badge-ok">Yes</span>
                    ) : (
                      <span className="admin-badge admin-badge-dim">No</span>
                    )
                  ) : (
                    <span className="admin-badge admin-badge-dim">—</span>
                  )}
                </td>
                <td>
                  {!isTracked ? (
                    <span className="admin-badge admin-badge-dim">—</span>
                  ) : latestVersion === null ? (
                    <span className="admin-badge admin-badge-dim">Unchecked</span>
                  ) : latestVersion ? (
                    <span className="admin-badge admin-badge-ok">Yes</span>
                  ) : (
                    <span className="admin-badge admin-badge-warn">No</span>
                  )}
                </td>
                <td>
                  <div className="admin-actions">
                    {isTracked ? (
                      <>
                        <button
                          className="admin-btn-sm"
                          onClick={() => onEditProject(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn-sm"
                          onClick={() => handleRenew(r)}
                          disabled={latestVersion || renewingId === r.db_id}
                        >
                          {renewingId === r.db_id ? "Renewing..." : "Renew"}
                        </button>
                        <button
                          className="admin-btn-sm admin-btn-danger"
                          onClick={() => handleDelete(r)}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        className="admin-btn-sm"
                        onClick={() => onAddProject(r.github_url)}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  {isTracked && (
                    <button
                      className="admin-btn-sm"
                      onClick={() => onViewLogs(r)}
                    >
                      Logs
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Logs View ──────────────────────────────────────────────
function LogEntry({ entry, isCurrent }) {
  return (
    <div className="admin-log-entry">
      <div className="admin-log-header">
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span className="admin-log-version">Version {entry._version}</span>
          {isCurrent && <span className="admin-badge admin-badge-ok">Current</span>}
        </div>
        <span className="admin-log-date">
          {new Date(entry.saved_at).toLocaleString()}
        </span>
      </div>
      <div className="admin-log-body">
        <div className="admin-log-field">
          <span className="admin-log-label">Title</span>
          <span>{entry.title}</span>
        </div>
        <div className="admin-log-field">
          <span className="admin-log-label">Description</span>
          <span>{entry.description}</span>
        </div>
        <div className="admin-log-field">
          <span className="admin-log-label">Tags</span>
          <span>{entry.tags.join(", ")}</span>
        </div>
        <div className="admin-log-field">
          <span className="admin-log-label">GitHub</span>
          <span>{entry.github_url}</span>
        </div>
        <div className="admin-log-field">
          <span className="admin-log-label">Website</span>
          <span>{entry.website_url || "—"}</span>
        </div>
        <div className="admin-log-field">
          <span className="admin-log-label">Demo</span>
          <span>{entry.demo_url || "—"}</span>
        </div>
        <div className="admin-log-field">
          <span className="admin-log-label">Year</span>
          <span>{entry.year}</span>
        </div>
        <div className="admin-log-field">
          <span className="admin-log-label">Commit SHA</span>
          <span className="admin-sha">{entry.last_commit_sha?.slice(0, 7) || "—"}</span>
        </div>
      </div>
    </div>
  );
}

function LogsView({ project, onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${project.db_id || project.id}/history`)
      .then((res) => res.json())
      .then((data) => {
        // Build current version from project data
        const current = {
          id: "current",
          title: project.title,
          description: project.description,
          tags: project.tags || [],
          github_url: project.github_url,
          website_url: project.website_url,
          demo_url: project.demo_url,
          year: project.year,
          last_commit_sha: project.last_commit_sha,
          saved_at: project.updated_at || new Date().toISOString(),
        };

        // History is already newest first from the API
        // Total versions = history entries + 1 (current)
        const total = data.length + 1;
        current._version = total;
        const numbered = data.map((entry, i) => ({
          ...entry,
          _version: total - 1 - i,
        }));

        setHistory([current, ...numbered]);
        setLoading(false);
      });
  }, [project]);

  if (loading) return <div className="admin-section"><p>Loading...</p></div>;

  return (
    <div className="admin-section">
      <button className="admin-btn admin-btn-secondary" onClick={onBack}>
        &larr; Back to Dashboard
      </button>
      <h2>Edit History: {project.title || project.repo_name}</h2>

      <div className="admin-logs">
        {history.map((entry, i) => (
          <LogEntry key={entry.id} entry={entry} isCurrent={i === 0} />
        ))}
      </div>
    </div>
  );
}

// ─── Resume View ────────────────────────────────────────────
function ResumeView() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewKey, setPreviewKey] = useState(Date.now());

  const fetchInfo = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/resume");
    if (res.ok) setInfo(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("File must be a PDF");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/resume", {
        method: "POST",
        body: data,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed");
      }
      await fetchInfo();
      setPreviewKey(Date.now());
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  }

  return (
    <div className="admin-section">
      <h1>Resume</h1>
      <p className="admin-subtext">
        Upload a PDF to replace the resume shown on /resume.
      </p>

      <div className="admin-form">
        <label>
          Upload new PDF
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {uploading && <p className="admin-subtext">Uploading...</p>}
        {error && <p className="admin-error">{error}</p>}
        {!loading && info && (
          <p className="admin-subtext">
            {info.exists
              ? `Current: ${(info.size / 1024).toFixed(1)} KB · updated ${new Date(info.updated_at).toLocaleString()}`
              : "No upload yet — serving the bundled default."}
          </p>
        )}
      </div>

      <iframe
        key={previewKey}
        src="/api/resume"
        title="Resume preview"
        className="admin-resume-preview"
      />
    </div>
  );
}

// ─── About View ─────────────────────────────────────────────
const ABOUT_FIELDS = [
  { key: "about", label: "About Me", rows: 3 },
  { key: "currently", label: "Currently", rows: 4 },
  { key: "previous_education", label: "Previous Education", rows: 2 },
  { key: "interests", label: "Interests", rows: 4 },
];

function AboutView() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    fetch("/api/admin/about")
      .then((res) => res.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      setSavedAt(new Date());
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  if (loading || !form) {
    return (
      <div className="admin-section">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h1>About</h1>
      <p className="admin-subtext">
        Edit the text shown on the homepage. Section headings and order are
        fixed.
      </p>

      <div className="admin-form">
        {ABOUT_FIELDS.map(({ key, label, rows }) => (
          <label key={key}>
            {label}
            <textarea
              rows={rows}
              value={form[key] ?? ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}

        {error && <p className="admin-error">{error}</p>}

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button className="admin-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          {savedAt && (
            <span className="admin-subtext">
              Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Experience Views ───────────────────────────────────────
function ExperienceListView({ onAdd, onEdit, onReorder }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/experience");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await fetch(`/api/admin/experience/${item.id}`, { method: "DELETE" });
    await fetchItems();
  }

  if (loading) {
    return (
      <div className="admin-section">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h1>Experience</h1>
        <div className="admin-header-actions">
          {items.length > 1 && (
            <button
              className="admin-btn admin-btn-secondary"
              onClick={onReorder}
            >
              Reorder
            </button>
          )}
          <button className="admin-btn" onClick={onAdd}>
            + Add Experience
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="admin-subtext">No experiences yet. Click + Add Experience.</p>
      ) : (
        <table className="admin-table admin-experience-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Period</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.period || "—"}</td>
                <td className="admin-subtext">{(e.tags || []).join(", ")}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn-sm" onClick={() => onEdit(e)}>
                      Edit
                    </button>
                    <button
                      className="admin-btn-sm admin-btn-danger"
                      onClick={() => handleDelete(e)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ExperienceFormView({ initial, onBack, onSaved }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial || { title: "", tags: [], description: "", period: "" }
  );
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTagKeyDown(e) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  }

  function removeTag(index) {
    setForm({ ...form, tags: form.tags.filter((_, i) => i !== index) });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const url = isEdit
        ? `/api/admin/experience/${initial.id}`
        : "/api/admin/experience";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <div className="admin-section">
      <button className="admin-btn admin-btn-secondary" onClick={onBack}>
        &larr; Back
      </button>
      <h2>{isEdit ? `Edit: ${initial.title}` : "Add Experience"}</h2>

      <div className="admin-form">
        <label>
          Title
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="SWE Internship @ Bearing AI"
          />
        </label>

        <label>
          Tags (press Enter to add)
          <div className="admin-tags-editor">
            {form.tags.map((tag, i) => (
              <span key={i} className="admin-tag">
                {tag}
                <button type="button" onClick={() => removeTag(i)}>
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag..."
              className="admin-tag-input"
            />
          </div>
        </label>

        <label>
          Description
          <textarea
            rows={8}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <label>
          Period
          <input
            type="text"
            value={form.period || ""}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            placeholder="Summer 2024"
          />
        </label>

        {error && <p className="admin-error">{error}</p>}

        <button className="admin-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Experience"}
        </button>
      </div>
    </div>
  );
}

function ExperienceReorderView({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/experience")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  function moveUp(index) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
  }

  function moveDown(index) {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next);
  }

  async function handleSave() {
    setSaving(true);
    await Promise.all(
      items.map((item, i) =>
        fetch(`/api/admin/experience/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: i + 1 }),
        })
      )
    );
    setSaving(false);
    onBack();
  }

  if (loading) {
    return (
      <div className="admin-section">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <button className="admin-btn admin-btn-secondary" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Reorder Experiences</h2>
      <p className="admin-subtext">
        Top item appears first on the Experience page.
      </p>

      <div className="admin-reorder-list">
        {items.map((item, i) => (
          <div key={item.id} className="admin-reorder-item">
            <span className="admin-reorder-num">{i + 1}</span>
            <span className="admin-reorder-title">{item.title}</span>
            <div className="admin-reorder-arrows">
              <button
                className="admin-btn-sm"
                onClick={() => moveUp(i)}
                disabled={i === 0}
              >
                ↑
              </button>
              <button
                className="admin-btn-sm"
                onClick={() => moveDown(i)}
                disabled={i === items.length - 1}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="admin-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Order"}
      </button>
    </div>
  );
}

// ─── Contact View ───────────────────────────────────────────
function ContactView() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    fetch("/api/admin/contact")
      .then((res) => res.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      setSavedAt(new Date());
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  if (loading || !form) {
    return (
      <div className="admin-section">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h1>Contact</h1>
      <p className="admin-subtext">
        Edit the body text shown on the Contact page. The "Contact Me" heading
        is fixed.
      </p>

      <div className="admin-form">
        <label>
          Body
          <textarea
            rows={4}
            value={form.body ?? ""}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        </label>

        {error && <p className="admin-error">{error}</p>}

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button className="admin-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          {savedAt && (
            <span className="admin-subtext">
              Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reorder Projects View ──────────────────────────────────
function ReorderView({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((res) => res.json())
      .then((data) => {
        const published = data
          .filter((p) => p.is_published)
          .sort((a, b) => a.sort_order - b.sort_order);
        setItems(published);
        setLoading(false);
      });
  }, []);

  function moveUp(index) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
  }

  function moveDown(index) {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next);
  }

  async function handleSave() {
    setSaving(true);
    await Promise.all(
      items.map((item, i) =>
        fetch(`/api/projects/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: i + 1 }),
        })
      )
    );
    setSaving(false);
    onBack();
  }

  if (loading) return <div className="admin-section"><p>Loading...</p></div>;

  return (
    <div className="admin-section">
      <button className="admin-btn admin-btn-secondary" onClick={onBack}>
        &larr; Back to Dashboard
      </button>
      <h2>Reorder Published Projects</h2>
      <p style={{ color: "#656d76", fontSize: "0.85rem" }}>
        Use the arrows to reorder. The top item appears first on your portfolio.
      </p>

      <div className="admin-reorder-list">
        {items.map((item, i) => (
          <div key={item.id} className="admin-reorder-item">
            <span className="admin-reorder-num">{i + 1}</span>
            <span className="admin-reorder-title">{item.title}</span>
            <div className="admin-reorder-arrows">
              <button
                className="admin-btn-sm"
                onClick={() => moveUp(i)}
                disabled={i === 0}
              >
                ↑
              </button>
              <button
                className="admin-btn-sm"
                onClick={() => moveDown(i)}
                disabled={i === items.length - 1}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="admin-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Order"}
      </button>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────
function AdminSidebar({ section, onNavigate }) {
  const items = [
    { key: "projects", label: "Projects" },
    { key: "about", label: "About" },
    { key: "experience", label: "Experience" },
    { key: "resume", label: "Resume" },
    { key: "contact", label: "Contact" },
  ];
  return (
    <nav className="admin-sidebar">
      {items.map((item) => (
        <button
          key={item.key}
          className={
            "admin-sidebar-item" +
            (section === item.key ? " admin-sidebar-item-active" : "")
          }
          onClick={() => onNavigate(item.key)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

// ─── Main Admin Page ────────────────────────────────────────
export default function AdminPage() {
  const [view, setView] = useState("login");
  // Views: login | dashboard | add | edit | reorder | logs | resume | about | contact
  // Experience views: exp_list | exp_add | exp_edit | exp_reorder
  const [editExperience, setEditExperience] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [logsProject, setLogsProject] = useState(null);
  const [addGithubUrl, setAddGithubUrl] = useState("");

  // Logout on page unload so session doesn't persist
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon("/api/auth/logout");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  if (view === "login") {
    return <LoginView onLogin={() => setView("dashboard")} />;
  }

  // Top-level section shown by the sidebar; subviews share their parent section
  const section = view === "resume"
    ? "resume"
    : view === "about"
    ? "about"
    : view === "contact"
    ? "contact"
    : view.startsWith("exp_")
    ? "experience"
    : "projects";

  function handleNavigate(next) {
    if (next === "resume") setView("resume");
    else if (next === "about") setView("about");
    else if (next === "contact") setView("contact");
    else if (next === "experience") setView("exp_list");
    else setView("dashboard");
  }

  let content;
  if (view === "add") {
    content = (
      <AddProjectView
        initialGithubUrl={addGithubUrl}
        onBack={() => setView("dashboard")}
        onSaved={() => setView("dashboard")}
      />
    );
  } else if (view === "logs" && logsProject) {
    content = <LogsView project={logsProject} onBack={() => setView("dashboard")} />;
  } else if (view === "reorder") {
    content = <ReorderView onBack={() => setView("dashboard")} />;
  } else if (view === "edit" && editProject) {
    content = (
      <EditProjectView
        project={editProject}
        onBack={() => setView("dashboard")}
        onSaved={() => setView("dashboard")}
      />
    );
  } else if (view === "resume") {
    content = <ResumeView />;
  } else if (view === "about") {
    content = <AboutView />;
  } else if (view === "contact") {
    content = <ContactView />;
  } else if (view === "exp_list") {
    content = (
      <ExperienceListView
        onAdd={() => setView("exp_add")}
        onEdit={(item) => {
          setEditExperience(item);
          setView("exp_edit");
        }}
        onReorder={() => setView("exp_reorder")}
      />
    );
  } else if (view === "exp_add") {
    content = (
      <ExperienceFormView
        onBack={() => setView("exp_list")}
        onSaved={() => setView("exp_list")}
      />
    );
  } else if (view === "exp_edit" && editExperience) {
    content = (
      <ExperienceFormView
        initial={editExperience}
        onBack={() => setView("exp_list")}
        onSaved={() => setView("exp_list")}
      />
    );
  } else if (view === "exp_reorder") {
    content = <ExperienceReorderView onBack={() => setView("exp_list")} />;
  } else {
    content = (
      <DashboardView
        onAddProject={(githubUrl) => {
          setAddGithubUrl(githubUrl || "");
          setView("add");
        }}
        onReorder={() => setView("reorder")}
        onViewLogs={(p) => {
          setLogsProject(p);
          setView("logs");
        }}
        onRenew={(p) => {
          setEditProject(p);
          setView("edit");
        }}
        onEditProject={(p) => {
          setEditProject(p);
          setView("edit");
        }}
      />
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar section={section} onNavigate={handleNavigate} />
      <div className="admin-content">{content}</div>
    </div>
  );
}

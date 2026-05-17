const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = Number(process.env.PORT || 3000);

const repoRoot = path.join(__dirname, "repository");

const seededFiles = [
  {
    name: "Q3_Financial_Report_2024.pdf",
    owner: "Finance Ops",
    modified: "2024-10-12 09:18",
    size: "2.4 MB",
  },
  {
    name: "Employee_Handbook_v4.docx",
    owner: "People Team",
    modified: "2024-11-03 14:32",
    size: "1.1 MB",
  },
  {
    name: "IT_Security_Policy_Draft.pdf",
    owner: "Security Office",
    modified: "2024-11-09 11:04",
    size: "896 KB",
  },
  {
    name: "Project_Atlas_Roadmap.xlsx",
    owner: "PMO",
    modified: "2024-11-14 16:25",
    size: "742 KB",
  },
  {
    name: "NDA_Template_2024.docx",
    owner: "Legal",
    modified: "2024-11-18 10:56",
    size: "366 KB",
  },
];

let accessLog = [
  { name: "Q3_Financial_Report_2024.pdf", timestamp: "2026-05-16 08:42", ip: "10.42.18.9" },
  { name: "NDA_Template_2024.docx", timestamp: "2026-05-16 08:31", ip: "10.42.16.12" },
  { name: "Project_Atlas_Roadmap.xlsx", timestamp: "2026-05-16 08:14", ip: "10.42.11.22" },
  { name: "IT_Security_Policy_Draft.pdf", timestamp: "2026-05-16 07:58", ip: "10.42.14.7" },
  { name: "Employee_Handbook_v4.docx", timestamp: "2026-05-16 07:40", ip: "10.42.19.3" },
];

const mimeMap = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".json": "application/json",
  ".log": "text/plain",
  ".csv": "text/csv",
  ".xml": "application/xml",
};

const textExtensions = new Set([".txt", ".md", ".json", ".csv", ".xml", ".log", ".conf", ".ini", ".sh", ".js", ".py", ".yml", ".yaml"]);

app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "static")));

function ensureSeedFiles() {
  if (!fs.existsSync(repoRoot)) {
    fs.mkdirSync(repoRoot, { recursive: true });
  }

  const templates = {
    "Q3_Financial_Report_2024.pdf": "Placeholder binary content for finance report.",
    "Employee_Handbook_v4.docx": "Placeholder binary content for employee handbook.",
    "IT_Security_Policy_Draft.pdf": "Placeholder binary content for policy draft.",
    "Project_Atlas_Roadmap.xlsx": "Placeholder binary content for roadmap workbook.",
    "NDA_Template_2024.docx": "Placeholder binary content for NDA template.",
  };

  for (const file of seededFiles) {
    const fullPath = path.join(repoRoot, file.name);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, templates[file.name] || "Placeholder content\n", "utf8");
    }
  }
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function guessMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeMap[ext] || "application/octet-stream";
}

function isProbablyText(buffer, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (textExtensions.has(ext)) {
    return true;
  }

  const slice = buffer.subarray(0, Math.min(buffer.length, 4096));
  if (slice.includes(0)) {
    return false;
  }

  let printable = 0;
  for (const byte of slice) {
    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
      printable += 1;
    }
  }

  const ratio = slice.length === 0 ? 1 : printable / slice.length;
  return ratio > 0.9;
}

function iconForFile(name) {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".pdf") {
    return '<span class="ft-icon pdf" aria-hidden="true"></span>';
  }
  if (ext === ".docx") {
    return '<span class="ft-icon docx" aria-hidden="true"></span>';
  }
  if (ext === ".xlsx") {
    return '<span class="ft-icon xlsx" aria-hidden="true"></span>';
  }
  return '<span class="ft-icon generic" aria-hidden="true"></span>';
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function layout({ title, breadcrumb, activeNav, content, metaPanel = "", hasMeta = false }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;700&family=Source+Code+Pro:wght@400;500&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/static/styles.css">
</head>
<body>
  <div class="shell ${hasMeta ? "has-meta" : ""}">
    <aside class="sidebar">
      <div>
        <div class="logo">DocVault</div>
        <div class="folder-tree">
          <a class="tree-item ${activeNav === "files" ? "active" : ""}" href="/files">All Files</a>
          <a class="tree-item ${activeNav === "audit" ? "active" : ""}" href="/audit">Recent</a>
          <a class="tree-item ${activeNav === "upload" ? "active" : ""}" href="/upload">Upload Intake</a>
          <a class="tree-item" href="#">Shared with Me</a>
        </div>
      </div>
    </aside>

    <div class="main-wrap">
      <header class="topbar">
        <div class="breadcrumb">${breadcrumb}</div>
        <div class="top-tools">
          <input class="search" type="text" placeholder="Search documents" />
          <a class="upload-btn" href="/upload">Upload</a>
          <div class="avatar">JR</div>
        </div>
      </header>

      <main class="content">${content}</main>
    </div>

    ${hasMeta ? `<aside class="meta">${metaPanel}</aside>` : ""}
  </div>
</body>
</html>`;
}

function renderFileRows() {
  return seededFiles
    .map((file) => {
      const icon = iconForFile(file.name);
      return `<tr class="file-row">
        <td>
          <div class="file-cell">
            ${icon}
            <a href="/files/view?name=${encodeURIComponent(file.name)}" class="file-name">${escapeHtml(file.name)}</a>
          </div>
        </td>
        <td>${escapeHtml(file.owner)}</td>
        <td>${escapeHtml(file.modified)}</td>
        <td>${escapeHtml(file.size)}</td>
        <td class="actions">
          <button class="icon-btn" type="button" aria-label="Download">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4v10"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/></svg>
          </button>
          <button class="icon-btn" type="button" aria-label="Share">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51 15.42 17.49"/><path d="M15.41 6.51 8.59 10.49"/></svg>
          </button>
          <button class="icon-btn" type="button" aria-label="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button>
        </td>
      </tr>`;
    })
    .join("\n");
}

app.get("/", (_req, res) => {
  res.redirect("/files");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", lab: "path-traversal" });
});

app.get("/files", (_req, res) => {
  const content = `
    <section class="page-header">
      <h1>Document Repository</h1>
      <p>Browse internal files available to finance, legal, and operations teams.</p>
    </section>

    <section class="table-wrap">
      <table class="file-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Owner</th>
            <th>Date Modified</th>
            <th>Size</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${renderFileRows()}
        </tbody>
      </table>
    </section>
  `;

  res.type("html").send(
    layout({
      title: "DocVault · Files",
      breadcrumb: 'Home <span class="chev">›</span> <span class="current">All Files</span>',
      activeNav: "files",
      content,
    })
  );
});

app.get("/files/view", (req, res) => {
  const requested = req.query.name || seededFiles[0].name;
  const targetPath = path.join(repoRoot, requested);

  let viewerBlock = "";
  let metadata = {
    name: requested,
    size: "n/a",
    modified: "n/a",
    mime: guessMime(targetPath),
  };

  try {
    const stats = fs.statSync(targetPath);
    const buffer = fs.readFileSync(targetPath);

    metadata = {
      name: requested,
      size: `${stats.size} bytes`,
      modified: formatDate(stats.mtime),
      mime: guessMime(targetPath),
    };

    const isText = isProbablyText(buffer, requested);

    if (isText) {
      const content = buffer.toString("utf8");
      viewerBlock = `<pre class="viewer-code">${escapeHtml(content)}</pre>`;
    } else {
      viewerBlock = `
        <div class="binary-note">
          Preview unavailable for this file type. Use download for offline review.
        </div>
      `;
    }

    accessLog.unshift({
      name: requested,
      timestamp: formatDate(new Date()),
      ip: req.ip,
    });
    accessLog = accessLog.slice(0, 10);
  } catch (error) {
    viewerBlock = `<pre class="viewer-code">${escapeHtml(error.message)}</pre>`;
  }

  const content = `
    <section class="page-header">
      <h1>File Viewer</h1>
      <p>Inspect document content and metadata before distribution.</p>
    </section>

    <section class="viewer-card">
      <div class="viewer-top">
        <div class="viewer-title">${escapeHtml(requested)}</div>
        <button class="download-btn" type="button">Download</button>
      </div>
      ${viewerBlock}
    </section>
  `;

  const metaPanel = `
    <h2>Metadata</h2>
    <dl class="meta-list">
      <dt>Filename</dt><dd>${escapeHtml(metadata.name)}</dd>
      <dt>Size</dt><dd>${escapeHtml(metadata.size)}</dd>
      <dt>Last Modified</dt><dd>${escapeHtml(metadata.modified)}</dd>
      <dt>MIME Type</dt><dd>${escapeHtml(metadata.mime)}</dd>
    </dl>
  `;

  res.type("html").send(
    layout({
      title: "DocVault · Viewer",
      breadcrumb: `Home <span class="chev">›</span> <a href="/files">All Files</a> <span class="chev">›</span> <span class="current">${escapeHtml(requested)}</span>`,
      activeNav: "files",
      content,
      metaPanel,
      hasMeta: true,
    })
  );
});

app.get("/upload", (_req, res) => {
  const submitted = _req.query.status === "submitted";
  const content = `
    <section class="page-header">
      <h1>Upload Intake</h1>
      <p>Use this intake form to submit files for indexing review.</p>
    </section>

    <section class="upload-card">
      ${submitted ? '<div class="upload-flash">Upload request captured. Records team will review this submission.</div>' : ""}
      <form class="upload-form" method="post" action="/upload">
        <label>Document Title</label>
        <input type="text" name="title" placeholder="e.g. Vendor Contract Addendum" required />

        <label>Owner Team</label>
        <input type="text" name="team" placeholder="Finance / Legal / Security" required />

        <label>Choose File</label>
        <input type="file" name="file" />

        <button type="submit" class="submit-btn">Submit for Review</button>
      </form>
      <p class="upload-note">Uploads are queued for validation by records administrators.</p>
    </section>
  `;

  res.type("html").send(
    layout({
      title: "DocVault · Upload",
      breadcrumb: 'Home <span class="chev">›</span> <span class="current">Upload</span>',
      activeNav: "upload",
      content,
    })
  );
});

app.post("/upload", (_req, res) => {
  res.redirect("/upload?status=submitted");
});

app.get("/audit", (_req, res) => {
  const rows = accessLog
    .map(
      (item) => `<tr>
        <td class="mono">${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.timestamp)}</td>
        <td>${escapeHtml(item.ip)}</td>
      </tr>`
    )
    .join("\n");

  const content = `
    <section class="page-header">
      <h1>Recent Access Log</h1>
      <p>Document viewer activity for compliance and monitoring workflows.</p>
    </section>

    <section class="table-wrap">
      <table class="file-table audit-table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Timestamp</th>
            <th>IP Address</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </section>
  `;

  res.type("html").send(
    layout({
      title: "DocVault · Audit",
      breadcrumb: 'Home <span class="chev">›</span> <span class="current">Audit</span>',
      activeNav: "audit",
      content,
    })
  );
});

app.listen(port, "0.0.0.0", () => {
  ensureSeedFiles();
  console.log(`Traversal lab listening on ${port}`);
});

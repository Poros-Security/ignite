<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexaDocs — Document Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
    <style>
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            background: #0a0e14;
            color: #b8c4d0;
        }

        .sidebar {
            width: 260px;
            background: #0d1117;
            border-right: 1px solid #1e2733;
            position: fixed;
            top: 0; left: 0; bottom: 0;
            display: flex; flex-direction: column;
            z-index: 20;
        }

        .sidebar__brand {
            padding: 1.5rem 1.4rem 1.25rem;
            border-bottom: 1px solid #1e2733;
        }

        .sidebar__logo {
            font-family: 'JetBrains Mono', monospace;
            font-size: 1.4rem; font-weight: 700;
            color: #3cdc7c;
        }
        .sidebar__logo span { color: #7ee2a8; }

        .sidebar__tagline {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem; color: #3d4f5f;
            margin-top: 0.3rem; letter-spacing: 0.04em;
        }

        .sidebar__nav { flex: 1; padding: 1rem 0; }

        .nav-item {
            display: flex; align-items: center; gap: 0.75rem;
            padding: 0.75rem 1.4rem;
            font-size: 0.95rem; color: #4e6070;
            text-decoration: none; cursor: pointer;
            transition: all 0.12s;
            font-family: 'JetBrains Mono', monospace;
            border-left: 3px solid transparent;
        }
        .nav-item:hover { color: #3cdc7c; background: rgba(60,220,124,0.04); }
        .nav-item--active { color: #3cdc7c; border-left-color: #3cdc7c; background: rgba(60,220,124,0.06); }
        .nav-item i { font-size: 1.25rem; width: 24px; text-align: center; }

        .sidebar__footer {
            padding: 1.2rem 1.4rem;
            border-top: 1px solid #1e2733;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem; color: #2d3b47;
        }

        /* Main */
        .main-wrap { margin-left: 260px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

        /* Topbar */
        .topbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 2rem; height: 64px;
            background: #0d1117; border-bottom: 1px solid #1e2733;
            position: sticky; top: 0; z-index: 10;
        }
        .topbar__breadcrumb {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem; color: #3d4f5f;
        }
        .topbar__breadcrumb strong { color: #3cdc7c; }
        .topbar__actions { display: flex; align-items: center; gap: 1.25rem; }
        .topbar__notif { position: relative; font-size: 1.2rem; cursor: pointer; color: #4e6070; }
        .topbar__notif-dot { position: absolute; top: 0; right: 0; width: 6px; height: 6px; background: #ef4444; border-radius: 50%; }
        .topbar__user { display: flex; align-items: center; gap: 0.6rem; }
        .avatar-term { width: 32px; height: 32px; border-radius: 4px; background: #3cdc7c; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 700; color: #0a0e14; }
        .topbar__username { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: #4e6070; }

        /* Content area */
        .content { flex: 1; padding: 2.5rem 3rem; max-width: 900px; }

        /* Page container */
        .page { display: none; }
        .page--active { display: block; }

        .content__title {
            font-family: 'JetBrains Mono', monospace;
            font-size: 1.75rem; font-weight: 700;
            color: #3cdc7c; margin-bottom: 0.5rem;
        }
        .content__subtitle { font-size: 1rem; color: #4e6070; margin-bottom: 2rem; }

        /* Quick links */
        .quick-links { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .quick-link {
            padding: 0.4rem 0.85rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem; color: #3cdc7c;
            cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;
            background: rgba(60,220,124,0.06);
            border: 1px solid rgba(60,220,124,0.15);
            border-radius: 4px;
            transition: all 0.15s;
        }
        .quick-link:hover { background: rgba(60,220,124,0.12); border-color: rgba(60,220,124,0.3); }
        .quick-link i { font-size: 1.05rem; }

        /* Search bar */
        .search-bar { display: flex; gap: 0.75rem; margin-bottom: 1.75rem; }
        .search-bar__prefix {
            font-family: 'JetBrains Mono', monospace;
            font-size: 1.05rem; color: #3cdc7c;
            align-self: center; white-space: nowrap;
        }
        .search-bar input {
            flex: 1; padding: 0.75rem 1rem;
            background: #0d1117; border: 1px solid #1e2733;
            border-radius: 4px; color: #e2e8f0;
            font-family: 'JetBrains Mono', monospace;
            font-size: 1.05rem; outline: none;
            transition: border-color 0.2s;
        }
        .search-bar input:focus { border-color: #3cdc7c; }
        .search-bar input::placeholder { color: #2d3b47; }
        .search-bar button {
            padding: 0.75rem 1.5rem; border: 1px solid #3cdc7c;
            border-radius: 4px; background: transparent;
            color: #3cdc7c; font-family: 'JetBrains Mono', monospace;
            font-weight: 600; font-size: 0.95rem; cursor: pointer;
            transition: all 0.15s; display: flex; align-items: center; gap: 0.4rem;
        }
        .search-bar button:hover { background: rgba(60,220,124,0.1); }

        /* Output panel */
        .output-panel { background: #0d1117; border: 1px solid #1e2733; border-radius: 6px; overflow: hidden; }
        .output-panel__header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.8rem 1.25rem;
            background: #161b22; border-bottom: 1px solid #1e2733;
        }
        .output-panel__label {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem; font-weight: 600; color: #3cdc7c;
            text-transform: uppercase; letter-spacing: 0.05em;
            display: flex; align-items: center; gap: 0.5rem;
        }
        .output-panel__time {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem; color: #4e6070;
        }
        .output-panel__body {
            padding: 1.5rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.95rem; line-height: 1.7;
            white-space: pre-wrap; word-break: break-all;
            color: #8ba4b8; min-height: 120px; max-height: 400px; overflow-y: auto;
        }
        .output-panel__body--error { color: #f87171; }

        /* Scanline overlay */
        .output-panel__body::after {
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
            pointer-events: none;
        }
        .output-panel { position: relative; }

        /* Dummy pages */
        .dummy-page { padding: 2rem 0; }
        .dummy-page h2 { font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; color: #3cdc7c; margin-bottom: 0.75rem; }
        .dummy-card {
            background: #0d1117; border: 1px solid #1e2733; border-radius: 6px;
            padding: 1.5rem; margin-bottom: 1rem;
        }
        .dummy-card__title { font-family: 'JetBrains Mono', monospace; font-size: 1.05rem; color: #7ee2a8; margin-bottom: 0.5rem; }
        .dummy-card__text { font-size: 0.95rem; color: #6b7db3; line-height: 1.6; }
        .dummy-stat { display: flex; gap: 1.25rem; margin-bottom: 1.25rem; }
        .dummy-stat__item { background: #0d1117; border: 1px solid #1e2733; border-radius: 6px; padding: 1.25rem 1.5rem; flex: 1; }
        .dummy-stat__num { font-family: 'JetBrains Mono', monospace; font-size: 1.75rem; font-weight: 700; color: #3cdc7c; }
        .dummy-stat__label { font-size: 0.85rem; color: #4e6070; margin-top: 0.25rem; }

        .table-dummy { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
        .table-dummy th { text-align: left; padding: 0.75rem 1rem; color: #3cdc7c; border-bottom: 1px solid #1e2733; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; text-transform: uppercase; }
        .table-dummy td { padding: 0.75rem 1rem; color: #6b7db3; border-bottom: 1px solid #131920; }

        .page-footer {
            padding: 1.5rem 3rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem; color: #2d3b47;
            border-top: 1px solid #131920;
        }

        @media(max-width:768px) {
            .sidebar { display: none; }
            .main-wrap { margin-left: 0; }
            .content { padding: 1.5rem; }
        }
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="sidebar__brand">
            <div class="sidebar__logo">Nexa<span>Docs</span></div>
            <div class="sidebar__tagline">// doc management v2.4.1</div>
        </div>
        <nav class="sidebar__nav">
            <a class="nav-item" onclick="showPage('dashboard')" href="#"><i class='bx bx-grid-alt'></i> Dashboard</a>
            <a class="nav-item nav-item--active" id="nav-docs" onclick="showPage('documents')" href="#"><i class='bx bx-file'></i> Documents</a>
            <a class="nav-item" onclick="showPage('shared')" href="#"><i class='bx bx-share-alt'></i> Shared Files</a>
            <a class="nav-item" onclick="showPage('archive')" href="#"><i class='bx bx-archive'></i> Archive</a>
            <a class="nav-item" onclick="showPage('settings')" href="#"><i class='bx bx-cog'></i> Settings</a>
        </nav>
        <div class="sidebar__footer">sys.nexadocs v2.4.1</div>
    </aside>

    <div class="main-wrap">
        <header class="topbar">
            <div class="topbar__breadcrumb">~/docs &gt; <strong>viewer</strong></div>
            <div class="topbar__actions">
                <div class="topbar__notif"><i class='bx bx-bell'></i><span class="topbar__notif-dot"></span></div>
                <div class="topbar__user">
                    <div class="avatar-term">SK</div>
                    <span class="topbar__username">kowalski</span>
                </div>
            </div>
        </header>

        <main class="content">
            <!-- PAGE: Dashboard -->
            <div class="page" id="page-dashboard">
                <h1 class="content__title">Dashboard</h1>
                <p class="content__subtitle">System overview and activity</p>
                <div class="dummy-stat">
                    <div class="dummy-stat__item"><div class="dummy-stat__num">247</div><div class="dummy-stat__label">Total Documents</div></div>
                    <div class="dummy-stat__item"><div class="dummy-stat__num">18</div><div class="dummy-stat__label">Shared Today</div></div>
                    <div class="dummy-stat__item"><div class="dummy-stat__num">3.2GB</div><div class="dummy-stat__label">Storage Used</div></div>
                </div>
                <div class="dummy-card">
                    <div class="dummy-card__title">Recent Activity</div>
                    <div class="dummy-card__text">kowalski uploaded "Q4_report.pdf" — 2 hours ago<br>admin modified "policy_v3.docx" — 5 hours ago<br>jiang.w shared "design_assets/" — yesterday</div>
                </div>
            </div>

            <!-- PAGE: Documents (main functional page) -->
            <div class="page page--active" id="page-documents">
                <h1 class="content__title">Document Viewer</h1>
                <p class="content__subtitle">Browse and view internal documents.</p>

                <div class="quick-links">
                    <span class="quick-link" onclick="document.getElementById('file-input').value='welcome.txt';document.getElementById('viewer-form').submit();"><i class='bx bx-file-blank'></i> welcome.txt</span>
                    <span class="quick-link" onclick="document.getElementById('file-input').value='about.txt';document.getElementById('viewer-form').submit();"><i class='bx bx-notepad'></i> about.txt</span>
                    <span class="quick-link" onclick="document.getElementById('file-input').value='contact.txt';document.getElementById('viewer-form').submit();"><i class='bx bx-id-card'></i> contact.txt</span>
                </div>

                <form method="GET" action="" id="viewer-form">
                    <div class="search-bar">
                        <span class="search-bar__prefix">$</span>
                        <input type="text" name="file" id="file-input" placeholder="cat filename.txt" value="<?php echo isset($_GET['file']) ? htmlspecialchars($_GET['file']) : ''; ?>">
                        <button type="submit"><i class='bx bx-terminal'></i> Run</button>
                    </div>
                </form>

                <div class="output-panel">
                    <div class="output-panel__header">
                        <span class="output-panel__label"><i class='bx bx-code-block'></i> stdout</span>
                        <span class="output-panel__time"><?php echo date('H:i:s'); ?></span>
                    </div>
                    <div class="output-panel__body <?php
                        if (isset($_GET['file'])) {
                            $file = $_GET['file'];
                            if (!empty($file)) {
                                $base_dir = '/var/www/html/files/';
                                $path = $base_dir . $file;
                                if (strpos($path, $base_dir) !== 0) { echo 'output-panel__body--error'; }
                            }
                        }
                    ?>"><?php
                        if (isset($_GET['file'])) {
                            $file = $_GET['file'];
                            $base_dir = '/var/www/html/files/';
                            $path = $base_dir . $file;
                            if (empty($file)) { echo "nexadocs: no filename specified"; }
                            elseif (strpos($path, $base_dir) !== 0) { echo "nexadocs: permission denied — restricted path"; }
                            else {
                                if (file_exists($path)) { echo htmlspecialchars(file_get_contents($path)); }
                                else { echo "nexadocs: file not found: " . htmlspecialchars($file); }
                            }
                        } else { echo "nexadocs: awaiting input...\n\nType a filename above or use quick access links."; }
                    ?></div>
                </div>
            </div>

            <div class="page" id="page-shared">
                <h1 class="content__title">Shared Files</h1>
                <p class="content__subtitle">Files shared across departments</p>
                <table class="table-dummy">
                    <thead><tr><th>File</th><th>Shared By</th><th>Date</th></tr></thead>
                    <tbody>
                        <tr><td>onboarding_guide.pdf</td><td>admin</td><td>Feb 12, 2026</td></tr>
                        <tr><td>brand_assets_v2.zip</td><td>jiang.w</td><td>Feb 10, 2026</td></tr>
                        <tr><td>team_roster.xlsx</td><td>kowalski</td><td>Feb 08, 2026</td></tr>
                        <tr><td>infra_diagram.png</td><td>ops-team</td><td>Jan 30, 2026</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="page" id="page-archive">
                <h1 class="content__title">Archive</h1>
                <p class="content__subtitle">Archived documents and old versions</p>
                <div class="dummy-card"><div class="dummy-card__title">2025 Q4 Reports</div><div class="dummy-card__text">12 files — archived Dec 31, 2025</div></div>
                <div class="dummy-card"><div class="dummy-card__title">Legacy Policies</div><div class="dummy-card__text">8 files — archived Nov 15, 2025</div></div>
                <div class="dummy-card"><div class="dummy-card__title">Old Templates</div><div class="dummy-card__text">5 files — archived Oct 01, 2025</div></div>
            </div>

            <div class="page" id="page-settings">
                <h1 class="content__title">Settings</h1>
                <p class="content__subtitle">System configuration</p>
                <div class="dummy-card">
                    <div class="dummy-card__title">Storage</div>
                    <div class="dummy-card__text">Used: 3.2 GB / 10 GB<br>Auto-archive: Enabled<br>Retention: 90 days</div>
                </div>
                <div class="dummy-card">
                    <div class="dummy-card__title">Access Control</div>
                    <div class="dummy-card__text">Auth mode: LDAP<br>Max sessions: 3<br>2FA: Disabled</div>
                </div>
            </div>
        </main>

        <footer class="page-footer">&copy; 2026 Nexa Corp. All rights reserved. // internal use only</footer>
    </div>

    <script>
        function showPage(id) {
            document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('page--active'); });
            document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('nav-item--active'); });
            document.getElementById('page-' + id).classList.add('page--active');
            event.currentTarget.classList.add('nav-item--active');
        }
    </script>
</body>
</html>

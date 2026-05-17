const express = require('express');
const app = express();
const PORT = 3000;
const FLAG = process.env.FLAG || 'ignite{default_idor_flag}';

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@devhub.io', role: 'developer', bio: 'Full-stack developer working on frontend tooling.', joined: 'Jan 2025', lastActive: '2 hours ago' },
  { id: 2, name: 'Bob Smith', email: 'bob@devhub.io', role: 'developer', bio: 'Backend engineer focused on API design and microservices.', joined: 'Mar 2025', lastActive: '5 hours ago' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@devhub.io', role: 'developer', bio: 'DevOps specialist. Infrastructure as code enthusiast.', joined: 'Jun 2025', lastActive: '1 day ago' },
  { id: 4, name: 'Diana Prince', email: 'diana@devhub.io', role: 'team-lead', bio: 'Engineering team lead. Passionate about code quality.', joined: 'Nov 2024', lastActive: '3 hours ago' },
  { id: 5, name: 'System Admin', email: 'admin@devhub.io', role: 'admin', bio: `Platform administrator. Confidential: ${FLAG}`, joined: 'Sep 2024', lastActive: 'Just now' },
];

app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid member ID.' });
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Member not found.' });
  res.json({ user });
});

app.get('/api/me', (req, res) => { res.json({ user: users[0] }); });

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevHub — Members</title>
    <!-- Using VT323: A highly legible, tall pixel-art font -->
    <link href="https://fonts.googleapis.com/css2?family=VT323&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
    <style>
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',sans-serif;min-height:100vh;display:flex;background:#1a1a2e;color:#e0e0e0}

        /* Sidebar — pixel theme */
        .sidebar{width:240px;background:#16213e;border-right:3px solid #0f3460;position:fixed;top:0;left:0;bottom:0;display:flex;flex-direction:column;z-index:20}
        .sidebar__brand{padding:1.5rem 1.25rem 1.25rem;border-bottom:3px solid #0f3460}
        .sidebar__logo{font-family:'VT323',monospace;font-size:2.2rem;color:#e94560;line-height:1}
        .sidebar__logo span{color:#00d2ff}
        .sidebar__tagline{font-size:0.8rem;color:#4a5580;margin-top:0.4rem;text-transform:uppercase;letter-spacing:0.05em;font-weight:600}

        .sidebar__nav{flex:1;padding:1rem 0}
        .nav-item{display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1.25rem;font-size:0.95rem;font-weight:500;color:#6b7db3;text-decoration:none;cursor:pointer;transition:all 0.1s;border:none;background:none;width:100%}
        .nav-item:hover{background:#1a1a40;color:#00d2ff}
        .nav-item--active{background:#1a1a40;color:#00d2ff;border-left:3px solid #00d2ff;padding-left:calc(1.25rem - 3px)}
        .nav-item i{font-size:1.25rem;width:24px;text-align:center}

        .sidebar__footer{padding:1rem 1.25rem;border-top:3px solid #0f3460;font-family:'VT323',monospace;font-size:1rem;color:#4a5580;line-height:1.4}

        .main-wrap{margin-left:240px;flex:1;display:flex;flex-direction:column;min-height:100vh}

        /* Topbar */
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:60px;background:#16213e;border-bottom:3px solid #0f3460;position:sticky;top:0;z-index:10}
        .topbar__breadcrumb{font-family:'VT323',monospace;font-size:1.15rem;color:#4a5580;letter-spacing:0.05em}
        .topbar__breadcrumb strong{color:#00d2ff}
        .topbar__actions{display:flex;align-items:center;gap:1.25rem}
        .topbar__notif{position:relative;font-size:1.25rem;cursor:pointer;color:#6b7db3}
        .topbar__notif-dot{position:absolute;top:-2px;right:-2px;width:6px;height:6px;background:#e94560;border-radius:0}
        /* Pixel avatar — blocky */
        .avatar-px{display:flex;align-items:center;justify-content:center;font-family:'VT323',monospace;color:#1a1a2e;border:2px solid #0f3460}
        .avatar-px--sm{width:32px;height:32px;font-size:1.25rem}
        .avatar-px--md{width:48px;height:48px;font-size:1.75rem}
        .avatar-px--lg{width:64px;height:64px;font-size:2.25rem}
        .avatar-px--cyan{background:#00d2ff}
        .avatar-px--pink{background:#e94560}
        .avatar-px--yellow{background:#ffd700}
        .avatar-px--green{background:#39ff14}
        .avatar-px--purple{background:#b537f2}
        .topbar__username{font-size:0.95rem;font-weight:600;color:#6b7db3}

        /* Content */
        .content{flex:1;padding:2.5rem 2.5rem;max-width:850px}

        .page{display:none}
        .page--active{display:block}

        .content__title{font-family:'VT323',monospace;font-size:2.25rem;color:#00d2ff;margin-bottom:0.25rem;line-height:1.2;letter-spacing:0.02em}
        .content__subtitle{font-size:1rem;color:#6b7db3;margin-bottom:2rem}

        /* Search */
        .search-bar{display:flex;gap:0.75rem;margin-bottom:1.5rem;align-items:center}
        .search-bar label{font-family:'VT323',monospace;font-size:1.4rem;color:#6b7db3;white-space:nowrap}
        .search-bar input{width:100px;padding:0.6rem 0.8rem;background:#16213e;border:2px solid #0f3460;color:#e0e0e0;font-family:'Inter',sans-serif;font-size:1.1rem;font-weight:600;outline:none;transition:border-color 0.15s;text-align:center}
        .search-bar input:focus{border-color:#00d2ff}
        .search-bar button{padding:0.6rem 1.25rem;border:2px solid #e94560;background:transparent;color:#e94560;font-family:'VT323',monospace;font-size:1.3rem;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:0.4rem}
        .search-bar button:hover{background:#e94560;color:#1a1a2e}
        .search-bar button i{font-size:1.1rem}

        .error-msg{background:rgba(233,69,96,0.15);border:2px solid #e94560;color:#e94560;padding:0.8rem 1rem;font-size:0.95rem;font-weight:500;margin-bottom:1.25rem;display:none}

        /* Member card — pixel blocky style */
        .member-card{background:#16213e;border:3px solid #0f3460;padding:1.75rem;margin-bottom:1.25rem;transition:border-color 0.15s}
        .member-card:hover{border-color:#00d2ff}
        .member-card__header{display:flex;align-items:center;gap:1.25rem;margin-bottom:1rem}
        .member-card__info h3{font-family:'VT323',monospace;font-size:2rem;color:#e0e0e0;line-height:1;margin-bottom:0.15rem}
        .member-card__info p{font-size:0.95rem;color:#6b7db3;margin-top:0.25rem}
        .member-card__role{display:inline-block;padding:0.25rem 0.6rem;font-family:'VT323',monospace;font-size:1.15rem;text-transform:uppercase;margin-top:0.6rem;border:2px solid;line-height:1}
        .role--developer{border-color:#00d2ff;color:#00d2ff;background:rgba(0,210,255,0.08)}
        .role--team-lead{border-color:#ffd700;color:#ffd700;background:rgba(255,215,0,0.08)}
        .role--admin{border-color:#e94560;color:#e94560;background:rgba(233,69,96,0.08)}
        .member-card__bio{font-size:0.95rem;color:#8a9bc0;line-height:1.6;margin-bottom:1rem}
        .member-card__meta{display:flex;gap:1.5rem;font-size:0.85rem;color:#6b7db3;padding-top:0.85rem;border-top:2px dashed #0f3460}
        .member-card__meta span{display:flex;align-items:center;gap:0.35rem}

        /* Dummy pages */
        .pixel-card{background:#16213e;border:3px solid #0f3460;padding:1.4rem;margin-bottom:0.85rem}
        .pixel-card__title{font-family:'VT323',monospace;font-size:1.5rem;color:#00d2ff;margin-bottom:0.4rem;line-height:1}
        .pixel-card__text{font-size:0.95rem;color:#8a9bc0;line-height:1.6}

        .pixel-stats{display:flex;gap:1rem;margin-bottom:1.25rem}
        .pixel-stat{background:#16213e;border:3px solid #0f3460;padding:1rem 1.25rem;flex:1;text-align:center}
        .pixel-stat__num{font-family:'VT323',monospace;font-size:2.5rem;color:#e94560;line-height:1}
        .pixel-stat__label{font-size:0.85rem;font-weight:600;color:#6b7db3;margin-top:0.5rem;text-transform:uppercase;letter-spacing:0.05em}

        .prog-bar{height:16px;background:#0f3460;margin-top:0.75rem;position:relative}
        .prog-bar__fill{height:100%;background:#39ff14}
        .prog-bar__text{position:absolute;right:6px;top:0;font-family:'VT323',monospace;font-size:1.1rem;line-height:16px;color:#1a1a2e}

        .page-footer{padding:1.5rem 2.5rem;font-family:'VT323',monospace;font-size:1.15rem;color:#4a5580;border-top:3px solid #0f3460;line-height:1.5}

        @media(max-width:768px){.sidebar{display:none}.main-wrap{margin-left:0}.content{padding:1.5rem 1rem}}
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="sidebar__brand">
            <div class="sidebar__logo">Dev<span>Hub</span></div>
            <div class="sidebar__tagline">Developer Platform</div>
        </div>
        <nav class="sidebar__nav">
            <a class="nav-item" onclick="showPage('dash',this)" href="#">
                <i class='bx bx-grid-alt'></i> Dashboard
            </a>
            <a class="nav-item" onclick="showPage('projects',this)" href="#">
                <i class='bx bx-code-alt'></i> Projects
            </a>
            <a class="nav-item nav-item--active" id="nav-members" onclick="showPage('members',this)" href="#">
                <i class='bx bx-group'></i> Members
            </a>
            <a class="nav-item" onclick="showPage('api',this)" href="#">
                <i class='bx bx-book-open'></i> API Docs
            </a>
            <a class="nav-item" onclick="showPage('settings',this)" href="#">
                <i class='bx bx-cog'></i> Settings
            </a>
        </nav>
        <div class="sidebar__footer">DevHub v1.8.3<br>PLAYER 1 ONLINE</div>
    </aside>

    <div class="main-wrap">
        <header class="topbar">
            <div class="topbar__breadcrumb">PLATFORM \ <strong>MEMBERS</strong></div>
            <div class="topbar__actions">
                <div class="topbar__notif"><i class='bx bx-bell'></i><span class="topbar__notif-dot"></span></div>
                <div style="display:flex;align-items:center;gap:0.6rem">
                    <div class="avatar-px avatar-px--sm avatar-px--cyan">AJ</div>
                    <span class="topbar__username">Alice</span>
                </div>
            </div>
        </header>

        <main class="content">
            <!-- Dashboard page -->
            <div class="page" id="page-dash">
                <h1 class="content__title">DASHBOARD</h1>
                <p class="content__subtitle">Platform overview and user metrics</p>
                <div class="pixel-stats">
                    <div class="pixel-stat"><div class="pixel-stat__num">42</div><div class="pixel-stat__label">Projects</div></div>
                    <div class="pixel-stat"><div class="pixel-stat__num">5</div><div class="pixel-stat__label">Members</div></div>
                    <div class="pixel-stat"><div class="pixel-stat__num">128</div><div class="pixel-stat__label">Commits</div></div>
                </div>
                <div class="pixel-card">
                    <div class="pixel-card__title">ACTIVITY LOG</div>
                    <div class="pixel-card__text">alice pushed 3 commits — 2h ago<br>bob merged PR #47 — 5h ago<br>diana created branch feature/auth — yesterday</div>
                </div>
            </div>

            <!-- Projects page -->
            <div class="page" id="page-projects">
                <h1 class="content__title">PROJECTS</h1>
                <p class="content__subtitle">Active repositories and build status</p>
                <div class="pixel-card">
                    <div class="pixel-card__title">FRONTEND-APP</div>
                    <div class="pixel-card__text">React dashboard · 3 contributors · Updated 2h ago</div>
                    <div class="prog-bar"><div class="prog-bar__fill" style="width:78%"></div><div class="prog-bar__text">78%</div></div>
                </div>
                <div class="pixel-card">
                    <div class="pixel-card__title">API-SERVER</div>
                    <div class="pixel-card__text">Node.js REST API · 2 contributors · Updated 1d ago</div>
                    <div class="prog-bar"><div class="prog-bar__fill" style="width:92%"></div><div class="prog-bar__text">92%</div></div>
                </div>
                <div class="pixel-card">
                    <div class="pixel-card__title">INFRA-CONFIG</div>
                    <div class="pixel-card__text">Terraform configs · 1 contributor · Updated 3d ago</div>
                    <div class="prog-bar"><div class="prog-bar__fill" style="width:45%;background:#ffd700"></div><div class="prog-bar__text">45%</div></div>
                </div>
            </div>

            <!-- Members page (main functional) -->
            <div class="page page--active" id="page-members">
                <h1 class="content__title">MEMBER DIRECTORY</h1>
                <p class="content__subtitle">View team member profiles and access roles</p>

                <div class="search-bar">
                    <label for="uid">MEMBER #</label>
                    <input type="number" id="uid" value="1" min="1">
                    <button onclick="loadUser()"><i class='bx bx-search'></i> FIND</button>
                </div>

                <div class="error-msg" id="error"></div>

                <div class="member-card" id="member-card">
                    <div class="member-card__header">
                        <div class="avatar-px avatar-px--lg avatar-px--cyan" id="p-avatar">...</div>
                        <div class="member-card__info">
                            <h3 id="p-name">LOADING...</h3>
                            <p id="p-email"></p>
                            <span class="member-card__role role--developer" id="p-role"></span>
                        </div>
                    </div>
                    <div class="member-card__bio" id="p-bio"></div>
                    <div class="member-card__meta">
                        <span id="p-joined"><i class='bx bx-calendar'></i> </span>
                        <span id="p-active"><i class='bx bx-radio-circle-marked'></i> </span>
                    </div>
                </div>
            </div>

            <!-- API Docs page -->
            <div class="page" id="page-api">
                <h1 class="content__title">API DOCS</h1>
                <p class="content__subtitle">REST API reference for developers</p>
                <div class="pixel-card">
                    <div class="pixel-card__title">GET /api/users/:id</div>
                    <div class="pixel-card__text">Fetch a user profile by numeric ID.<br>Returns: { user: { id, name, email, role, bio } }</div>
                </div>
                <div class="pixel-card">
                    <div class="pixel-card__title">GET /api/me</div>
                    <div class="pixel-card__text">Returns the currently authenticated user profile.</div>
                </div>
            </div>

            <!-- Settings page -->
            <div class="page" id="page-settings">
                <h1 class="content__title">SETTINGS</h1>
                <p class="content__subtitle">Platform configuration</p>
                <div class="pixel-card">
                    <div class="pixel-card__title">ACCOUNT</div>
                    <div class="pixel-card__text">Username: alice<br>Email: alice@devhub.io<br>Role: Developer</div>
                </div>
                <div class="pixel-card">
                    <div class="pixel-card__title">NOTIFICATIONS</div>
                    <div class="pixel-card__text">Email alerts: ON<br>Push notifications: OFF<br>Weekly digest: ON</div>
                </div>
            </div>
        </main>

        <footer class="page-footer">&copy; 2026 DEVHUB TECHNOLOGIES // v1.8.3</footer>
    </div>

    <script>
        var avatarColors = ['avatar-px--cyan','avatar-px--pink','avatar-px--purple','avatar-px--yellow','avatar-px--green'];

        function getInitials(name) { return name.split(' ').map(function(w){return w[0]}).join('').substring(0,2).toUpperCase(); }
        function getRoleClass(role) { if (role==='admin') return 'role--admin'; if (role==='team-lead') return 'role--team-lead'; return 'role--developer'; }

        function showPage(id, el) {
            document.querySelectorAll('.page').forEach(function(p){p.classList.remove('page--active')});
            document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('nav-item--active')});
            document.getElementById('page-'+id).classList.add('page--active');
            if(el) el.classList.add('nav-item--active');
        }

        async function loadUser() {
            var id = document.getElementById('uid').value;
            var errorEl = document.getElementById('error');
            errorEl.style.display = 'none';
            try {
                var res = await fetch('/api/users/' + id);
                var data = await res.json();
                if (data.error) { errorEl.textContent = data.error; errorEl.style.display = 'block'; return; }
                var u = data.user;
                var initials = getInitials(u.name);
                var colorIdx = (u.id - 1) % avatarColors.length;
                document.getElementById('p-avatar').textContent = initials;
                document.getElementById('p-avatar').className = 'avatar-px avatar-px--lg ' + avatarColors[colorIdx];
                document.getElementById('p-name').textContent = u.name.toUpperCase();
                document.getElementById('p-email').textContent = u.email;
                var roleEl = document.getElementById('p-role');
                roleEl.textContent = u.role.toUpperCase();
                roleEl.className = 'member-card__role ' + getRoleClass(u.role);
                document.getElementById('p-bio').textContent = u.bio;
                document.getElementById('p-joined').innerHTML = '<i class="bx bx-calendar"></i> Joined ' + (u.joined || 'N/A');
                document.getElementById('p-active').innerHTML = '<i class="bx bx-radio-circle-marked"></i> ' + (u.lastActive || 'Unknown');
            } catch (e) { errorEl.textContent = 'Failed to load member profile.'; errorEl.style.display = 'block'; }
        }
        loadUser();
    </script>
</body>
</html>`);
});

app.listen(PORT, '0.0.0.0', () => { console.log('IDOR Lab running on port ' + PORT); });

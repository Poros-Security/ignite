const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;
const FLAG = process.env.FLAG || 'ignite{default_jwt_flag}';
const JWT_SECRET = 'secret';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = {
    'guest': { username: 'guest', password: 'guest123', role: 'user' },
    'user1': { username: 'user1', password: 'password1', role: 'user' },
};

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });
    const user = users[username];
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
    res.json({ message: 'Authentication successful.', token });
});

app.get('/api/admin', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded) return res.status(401).json({ error: 'Invalid token format.' });
        let payload;
        if (decoded.header.alg === 'none' || decoded.header.alg === 'None') { payload = decoded.payload; }
        else { payload = jwt.verify(token, JWT_SECRET); }
        if (payload.role === 'admin') { res.json({ message: 'Access granted.', flag: FLAG, user: payload }); }
        else { res.json({ message: 'Insufficient permissions.', your_role: payload.role, user: payload }); }
    } catch (err) { res.status(401).json({ error: 'Verification failed: ' + err.message }); }
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sentinel — Identity Platform</title>
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@500;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
    <style>
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',sans-serif;min-height:100vh;display:flex;background:#0f0f0f;color:#d4d4d4}

        /* Sidebar — brutalist dark */
        .sidebar{width:260px;background:#0f0f0f;border-right:1px solid #222;position:fixed;top:0;left:0;bottom:0;display:flex;flex-direction:column;z-index:20}
        .sidebar__brand{padding:2rem 1.6rem 1.6rem;border-bottom:1px solid #222}
        .sidebar__logo{font-family:'Urbanist',sans-serif;font-size:1.6rem;font-weight:900;color:#fff;letter-spacing:-0.02em}
        .sidebar__logo span{color:#a855f7}
        .sidebar__tagline{font-size:0.75rem;color:#525252;margin-top:0.3rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:600}

        .sidebar__section{padding:1.25rem 1.6rem 0.6rem;font-size:0.75rem;color:#404040;text-transform:uppercase;letter-spacing:0.1em;font-weight:700}

        .sidebar__nav{flex:1;padding:0.5rem 0;overflow-y:auto}
        .s-nav{display:flex;align-items:center;gap:0.75rem;padding:0.8rem 1.6rem;font-size:0.95rem;color:#737373;text-decoration:none;cursor:pointer;transition:all 0.12s}
        .s-nav:hover{color:#d4d4d4;background:#171717}
        .s-nav--active{color:#a855f7;background:#1a1225}
        .s-nav i{font-size:1.2rem;width:24px;text-align:center}

        .sidebar__footer{padding:1.25rem 1.6rem;border-top:1px solid #222;font-size:0.75rem;color:#404040}

        .main-wrap{margin-left:260px;flex:1;display:flex;flex-direction:column;min-height:100vh}

        /* Topbar */
        .topbar{display:flex;align-items:center;justify-content:space-between;padding:0 2.5rem;height:64px;background:#0f0f0f;border-bottom:1px solid #222;position:sticky;top:0;z-index:10}
        .topbar__breadcrumb{font-size:0.95rem;color:#525252}
        .topbar__breadcrumb strong{color:#a855f7;font-weight:600}
        .topbar__actions{display:flex;align-items:center;gap:1.25rem}
        .topbar__status{display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:#737373;font-weight:500}
        .topbar__dot{width:8px;height:8px;background:#22c55e;border-radius:50%;animation:pulse 2.5s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        .topbar__ver{font-size:0.75rem;color:#525252;background:#1a1a1a;padding:0.25rem 0.6rem;border:1px solid #222;font-weight:600}

        /* Content */
        .content{flex:1;padding:2.5rem 2.75rem}
        .page{display:none}
        .page--active{display:block}

        .content__title{font-family:'Urbanist',sans-serif;font-size:2rem;font-weight:900;color:#fff;margin-bottom:0.25rem;letter-spacing:-0.02em}
        .content__subtitle{font-size:1.05rem;color:#737373;margin-bottom:2rem}

        /* Panel grid */
        .panels{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;max-width:1000px}

        /* Panel 1 — clean bordered */
        .panel-auth{background:#141414;border:1px solid #262626;padding:2.25rem}
        .panel-auth h2{font-family:'Urbanist',sans-serif;font-size:1.2rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem}
        .panel-auth .panel__sub{color:#737373;font-size:0.95rem;margin-bottom:1.5rem}

        /* Panel 2 — accent border */
        .panel-mgmt{background:#141414;border:1px solid #262626;border-left:4px solid #a855f7;padding:2.25rem}
        .panel-mgmt h2{font-family:'Urbanist',sans-serif;font-size:1.2rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem}
        .panel-mgmt .panel__sub{color:#737373;font-size:0.95rem;margin-bottom:1.5rem}

        /* Form */
        .form-group{margin-bottom:1.25rem}
        .form-group label{display:block;font-size:0.85rem;font-weight:700;color:#8b8b8b;margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.05em}
        .form-group input{width:100%;padding:0.75rem 1rem;background:#0f0f0f;border:1px solid #333;color:#d4d4d4;font-family:'Inter',sans-serif;font-size:1rem;outline:none;transition:border-color 0.15s}
        .form-group input:focus{border-color:#a855f7}
        .form-group input::placeholder{color:#404040}

        /* Buttons — brutalist */
        .btn-auth{width:100%;padding:0.85rem;border:none;background:#a855f7;color:#fff;font-family:'Urbanist',sans-serif;font-weight:800;font-size:1rem;cursor:pointer;transition:background 0.15s;display:flex;align-items:center;justify-content:center;gap:0.4rem;text-transform:uppercase;letter-spacing:0.05em}
        .btn-auth:hover{background:#9333ea}

        .btn-mgmt{width:100%;padding:0.85rem;border:1px solid #737373;background:transparent;color:#e5e5e5;font-family:'Urbanist',sans-serif;font-weight:800;font-size:1rem;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:0.4rem;text-transform:uppercase;letter-spacing:0.05em}
        .btn-mgmt:hover{border-color:#a855f7;color:#a855f7}

        /* Alerts */
        .alert{padding:0.85rem 1rem;font-size:0.95rem;margin-top:1rem;display:none;word-break:break-all;line-height:1.6}
        .alert--error{background:#1c0f0f;border:1px solid #7f1d1d;color:#fca5a5}
        .alert--success{background:#0f1c0f;border:1px solid #166534;color:#86efac}
        .alert--info{background:#170f1c;border:1px solid #581c87;color:#d8b4fe}

        .session-box{background:#1a1a1a;border:1px solid #262626;padding:1rem;font-size:0.85rem;word-break:break-all;margin-top:1rem;font-family:monospace;line-height:1.6;display:none;color:#a855f7}
        .session-box__label{font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:700;color:#8b8b8b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;display:block}

        .flag-box{background:#1a1225;border:2px solid #a855f7;padding:1.5rem;text-align:center;margin-top:1rem;display:none}
        .flag-box__label{font-family:'Urbanist',sans-serif;font-size:0.85rem;font-weight:800;color:#a855f7;text-transform:uppercase;letter-spacing:0.08em}
        .flag-box__flag{font-family:'Urbanist',sans-serif;font-size:1.25rem;font-weight:900;color:#fff;margin-top:0.4rem;word-break:break-all}

        .demo-hint{font-size:0.85rem;color:#525252;margin-top:1rem;text-align:center}

        /* Dummy pages */
        .brut-card{background:#141414;border:1px solid #262626;padding:1.5rem;margin-bottom:1rem}
        .brut-card--accent{border-left:4px solid #a855f7}
        .brut-card__title{font-family:'Urbanist',sans-serif;font-size:1.1rem;font-weight:800;color:#fff;margin-bottom:0.5rem}
        .brut-card__text{font-size:0.95rem;color:#737373;line-height:1.6}

        .brut-stats{display:flex;gap:1rem;margin-bottom:1.25rem}
        .brut-stat{background:#141414;border:1px solid #262626;padding:1.25rem 1.5rem;flex:1}
        .brut-stat__num{font-family:'Urbanist',sans-serif;font-size:2rem;font-weight:900;color:#a855f7;line-height:1}
        .brut-stat__label{font-size:0.8rem;color:#737373;margin-top:0.4rem;text-transform:uppercase;letter-spacing:0.06em;font-weight:600}

        .brut-table{width:100%;border-collapse:collapse;font-size:0.95rem}
        .brut-table th{text-align:left;padding:0.75rem 1rem;color:#8b8b8b;border-bottom:1px solid #262626;font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em}
        .brut-table td{padding:0.85rem 1rem;color:#737373;border-bottom:1px solid #1a1a1a}
        .brut-table .status-ok{color:#22c55e;font-weight:500;}
        .brut-table .status-warn{color:#eab308;font-weight:500;}

        .page-footer{padding:1.5rem 2.5rem;font-size:0.85rem;color:#404040;border-top:1px solid #1a1a1a;text-align:center}

        @media(max-width:768px){.sidebar{display:none}.main-wrap{margin-left:0}.content{padding:1.5rem 1.25rem}.panels{grid-template-columns:1fr}}
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="sidebar__brand">
            <div class="sidebar__logo">SENT<span>INEL</span></div>
            <div class="sidebar__tagline">ArcSys Identity Platform</div>
        </div>
        <nav class="sidebar__nav">
            <div class="sidebar__section">Main Console</div>
            <a class="s-nav" onclick="showPage('overview',this)" href="#"><i class='bx bx-grid-alt'></i> Overview</a>
            <a class="s-nav s-nav--active" id="nav-auth" onclick="showPage('auth',this)" href="#"><i class='bx bx-lock-alt'></i> Authentication</a>
            <a class="s-nav" onclick="showPage('users',this)" href="#"><i class='bx bx-group'></i> User Directory</a>
            <div class="sidebar__section">System Settings</div>
            <a class="s-nav" onclick="showPage('policies',this)" href="#"><i class='bx bx-shield-quarter'></i> Security Policies</a>
            <a class="s-nav" onclick="showPage('audit',this)" href="#"><i class='bx bx-list-ul'></i> Audit Log</a>
            <a class="s-nav" onclick="showPage('settings',this)" href="#"><i class='bx bx-cog'></i> Configuration</a>
        </nav>
        <div class="sidebar__footer">Sentinel v4.2.0-stable</div>
    </aside>

    <div class="main-wrap">
        <header class="topbar">
            <div class="topbar__breadcrumb">IDENTITY DASHBOARD / <strong>AUTHENTICATION</strong></div>
            <div class="topbar__actions">
                <span class="topbar__ver">v4.2.0</span>
                <div class="topbar__status"><span class="topbar__dot"></span> Healthy</div>
            </div>
        </header>

        <main class="content">
            <!-- Overview -->
            <div class="page" id="page-overview">
                <h1 class="content__title">Platform Overview</h1>
                <p class="content__subtitle">Identity management infrastructure status and metrics</p>
                <div class="brut-stats">
                    <div class="brut-stat"><div class="brut-stat__num">1,247</div><div class="brut-stat__label">Total Users</div></div>
                    <div class="brut-stat"><div class="brut-stat__num">89</div><div class="brut-stat__label">Active Sessions</div></div>
                    <div class="brut-stat"><div class="brut-stat__num">99.8%</div><div class="brut-stat__label">Monthly Uptime</div></div>
                </div>
                <div class="brut-card brut-card--accent">
                    <div class="brut-card__title">System Health Check</div>
                    <div class="brut-card__text">Authentication service: Operational<br>Token issuing service: Operational<br>Audit tracking service: Degraded (experiencing high latency)</div>
                </div>
            </div>

            <!-- Authentication (main functional) -->
            <div class="page page--active" id="page-auth">
                <h1 class="content__title">Authentication Service</h1>
                <p class="content__subtitle">Perform token generation and verify access privileges securely.</p>
                <div class="panels">
                    <div class="panel-auth">
                        <h2><i class='bx bx-log-in'></i> Authenticate Session</h2>
                        <p class="panel__sub">Provide valid credentials to receive an access token.</p>
                        <div class="form-group"><label>Username / ID</label><input type="text" id="username" placeholder="Enter service ID" value="guest"></div>
                        <div class="form-group"><label>Password</label><input type="password" id="password" placeholder="Enter passphrase" value="guest123"></div>
                        <button class="btn-auth" onclick="login()" id="login-btn"><i class='bx bx-lock-open'></i> Request Token</button>
                        <div class="alert alert--error" id="login-error"></div>
                        <div class="alert alert--success" id="login-success"></div>
                        <div class="session-box" id="token-box"><span class="session-box__label">Signed JWT (Access Token)</span><span id="token-text"></span></div>
                        <div class="demo-hint">Demo Access: guest / guest123</div>
                    </div>
                    <div class="panel-mgmt">
                        <h2><i class='bx bx-shield-quarter'></i> Management Verification</h2>
                        <p class="panel__sub">Verify token signature to enter restricted management zones.</p>
                        <div class="form-group"><label>Bearer Token</label><input type="text" id="token-input" placeholder="Paste the generated token here"></div>
                        <button class="btn-mgmt" onclick="checkAdmin()" id="admin-btn"><i class='bx bx-check-shield'></i> Authorize Access</button>
                        <div class="alert alert--error" id="admin-error"></div>
                        <div class="alert alert--info" id="admin-info"></div>
                        <div class="flag-box" id="flag-box"><div class="flag-box__label">Restricted Authorization Area</div><div class="flag-box__flag" id="flag-value"></div></div>
                    </div>
                </div>
            </div>

            <!-- Users -->
            <div class="page" id="page-users">
                <h1 class="content__title">User Directory</h1>
                <p class="content__subtitle">Accounts registered in the identity provider</p>
                <table class="brut-table">
                    <thead><tr><th>Identifier</th><th>Role Level</th><th>Status</th><th>Last Activity</th></tr></thead>
                    <tbody>
                        <tr><td>guest</td><td>user</td><td class="status-ok">Active</td><td>Just now</td></tr>
                        <tr><td>user1</td><td>user</td><td class="status-ok">Active</td><td>3 hours ago</td></tr>
                        <tr><td>admin</td><td>admin</td><td class="status-ok">Active</td><td>1 hour ago</td></tr>
                        <tr><td>service-bot</td><td>service</td><td class="status-warn">Idle</td><td>2 days ago</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Policies -->
            <div class="page" id="page-policies">
                <h1 class="content__title">Security Policies</h1>
                <p class="content__subtitle">Rules governing access and token issuance</p>
                <div class="brut-card"><div class="brut-card__title">Authentication Policy</div><div class="brut-card__text">Minimum entropy: 8 characters<br>Require uppercase: Yes<br>Require special characters: No<br>Credential rotation: 90 days</div></div>
                <div class="brut-card brut-card--accent"><div class="brut-card__title">Token / Session Policy</div><div class="brut-card__text">Max concurrent sessions: 3<br>Default TTL: 60 minutes<br>Refresh: Enabled<br>Signing Algorithm: HS256</div></div>
            </div>

            <!-- Audit Log -->
            <div class="page" id="page-audit">
                <h1 class="content__title">System Audit Log</h1>
                <p class="content__subtitle">Recent access and verification events</p>
                <table class="brut-table">
                    <thead><tr><th>Timestamp</th><th>Identity</th><th>Event Target</th><th>Status Code</th></tr></thead>
                    <tbody>
                        <tr><td>00:05:12</td><td>guest</td><td>LOGIN</td><td class="status-ok">SUCCESS</td></tr>
                        <tr><td>23:48:01</td><td>unknown</td><td>LOGIN</td><td style="color:#ef4444;font-weight:600">FAILED</td></tr>
                        <tr><td>23:30:55</td><td>user1</td><td>TOKEN_VERIFY</td><td class="status-ok">SUCCESS</td></tr>
                        <tr><td>22:15:40</td><td>admin</td><td>ADMIN_ACCESS</td><td class="status-ok">SUCCESS</td></tr>
                        <tr><td>21:55:23</td><td>guest</td><td>TOKEN_VERIFY</td><td class="status-warn">DENIED</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Settings -->
            <div class="page" id="page-settings">
                <h1 class="content__title">Configuration</h1>
                <p class="content__subtitle">Platform node settings</p>
                <div class="brut-card"><div class="brut-card__title">Node Information</div><div class="brut-card__text">Instance Type: sentinel-prod-01<br>Deployment Region: ap-southeast-1<br>Software Build: 4.2.0-stable</div></div>
                <div class="brut-card"><div class="brut-card__title">External Integrations</div><div class="brut-card__text">LDAP Sync: Connected<br>SAML SSO: Disabled<br>Event Webhook: https://hooks.arcsys.io/auth</div></div>
            </div>
        </main>

        <footer class="page-footer">&copy; 2026 ArcSys Inc. &mdash; Enterprise Identity Platform Management</footer>
    </div>

    <script>
        function showPage(id,el){
            document.querySelectorAll('.page').forEach(function(p){p.classList.remove('page--active')});
            document.querySelectorAll('.s-nav').forEach(function(n){n.classList.remove('s-nav--active')});
            document.getElementById('page-'+id).classList.add('page--active');
            if(el)el.classList.add('s-nav--active');
        }
        function showAlert(id,text){var el=document.getElementById(id);el.textContent=text;el.style.display='block'}
        function hideAll(){var ids=Array.prototype.slice.call(arguments);ids.forEach(function(id){document.getElementById(id).style.display='none'})}

        async function login(){
            hideAll('login-error','login-success','token-box');
            var btn=document.getElementById('login-btn');btn.innerHTML='<i class="bx bx-loader-alt bx-spin"></i> AUTHENTICATING...';btn.disabled=true;
            try{
                var res=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:document.getElementById('username').value,password:document.getElementById('password').value})});
                var data=await res.json();
                if(data.error){showAlert('login-error',data.error)}
                else{showAlert('login-success',data.message);document.getElementById('token-text').textContent=data.token;document.getElementById('token-box').style.display='block';document.getElementById('token-input').value=data.token}
            }catch(e){showAlert('login-error','Connection failed.')}
            btn.innerHTML='<i class="bx bx-lock-open"></i> REQUEST TOKEN';btn.disabled=false;
        }

        async function checkAdmin(){
            hideAll('admin-error','admin-info','flag-box');
            var btn=document.getElementById('admin-btn');btn.innerHTML='<i class="bx bx-loader-alt bx-spin"></i> VERIFYING...';btn.disabled=true;
            var token=document.getElementById('token-input').value;
            if(!token){showAlert('admin-error','Provide a session token.');btn.innerHTML='<i class="bx bx-check-shield"></i> AUTHORIZE ACCESS';btn.disabled=false;return}
            try{
                var res=await fetch('/api/admin',{headers:{'Authorization':'Bearer '+token}});
                var data=await res.json();
                if(data.error){showAlert('admin-error',data.error)}
                else if(data.flag){document.getElementById('flag-value').textContent=data.flag;document.getElementById('flag-box').style.display='block'}
                else{showAlert('admin-info',data.message+' (Role: '+data.your_role+')')}
            }catch(e){showAlert('admin-error','Connection failed.')}
            btn.innerHTML='<i class="bx bx-check-shield"></i> AUTHORIZE ACCESS';btn.disabled=false;
        }
    </script>
</body>
</html>`);
});

app.listen(PORT, '0.0.0.0', () => { console.log('JWT Lab running on port ' + PORT); });

<?php
session_start();
$flag = getenv('FLAG') ?: 'ignite{default_sqli_flag}';
$db_path = '/var/www/data/users.db';
$error = '';
$logged_in = false;

if (isset($_GET['logout'])) { session_destroy(); header('Location: /'); exit; }
if (isset($_SESSION['user'])) { $logged_in = true; }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $blocked_patterns = ['--', '#', '/*', '*/', 'OR 1=1', 'or 1=1', 'DROP', 'drop', 'DELETE', 'delete'];
    $is_blocked = false;
    foreach ($blocked_patterns as $pattern) {
        if (strpos($username, $pattern) !== false || strpos($password, $pattern) !== false) { $is_blocked = true; break; }
    }
    if ($is_blocked) {
        $error = 'Input contains restricted characters.';
    } elseif (empty($username) || empty($password)) {
        $error = 'Please fill in both fields.';
    } else {
        $db = new SQLite3($db_path);
        $query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
        $result = $db->querySingle($query, true);
        if ($result) { $_SESSION['user'] = $result['username']; $_SESSION['role'] = $result['role']; $logged_in = true; }
        else { $error = 'Invalid credentials. Please try again.'; }
        $db->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CloudStack — Sign In</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',sans-serif;min-height:100vh;display:flex;background:#f5f7fa;color:#1e293b}

        /* Brand Panel */
        .brand-panel{width:400px;background:linear-gradient(155deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%);display:flex;flex-direction:column;justify-content:center;padding:2.75rem;color:white;position:relative;overflow:hidden}
        .brand-panel::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;background:rgba(255,255,255,0.05);border-radius:50%}
        .brand-panel::after{content:'';position:absolute;bottom:-40px;left:-30px;width:150px;height:150px;background:rgba(255,255,255,0.03);border-radius:50%}

        .brand-panel__logo{font-family:'Outfit',sans-serif;font-size:1.4rem;font-weight:800;margin-bottom:0.2rem}
        .brand-panel__tagline{font-size:0.78rem;opacity:0.7;margin-bottom:2.25rem;letter-spacing:0.01em}
        .brand-panel__heading{font-family:'Outfit',sans-serif;font-size:1.65rem;font-weight:700;line-height:1.25;margin-bottom:0.75rem}
        .brand-panel__desc{font-size:0.85rem;opacity:0.8;line-height:1.6;max-width:300px}
        .brand-panel__stats{margin-top:2.25rem;display:flex;gap:1.75rem}
        .stat__number{font-family:'Outfit',sans-serif;font-size:1.3rem;font-weight:700}
        .stat__label{font-size:0.68rem;opacity:0.6;text-transform:uppercase;letter-spacing:0.04em;margin-top:0.1rem}

        /* Right area */
        .main-panel{flex:1;display:flex;flex-direction:column}
        .topbar{display:flex;align-items:center;justify-content:flex-end;padding:0 1.75rem;height:50px;gap:0.9rem}
        .topbar__status{display:flex;align-items:center;gap:0.35rem;font-size:0.72rem;color:#6b7280}
        .topbar__dot{width:6px;height:6px;background:#22c55e;border-radius:50%}
        .topbar__ver{font-size:0.65rem;color:#9ca3af;background:#f3f4f6;padding:0.15rem 0.45rem;border-radius:3px}

        /* Login form */
        .form-area{flex:1;display:flex;align-items:center;justify-content:center;padding:2rem}
        .card{background:#fff;border:1px solid #eaecf0;border-radius:12px;padding:2.25rem;max-width:380px;width:100%;box-shadow:0 2px 12px rgba(0,0,0,0.03)}
        .card h1{font-family:'Outfit',sans-serif;font-size:1.25rem;font-weight:700;margin-bottom:0.15rem;color:#111827}
        .card .subtitle{color:#6b7280;font-size:0.83rem;margin-bottom:1.4rem;line-height:1.45}

        .form-group{margin-bottom:0.95rem}
        .form-group label{display:block;font-size:0.75rem;font-weight:600;color:#4b5563;margin-bottom:0.25rem}
        .form-group input{width:100%;padding:0.62rem 0.85rem;border:1.5px solid #e5e7eb;border-radius:7px;font-family:'Inter',sans-serif;font-size:0.86rem;outline:none;transition:border-color 0.2s,box-shadow 0.2s}
        .form-group input:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.08)}

        .btn-submit{width:100%;padding:0.68rem;border:none;border-radius:8px;background:#2563eb;color:white;font-family:'Inter',sans-serif;font-weight:600;font-size:0.86rem;cursor:pointer;transition:background 0.2s;margin-top:0.35rem}
        .btn-submit:hover{background:#1d4ed8}

        .form-links{margin-top:1rem;text-align:center;font-size:0.75rem;color:#9ca3af}
        .form-links a{color:#3b82f6;text-decoration:none;font-weight:500}
        .form-links a:hover{text-decoration:underline}

        .alert{padding:0.65rem 0.85rem;border-radius:6px;font-size:0.8rem;margin-bottom:0.9rem}
        .alert--error{background:#fef2f2;border:1px solid #fecaca;color:#dc2626}

        /* ========== Dashboard (logged in) ========== */
        .dashboard{flex:1;display:flex}
        .dash-sidebar{width:190px;background:#fff;border-right:1px solid #eaecf0;padding:1.25rem 0}
        .dash-nav{display:flex;align-items:center;gap:0.5rem;padding:0.5rem 1.15rem;font-size:0.78rem;color:#6b7280;text-decoration:none;cursor:pointer;transition:background 0.12s}
        .dash-nav:hover{background:#f9fafb}
        .dash-nav--active{background:#eff6ff;color:#2563eb;font-weight:600}

        .dash-content{flex:1;padding:1.75rem 2.25rem}
        .welcome-card{background:#fff;border:1px solid #eaecf0;border-radius:10px;padding:1.75rem;max-width:460px}
        .welcome-card__header{display:flex;align-items:center;gap:0.7rem;margin-bottom:0.85rem}
        .avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:white}
        .avatar--md{width:38px;height:38px;font-size:0.8rem}
        .avatar--blue{background:linear-gradient(140deg,#2563eb,#60a5fa)}
        .welcome-card h2{font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:700}
        .welcome-card__role{display:inline-block;padding:0.12rem 0.55rem;border-radius:4px;font-size:0.65rem;font-weight:600;text-transform:uppercase;background:#eff6ff;color:#2563eb;margin-top:0.2rem}
        .welcome-card__info{font-size:0.8rem;color:#6b7280;line-height:1.5;margin:0.75rem 0}

        .flag-box{background:linear-gradient(145deg,#eff6ff,#dbeafe);border:1.5px solid #93c5fd;border-radius:8px;padding:1.15rem;text-align:center}
        .flag-box__label{font-size:0.68rem;font-weight:600;color:#2563eb;text-transform:uppercase;letter-spacing:0.04em}
        .flag-box__flag{font-family:'Outfit',sans-serif;font-size:0.92rem;font-weight:700;color:#1e3a8a;margin-top:0.25rem;word-break:break-all}

        .notice-box{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:0.7rem 0.9rem;font-size:0.8rem;color:#92400e}
        .logout-link{display:inline-block;margin-top:0.9rem;font-size:0.78rem;color:#9ca3af;text-decoration:none}
        .logout-link:hover{color:#6b7280}

        .page-footer{padding:0.9rem 1.75rem;font-size:0.65rem;color:#d1d5db;text-align:center;border-top:1px solid #f3f4f6}

        @media(max-width:768px){
            .brand-panel{display:none}
            .dash-sidebar{display:none}
        }
    </style>
</head>
<body>
<?php if ($logged_in): ?>
    <div class="main-panel" style="width:100%">
        <div class="topbar" style="border-bottom:1px solid #eaecf0;background:#fff">
            <div style="margin-right:auto;display:flex;align-items:center;gap:0.5rem">
                <span style="font-family:'Outfit',sans-serif;font-weight:800;color:#2563eb;font-size:0.95rem">☁️ CloudStack</span>
                <span class="topbar__ver">v3.1.0</span>
            </div>
            <div class="topbar__status"><span class="topbar__dot"></span>System online</div>
            <div style="display:flex;align-items:center;gap:0.45rem">
                <div class="avatar avatar--md avatar--blue"><?php echo strtoupper(substr($_SESSION['user'], 0, 2)); ?></div>
                <span style="font-size:0.78rem;font-weight:600;color:#374151"><?php echo htmlspecialchars($_SESSION['user']); ?></span>
            </div>
        </div>
        <div class="dashboard">
            <div class="dash-sidebar">
                <a class="dash-nav dash-nav--active">📊 Overview</a>
                <a class="dash-nav">📈 Analytics</a>
                <a class="dash-nav">📋 Reports</a>
                <a class="dash-nav">👥 Team</a>
                <a class="dash-nav">⚙️ Settings</a>
            </div>
            <div class="dash-content">
                <div class="welcome-card">
                    <div class="welcome-card__header">
                        <div class="avatar avatar--md avatar--blue"><?php echo strtoupper(substr($_SESSION['user'], 0, 2)); ?></div>
                        <div>
                            <h2>Welcome, <?php echo htmlspecialchars($_SESSION['user']); ?> 👋</h2>
                            <span class="welcome-card__role"><?php echo htmlspecialchars($_SESSION['role']); ?></span>
                        </div>
                    </div>
                    <?php if ($_SESSION['role'] === 'admin'): ?>
                        <div class="welcome-card__info">You have full administrative access to this workspace.</div>
                        <div class="flag-box">
                            <div class="flag-box__label">🔐 System Notice</div>
                            <div class="flag-box__flag"><?php echo htmlspecialchars($flag); ?></div>
                        </div>
                    <?php else: ?>
                        <div class="notice-box">⚠️ Limited access. Contact your organization admin for elevated permissions.</div>
                    <?php endif; ?>
                    <a href="?logout=1" class="logout-link">← Sign out</a>
                </div>
            </div>
        </div>
        <footer class="page-footer">&copy; 2026 CloudStack Inc. All rights reserved. &middot; v3.1.0</footer>
    </div>
<?php else: ?>
    <div class="brand-panel">
        <div class="brand-panel__logo">☁️ CloudStack</div>
        <div class="brand-panel__tagline">Enterprise Workspace Platform</div>
        <h2 class="brand-panel__heading">Manage your<br>workspace with<br>confidence.</h2>
        <p class="brand-panel__desc">CloudStack brings your team together with powerful collaboration tools, analytics, and enterprise-grade security.</p>
        <div class="brand-panel__stats">
            <div><div class="stat__number">12K+</div><div class="stat__label">Active Teams</div></div>
            <div><div class="stat__number">99.9%</div><div class="stat__label">Uptime</div></div>
            <div><div class="stat__number">50+</div><div class="stat__label">Countries</div></div>
        </div>
    </div>
    <div class="main-panel">
        <div class="topbar">
            <div class="topbar__status"><span class="topbar__dot"></span>All systems operational</div>
            <span class="topbar__ver">v3.1.0</span>
        </div>
        <div class="form-area">
            <div class="card">
                <h1>Welcome back</h1>
                <p class="subtitle">Sign in to access your CloudStack workspace.</p>
                <?php if ($error): ?><div class="alert alert--error"><?php echo htmlspecialchars($error); ?></div><?php endif; ?>
                <form method="POST" action="">
                    <div class="form-group">
                        <label for="username">Work Email</label>
                        <input type="text" name="username" id="username" placeholder="Enter your work email" autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" name="password" id="password" placeholder="Enter your password">
                    </div>
                    <button type="submit" class="btn-submit">Sign In</button>
                </form>
                <div class="form-links"><a href="#">Forgot password?</a> &middot; <a href="#">Create account</a></div>
            </div>
        </div>
        <footer class="page-footer">&copy; 2026 CloudStack Inc. All rights reserved. &middot; v3.1.0</footer>
    </div>
<?php endif; ?>
</body>
</html>

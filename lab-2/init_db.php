<?php
$db_path = '/var/www/data/users.db';

if (!is_dir(dirname($db_path))) {
    mkdir(dirname($db_path), 0755, true);
}

$db = new SQLite3($db_path);

$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
)");

$admin_pass = password_hash('sup3r_s3cur3_p4ss!', PASSWORD_DEFAULT);
$user_pass  = password_hash('userpass123', PASSWORD_DEFAULT);
$guest_pass = password_hash('guestguest', PASSWORD_DEFAULT);

$count = $db->querySingle("SELECT COUNT(*) FROM users");
if ($count == 0) {
    $db->exec("INSERT INTO users (username, password, role) VALUES ('admin', '$admin_pass', 'admin')");
    $db->exec("INSERT INTO users (username, password, role) VALUES ('user1', '$user_pass', 'user')");
    $db->exec("INSERT INTO users (username, password, role) VALUES ('guest', '$guest_pass', 'guest')");
}

$db->close();
echo "Database initialized.\n";

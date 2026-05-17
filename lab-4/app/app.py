import os
import sqlite3
from datetime import datetime, timezone

from flask import Flask, jsonify, redirect, render_template, request, url_for
import subprocess

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "netops_history.db")

TOOLS = {
    "ping": {
        "title": "Ping Utility",
        "description": "Run ICMP checks against hostnames and network devices.",
        "command_builder": lambda target: f"ping -c 4 {target}",
        "placeholder": "e.g. 10.10.20.5 or google.com",
    },
    "nslookup": {
        "title": "DNS Lookup",
        "description": "Resolve DNS records for service endpoints and public hosts.",
        "command_builder": lambda target: f"nslookup {target}",
        "placeholder": "e.g. payments.internal.local",
    },
    "traceroute": {
        "title": "Traceroute",
        "description": "Trace packet path to identify latency spikes between hops.",
        "command_builder": lambda target: f"traceroute {target}",
        "placeholder": "e.g. api.vendor.net",
    },
}


def db_connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = db_connect()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS command_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool TEXT NOT NULL,
            target TEXT NOT NULL,
            command_text TEXT NOT NULL,
            output_text TEXT NOT NULL,
            run_status TEXT NOT NULL,
            user_agent TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def log_history(tool, target, command_text, output_text, run_status, user_agent):
    conn = db_connect()
    created_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    query = (
        "INSERT INTO command_history (tool, target, command_text, output_text, run_status, user_agent, created_at) "
        f"VALUES ('{tool}', '{target}', '{command_text}', '{output_text}', '{run_status}', '{user_agent}', '{created_at}')"
    )
    conn.execute(query)
    conn.commit()
    conn.close()


def fetch_recent_history(limit=10):
    conn = db_connect()
    rows = conn.execute(
        "SELECT id, tool, target, command_text, run_status, user_agent, created_at "
        "FROM command_history ORDER BY id DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()
    return rows


def execute_tool(tool_key, target):
    command_text = TOOLS[tool_key]["command_builder"](target)

    try:
        result = subprocess.run(
            command_text,
            shell=True,
            capture_output=True,
            text=True,
            timeout=12,
        )
        output_text = (result.stdout or "") + (result.stderr or "")
        run_status = "success" if result.returncode == 0 else "error"
    except Exception as exc:
        output_text = str(exc)
        run_status = "error"

    user_agent = request.headers.get("User-Agent", "unknown-client")
    output_for_log = output_text.replace("'", "''")
    ua_for_log = user_agent.replace("'", "''")
    target_for_log = target.replace("'", "''")
    cmd_for_log = command_text.replace("'", "''")

    log_history(tool_key, target_for_log, cmd_for_log, output_for_log, run_status, ua_for_log)

    return {
        "command_text": command_text,
        "output_text": output_text.strip() or "(no output)",
        "run_status": run_status,
        "last_run_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
    }


def render_tool_page(tool_key):
    tool = TOOLS[tool_key]
    run_data = {
        "command_text": "",
        "output_text": "",
        "run_status": "",
        "last_run_at": "No execution yet",
    }
    target = ""

    if request.method == "POST":
        target = request.form.get("target", "")
        run_data = execute_tool(tool_key, target)

    return render_template(
        "tool.html",
        active_page=tool_key,
        tool_key=tool_key,
        tool=tool,
        target=target,
        run_data=run_data,
    )


@app.get("/")
def root():
    return redirect(url_for("ping_tool"))


@app.route("/ping", methods=["GET", "POST"])
def ping_tool():
    return render_tool_page("ping")


@app.route("/nslookup", methods=["GET", "POST"])
def nslookup_tool():
    return render_tool_page("nslookup")


@app.route("/traceroute", methods=["GET", "POST"])
def traceroute_tool():
    return render_tool_page("traceroute")


@app.get("/history")
def history_page():
    rows = fetch_recent_history(10)
    return render_template("history.html", active_page="history", rows=rows)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "lab": "command-injection"})


if __name__ == "__main__":
    init_db()
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)

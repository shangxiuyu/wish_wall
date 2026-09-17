#!/usr/bin/env python3
"""Backend server for the "许愿墙 (Wish Wall)" mini-program in Eden-AI / AHub.

Standard library only, zero external dependencies.
Listens on $PORT (injected by AHub runtime, defaults to 8769).
Binds to 127.0.0.1 and reached via reverse proxy /mp-api/wish-wall/* or direct access.
Persists wishes into data/wishes.json.
"""

import os
import sys
import json
import mimetypes
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

APP_ID = os.environ.get("MP_APP_ID", "wish-wall")
PORT = int(os.environ.get("PORT", "8769"))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
WISHES_FILE = os.path.join(DATA_DIR, "wishes.json")

VALID_SKINS = {
    "ash", "indigo", "matcha", "vermilion",
    "bamboo", "goldpaper", "ribbon", "ema", "ticket",
    "ingot", "peace"
}

DEFAULT_SEED_WISHES = [
    { "id": "wish-1", "author": "探索者", "skin": "ema", "message": "保佑新的一年顺遂无忧，万事胜意！⛩️", "time": "2024/12/12\n12:00", "badge": "★ 早期破译者" },
    { "id": "wish-2", "author": "Lin", "skin": "ribbon", "message": "祝愿考研顺利，成功上岸梦校！🎗️", "time": "2024/12/12\n14:30", "badge": "★ 早期破译者" },
    { "id": "wish-3", "author": "研墨人", "skin": "bamboo", "message": "学而不思则罔，思而不学则殆", "time": "2025/01/12\n02:30", "badge": "★ 早期破译者" },
    { "id": "wish-4", "author": "考神附体", "skin": "vermilion", "message": "逢考必过，面试通关，一举夺魁！🏮", "time": "2025/03/18\n18:00", "badge": "★ 机要员专属" },
    { "id": "wish-5", "author": "墨客", "skin": "goldpaper", "message": "愿所有坚持与热爱，都能在时光里开出花来✨", "time": "2025/05/20\n09:15", "badge": "★ 同频漫游者" },
    { "id": "wish-6", "author": "旅人", "skin": "ticket", "message": "搭上通往未来的时光列车，保持好奇与赤诚🎟️", "time": "2025/07/07\n23:40", "badge": "★ 极客先锋" },
    { "id": "wish-7", "author": "夜行客", "skin": "indigo", "message": "深蓝静夜，专注内心的平静与力量", "time": "2025/09/01\n08:00", "badge": "★ 岁月静好" },
    { "id": "wish-8", "author": "松风", "skin": "matcha", "message": "林深见鹿，山重水复，日日是好日", "time": "2025/11/11\n16:20", "badge": "★ 卓越创造者" },
    { "id": "wish-9", "author": "雨林", "skin": "peace", "message": "希望家人身体健康，平安喜乐，岁岁常欢愉", "time": "2025/12/30\n10:05", "badge": "★ 岁岁平安" },
    { "id": "wish-10", "author": "祈愿神官", "skin": "ema", "message": "心之所向，行必能至；神明庇佑，福运长存⛩️", "time": "2026/01/15\n19:30", "badge": "★ 旷野漫步者" },
    { "id": "wish-11", "author": "红绶带", "skin": "ribbon", "message": "今年一定要完成马拉松，突破体能极限！", "time": "2026/03/08\n14:10", "badge": "★ 逻辑架构师" },
    { "id": "wish-12", "author": "青竹客", "skin": "bamboo", "message": "宁可食无肉，不可居无竹", "time": "2026/04/22\n21:00", "badge": "★ 暖心守护者" },
    { "id": "wish-13", "author": "列车长", "skin": "ticket", "message": "下一站：盛夏与繁花。愿旅途平安！🎟️", "time": "2026/06/18\n07:50", "badge": "★ 破晓之光" },
    { "id": "wish-14", "author": "多金客", "skin": "ingot", "message": "八方进宝，日进斗金，岁岁暴富！💰", "time": "2026/08/01\n11:25", "badge": "★ 招财进宝" },
    { "id": "wish-15", "author": "同频者", "skin": "goldpaper", "message": "流水不争先，争的是滔滔不绝", "time": "2026/09/01\n15:00", "badge": "★ 终局破壁者" }
]

def ensure_data_file():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(WISHES_FILE) or os.path.getsize(WISHES_FILE) < 5:
        with open(WISHES_FILE, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_SEED_WISHES, f, ensure_ascii=False, indent=2)

def read_wishes():
    ensure_data_file()
    try:
        with open(WISHES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list) and len(data) > 0:
                return data
    except Exception as e:
        print(f"[WishWall Server] Error reading wishes: {e}", file=sys.stderr)
    return DEFAULT_SEED_WISHES.copy()

def write_wishes(wishes):
    ensure_data_file()
    tmp_file = WISHES_FILE + ".tmp"
    try:
        with open(tmp_file, "w", encoding="utf-8") as f:
            json.dump(wishes, f, ensure_ascii=False, indent=2)
        os.replace(tmp_file, WISHES_FILE)
        return True
    except Exception as e:
        print(f"[WishWall Server] Error writing wishes: {e}", file=sys.stderr)
        if os.path.exists(tmp_file):
            try:
                os.remove(tmp_file)
            except Exception:
                pass
        return False

def format_server_time(dt=None):
    d = dt or datetime.now()
    return f"{d.year}/{d.month:02d}/{d.day:02d}\n{d.hour:02d}:{d.minute:02d}"


class WishWallHandler(BaseHTTPRequestHandler):
    server_version = "WishWall/1.0"

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_json(self, status_code, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. Health check
        if path == "/health" or path == "/healthz":
            self._send_json(200, {"status": "ok", "app": APP_ID, "time": datetime.now().isoformat()})
            return

        # 2. Get wishes list
        if path == "/api/wishes" or path == "/wishes":
            wishes = read_wishes()
            self._send_json(200, {"success": True, "count": len(wishes), "data": wishes})
            return

        # 3. Get wall stats
        if path == "/api/state":
            wishes = read_wishes()
            latest = wishes[-1] if wishes else None
            skin_counts = {}
            for w in wishes:
                s = w.get("skin", "ash")
                skin_counts[s] = skin_counts.get(s, 0) + 1
            self._send_json(200, {
                "success": True,
                "total_wishes": len(wishes),
                "latest_wish": latest,
                "skin_distribution": skin_counts
            })
            return

        # 4. Static file serving (index.html, assets, etc.)
        self._serve_static(path)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/wishes" or path == "/wishes":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 102400:  # 100KB limit
                self._send_json(413, {"success": False, "error": "Payload too large"})
                return

            try:
                body_bytes = self.rfile.read(content_length)
                payload = json.loads(body_bytes.decode("utf-8") or "{}")
            except Exception as e:
                self._send_json(400, {"success": False, "error": f"Invalid JSON payload: {e}"})
                return

            raw_msg = str(payload.get("message", "")).strip()
            if not raw_msg:
                self._send_json(400, {"success": False, "error": "心愿内容不能为空"})
                return

            message = raw_msg[:30]  # Max 30 chars
            author = str(payload.get("author", "")).strip()[:10] or "同频者"
            skin = str(payload.get("skin", "ash")).strip().lower()
            if not skin or not skin.replace("-", "").replace("_", "").isalnum() or len(skin) > 30:
                skin = "ash"

            badge = str(payload.get("badge", "")).strip()
            if not badge:
                badge = "★ 同频漫游者"

            new_wish = {
                "id": f"wish-{int(datetime.now().timestamp() * 1000)}",
                "author": author,
                "skin": skin,
                "message": message,
                "time": format_server_time(),
                "badge": badge
            }

            wishes = read_wishes()
            wishes.append(new_wish)
            capped = wishes[-500:]  # Keep last 500 wishes

            if write_wishes(capped):
                self._send_json(200, {"success": True, "data": new_wish, "count": len(capped)})
            else:
                self._send_json(500, {"success": False, "error": "写入数据库失败"})
            return

        self._send_json(404, {"success": False, "error": "Endpoint not found"})

    def _serve_static(self, req_path):
        if req_path in ("", "/"):
            req_path = "/index.html"

        # Sanitize path to prevent directory traversal
        rel_path = req_path.lstrip("/")
        local_path = os.path.normpath(os.path.join(BASE_DIR, rel_path))
        if not local_path.startswith(BASE_DIR):
            self.send_error(403, "Forbidden")
            return

        if not os.path.isfile(local_path):
            self.send_error(404, "File Not Found")
            return

        ctype, _ = mimetypes.guess_type(local_path)
        if not ctype:
            ctype = "application/octet-stream"

        try:
            with open(local_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", f"{ctype}; charset=utf-8" if "text" in ctype or "json" in ctype else ctype)
            self.send_header("Content-Length", str(len(content)))
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Read error: {e}")


def main():
    ensure_data_file()
    server_address = ("127.0.0.1", PORT)
    httpd = ThreadingHTTPServer(server_address, WishWallHandler)
    print(f"[WishWall] Server listening on http://127.0.0.1:{PORT} (App: {APP_ID})")
    print(f"[WishWall] Wishes file at: {WISHES_FILE}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[WishWall] Server stopped.")
        httpd.server_close()


if __name__ == "__main__":
    main()

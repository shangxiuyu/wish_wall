# 🎋 许愿墙 · 案头挂签祈愿系统 (Wish Wall)

> **东方雅致案头挂签祈愿系统** —— 融合物理拟物发声、昼夜交替星空月华与流星动效、多用户实时心跳同步与云端持久化存储。

🌐 **线上演示站点**：[http://47.93.187.177:3403/](http://47.93.187.177:3403/)

---

## ✨ 核心亮点

- 📜 **东方案头美学**：水墨质感笺纸纹理、黄铜古币锁扣与案头挂签布局，传递克制而温润的仪式感。
- 🌓 **昼夜双模天象**：
  - **白昼模式**：暖光雅宣、日光流动，伴随淡雅生活哲思寄语。
  - **夜幕星空**：流光银河、皓月清辉，动态划破天际的流星群与专属浪漫夜语。
- 🎆 **拟物交互与浪漫寄语**：
  - 许愿完成触发灿烂烟花粒子与清脆物理敲击音效。
  - 屏幕下方自适应弹现深/浅色模式下的专属随机浪漫寄语。
- ☁️ **全平台云端数据同步**：
  - 轻量原生 Python 微服务支持，提供 RESTful 接口。
  - 自动心跳增量轮询（Polling），跨终端实时感知其他访客的心愿投递与挂签。
  - 本地缓存 + 云端持久化双层冗余保障。

---

## 📂 项目结构

```text
├── index.html        # 许愿墙完整单页前端应用（UI、动效、音效与交互逻辑）
├── server.py         # 轻量级 RESTful API 服务后端（Python 原生 http.server 驱动）
├── app.json          # 小程序/微应用元数据配置
├── app.js            # 小程序运行时逻辑适配器
├── SKILL.md          # 模块规范与开发集成文档
├── data/
│   └── wishes.json   # 云端持久化心愿数据存储
└── assets/           # 视觉素材与图标资产
    ├── icon-day.jpg
    ├── icon-night.jpg
    ├── paper-texture.webp
    └── ...
```

---

## 🚀 快速启动

### 本地直接运行

项目采用零外部依赖的原生技术栈，只需系统自带的 Python 3 即可直接启动：

```bash
# 启动轻量服务
python3 server.py
```

终端将输出服务地址：
```text
✨ Wish Wall Server 已启动！监听地址: http://127.0.0.1:3403
🩺 健康检查端点: http://127.0.0.1:3403/healthz
🎋 心愿数据接口: http://127.0.0.1:3403/api/wishes
```

打开浏览器访问 `http://127.0.0.1:3403/` 即可体验。

---

## 📡 RESTful API 规范

| 接口 | 方法 | 说明 |
| :--- | :--- | :--- |
| `/api/wishes` | `GET` | 获取心愿列表（支持 `?limit=100` 分页参数） |
| `/api/wishes` | `POST` | 投递新心愿（JSON 载荷：`{ "text": "...", "name": "...", "date": "..." }`） |
| `/healthz` | `GET` | 服务健康检查探针 |

---

## ⚙️ 生产环境部署参考 (Linux Systemd)

创建用户级 systemd 服务文件 `~/.config/systemd/user/wish-wall.service`：

```ini
[Unit]
Description=Wish Wall Mini Program Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/partner/projects/wish-wall/current
ExecStart=/usr/bin/python3 /home/partner/projects/wish-wall/current/server.py
Restart=on-failure
RestartSec=5
UMask=0077
NoNewPrivileges=true
StandardOutput=journal
StandardError=journal
SyslogIdentifier=wish-wall

[Install]
WantedBy=default.target
```

启动并设置开机自启：
```bash
systemctl --user daemon-reload
systemctl --user enable --now wish-wall
```

---

## 📄 开源许可证

MIT License.

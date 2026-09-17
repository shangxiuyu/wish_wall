(function () {
      // 1. API 基础路径自适应推导
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const APP_ID = (pathParts[0] === 'mp' || pathParts[0] === 'mp-api') ? (pathParts[1] || 'wish-wall') : 'wish-wall';
      const API_BASE = window.location.pathname.startsWith('/mp') || window.location.pathname.startsWith('/mp-api')
        ? `/mp-api/${APP_ID}`
        : (window.location.port === "3100" || window.location.port === "5173" || window.location.port === "8000" ? `/mp-api/${APP_ID}` : "");

      const STORAGE_KEY = 'suhe_wish_wall_messages';
      const UNLOCKED_KEY = 'suhe_vault_unlocked';

      // 默认 15 条东方典雅种子心愿
      const defaultMessages = [
        { id: 'wish-1', author: '探索者', skin: 'ema', message: '保佑新的一年顺遂无忧，万事胜意！⛩️', time: '2024/12/12\n12:00', badge: '★ 早期破译者' },
        { id: 'wish-2', author: 'Lin', skin: 'ribbon', message: '祝愿考研顺利，成功上岸梦校！🎗️', time: '2024/12/12\n14:30', badge: '★ 早期破译者' },
        { id: 'wish-3', author: '研墨人', skin: 'bamboo', message: '学而不思则罔，思而不学则殆', time: '2025/01/12\n02:30', badge: '★ 早期破译者' },
        { id: 'wish-4', author: '考神附体', skin: 'vermilion', message: '逢考必过，面试通关，一举夺魁！🏮', time: '2025/03/18\n18:00', badge: '★ 机要员专属' },
        { id: 'wish-5', author: '墨客', skin: 'goldpaper', message: '愿所有坚持与热爱，都能在时光里开出花来✨', time: '2025/05/20\n09:15', badge: '★ 同频漫游者' },
        { id: 'wish-6', author: '旅人', skin: 'ticket', message: '搭上通往未来的时光列车，保持好奇与赤诚🎟️', time: '2025/07/07\n23:40', badge: '★ 极客先锋' },
        { id: 'wish-7', author: '夜行客', skin: 'indigo', message: '深蓝静夜，专注内心的平静与力量', time: '2025/09/01\n08:00', badge: '★ 岁月静好' },
        { id: 'wish-8', author: '松风', skin: 'matcha', message: '林深见鹿，山重水复，日日是好日', time: '2025/11/11\n16:20', badge: '★ 卓越创造者' },
        { id: 'wish-9', author: '雨林', skin: 'peace', message: '希望家人身体健康，平安喜乐，岁岁常欢愉', time: '2025/12/30\n10:05', badge: '★ 岁岁平安' },
        { id: 'wish-10', author: '祈愿神官', skin: 'ema', message: '心之所向，行必能至；神明庇佑，福运长存⛩️', time: '2026/01/15\n19:30', badge: '★ 旷野漫步者' },
        { id: 'wish-11', author: '红绶带', skin: 'ribbon', message: '今年一定要完成马拉松，突破体能极限！', time: '2026/03/08\n14:10', badge: '★ 逻辑架构师' },
        { id: 'wish-12', author: '青竹客', skin: 'bamboo', message: '宁可食无肉，不可居无竹', time: '2026/04/22\n21:00', badge: '★ 暖心守护者' },
        { id: 'wish-13', author: '列车长', skin: 'ticket', message: '下一站：盛夏与繁花。愿旅途平安！🎟️', time: '2026/06/18\n07:50', badge: '★ 破晓之光' },
        { id: 'wish-14', author: '多金客', skin: 'ingot', message: '八方进宝，日进斗金，岁岁暴富！💰', time: '2026/08/01\n11:25', badge: '★ 招财进宝' },
        { id: 'wish-15', author: '同频者', skin: 'goldpaper', message: '流水不争先，争的是滔滔不绝', time: '2026/09/01\n15:00', badge: '★ 终局破壁者' }
      ];

      // DOM 元素引用
      const wishOpenModalBtn = document.getElementById('wishOpenModalBtn');
      const wishModalOverlay = document.getElementById('wishModalOverlay');
      const wishModalClose = document.getElementById('wishModalClose');

      const wishBookmarksRail = document.getElementById('wishBookmarksRail');
      const wishRailTrack = document.getElementById('wishRailTrack');
      const guestbookForm = document.getElementById('guestbookForm');
      const gbMessage = document.getElementById('gbMessage');
      const gbAuthor = document.getElementById('gbAuthor');
      const gbCharCount = document.getElementById('gbCharCount');
      const gbSubmitBtn = document.getElementById('gbSubmitBtn');

      let currentMessages = [];

      // 本地缓存读写
      function getStoredMessages() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        } catch (e) {}
        return defaultMessages.slice();
      }

      function saveStoredMessages(msgs) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
        } catch (e) {}
      }

      // Web Audio API 纯代码拟物发声
      function playSound(type) {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') ctx.resume();
          const t = ctx.currentTime;

          if (type === 'stamp') {
            // 清脆文雅的挂签木印声
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(587.33, t); // D5
            osc1.frequency.exponentialRampToValueAtTime(880, t + 0.15); // A5
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1174.66, t + 0.05); // D6
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.26, t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            osc1.start(t);
            osc2.start(t + 0.05);
            osc1.stop(t + 0.42);
            osc2.stop(t + 0.42);
          } else if (type === 'unlock') {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.type = 'triangle';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(320, t);
            osc1.frequency.exponentialRampToValueAtTime(780, t + 0.08);
            osc1.frequency.exponentialRampToValueAtTime(1046.5, t + 0.35);
            osc2.frequency.setValueAtTime(523.25, t + 0.08);
            osc2.frequency.exponentialRampToValueAtTime(1318.5, t + 0.4);
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.24, t + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            osc1.start(t);
            osc2.start(t + 0.04);
            osc1.stop(t + 0.5);
            osc2.stop(t + 0.5);
          } else if (type === 'error') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, t);
            osc.frequency.setValueAtTime(110, t + 0.08);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.22);
          }
        } catch (e) {}
      }

      // 彩纸撒花粒子
      function spawnConfetti(originX, originY) {
        const colors = ['#C49F58', '#78B7BD', '#C18BA9', '#99B79F', '#FFE58F', '#B84E3A'];
        for (let i = 0; i < 32; i++) {
          const p = document.createElement('div');
          p.style.cssText = `
            position: fixed;
            left: ${originX || (window.innerWidth / 2)}px;
            top: ${originY || (window.innerHeight / 2)}px;
            width: ${Math.random() * 8 + 6}px;
            height: ${Math.random() * 8 + 4}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            pointer-events: none;
            z-index: 99999;
            transform: translate3d(0, 0, 0) rotate(0deg);
            transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease;
          `;
          document.body.appendChild(p);

          const angle = Math.random() * Math.PI * 2;
          const velocity = Math.random() * 180 + 80;
          const vx = Math.cos(angle) * velocity;
          const vy = Math.sin(angle) * velocity - 70;
          const rot = Math.random() * 720 - 360;

          requestAnimationFrame(() => {
            p.style.transform = `translate3d(${vx}px, ${vy}px, 0) rotate(${rot}deg)`;
            p.style.opacity = '0';
          });

          setTimeout(() => {
            if (p.parentNode) p.parentNode.removeChild(p);
          }, 1300);
        }
      }

      function escapeHtml(str) {
        return String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      // 时间格式化
      function formatWishTime(d) {
        const date = d || new Date();
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${y}/${m}/${day}\n${hh}:${mm}`;
      }

      // 滚动导轨至最新挂签
      function scrollToLatestWish(smooth = false) {
        requestAnimationFrame(() => {
          if (wishBookmarksRail) {
            wishBookmarksRail.scrollTo({
              left: wishBookmarksRail.scrollWidth,
              behavior: smooth ? 'smooth' : 'auto'
            });
          }
        });
      }

      // 渲染导轨上所有书签
      function renderWishWall(newlyAddedId) {
        if (!wishRailTrack) return;

        const nodesHtml = currentMessages.map((m, idx) => {
          const isNew = m.id === newlyAddedId;
          const formattedTime = (m.time || '').replace('\n', '<br>');
          const skinClass = m.skin ? `skin-${m.skin}` : 'skin-ash';
          const ingotPendantHtml = m.skin === 'ingot' ? `
            <div class="wish-ingot-pendant" aria-hidden="true" title="金元宝招财护佑">
              <div class="ingot-cord"><span class="ingot-bead"></span></div>
              <div class="ingot-sycee">
                <svg viewBox="0 0 32 20" width="24" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ingotGoldGrad-${idx}" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#FFE885"/>
                      <stop offset="35%" stop-color="#F5C438"/>
                      <stop offset="75%" stop-color="#CF9519"/>
                      <stop offset="100%" stop-color="#996906"/>
                    </linearGradient>
                    <radialGradient id="ingotCenterGlow-${idx}" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stop-color="#FFF5B8"/>
                      <stop offset="60%" stop-color="#F2BE30"/>
                      <stop offset="100%" stop-color="#BA8010"/>
                    </radialGradient>
                  </defs>
                  <path d="M2 5 C4 13, 8 18, 16 18 C24 18, 28 13, 30 5 C26 7, 20 8, 16 8 C12 8, 6 7, 2 5 Z" fill="url(#ingotGoldGrad-${idx})" />
                  <ellipse cx="16" cy="6.5" rx="8.5" ry="4.5" fill="url(#ingotCenterGlow-${idx})" />
                  <ellipse cx="16" cy="6" rx="5" ry="2.2" fill="#FFEFA8" opacity="0.65" />
                  <path d="M2 5 C5 2, 8 2.5, 10 4 C7 5, 4 5.5, 2 5 Z" fill="#FFEAA3"/>
                  <path d="M30 5 C27 2, 24 2.5, 22 4 C25 5, 28 5.5, 30 5 Z" fill="#FFEAA3"/>
                </svg>
              </div>
            </div>
          ` : '';

          const peacePendantHtml = m.skin === 'peace' ? `
            <div class="wish-peace-pendant" aria-hidden="true" title="白玉平安扣 · 岁岁平安">
              <div class="peace-cord"></div>
              <div class="peace-disc">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="peaceJadeGrad-${idx}" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stop-color="#FFFFFF"/>
                      <stop offset="40%" stop-color="#EFF7F3"/>
                      <stop offset="75%" stop-color="#D6ECE1"/>
                      <stop offset="100%" stop-color="#A5CDBE"/>
                    </radialGradient>
                  </defs>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5Z" fill="url(#peaceJadeGrad-${idx})" stroke="rgba(255,255,255,0.7)" stroke-width="0.75"/>
                  <path d="M5 8 C7 5, 11 4, 15 5" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
                </svg>
              </div>
              <div class="peace-tassel"></div>
            </div>
          ` : '';
          return `
            <div class="wish-node-item ${isNew ? 'is-new' : ''}" data-id="${escapeHtml(m.id)}" title="${escapeHtml(m.author)}: ${escapeHtml(m.message)}">
              <div class="wish-node-badge">${idx + 1}</div>
              <div class="wish-node-time">${formattedTime}</div>
              <div class="wish-node-cord"></div>
              <div class="wish-bookmark-strip ${skinClass}">
                <div class="wish-bookmark-eyelet"></div>
                <div class="wish-bookmark-text">${escapeHtml(m.message)}</div>
                <div class="wish-bookmark-footer">
                  <span class="wish-bookmark-author">${escapeHtml(m.author)}</span>
                </div>
                ${ingotPendantHtml}
                ${peacePendantHtml}
              </div>
            </div>
          `;
        }).join('');

        wishRailTrack.innerHTML = `<div class="wish-rail-axis" aria-hidden="true"></div>` + nodesHtml;
        scrollToLatestWish(Boolean(newlyAddedId));
      }

      // 从后端同步心愿（支持静默轮询与新挂签平滑展示）
      let isSyncing = false;
      async function syncWishes(isSilent = false) {
        if (isSyncing) return;
        isSyncing = true;

        if (!isSilent) {
          currentMessages = getStoredMessages();
          renderWishWall();
        }

        try {
          const res = await fetch(`${API_BASE}/api/wishes?_t=${Date.now()}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              const prevLen = currentMessages.length;
              const newLen = json.data.length;
              const prevLastId = prevLen > 0 ? currentMessages[prevLen - 1].id : null;
              const newLastId = newLen > 0 ? json.data[newLen - 1].id : null;

              // 检测是否有其他用户新增或更新了心愿
              const hasNewWishes = newLen !== prevLen || prevLastId !== newLastId;
              if (hasNewWishes) {
                const latestNewId = (newLen > prevLen) ? newLastId : null;
                currentMessages = json.data;
                saveStoredMessages(currentMessages);

                const currentScrollLeft = wishBookmarksRail ? wishBookmarksRail.scrollLeft : 0;
                const isNearEnd = wishBookmarksRail ? (wishBookmarksRail.scrollWidth - wishBookmarksRail.clientWidth - currentScrollLeft < 150) : false;

                renderWishWall(latestNewId);

                if (!isSilent || isNearEnd) {
                  setTimeout(() => scrollToLatestWish(Boolean(latestNewId)), 60);
                } else if (wishBookmarksRail) {
                  wishBookmarksRail.scrollLeft = currentScrollLeft;
                }
              }
            }
          }
        } catch (e) {
          // 离线使用本地存储数据
        } finally {
          isSyncing = false;
        }
      }

      // 鼠标拖拽横向滚动支持
      if (wishBookmarksRail) {
        let isDown = false;
        let startX;
        let scrollLeft;

        wishBookmarksRail.addEventListener('mousedown', (e) => {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;
          isDown = true;
          startX = e.pageX - wishBookmarksRail.offsetLeft;
          scrollLeft = wishBookmarksRail.scrollLeft;
        });

        window.addEventListener('mouseup', () => {
          isDown = false;
        });

        wishBookmarksRail.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - wishBookmarksRail.offsetLeft;
          const walk = (x - startX) * 1.5;
          wishBookmarksRail.scrollLeft = scrollLeft - walk;
        });

        // 鼠标滚轮横向滑动适配
        wishBookmarksRail.addEventListener('wheel', (e) => {
          if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
            // 如果只有垂直滚轮，横向平移轨道
            wishBookmarksRail.scrollLeft += e.deltaY;
          }
        }, { passive: true });
      }

      // 实时字数计数器 (最多30字)
      if (gbMessage && gbCharCount) {
        gbMessage.addEventListener('input', () => {
          const len = gbMessage.value.length;
          gbCharCount.textContent = `${len}/30`;
          if (len >= 30) {
            gbCharCount.style.color = '#B8402D';
            gbCharCount.style.fontWeight = '700';
          } else {
            gbCharCount.style.color = '';
            gbCharCount.style.fontWeight = '';
          }
        });
      }

      // 提交新愿望
      if (guestbookForm) {
        guestbookForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const rawMessage = gbMessage.value.trim();
          const message = rawMessage.slice(0, 30);
          const author = (gbAuthor.value.trim() || '同频者').slice(0, 5);

          const skinRadio = guestbookForm.querySelector('input[name="gbSkin"]:checked');
          const skin = skinRadio ? skinRadio.value : 'ash';

          if (!message) {
            gbMessage.focus();
            return;
          }

          const newId = 'wish-' + Date.now();
          const newWish = {
            id: newId,
            author: author,
            skin: skin,
            message: message,
            time: formatWishTime(new Date()),
            badge: '★ 同频漫游者'
          };

          // 1. 发送至后端持久化
          try {
            const res = await fetch(`${API_BASE}/api/wishes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                author,
                skin,
                message,
                badge: '★ 同频漫游者'
              })
            });
            if (res.ok) {
              const json = await res.json();
              if (json.success && json.data) {
                newWish.id = json.data.id;
                if (json.data.time) newWish.time = json.data.time;
              }
            }
          } catch (err) {}

          // 2. 本地缓存与视图更新
          currentMessages.push(newWish);
          saveStoredMessages(currentMessages);

          // 3. 拟物音效、撒花与浪漫祈愿浮签
          playSound('stamp');
          const rect = gbSubmitBtn.getBoundingClientRect();
          spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
          showRomanticBlessing();

          renderWishWall(newWish.id);
          setTimeout(() => scrollToLatestWish(true), 80);

          // 按钮反馈动效
          const oldText = gbSubmitBtn.textContent;
          gbSubmitBtn.textContent = '✓ 已挂上心愿签';
          gbSubmitBtn.style.background = '#99B79F';
          gbSubmitBtn.style.borderColor = '#99B79F';

          gbMessage.value = '';
          if (gbCharCount) {
            gbCharCount.textContent = '0/30';
            gbCharCount.style.color = '';
            gbCharCount.style.fontWeight = '';
          }

          setTimeout(() => {
            gbSubmitBtn.textContent = oldText;
            gbSubmitBtn.style.background = '';
            gbSubmitBtn.style.borderColor = '';
            closeWishModal(); // 挂签成功后关闭弹窗
          }, 700);
        });
      }

      // 💌 许愿成功后的浪漫祈愿文案库 (深浅色模式自适应随机)
      const DARK_BLESSINGS = [
        '愿望已借流星寄往银河，静候回响。',
        '星星听见了你的低语，正为你奔赴而来。',
        '心愿已漫入璀璨星夜，所念皆有回音。',
        '把心愿藏进夜空，月亮会替你守候。'
      ];

      const LIGHT_BLESSINGS = [
        '把愿望交给时间，只管去热爱生活。',
        '愿所有的坚持与热爱，都能在岁月中开出花来。',
        '生活总会留一束光，刚好照亮你的愿望。'
      ];

      let blessingTimer = null;
      function showRomanticBlessing() {
        const toast = document.getElementById('romanticBlessingToast');
        const textEl = document.getElementById('romanticBlessingText');
        const iconEl = document.getElementById('romanticBlessingIcon');
        if (!toast || !textEl) return;

        const isDark = document.body.classList.contains('lamp-mode');
        const pool = isDark ? DARK_BLESSINGS : LIGHT_BLESSINGS;
        const picked = pool[Math.floor(Math.random() * pool.length)];

        textEl.textContent = picked;
        if (iconEl) {
          iconEl.textContent = isDark ? '🌠' : '🌸';
        }

        if (blessingTimer) clearTimeout(blessingTimer);

        toast.classList.remove('is-show');
        void toast.offsetWidth; // 触发 reflow，保证连击时重播浮现动效
        toast.classList.add('is-show');

        blessingTimer = setTimeout(() => {
          toast.classList.remove('is-show');
        }, 3600);
      }

      // 🏷️ 动态同步弹窗标题中的皮肤名称：心愿签 · [皮肤名称]
      const SKIN_NAMES = {
        ash: '雅致素笺',
        indigo: '静夜深蓝',
        matcha: '松烟竹青',
        vermilion: '上岸红笺',
        bamboo: '楠木竹简',
        goldpaper: '洒金宣纸',
        ribbon: '织金飘带',
        ema: '神社绘马',
        ticket: '齿孔车票',
        ingot: '聚宝金元宝',
        peace: '岁岁平安扣'
      };

      const modalSkinNameEl = document.getElementById('modalSkinName');
      function updateModalSkinTitle() {
        if (!modalSkinNameEl || !guestbookForm) return;
        const checked = guestbookForm.querySelector('input[name="gbSkin"]:checked');
        const skinKey = checked ? checked.value : 'ash';
        modalSkinNameEl.textContent = SKIN_NAMES[skinKey] || '雅致素笺';
      }

      const skinInputs = guestbookForm ? guestbookForm.querySelectorAll('input[name="gbSkin"]') : [];
      skinInputs.forEach(input => {
        input.addEventListener('change', updateModalSkinTitle);
      });

      // 弹窗显隐控制
      function openWishModal() {
        if (!wishModalOverlay) return;
        updateModalSkinTitle();
        wishModalOverlay.style.display = 'flex';
        if (gbMessage) {
          setTimeout(() => gbMessage.focus(), 60);
        }
      }

      function closeWishModal() {
        if (!wishModalOverlay) return;
        wishModalOverlay.style.display = 'none';
      }

      if (wishOpenModalBtn) {
        wishOpenModalBtn.addEventListener('click', openWishModal);
      }
      if (wishModalClose) {
        wishModalClose.addEventListener('click', closeWishModal);
      }
      if (wishModalOverlay) {
        wishModalOverlay.addEventListener('click', (e) => {
          if (e.target === wishModalOverlay) closeWishModal();
        });
      }
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && wishModalOverlay && wishModalOverlay.style.display !== 'none') {
          closeWishModal();
        }
      });

      // 🕒 昼夜交替系统：根据当地时间自动无感切换（06:00~19:00 白天案头浅色模式，19:00~06:00 夜幕星空深色模式）
      function checkAutoTheme() {
        const now = new Date();
        const hour = now.getHours();
        const isDaytime = hour >= 6 && hour < 19; // 早上6点到晚上7点为浅色模式
        const isDark = !isDaytime;

        document.body.classList.toggle('lamp-mode', isDark);
        if (isDark) {
          initNightStars();
        }
      }

      checkAutoTheme();
      setInterval(checkAutoTheme, 60000); // 每分钟定时检测，跨时段自动无感切换

      // 🌌 动态生成夜空闪烁繁星
      function initNightStars() {
        const nightStars = document.getElementById('nightStars');
        if (!nightStars || nightStars.children.length > 0) return;
        const starCount = 72;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < starCount; i++) {
          const star = document.createElement('div');
          star.className = 'star-dot';
          const size = (Math.random() * 2.2 + 0.9).toFixed(1); // 0.9px ~ 3.1px
          const x = (Math.random() * 100).toFixed(2);
          const y = (Math.random() * 100).toFixed(2);
          const dur = (Math.random() * 3 + 2.2).toFixed(1);
          const delay = (Math.random() * 4).toFixed(1);
          star.style.width = `${size}px`;
          star.style.height = `${size}px`;
          star.style.left = `${x}%`;
          star.style.top = `${y}%`;
          star.style.animationDuration = `${dur}s`;
          star.style.animationDelay = `${delay}s`;
          if (Math.random() > 0.75) {
            star.style.background = '#FFF3C4';
            star.style.boxShadow = `0 0 4px rgba(255, 243, 196, 0.9)`;
          } else if (Math.random() > 0.85) {
            star.style.background = '#D6E4FF';
            star.style.boxShadow = `0 0 4px rgba(214, 228, 255, 0.9)`;
          }
          frag.appendChild(star);
        }
        nightStars.appendChild(frag);
      }
      initNightStars();

      // 初始化启动：展示全屏许愿墙并同步心愿数据
      syncWishes();

      // 🔄 多端/多用户实时心跳同步：每隔 5 秒静默轮询一次，其他用户发出的心愿自动上墙
      setInterval(() => {
        syncWishes(true);
      }, 5000);

    })();

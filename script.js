document.addEventListener('DOMContentLoaded', () => {
    const marketWorld = document.getElementById('market-world');
    const playerCharacter = document.getElementById('player-character');
    const walletAmountEl = document.getElementById('wallet-amount');
    const playerToast = document.getElementById('player-toast');
    const crowdLayer = document.getElementById('crowd-layer');
    const marketHud = document.getElementById('market-hud');
    const hudZone = document.getElementById('hud-zone');
    const hudTime = document.getElementById('hud-time');
    const bagCountEl = document.getElementById('bag-count');
    const bagBtn = document.getElementById('bag-btn');
    const infoBtn = document.getElementById('info-btn');
    const topupBtn = document.getElementById('topup-btn');
    const soundBtn = document.getElementById('sound-btn');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    const sections = document.querySelectorAll('.road-section');

    // Player Wallet & Tapau Bag State
    let walletRM = 50;
    const bagItems = [
        { title: 'Apam Balik Crispy (Starter)', price: 5, category: 'Street Food' }
    ];

    let toastTimer = null;
    function showPlayerToast(message) {
        if (!playerToast) return;
        playerToast.textContent = message;
        playerToast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            playerToast.classList.remove('show');
        }, 2200);
    }

    function updateWalletUI() {
        walletAmountEl.textContent = `RM${walletRM}`;
        bagCountEl.textContent = bagItems.length;
    }

    // ==========================================
    // 1. SCROLL-DRIVEN MIDDLE CHARACTER MOVEMENT
    // ==========================================
    let lastScrollY = window.scrollY;
    let walkStopTimer = null;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        const deltaY = currentScrollY - lastScrollY;
        const worldRect = marketWorld.getBoundingClientRect();
        const viewportH = window.innerHeight;

        // Show HUD & animate player once inside the 3 Road Sections
        const inMarket = worldRect.top <= viewportH * 0.45 && worldRect.bottom >= viewportH * 0.4;
        marketHud.classList.toggle('visible', inMarket);

        if (Math.abs(deltaY) > 1) {
            playerCharacter.classList.add('is-walking');
            playerCharacter.classList.toggle('facing-up', deltaY < 0);

            // Subtle side-to-side stroll weave along the center road line as user scrolls
            const progress = Math.max(0, currentScrollY - marketWorld.offsetTop);
            const weaveX = Math.sin(progress * 0.012) * 26;
            const verticalNudge = Math.cos(progress * 0.008) * 10;
            playerCharacter.style.transform = `translate(calc(-50% + ${weaveX.toFixed(1)}px), calc(-50% + ${verticalNudge.toFixed(1)}px))`;

            clearTimeout(walkStopTimer);
            walkStopTimer = setTimeout(() => {
                playerCharacter.classList.remove('is-walking');
            }, 160);
        }

        // Detect which road section the character is currently walking through
        sections.forEach((sec) => {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= viewportH * 0.5 && rect.bottom >= viewportH * 0.5) {
                const zoneName = sec.getAttribute('data-zone');
                if (zoneName && hudZone.textContent !== zoneName) {
                    hudZone.textContent = zoneName;
                }
            }
        });

        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ==========================================
    // 2. LIVE SMOKE ANIMATION FROM GRILL STALLS
    // ==========================================
    const smokeEmitters = document.querySelectorAll('.smoke-emitter');

    smokeEmitters.forEach((emitter) => {
        const x = emitter.getAttribute('data-smoke-x') || '50%';
        const y = emitter.getAttribute('data-smoke-y') || '50%';
        emitter.style.left = x;
        emitter.style.top = y;
    });

    function spawnSmokePuffs() {
        smokeEmitters.forEach((emitter) => {
            const rect = emitter.getBoundingClientRect();
            // Only spawn smoke when section is near or within viewport
            if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
                const puff = document.createElement('div');
                puff.className = 'smoke-puff';
                const driftX = (Math.random() * 36 - 18).toFixed(1);
                puff.style.setProperty('--drift-x', `${driftX}px`);
                puff.style.left = `${(Math.random() * 14 - 7).toFixed(1)}px`;
                puff.style.top = `${(Math.random() * 10 - 5).toFixed(1)}px`;
                emitter.appendChild(puff);

                setTimeout(() => {
                    puff.remove();
                }, 2800);
            }
        });
    }

    setInterval(spawnSmokePuffs, 520);
    spawnSmokePuffs();

    // ==========================================
    // 3. RANDOMLY MOVING PASAR MALAM CROWD (NPCs)
    // ==========================================
    const npcSprites = [
        'assets/npc-1.svg',
        'assets/npc-2.svg',
        'assets/npc-3.svg',
        'assets/npc-4.svg',
        'assets/npc-5.svg',
        'assets/npc-6.svg'
    ];

    const malaysianPhrases = [
        'Satay 10 cucuk!',
        'Air Jagung ikat tepi!',
        'Burger Ramly Special!',
        'Cantik Batik ni!',
        'Murah-murah RM10!',
        'Jom main Tangkap Ikan!',
        'Wau Bulan lawa!',
        'Sedap bau satay!',
        'Musang King padu!',
        'Capal kulit asli!',
        'Apam Balik panas!'
    ];

    const npcCount = 22;
    const npcs = [];

    // Road walkable horizontal corridor is roughly 35% to 65% of screen width
    function randomRoadX() {
        // Either left lane near left stalls (34%-44%) or right lane near right stalls (56%-66%)
        return Math.random() < 0.5
            ? 34 + Math.random() * 11
            : 55 + Math.random() * 11;
    }

    for (let i = 0; i < npcCount; i++) {
        const el = document.createElement('div');
        el.className = 'npc-walker is-moving';

        const chat = document.createElement('div');
        chat.className = 'npc-chat';
        chat.textContent = malaysianPhrases[i % malaysianPhrases.length];

        const img = document.createElement('img');
        img.className = 'npc-sprite';
        img.src = npcSprites[i % npcSprites.length];
        img.alt = '';

        el.appendChild(chat);
        el.appendChild(img);
        crowdLayer.appendChild(el);

        const startX = randomRoadX();
        const startY = 4 + (i / npcCount) * 92; // Spread vertically across all 3 road sections (0% - 100%)

        npcs.push({
            el,
            chat,
            x: startX,
            y: startY,
            targetX: randomRoadX(),
            targetY: Math.max(3, Math.min(96, startY + (Math.random() * 18 - 9))),
            speed: 0.018 + Math.random() * 0.022,
            pauseTicks: 0
        });
    }

    function updateCrowd() {
        npcs.forEach((npc) => {
            if (npc.pauseTicks > 0) {
                npc.pauseTicks--;
                if (npc.pauseTicks === 0) {
                    npc.el.classList.add('is-moving');
                    npc.chat.classList.remove('visible');
                }
                return;
            }

            const dx = npc.targetX - npc.x;
            const dy = npc.targetY - npc.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 0.6) {
                // Reached waypoint: pause briefly to browse a stall or chat
                npc.el.classList.remove('is-moving');
                npc.pauseTicks = 45 + Math.floor(Math.random() * 90);

                // 35% chance to pop a Malaysian night-market speech bubble
                if (Math.random() < 0.35) {
                    npc.chat.textContent = malaysianPhrases[Math.floor(Math.random() * malaysianPhrases.length)];
                    npc.chat.classList.add('visible');
                }

                npc.targetX = randomRoadX();
                npc.targetY = Math.max(3, Math.min(96, npc.y + (Math.random() * 22 - 11)));
            } else {
                npc.x += (dx / dist) * npc.speed * 1.4;
                npc.y += (dy / dist) * npc.speed;
                npc.el.style.left = `${npc.x.toFixed(2)}%`;
                npc.el.style.top = `${npc.y.toFixed(2)}%`;
            }
        });

        requestAnimationFrame(updateCrowd);
    }

    requestAnimationFrame(updateCrowd);

    // ==========================================
    // 4. INTERACTIVE STALLS & RM50 WALLET SYSTEM
    // ==========================================
    function openModal(htmlContent) {
        modalBody.innerHTML = htmlContent;
        modalBackdrop.hidden = false;
    }

    function closeModal() {
        modalBackdrop.hidden = true;
    }

    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
    });

    document.querySelectorAll('.stall-unit').forEach((stall) => {
        stall.addEventListener('click', () => {
            const title = stall.getAttribute('data-title');
            const category = stall.getAttribute('data-category');
            const price = parseInt(stall.getAttribute('data-price'), 10);
            const desc = stall.getAttribute('data-desc');

            openModal(`
                <span class="modal-category">${category}</span>
                <h2 class="modal-title">${title}</h2>
                <p class="modal-desc">${desc}</p>
                <button class="modal-buy-btn" id="buy-item-btn">
                    Beli Sekarang • RM${price} (Wallet: RM${walletRM})
                </button>
            `);

            const buyBtn = document.getElementById('buy-item-btn');
            buyBtn.addEventListener('click', () => {
                if (walletRM >= price) {
                    walletRM -= price;
                    bagItems.push({ title, price, category });
                    updateWalletUI();
                    closeModal();
                    showPlayerToast(`Tapau ${title.split(' ')[0]}! (-RM${price})`);
                } else {
                    buyBtn.textContent = 'Tak cukup duit! Klik +RM50 di atas untuk cucuk ATM';
                    buyBtn.style.background = '#ef4444';
                    buyBtn.style.color = '#ffffff';
                }
            });
        });
    });

    // Top-up RM50 button
    topupBtn.addEventListener('click', () => {
        walletRM += 50;
        updateWalletUI();
        showPlayerToast('Cucuk ATM +RM50!');
    });

    // View Tapau Shopping Bag Modal
    bagBtn.addEventListener('click', () => {
        const itemsHtml = bagItems
            .map((item) => `<li><span>${item.title}</span><strong>RM${item.price}</strong></li>`)
            .join('');

        openModal(`
            <span class="modal-category">BEG PLASTIK MERAH PUTIH</span>
            <h2 class="modal-title">Barang Tapau Pasar Malam (${bagItems.length})</h2>
            <ul class="bag-list">${itemsHtml}</ul>
            <p class="modal-desc">Baki Dompet: <strong style="color:#4ade80;">RM${walletRM}</strong></p>
            <button class="modal-buy-btn" id="close-bag-btn">Sambung Jalan-Jalan</button>
        `);

        document.getElementById('close-bag-btn').addEventListener('click', closeModal);
    });

    // Info Modal
    infoBtn.addEventListener('click', () => {
        openModal(`
            <span class="modal-category">MALAYSIAN NIGHT MARKET</span>
            <h2 class="modal-title">Selamat Datang ke Pasar Malam!</h2>
            <p class="modal-desc">
                Scroll up and down to walk your character through 3 lively zones of a Malaysian Pasar Malam:
                <br><br>
                • <strong>Zone 1 (Food &amp; Air Balang):</strong> Satay Kajang with live charcoal smoke, Air Balang Tiga Rasa, and Ramly Burger.<br>
                • <strong>Zone 2 (Clothing &amp; Fashion):</strong> Batik Terengganu, Kain Pelikat, Harimau Malaya jerseys, Capal sandals &amp; vintage Bundle.<br>
                • <strong>Zone 3 (Games &amp; Malaysian Culture):</strong> Tangkap Ikan Longkang, Ring Toss, Wau Bulan kites, Congkak, Gasing &amp; Musang King Durian.
            </p>
            <button class="modal-buy-btn" id="close-info-btn">Jom Teroka!</button>
        `);

        document.getElementById('close-info-btn').addEventListener('click', closeModal);
    });

    // ==========================================
    // 5. LIVE PASAR MALAM CLOCK & 8-BIT AMBIENCE
    // ==========================================
    let minutes = 30;
    setInterval(() => {
        minutes = (minutes + 1) % 60;
        const padded = minutes < 10 ? `0${minutes}` : minutes;
        hudTime.textContent = `Friday | 19:${padded}`;
    }, 15000);

    // Gentle 8-bit chiptune night market synthesizer (Rasa Sayang folk motif)
    let audioCtx = null;
    let isPlayingSound = false;
    let melodyInterval = null;
    // Rasa Sayang pentatonic notes (Hz)
    const rasaSayangNotes = [261.63, 293.66, 329.63, 392.00, 329.63, 293.66, 261.63, 392.00, 440.00, 392.00, 329.63, 293.66];
    let noteIndex = 0;

    soundBtn.addEventListener('click', () => {
        if (!isPlayingSound) {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            isPlayingSound = true;
            soundBtn.textContent = '🎵';
            showPlayerToast('Muzik Pasar Malam: ON');

            melodyInterval = setInterval(() => {
                if (!isPlayingSound || !audioCtx) return;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(rasaSayangNotes[noteIndex], audioCtx.currentTime);
                gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.32);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.34);
                noteIndex = (noteIndex + 1) % rasaSayangNotes.length;
            }, 380);
        } else {
            isPlayingSound = false;
            soundBtn.textContent = '🔊';
            clearInterval(melodyInterval);
            showPlayerToast('Muzik Pasar Malam: OFF');
        }
    });
});

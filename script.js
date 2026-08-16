/* ==========================================================================
   ABHIRAM GIRISH NAIK — portfolio behaviour
   Deliberately small: reveals, nav state, portrait unmask, screenshots, console.
   ========================================================================== */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Reveal on scroll ─────────────────────────────────────────────────────── */
(function reveals() {
    const all = document.querySelectorAll('.reveal');

    // Very old browser: show everything rather than leave the page blank.
    if (!('IntersectionObserver' in window)) {
        all.forEach((el) => el.classList.add('in'));
        return;
    }

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            obs.unobserve(e.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    all.forEach((el) => io.observe(el));

    // Printing does not scroll, so reveal everything before the sheet is rendered.
    const revealAll = () => all.forEach((el) => el.classList.add('in'));
    window.addEventListener('beforeprint', revealAll);
    if (window.matchMedia) {
        const mq = window.matchMedia('print');
        if (mq.addEventListener) mq.addEventListener('change', (e) => e.matches && revealAll());
    }

    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
})();

/* ── Pill bar: solid backdrop once scrolled ───────────────────────────────── */
(function pillbar() {
    const bar = document.getElementById('pillbar');
    if (!bar) return;
    const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

/* ── Experience rail: the avatar rides down to whichever role is in view ──── */
(function climbRider() {
    const climb = document.querySelector('.climb');
    if (!climb) return;

    const rider = climb.querySelector('.climb-rider');
    const steps = Array.from(climb.querySelectorAll('.climb-step'));
    if (!rider || !steps.length) return;

    // Must match .climb-step::before in the stylesheet: node at top:6px, 11px tall.
    const NODE_TOP = 6;
    const NODE_HALF = 5.5;
    const RIDER_HALF = 17;

    let queued = false;

    function place() {
        queued = false;

        // the last node whose card has crossed the reading line wins
        const line = window.innerHeight * 0.42;
        let active = 0;
        steps.forEach((step, i) => {
            if (step.getBoundingClientRect().top <= line) active = i;
        });

        // offsetTop is relative to .climb, which is position:relative
        const y = steps[active].offsetTop + NODE_TOP + NODE_HALF - RIDER_HALF;
        rider.style.transform = 'translateY(' + y + 'px)';

        steps.forEach((step, i) => step.classList.toggle('is-active', i === active));
    }

    function onScroll() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(place);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // fonts change card heights, so re-measure once they land
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    place();
})();

/* ── Portrait: hover on pointer devices, tap on touch ─────────────────────── */
(function portrait() {
    const fig = document.querySelector('.portrait');
    if (!fig) return;

    const toggle = () => fig.classList.toggle('unmasked');

    // Pointer devices get :hover from CSS; touch devices need an explicit toggle.
    if (window.matchMedia('(hover: none)').matches) {
        fig.addEventListener('click', toggle);
    }

    // Keyboard users get :focus-visible from CSS, plus Enter/Space to pin it.
    fig.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        toggle();
    });
})();

/* ── Hero matrix rain ─────────────────────────────────────────────────────── */
(function heroMatrix() {
    const cv = document.getElementById('hero-matrix');
    if (!cv || reduceMotion) return;

    const hero = cv.closest('.hero');
    const ctx = cv.getContext('2d', { alpha: true });
    if (!hero || !ctx) return;

    const GLYPHS = '01アイウエオカキクケコサシスセソハヒフヘホ<>{}[]/\\$#*';
    const SIZE = 14;
    const STEP = 55;               // ms between frames — slow enough to read as "calm"

    let w = 0, h = 0, cols = 0, drops = [], speeds = [];
    let raf = null, last = 0, visible = true;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = hero.clientWidth;
        h = hero.clientHeight;
        if (!w || !h) return;

        cv.width = Math.floor(w * dpr);
        cv.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        cols = Math.ceil(w / SIZE);
        drops = Array.from({ length: cols }, () => Math.random() * -h);
        speeds = Array.from({ length: cols }, () => 0.6 + Math.random() * 0.9);
        ctx.clearRect(0, 0, w, h);
    }

    function draw() {
        // translucent wash leaves the fading trail behind each glyph
        ctx.fillStyle = 'rgba(10, 11, 10, 0.10)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = SIZE + 'px "JetBrains Mono", monospace';

        for (let i = 0; i < cols; i++) {
            const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
            const y = drops[i];
            // the leading glyph is brighter, the tail is dim green
            ctx.fillStyle = Math.random() > 0.97
                ? 'rgba(134, 239, 172, 0.85)'
                : 'rgba(34, 197, 94, 0.42)';
            ctx.fillText(ch, i * SIZE, y);

            drops[i] = y > h && Math.random() > 0.975 ? 0 : y + SIZE * speeds[i];
        }
    }

    function loop(ts) {
        raf = requestAnimationFrame(loop);
        if (ts - last < STEP) return;
        last = ts;
        draw();
    }

    function start() {
        if (raf === null) raf = requestAnimationFrame(loop);
    }
    function stop() {
        if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
    }

    resize();
    start();

    // Don't burn CPU while the hero is scrolled away or the tab is hidden.
    new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
    }, { threshold: 0 }).observe(hero);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden || !visible) stop(); else start();
    });

    let t;
    window.addEventListener('resize', () => {
        clearTimeout(t);
        t = setTimeout(resize, 200);
    });
})();

/* ── Project screenshots ───────────────────────────────────────────── */
/* Cards pull their shots from /shots by filename — allsafe-1.png, allsafe-2.png
   and so on. Probing means dropping a file in the folder is the whole workflow:
   no markup to edit. The strip stays hidden until at least one image loads, so a
   project with no screenshots shows no empty frame. */
(function shots() {
    const EXTS = ['png', 'jpg', 'jpeg', 'webp'];
    const MAX = 8;                       // stop probing eventually

    function load(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    // Try each extension for one index; resolves to the first that exists.
    async function findOne(slug, n) {
        for (const ext of EXTS) {
            const hit = await load(`shots/${slug}-${n}.${ext}`);
            if (hit) return hit;
        }
        return null;
    }

    async function build(box) {
        const slug = box.dataset.shots;
        const track = box.querySelector('.shots-track');
        const dots = box.querySelector('.shots-dots');
        const found = [];

        for (let n = 1; n <= MAX; n++) {
            const src = await findOne(slug, n);
            if (!src) break;             // a gap means the end of the set
            found.push(src);
        }
        if (!found.length) return;

        found.forEach((src, i) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';                // decorative: the card text carries the meaning
            img.loading = 'lazy';
            img.decoding = 'async';
            track.appendChild(img);

            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Screenshot ${i + 1}`);
            dot.setAttribute('aria-selected', String(i === 0));
            dot.addEventListener('click', () => {
                track.scrollTo({ left: track.clientWidth * i, behavior: reduceMotion ? 'auto' : 'smooth' });
            });
            dots.appendChild(dot);
        });

        box.hidden = false;

        // keep the dots in step with manual swipes
        let queued = false;
        track.addEventListener('scroll', () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                const i = Math.round(track.scrollLeft / track.clientWidth);
                dots.querySelectorAll('button').forEach((d, k) =>
                    d.setAttribute('aria-selected', String(k === i)));
            });
        }, { passive: true });
    }

    document.querySelectorAll('.shots[data-shots]').forEach(build);
})();

/* ── Console ──────────────────────────────────────────────────────────────── */
(function console_() {
    const box = document.getElementById('term');
    const body = document.getElementById('term-body');
    const input = document.getElementById('term-input');
    const line = body ? body.querySelector('.t-input-line') : null;
    const clearBtn = document.getElementById('term-clear');
    if (!box || !body || !input) return;

    const EMAIL = 'abhiramgirishnaik@gmail.com';
    const RESUME = 'ABHIRAM_RESUME%20.pdf';

    const row = (k, v) => `<div class="t-row"><span class="t-key">${k}</span><span class="t-val">${v}</span></div>`;
    const head = (t) => `<span class="t-head">${t}</span>`;
    const mailTo = () => setTimeout(() => {
        window.location.href = `mailto:${EMAIL}?subject=Interview request — Abhiram Girish Naik`;
    }, 800);

    const cmds = {
        help: {
            info: 'List every command',
            run: () => head('Commands') + '<ul>' +
                Object.keys(cmds).filter((c) => !cmds[c].hidden)
                    .map((c) => `<li><span class="t-cmd">${c}</span>${cmds[c].info}</li>`).join('') +
                '</ul><div class="t-note">↑ / ↓ steps through history · Tab completes a command.</div>'
        },

        whoami: {
            info: 'The short version',
            run: () => head('Identity') +
                row('name', 'Abhiram Girish Naik') +
                row('focus', 'AI × cyber security · full-stack development') +
                row('based', 'Davanagere, Karnataka, India') +
                row('graduating', '2027 — GM University, final year B.Tech') +
                row('cgpa', '9.5+') +
                row('status', 'Open to security &amp; engineering roles') +
                '<div class="t-note">It started with cheat codes — wanting to know what the game was actually made of. Same instinct now, better tools: I have enumerated and assessed vulnerable hosts in the lab, and I have built the SIEM that catches that behaviour. In between I ship full-stack products real people use.</div>'
        },

        skills: {
            info: 'What I work with',
            run: () => head('Skills') +
                row('languages', 'Java, Python, C, JavaScript') +
                row('development', 'MERN stack, Python Flask') +
                row('security', 'Wireshark, Nmap, Burp Suite, Metasploit (basic), Kali Linux') +
                row('foundations', 'Data structures &amp; algorithms') +
                row('leadership', 'Team management, event planning &amp; coordination') +
                row('certification', 'TryHackMe — Pre Security')
        },

        projects: {
            info: 'Three things I built',
            run: () => head('Selected work') + '<ul>' +
                '<li><em>All Safe</em> — AI-powered SIEM: multi-source log collection, event correlation, threat detection, incident reports, automated response.</li>' +
                '<li><em>GM League</em> — registration and live bidding platform. 700+ player sign-ups, 40+ team owners, deployed on a college VM.</li>' +
                '<li><em>Oral Cancer Detection</em> — ResNet CNN on 1000+ images, plus Dr. Aria, a multilingual voice avatar for screening.</li>' +
                '</ul><div class="t-note">Run <b>repos</b> for the source on GitHub.</div>'
        },

        repos: {
            info: 'GitHub links for the projects',
            run: () => head('Source') +
                row('all safe', '<a href="https://github.com/abhiramnaik33/allsafe_HACKMALENADU" target="_blank" rel="noopener">github.com/abhiramnaik33/allsafe_HACKMALENADU</a>') +
                row('gm league', '<a href="https://github.com/abhiramnaik33/GML-EMS" target="_blank" rel="noopener">github.com/abhiramnaik33/GML-EMS</a>') +
                row('o-scan', '<a href="https://github.com/abhiramnaik33/O-SCAN" target="_blank" rel="noopener">github.com/abhiramnaik33/O-SCAN</a>')
        },

        achievements: {
            info: 'Competitions and leadership',
            run: () => head('Recognition') + '<ul>' +
                '<li><em>2nd place</em> — national 24-hour hackathon, Hyderabad</li>' +
                '<li><em>2nd runner up</em> — national 30-hour hackathon, Mumbai</li>' +
                '<li><em>Runner up</em> — Hack Malenadu\'s Karnataka, national 24-hour hackathon</li>' +
                '<li><em>4×</em> national CTF finalist</li>' +
                '<li><em>5×</em> mentor and judge at hackathons</li>' +
                '<li>Elected Technical Secretary, Student Affairs, GM University</li>' +
                '<li>Appointed Membership Chair, ACM Student Chapter</li>' +
                '<li>Co-founded Stackeducation — 50+ students mentored in cybersecurity</li>' +
                '</ul>'
        },

        research: {
            info: 'The published paper',
            run: () => head('Publication') +
                '<div class="t-note">“An Integrated SIEM Approach for Real-Time Threat Detection and Log Analytics in Higher Education ERM Systems”</div>' +
                'The academic work behind All Safe.'
        },

        education: {
            info: 'Degree and grades',
            run: () => head('Education') +
                row('degree', 'B.Tech — Computer Science &amp; Engineering (Cyber Security)') +
                row('institution', 'GM University, Davanagere, Karnataka') +
                row('years', '2023 – 2027 (pursuing)') +
                row('cgpa', '9.5+ cumulative')
        },

        contact: {
            info: 'How to reach me',
            run: () => head('Contact') +
                row('email', `<a href="mailto:${EMAIL}">${EMAIL}</a>`) +
                row('phone', '<a href="tel:+916363962653">+91 63639 62653</a>') +
                row('linkedin', '<a href="https://www.linkedin.com/in/abhiramgirishnaik/" target="_blank" rel="noopener">/in/abhiramgirishnaik</a>') +
                row('github', '<a href="https://github.com/abhiramnaik33" target="_blank" rel="noopener">@abhiramnaik33</a>')
        },

        resume: {
            info: 'Open the resume',
            run: () => {
                setTimeout(() => window.open(RESUME, '_blank', 'noopener'), 220);
                return `Opening the resume…<div class="t-note">If your browser blocked it: <a href="${RESUME}" target="_blank" rel="noopener">open it here</a>.</div>`;
            }
        },

        hire: {
            info: 'Why this is an easy yes',
            run: () => {
                mailTo();
                return head('The case') + '<ul>' +
                    '<li>I ship under pressure — three national hackathon podiums say the clock is not the problem.</li>' +
                    '<li>I have run real systems, not just repositories: 700+ users on a platform I deployed and supported.</li>' +
                    '<li>I understand attack and defence — lab assessments on one side, a working SIEM on the other.</li>' +
                    '<li>I can teach it: 50+ students mentored, five times a hackathon mentor and judge.</li>' +
                    '<li>And the unglamorous part: a 9.5+ CGPA across the degree is just consistency.</li>' +
                    '</ul>' +
                    `<div class="t-note">Opening a draft to <a href="mailto:${EMAIL}">${EMAIL}</a>. If nothing happens, copy the address — I reply the same day.</div>`;
            }
        },

        sudo: {
            info: 'Try it',
            hidden: true,
            run: (a) => {
                if (!/hire/i.test(a.join(' '))) {
                    return '<span class="t-err">abhiram is not in the sudoers file.</span> ' +
                        'This incident has been logged — I do run a SIEM, after all.';
                }
                mailTo();
                return 'Password accepted. Escalating privileges…' +
                    `<div class="t-note">Root granted. Opening a draft to <a href="mailto:${EMAIL}">${EMAIL}</a>.</div>`;
            }
        },

        clear: { info: 'Clear the console', run: () => '__CLEAR__' }
    };

    const alias = {
        about: 'whoami', me: 'whoami', bio: 'whoami',
        work: 'projects', project: 'projects',
        skill: 'skills', stack: 'skills', tech: 'skills',
        awards: 'achievements', experience: 'achievements', wins: 'achievements',
        cv: 'resume', pdf: 'resume',
        github: 'repos', source: 'repos', code: 'repos',
        email: 'contact', reach: 'contact',
        edu: 'education', college: 'education',
        paper: 'research', publication: 'research',
        cls: 'clear', man: 'help', '?': 'help', commands: 'help'
    };

    const past = [];
    let cursor = -1;

    const toBottom = () => { body.scrollTop = body.scrollHeight; };

    function run(raw) {
        const text = raw.trim();
        if (!text) return;

        const echo = document.createElement('div');
        echo.className = 't-line t-echo';
        echo.innerHTML = `<span class="t-prompt">→</span>${text.replace(/</g, '&lt;')}`;
        body.insertBefore(echo, line);

        past.push(text);
        cursor = past.length;

        const bits = text.split(/\s+/);
        let name = bits[0].toLowerCase();
        if (alias[name]) name = alias[name];

        const cmd = cmds[name];
        let html;

        if (!cmd) {
            const near = Object.keys(cmds).find((c) => c.startsWith(name.slice(0, 3)));
            html = `<span class="t-err">command not found:</span> ${name.replace(/</g, '&lt;')}` +
                (near ? ` — did you mean <b>${near}</b>?` : '') +
                `<div class="t-note">Run <b>help</b> for the full list.</div>`;
        } else {
            try {
                html = cmd.run(bits.slice(1));
            } catch (err) {
                html = `<span class="t-err">${name} failed:</span> ${String(err.message || err)}`;
            }
        }

        if (html === '__CLEAR__') {
            body.querySelectorAll('.t-line:not(.t-input-line), .t-out').forEach((n) => n.remove());
        } else {
            const out = document.createElement('div');
            out.className = 't-out';
            out.innerHTML = html;
            body.insertBefore(out, line);
        }
        toBottom();
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            run(input.value);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cursor > 0) input.value = past[--cursor];
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (cursor < past.length - 1) input.value = past[++cursor];
            else { cursor = past.length; input.value = ''; }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const p = input.value.trim().toLowerCase();
            if (!p) return;
            const pool = Object.keys(cmds).filter((c) => !cmds[c].hidden).concat(Object.keys(alias));
            const hit = pool.find((c) => c.startsWith(p));
            if (hit) input.value = hit;
        }
    });

    body.addEventListener('click', () => input.focus());
    document.querySelectorAll('.chip').forEach((c) => {
        c.addEventListener('click', () => { run(c.dataset.cmd); input.focus(); });
    });
    if (clearBtn) clearBtn.addEventListener('click', () => {
        body.querySelectorAll('.t-line:not(.t-input-line), .t-out').forEach((n) => n.remove());
        input.focus();
    });

    window.runConsole = run;

    // Run whoami once, when the console first comes into view, so it is never empty.
    let done = false;
    new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting && !done) { done = true; setTimeout(() => run('whoami'), 420); }
        });
    }, { threshold: 0.3 }).observe(box);
})();

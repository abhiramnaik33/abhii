/* ==========================================================================
   ABHIRAM GIRISH NAIK — portfolio behaviour
   Deliberately small: reveals, nav state, portrait unmask, work modal, console.
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

/* ── "What I do" cards jump to the matching project card ──────────────────── */
(function jumps() {
    const behavior = reduceMotion ? 'auto' : 'smooth';

    document.querySelectorAll('.do-card[data-jump]').forEach((card) => {
        card.addEventListener('click', (e) => {
            const target = document.getElementById('p-' + card.dataset.jump);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior, block: 'center' });
        });
    });

    // Cards with no project of their own answer through the console instead.
    document.querySelectorAll('.do-card[data-cmd]').forEach((card) => {
        card.addEventListener('click', (e) => {
            const term = document.getElementById('term');
            if (!term || !window.runConsole) return;
            e.preventDefault();
            term.scrollIntoView({ behavior, block: 'center' });
            setTimeout(() => window.runConsole(card.dataset.cmd), reduceMotion ? 0 : 600);
        });
    });
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

/* ── Project data ─────────────────────────────────────────────────────────── */
const projects = {
    allsafe: {
        kicker: 'Detection engineering',
        title: 'All Safe — AI-Powered SIEM',
        stack: ['Python', 'Flask', 'SQLAlchemy', 'JavaScript'],
        lede: 'A Security Incident &amp; Event Management platform built on the idea that detection is only useful when the response is already wired up.',
        how: [
            '<b>Multi-source ingestion.</b> Collects logs from several different sources and normalises them into one queryable event store.',
            '<b>Event correlation.</b> Ties related events together, so a pattern spread across separate log streams reads as one incident instead of noise.',
            '<b>Threat detection.</b> Surfaces potential threats out of correlated activity rather than raising an alert per raw line.',
            '<b>Incident reporting.</b> Generates detailed reports so an analyst inherits context, not a log dump.',
            '<b>Automated response.</b> Response actions fire automatically, shortening the gap between detection and containment.'
        ],
        why: [
            'It is the system behind my published paper on integrated SIEM for real-time threat detection and log analytics in higher-education ERM systems.',
            'I built the whole thing — ingestion, correlation logic, data layer and the analyst-facing interface.'
        ]
    },

    kioptrix: {
        kicker: 'Offensive security',
        title: 'Kioptrix Level 1.1',
        stack: ['Nmap', 'Nikto', 'ARP Scan', 'Kali Linux'],
        lede: 'A comprehensive vulnerability assessment and enumeration of the Kioptrix Level 1.1 machine, carried out end to end in a controlled lab environment.',
        how: [
            '<b>Host discovery.</b> Mapped the lab segment with ARP Scan to locate the live target.',
            '<b>Service enumeration.</b> Nmap scanning to establish open ports, running services and version fingerprints.',
            '<b>Web surface assessment.</b> Nikto sweeps against the exposed web services to enumerate misconfigurations and known-vulnerable components.',
            '<b>Documentation.</b> Findings recorded as a structured assessment rather than loose terminal output.'
        ],
        why: [
            'Produced a full picture of the target\'s attack surface from an unauthenticated starting position.',
            'Recon and enumeration is the phase every real engagement is built on — and it is the same instinct I bring to the defensive side.'
        ]
    },

    gmleague: {
        kicker: 'Production web platform',
        title: 'GM League',
        stack: ['Python', 'Flask', 'SQLAlchemy', 'JavaScript'],
        lede: 'A web platform that took a university tournament off spreadsheets: player and team-owner registration, plus the live bidding process that decides who ends up on which roster.',
        how: [
            '<b>Registration at scale.</b> Handled <b>700+ player sign-ups</b> and <b>40+ team owners</b> through a single flow.',
            '<b>Bidding workflow.</b> Managed the auction process so owners could bid without organisers refereeing a spreadsheet.',
            '<b>Real deployment.</b> Hosted on a college-allotted virtual machine — provisioning, deployment and uptime were mine, not a platform\'s.'
        ],
        why: [
            'It ran a live event for 700+ participants. The failure mode was a room full of people, not a failing test.',
            'End-to-end ownership: requirements from the organisers, build, deploy, and support while it mattered.'
        ]
    },

    cancer: {
        kicker: 'Applied machine learning',
        title: 'Oral Cancer Detection System',
        stack: ['CNN / ResNet', 'Flask', 'Python', 'JavaScript'],
        lede: 'A screening application built on the belief that voice, not forms, is how most people will actually talk to computers.',
        how: [
            '<b>The model.</b> A CNN (ResNet) trained on <b>1000+ images</b>, reaching strong accuracy on the screening task.',
            '<b>Two signals.</b> Patients are assessed on uploaded images <em>and</em> on habitual risk factors, not on the image alone.',
            '<b>Doctor in the loop.</b> The app connects patients through to doctors rather than ending at a model output.',
            '<b>Dr. Aria.</b> A multilingual virtual-doctor avatar that makes voice-based screening simple for patients who would never fill in a clinical form.'
        ],
        why: [
            'It turns a model into something a non-technical patient can use — in their own language.',
            'Covers the full pipeline: dataset, training, API, front end, and the voice layer on top.'
        ]
    }
};

/* ── Work modal ───────────────────────────────────────────────────────────── */
(function modal() {
    const el = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close');
    if (!el || !body) return;

    let lastFocus = null;

    function open(id) {
        const p = projects[id];
        if (!p) return;
        lastFocus = document.activeElement;

        body.innerHTML =
            `<p class="m-kicker">${p.kicker}</p>` +
            `<h3 class="m-title">${p.title}</h3>` +
            `<p class="m-lede">${p.lede}</p>` +
            `<div class="m-stack">${p.stack.map((s) => `<span>${s}</span>`).join('')}</div>` +
            `<p class="m-sub">How it works</p>` +
            `<ul class="m-list">${p.how.map((h) => `<li>${h}</li>`).join('')}</ul>` +
            `<p class="m-sub">Why it matters</p>` +
            `<ul class="m-list">${p.why.map((w) => `<li>${w}</li>`).join('')}</ul>`;

        el.classList.add('open');
        el.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // The panel is still visibility:hidden this tick, so focus() would be a no-op.
        // Wait one frame for the style flush before moving focus into the dialog.
        const panel = el.querySelector('.modal-panel');
        requestAnimationFrame(() => (panel || closeBtn).focus());
    }

    function close() {
        el.classList.remove('open');
        el.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }

    // Real <button>s, so Enter/Space keyboard activation comes for free.
    document.querySelectorAll('.go[data-project]').forEach((btn) => {
        btn.addEventListener('click', () => open(btn.dataset.project));
    });

    closeBtn.addEventListener('click', close);
    el.addEventListener('click', (e) => { if (e.target === el) close(); });

    window.addEventListener('keydown', (e) => {
        if (!el.classList.contains('open')) return;

        if (e.key === 'Escape') { close(); return; }

        // Keep Tab inside the dialog while it is open.
        if (e.key !== 'Tab') return;
        const focusable = el.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        // Focus drifted out of the dialog entirely — pull it back.
        if (!el.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
            return;
        }

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    window.openProject = open;
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
                row('focus', 'Cyber security · full-stack development') +
                row('based', 'Davanagere, Karnataka, India') +
                row('graduating', '2027 — GM University') +
                row('cgpa', '9.5+') +
                row('status', 'Open to security &amp; engineering roles') +
                '<div class="t-note">I work both sides of the line: I have enumerated and assessed vulnerable hosts in the lab, and I have built the SIEM that catches that behaviour. In between I ship full-stack products real people use.</div>'
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
            info: 'Four things I built',
            run: () => head('Selected work') + '<ul>' +
                '<li><em>All Safe</em> — AI-powered SIEM: multi-source log collection, event correlation, threat detection, incident reports, automated response.</li>' +
                '<li><em>Kioptrix 1.1</em> — full vulnerability assessment and enumeration of a vulnerable host in a controlled Kali lab.</li>' +
                '<li><em>GM League</em> — registration and live bidding platform. 700+ player sign-ups, 40+ team owners, deployed on a college VM.</li>' +
                '<li><em>Oral Cancer Detection</em> — ResNet CNN on 1000+ images, plus Dr. Aria, a multilingual voice avatar for screening.</li>' +
                '</ul><div class="t-note">Run <b>open allsafe</b>, <b>open kioptrix</b>, <b>open gmleague</b> or <b>open cancer</b> for the full breakdown.</div>'
        },

        open: {
            info: 'Open a project — e.g. open allsafe',
            run: (a) => {
                const k = (a[0] || '').toLowerCase();
                if (!k) return '<span class="t-err">usage:</span> open &lt;allsafe | kioptrix | gmleague | cancer&gt;';
                if (!projects[k]) return `<span class="t-err">no such project:</span> ${k}`;
                setTimeout(() => window.openProject && window.openProject(k), 200);
                return `Opening <em>${projects[k].title}</em>…`;
            }
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

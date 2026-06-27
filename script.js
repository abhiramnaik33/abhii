/* -------------------------------------------------------------
   1. CANVAS BACKDROP MATRIX DIGITAL RAIN
   Subtle glowing cyan binary stream
------------------------------------------------------------- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Calculate columns based on width
const fontSize = 16;
let columns = Math.floor(width / fontSize);
let yPositions = Array(columns).fill(0).map(() => Math.random() * -height);

// Drawing loop
function drawMatrixRain() {
    // Semi-transparent background clear to create fade trail
    ctx.fillStyle = 'rgba(4, 8, 20, 0.08)'; // Matches space-slate bg-primary
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00f0ff'; // Cyan accent code
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < columns; i++) {
        // Random binary code character
        const char = Math.random() > 0.5 ? '1' : '0';
        const x = i * fontSize;
        const y = yPositions[i];

        ctx.fillText(char, x, y);

        // Reset column if it exceeds viewport height with random delay offset
        if (y > height && Math.random() > 0.98) {
            yPositions[i] = 0;
        } else {
            yPositions[i] += fontSize;
        }
    }
}

// Kickstart animation at ~30 FPS (33ms interval)
let rainInterval = setInterval(drawMatrixRain, 33);

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    // Recalculate columns on resize
    columns = Math.floor(width / fontSize);
    yPositions = Array(columns).fill(0).map(() => Math.random() * -height);
});


/* -------------------------------------------------------------
   2. CARD GLOW EFFECT (MOUSE COORDINATE TRACKER)
------------------------------------------------------------- */
function initCardGlow() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}
document.addEventListener('DOMContentLoaded', initCardGlow);


/* -------------------------------------------------------------
   3. SCROLL METRICS & NAVIGATION ACTIVE HIGHLIGHT
------------------------------------------------------------- */
const mainHeader = document.getElementById('main-header');
const scrollProgress = document.getElementById('scroll-progress');
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Add backdrop blurring class to header on scroll
    if (scrollY > 50) {
        mainHeader.classList.add('scrolled');
    } else {
        mainHeader.classList.remove('scrolled');
    }

    // Scroll progress calculator
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
        const scrolledPercentage = (scrollY / docHeight) * 100;
        scrollProgress.style.width = `${scrolledPercentage}%`;
    }
});

// Highlight Nav links on scrolling
const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px', // focused in top-middle third
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const activeId = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${activeId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));


/* -------------------------------------------------------------
   4. DYNAMIC PROJECTS SPEC MODAL SYSTEM
------------------------------------------------------------- */
const projectModal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body-content');

// Content DB for all 4 project highlights
const projectDatabase = {
    allsafe: {
        title: "Allsafe SIEM System",
        type: "Security Incident & Event Management",
        tech: ["Python", "Flask", "SQLAlchemy", "Log Correlation", "Async Thread Pools"],
        desc: "A comprehensive log ingestion and analytics platform built to solve database locking during multi-stream logs inputs. Ingests raw event logs, parses metadata using custom regex profiles, and correlates concurrent events to trigger alerts based on defined indicators of compromise (IoC).",
        specs: [
            "Ingestion Engine: Asynchronous queue worker thread pool in Flask to avoid API blocking.",
            "Database Tuning: Heavily indexed SQLite / relational schemas to handle sub-second queries on 10,000+ entries.",
            "Parsing profiles: Customizable Regex parser templates for standard syslog, Nginx, SSH, and auth logs."
        ],
        outcomes: [
            "Tested and handles log rates of up to 1,500 entries per minute smoothly on single-core host environments.",
            "Successfully correlates brute-force SSH triggers (5+ failed attempts in 10s) with active geolocation anomaly flags."
        ]
    },
    kioptrix: {
        title: "Kioptrix Level 1.1 Lab Audit",
        type: "Penetration Testing & Security Audit",
        tech: ["Nmap", "Kali Linux", "Nikto", "SQL Injection", "Local Privilege Escalation"],
        desc: "Conducted complete vulnerability scanning, enumeration, exploitation, and post-exploitation privilege escalation on the Kioptrix virtual target machine, simulating real-world adversary behavior.",
        specs: [
            "Reconnaissance: Port scanning and service version detection using custom Nmap script vectors.",
            "Initial Exploitation: Identified and bypassed web console authentication through raw SQL Injection inputs.",
            "Reverse Access: Spawned interactive Netcat shell connectivity back to Kali Linux sandbox handler.",
            "Privilege Escalation: Discovered kernel version details, compiled a matching local privilege escalation script, and obtained administrative root access."
        ],
        outcomes: [
            "Obtained full root privileges and read the secure user flags.",
            "Documented absolute vulnerabilities and drafted remediation guidelines matching OWASP standards."
        ]
    },
    gmleague: {
        title: "GM League Event Draft Platform",
        type: "Auction Bidding & Live Portal",
        tech: ["Python", "Flask", "SQLite", "SQLAlchemy", "Concurrent Session Lock Management"],
        desc: "High-concurrency sports player draft bidding platform designed for GM University sports tournaments, supporting Team Owners to bid on registered athletes in real-time.",
        specs: [
            "Draft Size: Supported 700+ registered student athletes, divided across active sport brackets.",
            "Concurrent Operations: Maintained strict session lock synchronization for bidding transactions, resolving race conditions between 40+ concurrent team bidding consoles.",
            "Performance Optimization: Deployed index paths on sqlite queries, minimizing search latency to less than 200ms under heavy page reload sweeps."
        ],
        outcomes: [
            "Successfully hosted locally on GM University allocated virtual machines.",
            "Orchestrated multiple tournament seasons without data conflicts or transactional losses."
        ]
    },
    cancer: {
        title: "AI Cancer Classification",
        type: "Deep Learning & Vision Web App",
        tech: ["ResNet (CNN)", "Flask", "Web Speech API", "Computer Vision", "Speech Recognition"],
        desc: "A medical screening dashboard prototype that combines a custom ResNet convolutional neural network image classifier with a voice-activated doctor avatar named Dr. Aria.",
        specs: [
            "Classifier Model: Fine-tuned ResNet architecture on 1,000+ benchmarked dermatological lesion images.",
            "Interactive Speech: Handled user response parsing directly in the browser via JavaScript Web Speech API (no cloud latency).",
            "Doctor Avatar: Dynamic Dr. Aria avatar responds in real-time to voice inputs to guide patients through standard pre-screen check questionnaires."
        ],
        outcomes: [
            "Achieved model validation score of 87%+ on baseline dermoscopic testing images.",
            "Bypassed server voice processing lag completely by executing transcription and speech synthesis locally in browser window thread pools."
        ]
    }
};

function openProjectModal(projectId) {
    const data = projectDatabase[projectId];
    if (!data) return;

    // Construct modal HTML dynamically
    let modalHTML = `
        <h3>${data.title}</h3>
        <div class="meta-details">
            <span class="spec-label">${data.type}</span>
            ${data.tech.map(t => `<span class="spec-label" style="background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.2); color: #818cf8;">${t}</span>`).join('')}
        </div>
        <p>${data.desc}</p>
        
        <h4 class="modal-section-title">Technical Specifications</h4>
        <ul class="modal-list">
            ${data.specs.map(s => `<li>${s}</li>`).join('')}
        </ul>
        
        <h4 class="modal-section-title">Impact &amp; Outcomes</h4>
        <ul class="modal-list">
            ${data.outcomes.map(o => `<li>${o}</li>`).join('')}
        </ul>
    `;

    modalBody.innerHTML = modalHTML;
    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock page scroll
}

function closeProjectModal() {
    projectModal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock page scroll
}

// Close modal on Escape key press
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal.classList.contains('active')) {
        closeProjectModal();
    }
});

/* -------------------------------------------------------------
   5. DYNAMIC THEME SWITCHER
------------------------------------------------------------- */
const themePresets = {
    cyan: {
        '--bg-primary': '#040814',
        '--bg-secondary': '#090e1c',
        '--bg-card': 'rgba(9, 14, 28, 0.55)',
        '--accent': '#00f0ff',
        '--accent-glow': 'rgba(0, 240, 255, 0.35)',
        '--secondary-accent': '#3b82f6',
        '--secondary-glow': 'rgba(59, 130, 246, 0.25)',
        '--border-color': 'rgba(0, 240, 255, 0.08)',
        '--border-hover': 'rgba(0, 240, 255, 0.3)'
    },
    gold: {
        '--bg-primary': '#0b0907',
        '--bg-secondary': '#13100c',
        '--bg-card': 'rgba(19, 16, 12, 0.55)',
        '--accent': '#f59e0b',
        '--accent-glow': 'rgba(245, 158, 11, 0.35)',
        '--secondary-accent': '#d97706',
        '--secondary-glow': 'rgba(217, 119, 6, 0.25)',
        '--border-color': 'rgba(245, 158, 11, 0.08)',
        '--border-hover': 'rgba(245, 158, 11, 0.3)'
    },
    emerald: {
        '--bg-primary': '#030704',
        '--bg-secondary': '#08110b',
        '--bg-card': 'rgba(8, 17, 11, 0.55)',
        '--accent': '#10b981',
        '--accent-glow': 'rgba(16, 185, 129, 0.35)',
        '--secondary-accent': '#059669',
        '--secondary-glow': 'rgba(5, 150, 105, 0.25)',
        '--border-color': 'rgba(16, 185, 129, 0.08)',
        '--border-hover': 'rgba(16, 185, 129, 0.3)'
    },
    purple: {
        '--bg-primary': '#0b0713',
        '--bg-secondary': '#120b20',
        '--bg-card': 'rgba(18, 11, 32, 0.55)',
        '--accent': '#d946ef',
        '--accent-glow': 'rgba(217, 70, 239, 0.35)',
        '--secondary-accent': '#8b5cf6',
        '--secondary-glow': 'rgba(139, 92, 246, 0.25)',
        '--border-color': 'rgba(217, 70, 239, 0.08)',
        '--border-hover': 'rgba(217, 70, 239, 0.3)'
    },
    silver: {
        '--bg-primary': '#080808',
        '--bg-secondary': '#121212',
        '--bg-card': 'rgba(18, 18, 18, 0.55)',
        '--accent': '#e5e7eb',
        '--accent-glow': 'rgba(229, 231, 235, 0.35)',
        '--secondary-accent': '#9ca3af',
        '--secondary-glow': 'rgba(156, 163, 175, 0.25)',
        '--border-color': 'rgba(229, 231, 235, 0.08)',
        '--border-hover': 'rgba(229, 231, 235, 0.3)'
    }
};

const toggleBtn = document.getElementById('theme-toggle-btn');
const panel = document.getElementById('theme-panel');
const optionBtns = document.querySelectorAll('.theme-opt-btn');

// Toggle open state
if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('open');
    });
    
    // Close panel on body click
    document.addEventListener('click', () => {
        panel.classList.remove('open');
    });
    panel.addEventListener('click', (e) => e.stopPropagation());
}

// Handle preset selection
optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const themeName = btn.getAttribute('data-theme');
        applyTheme(themeName);
        
        // Update active state in UI
        optionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

function applyTheme(themeName) {
    const theme = themePresets[themeName];
    if (!theme) return;
    
    const root = document.documentElement;
    Object.keys(theme).forEach(key => {
        root.style.setProperty(key, theme[key]);
    });
    
    localStorage.setItem('portfolio-theme', themeName);
}

// Load saved theme
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme && themePresets[savedTheme]) {
    applyTheme(savedTheme);
    optionBtns.forEach(btn => {
        if (btn.getAttribute('data-theme') === savedTheme) {
            optionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    });
}

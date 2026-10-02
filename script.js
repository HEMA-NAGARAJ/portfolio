/**
 * HEMA N - Portfolio Interactive Engine
 * Advanced Cyber-Modern UI & Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ==========================================
     1. SYNTHESIZED SOUND FX (Web Audio API)
     ========================================== */
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playBeep(freq = 600, type = 'sine', duration = 0.06, vol = 0.05) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        soundToggle.classList.add('text-cyan-400');
        playBeep(880, 'triangle', 0.08, 0.08);
      } else {
        soundToggle.classList.remove('text-cyan-400');
      }
      if (soundIcon) {
        soundIcon.setAttribute('data-lucide', soundEnabled ? 'volume-2' : 'volume-x');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // Attach subtle audio feedback to all interactive buttons
  document.querySelectorAll('button, .nav-link, .social-pill, .cmd-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      playBeep(480, 'sine', 0.04, 0.03);
    });
  });

  /* ==========================================
     2. DYNAMIC PARTICLE BACKGROUND CANVAS
     ========================================== */
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 15), 85);
    const mouse = { x: null, y: null, radius: 140 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 1.8 + 0.8;
        this.color = Math.random() > 0.4 ? 'rgba(56, 189, 248, ' : 'rgba(139, 92, 246, ';
        this.baseAlpha = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse avoidance/interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 3;
            this.y -= (dy / dist) * force * 3;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.baseAlpha + ')';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const alpha = (1 - dist / 115) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  /* ==========================================
     3. TYPEWRITER EFFECT
     ========================================== */
  const typedEl = document.getElementById('typedText');
  if (typedEl) {
    const roles = [
      'Full Stack Developer',
      'Python & Flask Engineer',
      'B.Sc Computer Science Scholar',
      'AI & IoT Specialist',
      'Academic Proficiency Honoree'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        typedEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typedEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 110;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        typingSpeed = 1800; // Pause at end of text
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 400; // Pause before typing new
      }

      setTimeout(type, typingSpeed);
    }
    type();
  }

  /* ==========================================
     4. SKILLS FILTERING TABS
     ========================================== */
  const filterBtns = document.querySelectorAll('.skill-filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
          card.classList.add('animate-fadeIn');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================
     5. INTERACTIVE TERMINAL ENGINE
     ========================================== */
  const terminalForm = document.getElementById('terminalForm');
  const terminalInput = document.getElementById('terminalInput');
  const terminalBody = document.getElementById('terminalBody');
  const openTerminalBtn = document.getElementById('openTerminalBtn');

  const commands = {
    help: () => `
<div class="text-cyan-400 font-bold">AVAILABLE COMMANDS:</div>
<div class="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
  <div><span class="text-emerald-400">whoami</span> - About Hema N</div>
  <div><span class="text-emerald-400">skills</span> - Technical skill set</div>
  <div><span class="text-emerald-400">projects</span> - View full-stack projects</div>
  <div><span class="text-emerald-400">education</span> - Academic background</div>
  <div><span class="text-emerald-400">experience</span> - Internship & workshop</div>
  <div><span class="text-emerald-400">certifications</span> - Verified credentials</div>
  <div><span class="text-emerald-400">contact</span> - Reach out details</div>
  <div><span class="text-emerald-400">sudo hire</span> - Direct recruitment trigger</div>
  <div><span class="text-emerald-400">clear</span> - Clear the terminal screen</div>
</div>`,
    
    whoami: () => `
<div class="space-y-1">
  <div class="text-white font-bold">Hema N</div>
  <div>B.Sc Computer Science Student at Dr.N.G.P Arts and Science College (CGPA: 8.43)</div>
  <div class="text-slate-400">Specializes in Python, Full Stack Web Development, Relational Databases, and IoT architectures.</div>
  <div class="text-emerald-400">Honored with Academic Proficiency Award.</div>
</div>`,

    about: () => commands.whoami(),

    skills: () => `
<div class="space-y-1">
  <div><strong class="text-cyan-400">Languages:</strong> C, Python</div>
  <div><strong class="text-orange-400">Web Tech:</strong> HTML5, CSS3, JavaScript, Flask</div>
  <div><strong class="text-emerald-400">Database:</strong> SQL (Relational Schema & Queries)</div>
  <div><strong class="text-indigo-400">Tools:</strong> VS Code, Microsoft Word, Git</div>
  <div><strong class="text-pink-400">Soft Skills:</strong> Communication, Time Management, Dedicated, Leadership, Team Collaboration</div>
</div>`,

    projects: () => `
<div class="p-2 rounded bg-slate-900 border border-white/10 space-y-1">
  <div class="text-emerald-400 font-bold">STUDENT COURSE REGISTRATION SYSTEM</div>
  <div class="text-slate-400 text-xs">Domain: Full Stack Web Engineering</div>
  <div class="text-xs">Stack: HTML, CSS, JavaScript, Python Flask, SQL</div>
  <div class="text-xs text-slate-300">Automates student enrollment, course catalog, quota checks, and academic schedule management.</div>
</div>`,

    education: () => `
<div class="space-y-1">
  <div><strong class="text-white">Under Graduation:</strong> B.Sc Computer Science, Dr.N.G.P Arts & Science College (CGPA: <span class="text-cyan-400 font-bold">8.43</span>)</div>
  <div><strong class="text-white">Higher Secondary:</strong> Sree Dharmasastha Matric HSS (<span class="text-indigo-400 font-bold">93.3% & 87.3%</span>)</div>
  <div><strong class="text-white">SSLC (10th):</strong> Sree Dharmasastha Matric HSS (<span class="text-slate-300 font-bold">83.8%</span>)</div>
</div>`,

    experience: () => `
<div class="space-y-1">
  <div><strong class="text-amber-400">Internship:</strong> SubZero Technologies, Coimbatore (30 Days Practical Exposure)</div>
  <div><strong class="text-cyan-400">Workshop:</strong> Hands-on Internet of Things (IoT) Workshop at Dr. N.G.P Arts & Science College</div>
</div>`,

    certifications: () => `
<div class="space-y-1">
  <div>★ <strong class="text-amber-300">Academic Proficiency Award</strong> - Dr. N.G.P. College</div>
  <div>✓ <strong class="text-blue-400">Aptis English Test</strong> - British Council</div>
  <div>✓ <strong class="text-cyan-400">Introduction to IoT</strong> - NPTEL</div>
  <div>✓ <strong class="text-purple-400">Artificial Intelligence and Machine Learning</strong> - NCVRT</div>
</div>`,

    contact: () => `
<div class="space-y-1">
  <div><span class="text-slate-400">Email:</span> <a href="mailto:backiyahema12@gmail.com" class="text-cyan-400 underline">backiyahema12@gmail.com</a></div>
  <div><span class="text-slate-400">Phone:</span> <a href="tel:+919363876723" class="text-emerald-400 underline">+91 9363876723</a></div>
  <div><span class="text-slate-400">LinkedIn:</span> <a href="https://www.linkedin.com/in/hema-n-cs/" target="_blank" class="text-blue-400 underline">linkedin.com/in/hema-n-cs</a></div>
  <div><span class="text-slate-400">Location:</span> Coimbatore, Tamil Nadu, India</div>
</div>`,

    hire: () => `
<div class="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 space-y-1">
  <div class="text-emerald-300 font-bold">ACCESS GRANTED: Candidate Ready For Onboarding! 🚀</div>
  <div class="text-xs text-slate-300">Initiating recruitment protocol...</div>
  <div class="text-xs text-cyan-300">Redirecting to contact form or email: backiyahema12@gmail.com</div>
</div>`,

    'sudo hire': () => commands.hire(),

    clear: () => {
      if (terminalBody) terminalBody.innerHTML = '';
      return '';
    }
  };

  function executeCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    playBeep(700, 'triangle', 0.05, 0.05);

    if (cmd === 'clear') {
      commands.clear();
      return;
    }

    // Append input line
    const userLine = document.createElement('div');
    userLine.className = 'flex items-center gap-2 text-cyan-300';
    userLine.innerHTML = `<span class="text-emerald-400 font-bold">hema@portfolio:~$</span><span>${escapeHtml(rawCmd)}</span>`;
    terminalBody.appendChild(userLine);

    // Append output line
    const outputLine = document.createElement('div');
    outputLine.className = 'pl-4 text-slate-300';

    if (commands[cmd]) {
      outputLine.innerHTML = commands[cmd]();
    } else {
      outputLine.innerHTML = `<span class="text-rose-400">Command not found: '${escapeHtml(rawCmd)}'. Type <span class="text-cyan-400 font-bold">'help'</span> for list of commands.</span>`;
    }

    terminalBody.appendChild(outputLine);
    terminalBody.scrollTop = terminalBody.scrollHeight;

    // Special action for hire
    if (cmd === 'hire' || cmd === 'sudo hire') {
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 700);
    }
  }

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeCommand(terminalInput.value);
      terminalInput.value = '';
    });
  }

  // Quick Command Pills
  document.querySelectorAll('.cmd-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      executeCommand(cmd);
    });
  });

  // Open Terminal Button scroll helper
  if (openTerminalBtn) {
    openTerminalBtn.addEventListener('click', () => {
      const term = document.getElementById('terminalBody');
      if (term) {
        term.scrollIntoView({ behavior: 'smooth' });
        if (terminalInput) terminalInput.focus();
      }
    });
  }

  /* ==========================================
     6. PROJECT SIMULATOR RUN
     ========================================== */
  const quickTestEnrollBtn = document.getElementById('quickTestEnrollBtn');
  if (quickTestEnrollBtn) {
    quickTestEnrollBtn.addEventListener('click', () => {
      quickTestEnrollBtn.disabled = true;
      quickTestEnrollBtn.innerHTML = `<span class="animate-spin inline-block mr-1">⟳</span> Validating...`;

      playBeep(520, 'sine', 0.1, 0.05);

      setTimeout(() => {
        playBeep(940, 'triangle', 0.15, 0.08);
        quickTestEnrollBtn.innerHTML = `✓ Enrolled Successfully!`;
        quickTestEnrollBtn.classList.remove('bg-emerald-500/20', 'text-emerald-300');
        quickTestEnrollBtn.classList.add('bg-emerald-500', 'text-slate-950', 'font-bold');

        setTimeout(() => {
          quickTestEnrollBtn.disabled = false;
          quickTestEnrollBtn.innerHTML = `Simulate Run`;
          quickTestEnrollBtn.classList.add('bg-emerald-500/20', 'text-emerald-300');
          quickTestEnrollBtn.classList.remove('bg-emerald-500', 'text-slate-950', 'font-bold');
        }, 3000);
      }, 800);
    });
  }

  /* ==========================================
     7. MODAL CONTROLS (Resume & Project Details)
     ========================================== */
  const resumeModal = document.getElementById('resumeModal');
  const resumeModalBtn = document.getElementById('resumeModalBtn');
  const closeResumeModalBtn = document.getElementById('closeResumeModalBtn');
  const printCvBtn = document.getElementById('printCvBtn');

  if (resumeModalBtn && resumeModal) {
    resumeModalBtn.addEventListener('click', () => {
      resumeModal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (closeResumeModalBtn && resumeModal) {
    closeResumeModalBtn.addEventListener('click', () => {
      resumeModal.classList.add('hidden');
    });
  }

  if (printCvBtn) {
    printCvBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const projectModal = document.getElementById('projectModal');
  const projectDetailsBtn = document.getElementById('projectDetailsBtn');
  const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');

  if (projectDetailsBtn && projectModal) {
    projectDetailsBtn.addEventListener('click', () => {
      projectModal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (closeProjectModalBtn && projectModal) {
    closeProjectModalBtn.addEventListener('click', () => {
      projectModal.classList.add('hidden');
    });
  }

  // Close modals on clicking backdrop or ESC key
  window.addEventListener('click', (e) => {
    if (e.target === resumeModal) resumeModal.classList.add('hidden');
    if (e.target === projectModal) projectModal.classList.add('hidden');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (resumeModal) resumeModal.classList.add('hidden');
      if (projectModal) projectModal.classList.add('hidden');
    }
  });

  /* ==========================================
     8. CLIPBOARD COPY UTILITY
     ========================================== */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (navigator.clipboard && textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          playBeep(880, 'sine', 0.1, 0.08);
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `<span class="text-emerald-400 font-mono text-xs">Copied!</span>`;
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            if (window.lucide) window.lucide.createIcons();
          }, 2000);
        });
      }
    });
  });

  /* ==========================================
     9. INTERACTIVE CONTACT FORM
     ========================================== */
  const contactForm = document.getElementById('contactForm');
  const formToast = document.getElementById('formToast');
  const toastMsg = document.getElementById('toastMsg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value || 'Portfolio Inquiry';
      const message = document.getElementById('message').value;

      playBeep(640, 'triangle', 0.15, 0.08);

      if (formToast && toastMsg) {
        toastMsg.textContent = `Thank you, ${name}! Launching email client for backiyahema12@gmail.com...`;
        formToast.classList.remove('hidden');
      }

      // Format mailto link
      const mailtoUrl = `mailto:backiyahema12@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 600);
    });
  }

  /* ==========================================
     10. MOBILE NAVIGATION MENU
     ========================================== */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});

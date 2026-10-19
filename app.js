(() => {
  const NAME_KEY = 'dsr_name';
  const SKIP_KEY = 'dsr_name_skipped';
  const BLOCKS = ['mañana', 'tarde', 'noche'];

  function todayKey() {
    const iso = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time
    return `dsr_tasks_${iso}`;
  }

  function getMomentIndex(hour) {
    if (hour >= 5 && hour < 12) return 0;  // mañana
    if (hour >= 12 && hour < 19) return 1; // tarde
    return 2;                              // noche
  }

  function getGreetingWord(momentIndex) {
    if (momentIndex === 0) return 'buenos días';
    if (momentIndex === 1) return 'buenas tardes';
    return 'buenas noches';
  }

  // ---------- Tasks storage ----------
  let tasks = loadTasks();

  function loadTasks() {
    try {
      const raw = localStorage.getItem(todayKey());
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore corrupt data */ }
    return { mañana: [], tarde: [], noche: [] };
  }

  function saveTasks() {
    try {
      localStorage.setItem(todayKey(), JSON.stringify(tasks));
    } catch (e) { /* storage unavailable, continue without persistence */ }
  }

  function addTask(block, text) {
    tasks[block].push({ id: Date.now() + Math.random().toString(16).slice(2), text, done: false });
    saveTasks();
    renderList(block);
  }

  function toggleTask(block, id) {
    const t = tasks[block].find(t => t.id === id);
    if (t) t.done = !t.done;
    saveTasks();
    renderList(block);
  }

  function removeTask(block, id) {
    tasks[block] = tasks[block].filter(t => t.id !== id);
    saveTasks();
    renderList(block);
  }

  function renderList(block) {
    const ul = document.getElementById(`list-${block}`);
    ul.innerHTML = '';
    tasks[block].forEach(t => {
      const li = document.createElement('li');
      li.className = 'task-item' + (t.done ? ' done' : '');

      const check = document.createElement('button');
      check.className = 'task-check';
      check.setAttribute('aria-label', 'marcar tarea');
      check.innerHTML = '<svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.5"/></svg>';
      check.addEventListener('click', () => toggleTask(block, t.id));

      const span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = t.text;

      const remove = document.createElement('button');
      remove.className = 'task-remove';
      remove.textContent = '✕';
      remove.setAttribute('aria-label', 'quitar tarea');
      remove.addEventListener('click', () => removeTask(block, t.id));

      li.appendChild(check);
      li.appendChild(span);
      li.appendChild(remove);
      ul.appendChild(li);
    });
  }

  function renderAllLists() {
    BLOCKS.forEach(renderList);
  }

  // ---------- Greeting + block visibility (past blocks disappear) ----------
  function updateMoment() {
    const hour = new Date().getHours();
    const momentIndex = getMomentIndex(hour);
    const momentKey = BLOCKS[momentIndex];

    const name = localStorage.getItem(NAME_KEY);
    const greetingWord = getGreetingWord(momentIndex);
    document.getElementById('greeting').textContent = name
      ? `${greetingWord}, ${name}`
      : greetingWord;

    // Hide any block whose moment has already passed today.
    BLOCKS.forEach((block, i) => {
      const section = document.getElementById(`section-${block}`);
      if (i < momentIndex) {
        section.classList.add('hidden');
      } else {
        section.classList.remove('hidden');
      }
    });

    // Default page tint before any scrolling happens.
    if (!document.body.dataset.scrolled) {
      document.body.dataset.active = momentKey;
    }
  }

  // ---------- Name prompt (inline, inside hero only) ----------
  function initNamePrompt() {
    const stored = localStorage.getItem(NAME_KEY);
    const skipped = localStorage.getItem(SKIP_KEY);
    if (stored || skipped) return;

    const ask = document.getElementById('nameAsk');
    ask.classList.remove('hidden');

    const input = document.getElementById('nameInput');
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const val = input.value.trim();
      if (val) localStorage.setItem(NAME_KEY, val);
      ask.classList.add('hidden');
      updateMoment();
    });

    document.getElementById('nameSkip').addEventListener('click', () => {
      localStorage.setItem(SKIP_KEY, '1');
      ask.classList.add('hidden');
    });
  }

  // ---------- Add-task inputs ----------
  function initAddInputs() {
    document.querySelectorAll('.add-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const text = input.value.trim();
        if (!text) return;
        addTask(input.dataset.block, text);
        input.value = '';
      });
    });
  }

  // ---------- Scroll cascade reveal ----------
  function initScrollReveal() {
    const sections = document.querySelectorAll('.block-section, .pause-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          document.body.dataset.scrolled = '1';
          document.body.dataset.active = entry.target.dataset.block;
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => observer.observe(s));

    // Hero re-tints the page back to the real current moment while it's in view.
    const hero = document.getElementById('hero');
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.body.dataset.scrolled = '';
          updateMoment();
        }
      });
    }, { threshold: 0.6 });
    heroObserver.observe(hero);
  }

  // ---------- Breathing ----------
  function initBreathing() {
    const idle = document.getElementById('breatheIdle');
    const active = document.getElementById('breatheActive');
    const timerEl = document.getElementById('breatheTimer');
    const extend = document.getElementById('breatheExtend');
    const hint = document.getElementById('breatheHint');

    let remaining = 60;
    let totalElapsed = 0;
    let interval = null;
    const MAX_SECONDS = 10 * 60;

    function tick() {
      remaining -= 1;
      totalElapsed += 1;
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;

      if (remaining <= 0) {
        clearInterval(interval);
        interval = null;
        if (totalElapsed >= MAX_SECONDS) {
          hint.textContent = 'un minuto está bien. puedes volver cuando quieras.';
          extend.classList.add('hidden');
        } else {
          extend.classList.remove('hidden');
        }
      }
    }

    function start() {
      idle.classList.add('hidden');
      active.classList.remove('hidden');
      extend.classList.add('hidden');
      hint.textContent = 'inhala... exhala...';
      remaining = 60;
      timerEl.textContent = '1:00';
      clearInterval(interval);
      interval = setInterval(tick, 1000);
    }

    function stopAndClose() {
      clearInterval(interval);
      interval = null;
      totalElapsed = 0;
      active.classList.add('hidden');
      idle.classList.remove('hidden');
    }

    document.getElementById('breatheBtn').addEventListener('click', start);
    document.getElementById('breatheClose').addEventListener('click', stopAndClose);
    document.getElementById('breatheDone').addEventListener('click', stopAndClose);
    document.getElementById('breatheMore').addEventListener('click', () => {
      extend.classList.add('hidden');
      remaining = 60;
      timerEl.textContent = '1:00';
      clearInterval(interval);
      interval = setInterval(tick, 1000);
    });
  }

  // ---------- Close day ----------
  function initCloseDay() {
    const idle = document.getElementById('closeIdle');
    const message = document.getElementById('closeMessage');

    document.getElementById('closeDayBtn').addEventListener('click', () => {
      const all = BLOCKS.flatMap(b => tasks[b]);
      const total = all.length;
      const done = all.filter(t => t.done).length;

      let text;
      if (total === 0) {
        text = 'no hubo tareas hoy, y está bien. mañana empieza en blanco.';
      } else if (done === 0) {
        text = 'hoy no se marcó nada. no pasa nada: mañana es otra página en blanco.';
      } else if (done < total) {
        text = `marcaste ${done} de ${total}. eso ya cuenta.`;
      } else {
        text = 'todo lo que pusiste, lo marcaste. buen cierre.';
      }
      message.textContent = text;
      message.classList.remove('hidden');
      idle.classList.add('hidden');
    });
  }

  // ---------- Ambient particles ----------
  function initParticles() {
    const ambient = document.getElementById('ambient');
    const count = 14;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const duration = 18 + Math.random() * 16; // 18-34s
      const delay = -Math.random() * duration;   // stagger start positions
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${duration}s`;
      p.style.animationDelay = `${delay}s`;
      ambient.appendChild(p);
    }
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    initNamePrompt();
    updateMoment();
    renderAllLists();
    initAddInputs();
    initScrollReveal();
    initBreathing();
    initCloseDay();
    initParticles();

    setInterval(updateMoment, 60 * 1000);
  });
})();

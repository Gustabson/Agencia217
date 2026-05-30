(function () {
  'use strict';

  const STORAGE_KEY = 'a217-theme';
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const search = document.getElementById('search');
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const tabs = document.querySelectorAll('.tab');
  const yearEl = document.getElementById('year');

  yearEl.textContent = new Date().getFullYear();

  // ---------- Theme ----------
  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    }
  }
  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next, true);
  });

  // ---------- Icons ----------
  const ICONS = {
    file:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></svg>',
    link:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07L11 5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07L13 19"/></svg>',
    image:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
    sheet:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    folder:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
  };
  const ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';

  // ---------- Render ----------
  let data = (window.A217_DATA || []).slice();
  let activeFilter = 'documentos';
  let query = '';

  // ---------- Auto-carga desde manifest.json + enlaces.json ----------
  function prettify(filename) {
    return filename
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function iconForFile(filename) {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    if (['png','jpg','jpeg','gif','svg','webp','bmp','ico'].includes(ext)) return 'image';
    if (['xlsx','xls','xlsm','csv','tsv','ods'].includes(ext)) return 'sheet';
    if (['ics','ical'].includes(ext)) return 'calendar';
    return 'file';
  }
  function formatSize(bytes) {
    if (typeof bytes !== 'number' || isNaN(bytes)) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }
  function fileToItem(folderPath, type, file) {
    const ext = (file.name.split('.').pop() || '').toUpperCase();
    const size = formatSize(file.size);
    return {
      type,
      title: prettify(file.name),
      desc: '',
      url: `${folderPath}/${encodeURIComponent(file.name)}`,
      icon: iconForFile(file.name),
      meta: [ext, size].filter(Boolean).join(' · ')
    };
  }
  async function fetchJSON(path) {
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }
  async function autoLoadAll() {
    const [manifest, enlaces] = await Promise.all([
      fetchJSON('manifest.json'),
      fetchJSON('enlaces.json')
    ]);
    const fetched = [];

    if (manifest && Array.isArray(manifest.documentos)) {
      manifest.documentos.forEach(f => fetched.push(fileToItem('documentos', 'documentos', f)));
    }
    if (manifest && Array.isArray(manifest.recursos)) {
      manifest.recursos.forEach(f => fetched.push(fileToItem('recursos', 'recursos', f)));
    }
    if (Array.isArray(enlaces)) {
      enlaces.forEach(item => fetched.push({
        type: 'enlaces',
        title: item.title || '',
        desc: item.desc || '',
        url: item.url || '#',
        icon: item.icon || 'link',
        meta: item.meta || 'Externo'
      }));
    }

    if (fetched.length === 0) return;
    const existing = new Set(data.map(i => i.url));
    fetched.forEach(item => {
      if (!existing.has(item.url)) data.push(item);
    });
    render();
  }

  function cardEl(item) {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = item.url;
    a.dataset.type = item.type;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    const icon = ICONS[item.icon] || ICONS.file;
    a.innerHTML = `
      <div class="card-head">
        <span class="card-icon">${icon}</span>
        <div>
          <div class="card-type">${item.type}</div>
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
        </div>
      </div>
      <p class="card-desc">${escapeHtml(item.desc || '')}</p>
      <div class="card-foot">
        <span class="card-meta">${escapeHtml(item.meta || '')}</span>
        <span class="card-action">Abrir ${ARROW}</span>
      </div>
    `;
    return a;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render() {
    const q = query.trim().toLowerCase();
    const filtered = data.filter(item => {
      if (activeFilter !== 'all' && item.type !== activeFilter) return false;
      if (!q) return true;
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.desc || '').toLowerCase().includes(q) ||
        (item.meta || '').toLowerCase().includes(q)
      );
    });

    grid.innerHTML = '';
    filtered.forEach(item => grid.appendChild(cardEl(item)));
    empty.hidden = filtered.length > 0;
    updateCounts();
  }

  function updateCounts() {
    const counts = { documentos: 0, enlaces: 0, recursos: 0 };
    data.forEach(i => { if (counts[i.type] !== undefined) counts[i.type]++; });
    document.querySelectorAll('[data-count]').forEach(el => {
      const key = el.dataset.count;
      animateCount(el, counts[key] || 0);
    });
  }

  function animateCount(el, target) {
    const start = parseInt(el.textContent, 10) || 0;
    if (start === target) return;
    const duration = 600;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const value = Math.round(start + (target - start) * (1 - Math.pow(1 - t, 3)));
      el.textContent = value;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---------- Events ----------
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const wasActive = tab.classList.contains('active');
      tabs.forEach(t => t.classList.remove('active'));
      if (wasActive) {
        activeFilter = 'all';
      } else {
        tab.classList.add('active');
        activeFilter = tab.dataset.filter;
      }
      render();
    });
  });

  search.addEventListener('input', (e) => {
    query = e.target.value;
    render();
  });

  // Atajo de teclado: "/" enfoca el buscador
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    }
    if (e.key === 'Escape' && document.activeElement === search) {
      search.value = '';
      query = '';
      render();
      search.blur();
    }
  });

  render();
  autoLoadAll();
})();

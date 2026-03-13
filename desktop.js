/* ============================
   DESKTOP.JS – Y2K Windows Desktop Engine
   ============================ */

// ---- Boot Screen ----
(function () {
  const boot = document.createElement('div');
  boot.id = 'boot-screen';
  boot.innerHTML = `
    <div class="boot-logo">
      <svg viewBox="0 0 80 80" width="80" height="80">
        <rect x="2" y="2" width="36" height="36" fill="#d32f2f"/>
        <rect x="42" y="2" width="36" height="36" fill="#388e3c"/>
        <rect x="2" y="42" width="36" height="36" fill="#1976d2"/>
        <rect x="42" y="42" width="36" height="36" fill="#f57f17"/>
      </svg>
      <div class="boot-text">Microsoft Windows XP</div>
      <div class="boot-subtitle">PROFESSIONAL</div>
    </div>
    <div class="boot-progress-wrap">
      <div class="boot-progress-bar">
        <div class="boot-progress-fill"></div>
      </div>
    </div>
    <div class="boot-copy">Copyright © 2001 Microsoft Corporation</div>
  `;
  document.body.appendChild(boot);
  setTimeout(() => boot.remove(), 3200);
})();

// ---- State ----
let windows = {};
let zCounter = 200;
let focusedWinId = null;
let startMenuOpen = false;

const APP_CONFIG = {
  notepad:     { title: 'Notepad',           icon: 'icon-notepad',    width: 520,  height: 400, tpl: 'tpl-notepad',    onOpen: initNotepad },
  mycomputer:  { title: 'My Computer',       icon: 'icon-mycomputer', width: 620,  height: 440, tpl: 'tpl-mycomputer', onOpen: null },
  recyclebin:  { title: 'Recycle Bin',       icon: 'icon-recyclebin', width: 540,  height: 380, tpl: 'tpl-recyclebin', onOpen: null },
  iexplore:    { title: 'Internet Explorer', icon: 'icon-iexplore',   width: 680,  height: 500, tpl: 'tpl-iexplore',   onOpen: initIE },
  mspaint:     { title: 'Paint',             icon: 'icon-mspaint',    width: 640,  height: 480, tpl: 'tpl-mspaint',    onOpen: initPaint },
  winamp:      { title: 'Winamp 2.91',       icon: 'icon-winamp',     width: 280,  height: 420, tpl: 'tpl-winamp',     onOpen: initWinamp },
  viewcity:      { title: 'View City',      icon: 'icon-viewcity',      width: 800,  height: 560, tpl: 'tpl-viewcity',      onOpen: (content, winEl) => window.initViewCity?.(content, winEl) },
  viewspaceship: { title: 'View Spaceship', icon: 'icon-viewspaceship', width: 820,  height: 580, tpl: 'tpl-viewspaceship', onOpen: (content, winEl) => window.initViewSpaceship?.(content, winEl) },
  viewocean:     { title: 'View Ocean',     icon: 'icon-viewocean',     width: 820,  height: 580, tpl: 'tpl-viewocean',     onOpen: (content, winEl) => window.initViewOcean?.(content, winEl) },
  viewcrystal:   { title: 'View Crystal',   icon: 'icon-viewcrystal',   width: 820,  height: 580, tpl: 'tpl-viewcrystal',   onOpen: (content, winEl) => window.initViewCrystal?.(content, winEl) },
  scenes3d:      { title: '3D Scenes',      icon: 'icon-scenes3d',      width: 460,  height: 340, tpl: 'tpl-scenes3d',      onOpen: initScenes3d },
  minesweeper:   { title: 'Minesweeper',    icon: 'icon-minesweeper',   width: 200,  height: 260, tpl: 'tpl-minesweeper',   onOpen: initMinesweeper },
  wmplayer:      { title: 'Windows Media Player', icon: 'icon-wmplayer', width: 680, height: 520, tpl: 'tpl-wmplayer', onOpen: initWMP },
  solitaire:     { title: 'Solitaire',            icon: 'icon-solitaire', width: 620, height: 500, tpl: 'tpl-solitaire', onOpen: initSolitaire },
  musicviz:      { title: 'Music Visualiser', icon: 'icon-musicviz', width: 660, height: 480, tpl: 'tpl-musicviz', onOpen: initMusicViz },
  calculator:    { title: 'Calculator',        icon: 'icon-calculator', width: 240, height: 340, tpl: 'tpl-calculator', onOpen: initCalculator },
  lambdaide:     { title: 'Lambda & BF IDE',   icon: 'icon-lambdaide', width: 700, height: 520, tpl: 'tpl-lambdaide', onOpen: initLambdaIDE },
  spreadsheet:   { title: 'Spreadsheet',       icon: 'icon-spreadsheet', width: 720, height: 500, tpl: 'tpl-spreadsheet', onOpen: initSpreadsheet },
  ckprojects:    { title: 'CK Projects',        icon: 'icon-ckprojects',  width: 460, height: 360, tpl: 'tpl-ckprojects',  onOpen: initCkProjects },
  legalnotice:   { title: 'Legal Notice',        icon: 'icon-legalnotice', width: 480, height: 500, tpl: 'tpl-legalnotice',  onOpen: null },
  conwaylife:    { title: "Conway's Game of Life", icon: 'icon-conwaylife', width: 700, height: 560, tpl: 'tpl-conwaylife',   onOpen: initConwayLife },
  games:         { title: 'Games',                 icon: 'icon-games',       width: 560, height: 420, tpl: 'tpl-games',         onOpen: initGames },
  tetris:        { title: 'Tetris',                icon: 'icon-tetris',       width: 280, height: 580, tpl: 'tpl-tetris',        onOpen: initTetris },
  blackjack:     { title: 'Blackjack',             icon: 'icon-blackjack',    width: 620, height: 500, tpl: 'tpl-blackjack',     onOpen: initBlackjack },
  poker:         { title: '5-Card Draw Poker',     icon: 'icon-poker',        width: 680, height: 520, tpl: 'tpl-poker',         onOpen: initPoker },
  baccarat:      { title: 'Baccarat',              icon: 'icon-baccarat',     width: 640, height: 500, tpl: 'tpl-baccarat',      onOpen: initBaccarat },
};

const APP_ICONS = {
  notepad: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="2" y="1" width="10" height="13" rx="1" fill="#fffde7" stroke="#9e9e9e" stroke-width="0.8"/><line x1="4" y1="5" x2="10" y2="5" stroke="#9e9e9e" stroke-width="0.7"/><line x1="4" y1="7" x2="10" y2="7" stroke="#9e9e9e" stroke-width="0.7"/><line x1="4" y1="9" x2="8" y2="9" stroke="#9e9e9e" stroke-width="0.7"/></svg>`,
  mycomputer: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="2" width="14" height="10" rx="1" fill="#e3f2fd" stroke="#1565c0" stroke-width="1"/><rect x="3" y="12" width="4" height="1.5" fill="#bdbdbd"/><rect x="2" y="13.5" width="12" height="1.5" rx="0.5" fill="#9e9e9e"/></svg>`,
  recyclebin: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="4" y="6" width="8" height="8" rx="0.5" fill="#e0e0e0" stroke="#757575" stroke-width="0.8"/><rect x="3" y="5" width="10" height="2" rx="0.5" fill="#bdbdbd" stroke="#757575" stroke-width="0.8"/><rect x="6" y="3" width="4" height="3" rx="0.5" fill="#bdbdbd" stroke="#757575" stroke-width="0.8"/></svg>`,
  iexplore: `<svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6" fill="#e3f2fd" stroke="#1565c0" stroke-width="1"/><ellipse cx="8" cy="8" rx="3" ry="6" fill="none" stroke="#1565c0" stroke-width="0.8"/><line x1="2" y1="8" x2="14" y2="8" stroke="#1565c0" stroke-width="0.8"/></svg>`,
  mspaint: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="1" width="14" height="14" rx="1" fill="white" stroke="#9e9e9e" stroke-width="0.8"/><circle cx="5" cy="8" r="2" fill="#ef5350"/><circle cx="9" cy="6" r="2" fill="#66bb6a"/><circle cx="12" cy="10" r="2" fill="#42a5f5"/></svg>`,
  winamp: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="1" width="14" height="14" rx="1" fill="#1a1a2e"/><text x="2" y="9" font-size="5" fill="#00e5ff" font-weight="bold">WIN</text><text x="2" y="14" font-size="5" fill="#ff4081" font-weight="bold">AMP</text></svg>`,
  viewcity: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="0" y="0" width="16" height="16" fill="#7ecbf5"/><rect x="0" y="11" width="16" height="5" fill="#9ab8cc"/><polygon points="1,11 5,4 9,11" fill="#c8dce8"/><rect x="10" y="7" width="2" height="4" fill="#c8dce8"/><rect x="10.2" y="4" width="1.6" height="4" fill="#ddeef8"/><circle cx="11" cy="4" r="1" fill="#e8f4fc"/><line x1="11" y1="1" x2="11" y2="3" stroke="#b0c8e0" stroke-width="0.6"/></svg>`,
  viewspaceship: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="0" y="0" width="16" height="16" fill="#0a0e1a"/><ellipse cx="8" cy="9" rx="6" ry="3.2" fill="#1a2a4a" stroke="#4488cc" stroke-width="0.8"/><ellipse cx="8" cy="7" rx="3.5" ry="4.5" fill="#223355" stroke="#5599dd" stroke-width="0.7"/><ellipse cx="8" cy="6.5" rx="2" ry="1.2" fill="#3366aa" opacity="0.9"/><rect x="5.5" y="8.8" width="1.2" height="2.8" rx="0.3" fill="#2255aa"/><rect x="9.3" y="8.8" width="1.2" height="2.8" rx="0.3" fill="#2255aa"/><circle cx="8" cy="5.8" r="0.9" fill="#88ccff" opacity="0.9"/><line x1="2.5" y1="9" x2="0.5" y2="10.5" stroke="#3366aa" stroke-width="0.6"/><line x1="13.5" y1="9" x2="15.5" y2="10.5" stroke="#3366aa" stroke-width="0.6"/><circle cx="4" cy="7" r="0.5" fill="#00ffcc" opacity="0.8"/><circle cx="12" cy="7" r="0.5" fill="#00ffcc" opacity="0.8"/></svg>`,
  viewocean: `<svg viewBox="0 0 16 16" width="16" height="16"><defs><linearGradient id="oceang" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0af0ff"/><stop offset="100%" stop-color="#012040"/></linearGradient></defs><rect x="0" y="0" width="16" height="16" fill="url(#oceang)"/><ellipse cx="8" cy="12" rx="5" ry="1.5" fill="#ff4060" opacity="0.7"/><ellipse cx="4" cy="13" rx="2" ry="1" fill="#ff6040" opacity="0.6"/><path d="M3 8 Q5 7 7 8 Q9 9 11 8 Q13 7 15 8" stroke="#80deea" stroke-width="0.5" fill="none" opacity="0.7"/><circle cx="5" cy="10" r="0.8" fill="#44aaff" opacity="0.6"/><circle cx="11" cy="9" r="0.6" fill="#ffcc00" opacity="0.6"/></svg>`,
  viewcrystal: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="0" y="0" width="16" height="16" fill="#000820"/><polygon points="8,1 10,6 8,5 6,6" fill="#1133cc" opacity="0.9"/><polygon points="8,5 11,9 8,8 5,9" fill="#2244ee" opacity="0.85"/><polygon points="8,8 12,13 8,11 4,13" fill="#3366ff" opacity="0.9"/><polygon points="3,3 5,7 3,6 1,7" fill="#0022aa" opacity="0.8"/><polygon points="13,4 15,8 13,7 11,8" fill="#1144bb" opacity="0.75"/><circle cx="8" cy="5" r="0.9" fill="#88aaff" opacity="0.9"/><circle cx="3" cy="6" r="0.6" fill="#4466ff" opacity="0.7"/><circle cx="13" cy="7" r="0.6" fill="#4466ff" opacity="0.7"/></svg>`,
  minesweeper: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="1" width="14" height="14" rx="1" fill="#c0c0c0" stroke="#808080" stroke-width="0.5"/><circle cx="8" cy="8" r="4" fill="#222"/><circle cx="6.5" cy="6.5" r="1" fill="white" opacity="0.7"/><line x1="8" y1="1" x2="8" y2="3" stroke="#222" stroke-width="1.2"/><line x1="8" y1="13" x2="8" y2="15" stroke="#222" stroke-width="1.2"/><line x1="1" y1="8" x2="3" y2="8" stroke="#222" stroke-width="1.2"/><line x1="13" y1="8" x2="15" y2="8" stroke="#222" stroke-width="1.2"/><line x1="3" y1="3" x2="4.5" y2="4.5" stroke="#222" stroke-width="1.2"/><line x1="13" y1="3" x2="11.5" y2="4.5" stroke="#222" stroke-width="1.2"/><line x1="3" y1="13" x2="4.5" y2="11.5" stroke="#222" stroke-width="1.2"/><line x1="13" y1="13" x2="11.5" y2="11.5" stroke="#222" stroke-width="1.2"/></svg>`,
  wmplayer: `<svg viewBox="0 0 16 16" width="16" height="16"><defs><linearGradient id="wmpg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a73e8"/><stop offset="100%" stop-color="#0d47a1"/></linearGradient></defs><rect x="0" y="0" width="16" height="16" rx="2" fill="url(#wmpg)"/><circle cx="8" cy="8" r="5.5" fill="none" stroke="#42a5f5" stroke-width="1"/><circle cx="8" cy="8" r="3" fill="none" stroke="#90caf9" stroke-width="0.8"/><polygon points="6.5,5.5 6.5,10.5 11,8" fill="white" opacity="0.9"/></svg>`,
  solitaire: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="1" width="6" height="8" rx="1" fill="#fff" stroke="#c00" stroke-width="0.8"/><text x="2" y="7" font-size="6" fill="#c00">♥</text><rect x="9" y="1" width="6" height="8" rx="1" fill="#fff" stroke="#222" stroke-width="0.8"/><text x="10" y="7" font-size="6" fill="#222">♠</text><rect x="1" y="10" width="6" height="5" rx="1" fill="#c0e0ff" stroke="#448" stroke-width="0.8"/><rect x="9" y="10" width="6" height="5" rx="1" fill="#c0e0ff" stroke="#448" stroke-width="0.8"/></svg>`,
  musicviz: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="0" y="0" width="16" height="16" rx="1" fill="#111"/><rect x="1" y="8" width="2" height="6" fill="#00e5ff"/><rect x="4" y="4" width="2" height="10" fill="#ff4081"/><rect x="7" y="6" width="2" height="8" fill="#76ff03"/><rect x="10" y="3" width="2" height="11" fill="#ffab00"/><rect x="13" y="7" width="2" height="7" fill="#e040fb"/></svg>`,
  calculator: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="1" width="14" height="14" rx="1" fill="#e0e0e0" stroke="#888" stroke-width="0.8"/><rect x="3" y="2.5" width="10" height="3" rx="0.5" fill="#cef0ce" stroke="#4a4" stroke-width="0.5"/><rect x="3" y="7" width="2.5" height="2" rx="0.3" fill="#fff" stroke="#999" stroke-width="0.3"/><rect x="6.75" y="7" width="2.5" height="2" rx="0.3" fill="#fff" stroke="#999" stroke-width="0.3"/><rect x="10.5" y="7" width="2.5" height="2" rx="0.3" fill="#ffa" stroke="#999" stroke-width="0.3"/><rect x="3" y="10.5" width="2.5" height="2" rx="0.3" fill="#fff" stroke="#999" stroke-width="0.3"/><rect x="6.75" y="10.5" width="2.5" height="2" rx="0.3" fill="#fff" stroke="#999" stroke-width="0.3"/><rect x="10.5" y="10.5" width="2.5" height="2" rx="0.3" fill="#9cf" stroke="#999" stroke-width="0.3"/></svg>`,
  lambdaide: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="0" y="0" width="16" height="16" rx="1" fill="#1a1a2e"/><text x="2" y="10" font-size="10" fill="#00e5ff" font-family="serif" font-weight="bold">λ</text><text x="9" y="12" font-size="6" fill="#ff4081" font-family="monospace">bf</text></svg>`,
  spreadsheet: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="1" width="14" height="14" rx="1" fill="#fff" stroke="#2e7d32" stroke-width="1"/><line x1="5" y1="1" x2="5" y2="15" stroke="#2e7d32" stroke-width="0.5"/><line x1="9" y1="1" x2="9" y2="15" stroke="#2e7d32" stroke-width="0.5"/><line x1="13" y1="1" x2="13" y2="15" stroke="#2e7d32" stroke-width="0.5"/><line x1="1" y1="5" x2="15" y2="5" stroke="#2e7d32" stroke-width="0.5"/><line x1="1" y1="9" x2="15" y2="9" stroke="#2e7d32" stroke-width="0.5"/><rect x="1" y="1" width="14" height="3" fill="#2e7d32"/><text x="2" y="3.5" font-size="2.5" fill="#fff" font-family="sans-serif">A B C</text></svg>`,
  cklink: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="1" width="14" height="14" rx="2" fill="#1a1a2e" stroke="#4488ff" stroke-width="1"/><text x="3" y="12" font-size="10" fill="#00e5ff" font-weight="bold" font-family="sans-serif">ck</text></svg>`,
  scenes3d: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="4" width="14" height="11" rx="1" fill="#dce8f8" stroke="#5588bb" stroke-width="0.8"/><rect x="1" y="4" width="5" height="3" rx="0" fill="#f5d97a" stroke="#5588bb" stroke-width="0.8"/><rect x="1" y="1" width="4" height="4" rx="1" fill="#f5d97a" stroke="#5588bb" stroke-width="0.8"/><line x1="5" y1="7" x2="5" y2="15" stroke="#5588bb" stroke-width="0.5"/><line x1="1" y1="7" x2="15" y2="7" stroke="#5588bb" stroke-width="0.5"/></svg>`,
  ckprojects: `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="4" width="14" height="11" rx="1" fill="#0d1b3e" stroke="#4488ff" stroke-width="0.8"/><rect x="1" y="4" width="5" height="3" rx="0" fill="#1a3a6e" stroke="#4488ff" stroke-width="0.8"/><rect x="1" y="1" width="4" height="4" rx="1" fill="#1a3a6e" stroke="#4488ff" stroke-width="0.8"/><text x="4" y="13" font-size="6" fill="#00e5ff" font-weight="bold" font-family="sans-serif">ck</text></svg>`,
  legalnotice: `<svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="7" fill="#f57f17" stroke="#e65100" stroke-width="0.8"/><text x="8" y="12" font-size="10" fill="white" font-weight="bold" font-family="sans-serif" text-anchor="middle">!</text></svg>`,
  conwaylife:  `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="0" y="0" width="16" height="16" fill="#0a0e1a"/><rect x="9" y="1" width="3" height="3" fill="#00e5ff"/><rect x="5" y="5" width="3" height="3" fill="#00e5ff"/><rect x="9" y="5" width="3" height="3" fill="#00e5ff"/><rect x="13" y="5" width="3" height="3" fill="#00e5ff"/><rect x="9" y="9" width="3" height="3" fill="#00e5ff" opacity="0.7"/></svg>`,
  games:       `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="4" width="14" height="11" rx="1" fill="#d4e8d0" stroke="#4a7c59" stroke-width="0.8"/><rect x="1" y="1" width="4" height="4" rx="1" fill="#f5d97a" stroke="#c9a000" stroke-width="0.8"/><circle cx="6" cy="10" r="2" fill="#c0c0c0" stroke="#808080" stroke-width="0.5"/><rect x="9" y="9" width="4" height="4" rx="0.5" fill="white" stroke="#999" stroke-width="0.4"/><text x="10.5" y="12.5" font-size="4" fill="#cc0000" font-family="serif" text-anchor="middle">♥</text></svg>`,
  tetris:      `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="0" y="0" width="16" height="16" fill="#000"/><rect x="1" y="1" width="4" height="4" fill="#00e5ff"/><rect x="5" y="1" width="4" height="4" fill="#00e5ff"/><rect x="1" y="5" width="4" height="4" fill="#ff4081"/><rect x="9" y="5" width="4" height="4" fill="#ff4081"/><rect x="5" y="9" width="4" height="4" fill="#76ff03"/><rect x="9" y="9" width="4" height="4" fill="#76ff03"/><rect x="1" y="13" width="4" height="2" fill="#ffab00"/><rect x="5" y="13" width="4" height="2" fill="#ffab00"/><rect x="9" y="13" width="4" height="2" fill="#ffab00"/></svg>`,
  blackjack:   `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="1" width="6" height="9" rx="1" fill="white" stroke="#bbb" stroke-width="0.6"/><text x="2" y="8" font-size="6" fill="#222" font-family="serif">♠</text><rect x="9" y="4" width="6" height="9" rx="1" fill="white" stroke="#bbb" stroke-width="0.6"/><text x="10" y="11" font-size="6" fill="#c00" font-family="serif">♥</text><text x="10" y="3" font-size="4" fill="#c00" font-family="sans-serif" font-weight="bold">21</text></svg>`,
  poker:       `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="0" y="3" width="5" height="7" rx="0.8" fill="white" stroke="#aaa" stroke-width="0.5"/><rect x="3" y="2" width="5" height="7" rx="0.8" fill="white" stroke="#aaa" stroke-width="0.5"/><rect x="6" y="1" width="5" height="7" rx="0.8" fill="white" stroke="#aaa" stroke-width="0.5"/><rect x="9" y="2" width="5" height="7" rx="0.8" fill="white" stroke="#aaa" stroke-width="0.5"/><rect x="12" y="3" width="4" height="7" rx="0.8" fill="white" stroke="#aaa" stroke-width="0.5"/><text x="7" y="13" font-size="4" fill="#c00" font-family="serif" text-anchor="middle">♦</text></svg>`,
  baccarat:    `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="0" y="0" width="16" height="16" rx="2" fill="#1a4a1a"/><rect x="2" y="3" width="5" height="7" rx="1" fill="white" stroke="#ccc" stroke-width="0.5"/><text x="3" y="9" font-size="5" fill="#222" font-family="serif">♣</text><rect x="9" y="3" width="5" height="7" rx="1" fill="white" stroke="#ccc" stroke-width="0.5"/><text x="10" y="9" font-size="5" fill="#c00" font-family="serif">♦</text><rect x="5" y="11" width="6" height="1.5" rx="0.5" fill="#f5d97a"/></svg>`,
};

// ---- Utilities ----
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
function uid() { return 'win_' + Math.random().toString(36).slice(2, 9); }

// ---- Clock ----
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const el = document.getElementById('clock');
  if (el) el.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 10000);

// ---- Window Management ----
function openApp(appId) {
  closeStartMenu();

  // Restore if already open
  if (windows[appId]) {
    const w = windows[appId];
    if (w.minimized) {
      w.el.classList.remove('minimized');
      w.minimized = false;
      const tbBtn = document.querySelector(`.taskbar-btn[data-wid="${appId}"]`);
      if (tbBtn) tbBtn.classList.remove('active');
    }
    focusWindow(appId);
    return;
  }

  const cfg = APP_CONFIG[appId];
  if (!cfg) return;

  const container = document.getElementById('windows-container');
  const dw = container.offsetWidth;
  const dh = container.offsetHeight;

  const startX = clamp(80 + Math.random() * (dw - cfg.width - 100), 20, dw - cfg.width - 10);
  const startY = clamp(40 + Math.random() * (dh - cfg.height - 80), 10, dh - cfg.height - 10);

  const winEl = document.createElement('div');
  winEl.className = 'window focused';
  winEl.dataset.wid = appId;
  winEl.style.width = cfg.width + 'px';
  winEl.style.height = cfg.height + 'px';
  winEl.style.left = startX + 'px';
  winEl.style.top = startY + 'px';
  winEl.style.zIndex = ++zCounter;

  // Title bar
  const titlebar = document.createElement('div');
  titlebar.className = 'win-titlebar';
  titlebar.innerHTML = `
    <div class="win-icon">${APP_ICONS[appId] || ''}</div>
    <div class="win-title">${cfg.title}</div>
    <div class="win-controls">
      <button class="win-btn win-btn-min" title="Minimize">&#x2013;</button>
      <button class="win-btn win-btn-max" title="Maximize">&#x25A1;</button>
      <button class="win-btn win-btn-close" title="Close">&#x2715;</button>
    </div>
  `;

  // Content
  const content = document.createElement('div');
  content.className = `win-content${appId === 'winamp' ? ' winamp-wrap' : ''}`;

  // Clone template
  const tpl = document.getElementById(cfg.tpl);
  if (tpl) {
    content.appendChild(tpl.content.cloneNode(true));
  }

  // Resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'win-resize-handle';

  winEl.appendChild(titlebar);
  winEl.appendChild(content);
  winEl.appendChild(resizeHandle);
  container.appendChild(winEl);

  const state = {
    el: winEl,
    id: appId,
    title: cfg.title,
    minimized: false,
    maximized: false,
    prevRect: null,
    content,
  };
  windows[appId] = state;

  // Wire controls
  titlebar.querySelector('.win-btn-min').addEventListener('click', (e) => {
    e.stopPropagation();
    minimizeWindow(appId);
  });
  titlebar.querySelector('.win-btn-max').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMaximize(appId);
  });
  titlebar.querySelector('.win-btn-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeWindow(appId);
  });

  // Double-click title bar to maximize
  titlebar.addEventListener('dblclick', () => toggleMaximize(appId));

  // Drag
  makeDraggable(winEl, titlebar, state);

  // Resize
  makeResizable(winEl, resizeHandle, state);

  // Focus on click
  winEl.addEventListener('mousedown', () => focusWindow(appId));

  // Add to taskbar
  addTaskbarButton(appId, cfg.title, appId);

  focusWindow(appId);

  // Run onOpen init
  if (cfg.onOpen) {
    requestAnimationFrame(() => cfg.onOpen(content, winEl));
  }
}

function focusWindow(appId) {
  if (focusedWinId === appId) return;

  // Defocus old
  if (focusedWinId && windows[focusedWinId]) {
    windows[focusedWinId].el.classList.remove('focused');
    const oldBtn = document.querySelector(`.taskbar-btn[data-wid="${focusedWinId}"]`);
    if (oldBtn) oldBtn.classList.remove('active');
  }

  focusedWinId = appId;
  const w = windows[appId];
  if (!w) return;
  w.el.classList.add('focused');
  w.el.style.zIndex = ++zCounter;

  const btn = document.querySelector(`.taskbar-btn[data-wid="${appId}"]`);
  if (btn) btn.classList.add('active');
}

function minimizeWindow(appId) {
  const w = windows[appId];
  if (!w) return;
  w.minimized = true;
  w.el.classList.add('minimized');
  const btn = document.querySelector(`.taskbar-btn[data-wid="${appId}"]`);
  if (btn) btn.classList.remove('active');
  if (focusedWinId === appId) focusedWinId = null;
}

function toggleMaximize(appId) {
  const w = windows[appId];
  if (!w) return;
  if (w.maximized) {
    // Restore
    w.el.classList.remove('maximized');
    if (w.prevRect) {
      w.el.style.left   = w.prevRect.left   + 'px';
      w.el.style.top    = w.prevRect.top    + 'px';
      w.el.style.width  = w.prevRect.width  + 'px';
      w.el.style.height = w.prevRect.height + 'px';
    }
    w.maximized = false;
    w.el.querySelector('.win-btn-max').textContent = '□';
  } else {
    w.prevRect = {
      left:   parseInt(w.el.style.left),
      top:    parseInt(w.el.style.top),
      width:  w.el.offsetWidth,
      height: w.el.offsetHeight,
    };
    w.el.classList.add('maximized');
    w.maximized = true;
    w.el.querySelector('.win-btn-max').textContent = '❐';
  }
  // Repaint paint canvas if needed
  if (appId === 'mspaint') repaintCanvas();
}

function closeWindow(appId) {
  const w = windows[appId];
  if (!w) return;
  w.el.remove();
  delete windows[appId];
  removeTaskbarButton(appId);
  if (focusedWinId === appId) focusedWinId = null;
  if (appId === 'winamp') stopWinamp();
}

// ---- Keep windows in-bounds on browser resize ----
window.addEventListener('resize', () => {
  const container = document.getElementById('windows-container');
  if (!container) return;
  Object.values(windows).forEach(w => {
    if (w.maximized || w.minimized) return;
    const el = w.el;
    const maxX = container.offsetWidth  - el.offsetWidth;
    const maxY = container.offsetHeight - el.offsetHeight;
    const curX = parseInt(el.style.left) || 0;
    const curY = parseInt(el.style.top)  || 0;
    el.style.left = clamp(curX, 0, Math.max(0, maxX)) + 'px';
    el.style.top  = clamp(curY, 0, Math.max(0, maxY)) + 'px';
  });
});
function addTaskbarButton(wid, title, appId) {
  const container = document.getElementById('taskbar-buttons');
  const btn = document.createElement('button');
  btn.className = 'taskbar-btn';
  btn.dataset.wid = wid;
  btn.innerHTML = (APP_ICONS[appId] || '') + ` <span>${title}</span>`;
  btn.addEventListener('click', () => {
    const w = windows[wid];
    if (!w) return;
    if (w.minimized) {
      w.el.classList.remove('minimized');
      w.minimized = false;
      focusWindow(wid);
    } else if (focusedWinId === wid) {
      minimizeWindow(wid);
    } else {
      focusWindow(wid);
    }
  });
  container.appendChild(btn);
}

function removeTaskbarButton(wid) {
  const btn = document.querySelector(`.taskbar-btn[data-wid="${wid}"]`);
  if (btn) btn.remove();
}

// ---- Start Menu ----
function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  startMenuOpen = !startMenuOpen;
  menu.classList.toggle('hidden', !startMenuOpen);
}

function closeStartMenu() {
  if (!startMenuOpen) return;
  document.getElementById('start-menu').classList.add('hidden');
  startMenuOpen = false;
}

document.addEventListener('mousedown', (e) => {
  if (startMenuOpen) {
    const menu = document.getElementById('start-menu');
    const btn  = document.getElementById('start-btn');
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      closeStartMenu();
    }
  }
  // Dismiss context menu
  const ctx = document.getElementById('context-menu');
  if (ctx && !ctx.contains(e.target)) ctx.remove();
});

// ---- Context Menu (right-click desktop) ----
document.getElementById('desktop').addEventListener('contextmenu', (e) => {
  if (e.target.closest('.window') || e.target.closest('#taskbar') || e.target.closest('#start-menu')) return;
  e.preventDefault();

  const existing = document.getElementById('context-menu');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.id = 'context-menu';
  menu.innerHTML = `
    <div class="ctx-item" onclick="openApp('iexplore')">Open Internet Explorer</div>
    <div class="ctx-item" onclick="openApp('notepad')">Open Notepad</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="refreshDesktop()">Refresh</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item">Arrange Icons By ▶</div>
    <div class="ctx-item">Properties</div>
  `;
  menu.style.left = Math.min(e.clientX, window.innerWidth - 160) + 'px';
  menu.style.top  = Math.min(e.clientY, window.innerHeight - 160) + 'px';
  document.body.appendChild(menu);
});

function refreshDesktop() {
  const ctx = document.getElementById('context-menu');
  if (ctx) ctx.remove();
}

// ---- Dragging ----
function makeDraggable(winEl, handle, state) {
  let dragging = false;
  let ox = 0, oy = 0;

  handle.addEventListener('mousedown', (e) => {
    if (e.target.closest('.win-controls')) return;
    if (state.maximized) return;
    dragging = true;
    ox = e.clientX - winEl.offsetLeft;
    oy = e.clientY - winEl.offsetTop;
    winEl.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const container = document.getElementById('windows-container');
    const maxX = container.offsetWidth  - winEl.offsetWidth;
    const maxY = container.offsetHeight - winEl.offsetHeight;
    winEl.style.left = clamp(e.clientX - ox, 0, maxX) + 'px';
    winEl.style.top  = clamp(e.clientY - oy, 0, maxY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
  });
}

// ---- Resizing ----
function makeResizable(winEl, handle, state) {
  let resizing = false;
  let sx = 0, sy = 0, sw = 0, sh = 0;

  handle.addEventListener('mousedown', (e) => {
    if (state.maximized) return;
    resizing = true;
    sx = e.clientX;
    sy = e.clientY;
    sw = winEl.offsetWidth;
    sh = winEl.offsetHeight;
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', (e) => {
    if (!resizing) return;
    const nw = Math.max(280, sw + (e.clientX - sx));
    const nh = Math.max(160, sh + (e.clientY - sy));
    winEl.style.width  = nw + 'px';
    winEl.style.height = nh + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (resizing) {
      resizing = false;
      if (state.id === 'mspaint') repaintCanvas();
    }
  });
}

// ---- Desktop icon grid-snap drag ----
const ICON_CELL = 84; // px per grid cell (width & height)
const ICON_PAD  = 10; // desktop edge padding

function iconGridCols() { return Math.max(1, Math.floor((window.innerWidth  - ICON_PAD * 2) / ICON_CELL)); }
function iconGridRows() { return Math.max(1, Math.floor((window.innerHeight - 30 - ICON_PAD * 2) / ICON_CELL)); }

// Returns {col, row} for a pixel position, clamped to the valid grid
function pixelToCell(px, py) {
  const col = clamp(Math.round((px - ICON_PAD) / ICON_CELL), 0, iconGridCols() - 1);
  const row = clamp(Math.round((py - ICON_PAD) / ICON_CELL), 0, iconGridRows() - 1);
  return { col, row };
}
function cellToPixel(col, row) {
  return { x: ICON_PAD + col * ICON_CELL, y: ICON_PAD + row * ICON_CELL };
}

// Map of cell key -> icon element so we can detect conflicts
const cellOccupied = new Map();

function snapIconToCell(icon, col, row) {
  // Find a free cell nearby if occupied by another icon
  let tries = 0;
  const cols = iconGridCols(), rows = iconGridRows();
  while (cellOccupied.has(`${col},${row}`) && cellOccupied.get(`${col},${row}`) !== icon && tries < 200) {
    row++;
    if (row >= rows) { row = 0; col++; }
    if (col >= cols) col = 0;
    tries++;
  }
  // Evict old cell for this icon
  cellOccupied.forEach((v, k) => { if (v === icon) cellOccupied.delete(k); });
  cellOccupied.set(`${col},${row}`, icon);
  icon.dataset.gridCol = col;
  icon.dataset.gridRow = row;
  const { x, y } = cellToPixel(col, row);
  icon.style.left = x + 'px';
  icon.style.top  = y + 'px';
}

let iconClickTimer = null;
(function setupIconDrag() {
  const iconsContainer = document.querySelector('.desktop-icons');
  if (!iconsContainer) return;

  const allIcons = Array.from(iconsContainer.querySelectorAll('.icon'));

  // Identify special bottom-right icons by their span text
  const bottomRightLabels = ['Recycle Bin', 'CK', 'CK Projects', 'Legal Notice'];
  const normalIcons = allIcons.filter(ic => !bottomRightLabels.includes(ic.querySelector('span')?.textContent?.trim()));
  const brIcons     = allIcons.filter(ic =>  bottomRightLabels.includes(ic.querySelector('span')?.textContent?.trim()));

  // Place normal icons top-left, column by column
  const rowsPerCol = iconGridRows();
  normalIcons.forEach((icon, idx) => {
    const col = Math.floor(idx / rowsPerCol);
    const row = idx % rowsPerCol;
    icon.style.position = 'absolute';
    snapIconToCell(icon, col, row);
  });

  // Place right-column icons stacked at the bottom-right column
  // Order bottom-to-top: Recycle Bin, CK, CK Projects, Legal Notice
  const rightCol = iconGridCols() - 1;
  const bottomRow = iconGridRows() - 1;
  const brOrder = ['Recycle Bin', 'CK', 'CK Projects', 'Legal Notice'];
  brIcons.sort((a, b) => {
    const ai = brOrder.indexOf(a.querySelector('span')?.textContent?.trim());
    const bi = brOrder.indexOf(b.querySelector('span')?.textContent?.trim());
    return ai - bi;
  });
  brIcons.forEach((icon, i) => {
    icon.style.position = 'absolute';
    const row = clamp(bottomRow - i, 0, iconGridRows() - 1);
    snapIconToCell(icon, rightCol, row);
  });

  // Attach drag behaviour to all icons
  allIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });

    let dragging = false, ox = 0, oy = 0;

    icon.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      dragging = true;
      ox = e.clientX - icon.offsetLeft;
      oy = e.clientY - icon.offsetTop;
      icon.style.zIndex = 99;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const maxX = window.innerWidth  - ICON_CELL;
      const maxY = window.innerHeight - 30 - ICON_CELL;
      icon.style.left = clamp(e.clientX - ox, 0, maxX) + 'px';
      icon.style.top  = clamp(e.clientY - oy, 0, maxY) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      icon.style.zIndex = '';
      // Snap to nearest grid cell
      const { col, row } = pixelToCell(icon.offsetLeft, icon.offsetTop);
      snapIconToCell(icon, col, row);
    });
  });

  // Re-snap all icons when the window is resized
  window.addEventListener('resize', () => {
    allIcons.forEach(icon => {
      const col = parseInt(icon.dataset.gridCol) || 0;
      const row = parseInt(icon.dataset.gridRow) || 0;
      const clamped = {
        col: clamp(col, 0, iconGridCols() - 1),
        row: clamp(row, 0, iconGridRows() - 1),
      };
      snapIconToCell(icon, clamped.col, clamped.row);
    });
  });
})();

// ============================
// NOTEPAD
// ============================
function initNotepad(content) {
  const ta         = content.querySelector('.notepad-textarea');
  const statusEl   = content.querySelector('.np-status');
  const filenameEl = content.querySelector('.np-filename');
  const fileInput  = content.querySelector('#np-file-input');
  if (!ta) return;

  let currentFilename = 'Untitled';
  let dirty = false;

  // ── Restore last session from localStorage ──────────────────────────────
  const saved = localStorage.getItem('notepad_content');
  const savedName = localStorage.getItem('notepad_filename');
  if (saved !== null) { ta.value = saved; currentFilename = savedName || 'Untitled'; }
  if (filenameEl) filenameEl.textContent = currentFilename;
  ta.focus();

  // ── Auto-save to localStorage on every change ────────────────────────────
  ta.addEventListener('input', () => {
    dirty = true;
    localStorage.setItem('notepad_content', ta.value);
    localStorage.setItem('notepad_filename', currentFilename);
    if (filenameEl) filenameEl.textContent = (dirty ? '* ' : '') + currentFilename;
  });

  // ── Cursor position status bar ───────────────────────────────────────────
  ta.addEventListener('keyup', updateStatus);
  ta.addEventListener('click', updateStatus);
  function updateStatus() {
    const lines = ta.value.substr(0, ta.selectionStart).split('\n');
    if (statusEl) statusEl.textContent = `Ln ${lines.length}, Col ${lines[lines.length-1].length + 1}`;
  }

  // ── Ctrl+S shortcut ──────────────────────────────────────────────────────
  ta.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); doSave(); }
  });

  // ── Save helpers ─────────────────────────────────────────────────────────
  function doSave() {
    const fname = (currentFilename === 'Untitled' || currentFilename === '* Untitled')
      ? (prompt('Save as:', 'document.txt') || 'document.txt')
      : currentFilename;
    doSaveAs(fname);
  }

  function doSaveAs(fname) {
    if (!fname) return;
    currentFilename = fname.replace(/^\* /, '');
    dirty = false;
    localStorage.setItem('notepad_content', ta.value);
    localStorage.setItem('notepad_filename', currentFilename);
    if (filenameEl) filenameEl.textContent = currentFilename;
    // Download the file
    const blob = new Blob([ta.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = currentFilename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function doNew() {
    if (dirty && ta.value && !confirm('Discard unsaved changes?')) return;
    ta.value = '';
    currentFilename = 'Untitled';
    dirty = false;
    localStorage.removeItem('notepad_content');
    localStorage.removeItem('notepad_filename');
    if (filenameEl) filenameEl.textContent = currentFilename;
    ta.focus();
  }

  // ── File menu wiring ─────────────────────────────────────────────────────
  const trigger  = content.querySelector('#np-file-trigger');
  const menu     = content.querySelector('#np-file-menu');

  if (trigger && menu) {
    trigger.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('hidden'); });
    document.addEventListener('click', () => menu.classList.add('hidden'));
  }

  const newBtn    = content.querySelector('#np-new');
  const openBtn   = content.querySelector('#np-open');
  const saveBtn   = content.querySelector('#np-save');
  const saveAsBtn = content.querySelector('#np-saveas');

  if (newBtn)    newBtn.addEventListener('click',    () => { menu?.classList.add('hidden'); doNew(); });
  if (saveBtn)   saveBtn.addEventListener('click',   () => { menu?.classList.add('hidden'); doSave(); });
  if (saveAsBtn) saveAsBtn.addEventListener('click', () => {
    menu?.classList.add('hidden');
    const fname = prompt('Save as:', currentFilename || 'document.txt');
    if (fname) doSaveAs(fname);
  });

  // Open local text file
  if (openBtn) {
    openBtn.addEventListener('click', () => { menu?.classList.add('hidden'); fileInput?.click(); });
  }
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        if (dirty && ta.value && !confirm('Discard unsaved changes?')) return;
        ta.value = e.target.result;
        currentFilename = file.name;
        dirty = false;
        localStorage.setItem('notepad_content', ta.value);
        localStorage.setItem('notepad_filename', currentFilename);
        if (filenameEl) filenameEl.textContent = currentFilename;
        updateStatus();
      };
      reader.readAsText(file);
      fileInput.value = '';
    });
  }
}

// ============================
// INTERNET EXPLORER
// ============================
let ieHistory = ['home'];
let ieHistoryPos = 0;

// IE browser state (shared across calls, one IE instance at a time)
const _ie = {
  history: [],
  histIdx: -1,
};

function initIE(content) {
  // Show homepage by default
  showIEHomepage(content);
  _ie.history = [];
  _ie.histIdx = -1;

  // Wire the search button on the homepage
  const searchBtn = content.querySelector('.ie-search-btn');
  const searchInput = content.querySelector('.ie-search-input');
  if (searchBtn && searchInput) {
    const doSearch = () => {
      const q = searchInput.value.trim();
      if (!q) return;
      const url = 'https://www.startpage.com/search?q=' + encodeURIComponent(q);
      _ieLoad(content, url);
    };
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  }

  // Wire homepage hot-site links to navigate
  content.querySelectorAll('.ie-home-col a[href="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const label = a.textContent.trim();
      const mapping = {
        'AskJeeves.com': 'https://ask.com',
        'Geocities.com': 'https://web.archive.org/web/2001*/http://www.geocities.com/',
        'Neopets.com': 'https://www.neopets.com',
        'MapQuest.com': 'https://www.mapquest.com',
        'AngelFire.com': 'https://www.angelfire.lycos.com',
        'Amazon.com': 'https://www.amazon.com',
        'eBay.com': 'https://www.ebay.com',
        'CDW.com': 'https://www.cdw.com',
        'BestBuy.com': 'https://www.bestbuy.com',
      };
      const url = mapping[label];
      if (url) _ieLoad(content, url);
    });
  });
}

function _ieLoad(content, url) {
  const frame = content.querySelector('#ie-frame');
  const hp = content.querySelector('#ie-homepage');
  const blocked = content.querySelector('#ie-blocked');
  const addrInput = content.querySelector('#ie-addr-input');
  const statusEl = content.querySelector('.ie-status-zone');

  if (!frame) return;

  // Normalize URL
  if (!url.match(/^https?:\/\//i)) url = 'https://' + url;

  // Update address bar
  if (addrInput) addrInput.value = url;

  // Push history
  if (_ie.history[_ie.histIdx] !== url) {
    _ie.history.splice(_ie.histIdx + 1);
    _ie.history.push(url);
    _ie.histIdx = _ie.history.length - 1;
  }

  // Hide homepage, show frame, hide blocked notice
  if (hp) hp.style.display = 'none';
  if (blocked) blocked.style.display = 'none';
  frame.style.display = 'block';

  // Status bar loading
  if (statusEl) statusEl.textContent = '⌛ Opening page ' + url + '...';

  // Inject sandbox and attempt to load
  frame.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
  frame.src = url;

  // On load – try to detect if the page actually rendered or was blocked
  const loadHandler = () => {
    frame.removeEventListener('load', loadHandler);
    frame.removeEventListener('error', errorHandler);

    let accessible = false;
    try {
      // If same-origin or non-blocked, contentDocument won't throw
      const doc = frame.contentDocument;
      accessible = doc && doc.body !== null && doc.body.innerHTML !== '';
    } catch (_) {
      accessible = false;
    }

    // If the frame src didn't change (browser refused), or body is completely empty, show blocked
    const loadedSrc = (() => { try { return frame.contentWindow.location.href; } catch(_) { return ''; } })();
    const wasBlocked = !accessible && (loadedSrc === 'about:blank' || loadedSrc === '');

    if (statusEl) {
      statusEl.innerHTML = wasBlocked
        ? `<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="6" fill="none" stroke="#1565c0" stroke-width="1.5"/><ellipse cx="8" cy="8" rx="3" ry="6" fill="none" stroke="#1565c0" stroke-width="1"/><line x1="2" y1="8" x2="14" y2="8" stroke="#1565c0" stroke-width="1"/></svg> Internet`
        : `<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="6" fill="none" stroke="#1565c0" stroke-width="1.5"/><ellipse cx="8" cy="8" rx="3" ry="6" fill="none" stroke="#1565c0" stroke-width="1"/><line x1="2" y1="8" x2="14" y2="8" stroke="#1565c0" stroke-width="1"/></svg> Internet`;
    }

    if (wasBlocked) _ieShowBlocked(content, url);
  };

  const errorHandler = () => {
    frame.removeEventListener('load', loadHandler);
    frame.removeEventListener('error', errorHandler);
    _ieShowBlocked(content, url);
  };

  frame.addEventListener('load', loadHandler);
  frame.addEventListener('error', errorHandler);

  // Safety timeout — if 8 s pass and we still can't read the doc, treat as blocked
  setTimeout(() => {
    let accessible = false;
    try { accessible = frame.contentDocument?.body?.innerHTML !== ''; } catch(_) {}
    if (!accessible) {
      frame.removeEventListener('load', loadHandler);
      frame.removeEventListener('error', errorHandler);
      _ieShowBlocked(content, url);
    }
  }, 8000);
}

function _ieShowBlocked(content, url) {
  const frame = content.querySelector('#ie-frame');
  let blocked = content.querySelector('#ie-blocked');

  if (!blocked) {
    blocked = document.createElement('div');
    blocked.id = 'ie-blocked';
    blocked.className = 'ie-blocked';
    content.querySelector('.ie-body')?.appendChild(blocked);
  }

  blocked.innerHTML = `
    <div class="ie-blocked-inner">
      <div class="ie-blocked-icon">⚠️</div>
      <h3>The page cannot be displayed</h3>
      <p>The website at <strong>${url}</strong> cannot be shown in this window.</p>
      <p class="ie-blocked-reason">This is usually because the website does not allow itself to be embedded in another page (X-Frame-Options or Content Security Policy).</p>
      <div class="ie-blocked-actions">
        <button class="exp-btn" onclick="window.open('${url.replace(/'/g,"\\'")}','_blank')">🌐 Open in new tab</button>
        <button class="exp-btn" id="ie-blocked-home-btn">🏠 Go to Homepage</button>
      </div>
    </div>`;

  blocked.querySelector('#ie-blocked-home-btn')?.addEventListener('click', () => {
    ieHome();
  });

  if (frame) frame.style.display = 'none';
  blocked.style.display = 'flex';
}

function showIEHomepage(content) {
  const hp = content.querySelector('#ie-homepage');
  const frame = content.querySelector('#ie-frame');
  const blocked = content.querySelector('#ie-blocked');
  if (hp) hp.style.display = 'block';
  if (frame) frame.style.display = 'none';
  if (blocked) blocked.style.display = 'none';
}

function ieNavigate(e) {
  if (e.key === 'Enter') ieGo();
}

function ieGo() {
  // Find the active IE window content
  const winData = windows['iexplore'];
  if (!winData) return;
  const input = winData.content.querySelector('#ie-addr-input');
  if (!input) return;
  let url = input.value.trim();
  if (!url) return;
  _ieLoad(winData.content, url);
}

function ieHome() {
  const win = windows['iexplore'];
  if (!win) return;
  const input = win.content.querySelector('#ie-addr-input');
  if (input) input.value = 'http://www.msn.com';
  showIEHomepage(win.content);
  _ie.history = [];
  _ie.histIdx = -1;
}

function ieRefresh() {
  const win = windows['iexplore'];
  if (!win) return;
  const frame = win.content.querySelector('#ie-frame');
  const hp = win.content.querySelector('#ie-homepage');
  if (hp && hp.style.display !== 'none') return; // on homepage, nothing to do
  if (frame && frame.src && frame.src !== 'about:blank') {
    const url = frame.src;
    frame.src = 'about:blank';
    setTimeout(() => { _ieLoad(win.content, url); }, 80);
  }
}

function ieBack() {
  if (_ie.histIdx <= 0) return;
  _ie.histIdx--;
  const url = _ie.history[_ie.histIdx];
  const win = windows['iexplore'];
  if (!win) return;
  const addrInput = win.content.querySelector('#ie-addr-input');
  if (addrInput) addrInput.value = url;
  const frame = win.content.querySelector('#ie-frame');
  if (frame) {
    frame.style.display = 'block';
    const blocked = win.content.querySelector('#ie-blocked');
    const hp = win.content.querySelector('#ie-homepage');
    if (blocked) blocked.style.display = 'none';
    if (hp) hp.style.display = 'none';
    frame.src = url;
  }
}

function ieForward() {
  if (_ie.histIdx >= _ie.history.length - 1) return;
  _ie.histIdx++;
  const url = _ie.history[_ie.histIdx];
  const win = windows['iexplore'];
  if (!win) return;
  const addrInput = win.content.querySelector('#ie-addr-input');
  if (addrInput) addrInput.value = url;
  const frame = win.content.querySelector('#ie-frame');
  if (frame) {
    frame.style.display = 'block';
    const blocked = win.content.querySelector('#ie-blocked');
    const hp = win.content.querySelector('#ie-homepage');
    if (blocked) blocked.style.display = 'none';
    if (hp) hp.style.display = 'none';
    frame.src = url;
  }
}

function showIEError() {
  openDialog(
    'Cannot find server',
    `The page cannot be displayed.\n\nThe page you are looking for is currently unavailable.`,
    ['OK'],
    '⚠️'
  );
}

// ============================
// 3D SCENES FOLDER
// ============================
function initScenes3d(content) {
  content.querySelectorAll('.scenes3d-item').forEach(item => {
    item.addEventListener('dblclick', () => {
      const app = item.dataset.app;
      if (app) openApp(app);
    });
    // Single click = select
    item.addEventListener('click', () => {
      content.querySelectorAll('.scenes3d-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
}


// ============================
// TETRIS
// ============================
function initTetris(content) {
  const canvas  = content.querySelector('.tetris-board');
  const nextCvs = content.querySelector('.tetris-next');
  const overlay = content.querySelector('.tetris-overlay');
  const startBtn = content.querySelector('#tetris-start-btn');
  const scoreEl = content.querySelector('.tetris-score');
  const linesEl = content.querySelector('.tetris-lines');
  const levelEl = content.querySelector('.tetris-level');
  const ctx  = canvas.getContext('2d');
  const nctx = nextCvs.getContext('2d');

  const COLS = 10, ROWS = 20, SZ = 20;
  const COLORS = ['', '#00e5ff','#ff4081','#76ff03','#ffab00','#e040fb','#ff6d00','#1de9b6'];
  const SHAPES = [
    [],
    [[1,1,1,1]],
    [[2,0],[2,0],[2,2]],
    [[0,3],[0,3],[3,3]],
    [[4,4],[4,4]],
    [[0,5,5],[5,5,0]],
    [[6,6,0],[0,6,6]],
    [[0,7,0],[7,7,7]],
  ];

  let board, piece, nextPiece, score, lines, level, speed, rafId, paused, running;

  function newBoard() { return Array.from({length:ROWS}, ()=>Array(COLS).fill(0)); }

  function randomPiece() {
    const t = Math.floor(Math.random()*7)+1;
    const s = SHAPES[t].map(r=>[...r]);
    return { t, s, x: Math.floor((COLS - s[0].length)/2), y: 0 };
  }

  function rotate(s) {
    const r = s[0].length, c = s.length;
    return Array.from({length:r}, (_,i)=>Array.from({length:c}, (_,j)=>s[c-1-j][i]));
  }

  function valid(s, x, y) {
    return s.every((row,r)=>row.every((v,c)=>{
      if (!v) return true;
      const nx=x+c, ny=y+r;
      return nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&!board[ny][nx];
    }));
  }

  function place() {
    piece.s.forEach((row,r)=>row.forEach((v,c)=>{
      if (v) board[piece.y+r][piece.x+c]=v;
    }));
    let cleared=0;
    for (let r=ROWS-1;r>=0;r--) {
      if (board[r].every(v=>v)) { board.splice(r,1); board.unshift(Array(COLS).fill(0)); cleared++; r++; }
    }
    const pts=[0,100,300,500,800];
    score += (pts[cleared]||0)*level;
    lines += cleared;
    level = Math.floor(lines/10)+1;
    speed = Math.max(100, 800 - (level-1)*70);
    scoreEl.textContent = score;
    linesEl.textContent = lines;
    levelEl.textContent = level;
    piece = nextPiece;
    nextPiece = randomPiece();
    drawNext();
    if (!valid(piece.s, piece.x, piece.y)) gameOver();
  }

  function drawBlock(c, r, v, context, sz, ox=0, oy=0) {
    context.fillStyle = COLORS[v];
    context.fillRect(ox+c*sz+1, oy+r*sz+1, sz-2, sz-2);
    context.fillStyle = 'rgba(255,255,255,0.25)';
    context.fillRect(ox+c*sz+1, oy+r*sz+1, sz-2, 3);
  }

  function drawBoard() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0,0,COLS*SZ,ROWS*SZ);
    ctx.strokeStyle='rgba(255,255,255,0.05)';
    ctx.lineWidth=0.5;
    for(let r=0;r<ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*SZ);ctx.lineTo(COLS*SZ,r*SZ);ctx.stroke();}
    for(let c=0;c<COLS;c++){ctx.beginPath();ctx.moveTo(c*SZ,0);ctx.lineTo(c*SZ,ROWS*SZ);ctx.stroke();}
    board.forEach((row,r)=>row.forEach((v,c)=>{ if(v) drawBlock(c,r,v,ctx,SZ); }));
    if (piece) {
      let gy = piece.y;
      while(valid(piece.s,piece.x,gy+1)) gy++;
      piece.s.forEach((row,r)=>row.forEach((v,c)=>{
        if(v){ ctx.fillStyle='rgba(255,255,255,0.12)'; ctx.fillRect((piece.x+c)*SZ+1,(gy+r)*SZ+1,SZ-2,SZ-2); }
      }));
      piece.s.forEach((row,r)=>row.forEach((v,c)=>{ if(v) drawBlock(piece.x+c,piece.y+r,v,ctx,SZ); }));
    }
  }

  function drawNext() {
    nctx.fillStyle='#111'; nctx.fillRect(0,0,80,80);
    const s=nextPiece.s, sz=16;
    const ox=Math.floor((80-s[0].length*sz)/2), oy=Math.floor((80-s.length*sz)/2);
    s.forEach((row,r)=>row.forEach((v,c)=>{ if(v) drawBlock(c,r,v,nctx,sz,ox,oy); }));
  }

  let lastTime=0, dropAcc=0;
  function loop(ts) {
    if (!running||paused) return;
    const dt = ts-lastTime; lastTime=ts; dropAcc+=dt;
    if (dropAcc>=speed) { dropAcc=0; moveDown(); }
    drawBoard();
    rafId = requestAnimationFrame(loop);
  }

  function moveDown() {
    if (valid(piece.s,piece.x,piece.y+1)) piece.y++;
    else place();
  }

  function gameOver() {
    running=false; cancelAnimationFrame(rafId);
    overlay.textContent='GAME OVER';
    overlay.style.display='flex';
    startBtn.textContent='RESTART';
  }

  function start() {
    board=newBoard(); score=0; lines=0; level=1; speed=800;
    scoreEl.textContent=0; linesEl.textContent=0; levelEl.textContent=1;
    piece=randomPiece(); nextPiece=randomPiece(); drawNext();
    paused=false; running=true;
    overlay.style.display='none';
    startBtn.textContent='PAUSE';
    lastTime=0; dropAcc=0;
    cancelAnimationFrame(rafId);
    rafId=requestAnimationFrame(loop);
  }

  startBtn.addEventListener('click', ()=>{
    if (!running) { start(); return; }
    paused=!paused;
    startBtn.textContent=paused?'RESUME':'PAUSE';
    if (!paused) { lastTime=0; rafId=requestAnimationFrame(loop); }
  });

  const keyMap = {
    ArrowLeft: ()=>{ if(piece&&valid(piece.s,piece.x-1,piece.y)){ piece.x--; drawBoard(); } },
    ArrowRight:()=>{ if(piece&&valid(piece.s,piece.x+1,piece.y)){ piece.x++; drawBoard(); } },
    ArrowDown: ()=>{ if(piece){ moveDown(); dropAcc=0; drawBoard(); } },
    ArrowUp:   ()=>{ if(piece){ const r=rotate(piece.s); if(valid(r,piece.x,piece.y)){ piece.s=r; drawBoard(); } } },
    ' ':       ()=>{ if(piece){ while(valid(piece.s,piece.x,piece.y+1)) piece.y++; place(); drawBoard(); } },
    p:         ()=>{ if(running){ paused=!paused; startBtn.textContent=paused?'RESUME':'PAUSE'; if(!paused){lastTime=0;rafId=requestAnimationFrame(loop);} } },
    P:         ()=>keyMap['p'](),
  };

  function onTetrisKey(e) {
    if (!running||paused&&e.key!=='p'&&e.key!=='P') return;
    if (!keyMap[e.key]) return;
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
    keyMap[e.key]();
  }
  document.addEventListener('keydown', onTetrisKey);

  const winId = Object.keys(windows).find(k=>windows[k] && windows[k].el && windows[k].el.contains(canvas));
  if (winId) {
    windows[winId].el.querySelector('.win-close')?.addEventListener('click', ()=>{
      cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', onTetrisKey);
    }, {once:true});
  }

  board=newBoard(); drawBoard();
  overlay.style.cssText='display:flex;align-items:center;justify-content:center;position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.65);color:#fff;font-size:22px;font-weight:bold;letter-spacing:2px;pointer-events:none;z-index:10;';
  overlay.textContent='Press START';
  overlay.style.display='flex';
}

// ============================
// CASINO HELPERS
// ============================
function makeDeck() {
  const suits=['♠','♥','♦','♣'], vals=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const d=[];
  for(const s of suits) for(const v of vals) d.push({s,v});
  return d;
}
function shuffleDeck(d) { for(let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; } return d; }
function cardVal(v) { if(['J','Q','K'].includes(v)) return 10; if(v==='A') return 11; return parseInt(v); }
function renderCard(card, faceDown=false) {
  if (faceDown) return `<div class="casino-card face-down"><span class="card-suit">🂠</span></div>`;
  const red = card.s==='♥'||card.s==='♦';
  return `<div class="casino-card${red?' red':''}"><span class="card-top">${card.v}</span><span class="card-suit">${card.s}</span></div>`;
}
function setupCasinoBetBtns(content, getBet, setBet, getBalance) {
  content.querySelectorAll('.casino-chip:not(.casino-chip-clear)').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const amt = parseInt(btn.dataset.amount);
      if (getBet()+amt > getBalance()) return;
      setBet(getBet()+amt);
    });
  });
  const clr = content.querySelector('.casino-chip-clear');
  if(clr) clr.addEventListener('click', ()=>setBet(0));
}

// ============================
// BLACKJACK
// ============================
function initBlackjack(content) {
  let balance=1000, bet=0, deck=[], state='betting';
  let playerHand=[], dealerHand=[];

  const balEl    = content.querySelector('.casino-balance');
  const betEl    = content.querySelector('.casino-bet-display');
  const msgEl    = content.querySelector('.bj-msg');
  const dealerHandEl  = content.querySelector('.dealer-hand');
  const playerHandEl  = content.querySelector('.player-hand');
  const dealerScoreEl = content.querySelector('.dealer-score');
  const playerScoreEl = content.querySelector('.player-score');
  const dealBtn  = content.querySelector('.bj-deal-btn');
  const hitBtn   = content.querySelector('.bj-hit-btn');
  const standBtn = content.querySelector('.bj-stand-btn');
  const dblBtn   = content.querySelector('.bj-double-btn');

  function updateUI() { balEl.textContent=balance; betEl.textContent=bet; }
  function setBet(v){ bet=v; updateUI(); }
  function getBet(){ return bet; }
  function getBalance(){ return balance; }

  setupCasinoBetBtns(content, getBet, setBet, getBalance);

  function bjScore(hand, hideSecond=false) {
    const cards = hideSecond ? [hand[0]] : hand;
    let s=0, aces=0;
    for(const c of cards){ let v=cardVal(c.v); if(v===11) aces++; s+=v; }
    while(s>21&&aces>0){ s-=10; aces--; }
    return s;
  }

  function renderHands(hideDealer=true) {
    dealerHandEl.innerHTML = dealerHand.map((c,i)=>renderCard(c, hideDealer&&i===1)).join('');
    playerHandEl.innerHTML = playerHand.map(c=>renderCard(c)).join('');
    playerScoreEl.textContent = 'Score: '+bjScore(playerHand);
    dealerScoreEl.textContent = hideDealer ? '' : 'Score: '+bjScore(dealerHand);
  }

  function setActionBtns(playing) {
    hitBtn.disabled = !playing;
    standBtn.disabled = !playing;
    dblBtn.disabled = !playing;
    dealBtn.disabled = playing;
  }

  function deal() {
    if (bet<=0) { msgEl.textContent='Place a bet first!'; return; }
    if (bet>balance) { msgEl.textContent='Not enough balance!'; return; }
    balance-=bet; updateUI();
    deck=shuffleDeck(makeDeck());
    playerHand=[deck.pop(), deck.pop()];
    dealerHand=[deck.pop(), deck.pop()];
    state='playing';
    setActionBtns(true);
    dblBtn.disabled = balance<bet;
    msgEl.textContent='';
    renderHands(true);
    if (bjScore(playerHand)===21) { stand(); }
  }

  function hit() {
    playerHand.push(deck.pop());
    renderHands(true);
    if (bjScore(playerHand)>21) { endGame('bust'); }
  }

  function stand() {
    while(bjScore(dealerHand)<17) dealerHand.push(deck.pop());
    renderHands(false);
    const ps=bjScore(playerHand), ds=bjScore(dealerHand);
    if (ps>21) endGame('bust');
    else if (ds>21||ps>ds) endGame('win');
    else if (ps===ds) endGame('push');
    else endGame('lose');
  }

  function doubleDown() {
    if (balance<bet) return;
    balance-=bet; bet*=2; updateUI();
    playerHand.push(deck.pop());
    renderHands(true);
    if (bjScore(playerHand)>21) endGame('bust');
    else stand();
  }

  function endGame(result) {
    state='done';
    setActionBtns(false);
    renderHands(false);
    if (result==='win') {
      const isNat=bjScore(playerHand)===21&&playerHand.length===2;
      if (isNat) { const w=bet+Math.floor(bet*1.5); balance+=w; msgEl.textContent=`Blackjack! You win $${w}! 🎰`; }
      else { balance+=bet*2; msgEl.textContent=`You win $${bet*2}! 🎉`; }
    } else if (result==='push') { balance+=bet; msgEl.textContent=`Push — bet returned ($${bet}).`; }
    else if (result==='bust') { msgEl.textContent='Bust! You lose.'; }
    else { msgEl.textContent=`Dealer wins. You lose $${bet}.`; }
    updateUI();
    if (balance<=0) {
      msgEl.textContent+=' Game over! Reloading...';
      setTimeout(()=>{ balance=1000; bet=0; updateUI(); msgEl.textContent='Balance reset to $1000.'; playerHandEl.innerHTML=''; dealerHandEl.innerHTML=''; playerScoreEl.textContent=''; dealerScoreEl.textContent=''; },2000);
    }
    bet=0;
  }

  dealBtn.addEventListener('click', deal);
  hitBtn.addEventListener('click', hit);
  standBtn.addEventListener('click', stand);
  dblBtn.addEventListener('click', doubleDown);
  updateUI();
}

// ============================
// 5-CARD DRAW POKER
// ============================
function initPoker(content) {
  let balance=1000, bet=0, deck=[], hand=[], held=[], state='betting';

  const balEl   = content.querySelector('.casino-balance');
  const betEl   = content.querySelector('.casino-bet-display');
  const msgEl   = content.querySelector('.poker-msg');
  const handEl  = content.querySelector('.poker-hand');
  const nameEl  = content.querySelector('.poker-hand-name');
  const dealBtn = content.querySelector('.poker-deal-btn');
  const drawBtn = content.querySelector('.poker-draw-btn');

  function updateUI(){ balEl.textContent=balance; betEl.textContent=bet; }
  function setBet(v){ bet=v; updateUI(); }
  function getBet(){ return bet; }
  function getBalance(){ return balance; }

  setupCasinoBetBtns(content, getBet, setBet, getBalance);

  function renderHand() {
    handEl.innerHTML = hand.map((c,i)=>{
      const red=c.s==='♥'||c.s==='♦';
      const isHeld=held.includes(i);
      return `<div class="casino-card${red?' red':''} poker-card${isHeld?' held':''}" data-idx="${i}">
        <span class="card-top">${c.v}</span><span class="card-suit">${c.s}</span>
        <span class="hold-label">${isHeld?'HELD':''}</span>
      </div>`;
    }).join('');
    handEl.querySelectorAll('.poker-card').forEach(el=>{
      el.addEventListener('click', ()=>{
        if (state!=='drawing') return;
        const idx=parseInt(el.dataset.idx);
        if (held.includes(idx)) held=held.filter(h=>h!==idx);
        else held.push(idx);
        renderHand();
      });
    });
  }

  function rankIdx(v){ return ['2','3','4','5','6','7','8','9','10','J','Q','K','A'].indexOf(v); }

  function evalHand(h) {
    const vals=h.map(c=>c.v), suits=h.map(c=>c.s);
    const idxs=vals.map(rankIdx).sort((a,b)=>a-b);
    const counts={};
    for(const v of vals) counts[v]=(counts[v]||0)+1;
    const freq=Object.values(counts).sort((a,b)=>b-a);
    const flush = suits.every(s=>s===suits[0]);
    const straight = (idxs[4]-idxs[0]===4&&new Set(idxs).size===5) ||
                     (vals.includes('A')&&vals.includes('2')&&vals.includes('3')&&vals.includes('4')&&vals.includes('5'));
    const royal = flush&&straight&&vals.includes('A')&&vals.includes('K');
    if (royal)                    return {name:'Royal Flush',   mult:250};
    if (flush&&straight)          return {name:'Straight Flush',mult:50};
    if (freq[0]===4)               return {name:'Four of a Kind',mult:25};
    if (freq[0]===3&&freq[1]===2)  return {name:'Full House',   mult:9};
    if (flush)                     return {name:'Flush',         mult:6};
    if (straight)                  return {name:'Straight',      mult:4};
    if (freq[0]===3)               return {name:'Three of a Kind',mult:3};
    if (freq[0]===2&&freq[1]===2)  return {name:'Two Pair',     mult:2};
    const pairs=Object.entries(counts).filter(([,c])=>c>=2).map(([v])=>v);
    if (pairs.some(v=>['J','Q','K','A'].includes(v))) return {name:'Jacks or Better',mult:1};
    return {name:'No Win',mult:0};
  }

  function deal() {
    if (bet<=0){ msgEl.textContent='Place a bet first!'; return; }
    if (bet>balance){ msgEl.textContent='Not enough balance!'; return; }
    balance-=bet; updateUI();
    deck=shuffleDeck(makeDeck());
    hand=[deck.pop(),deck.pop(),deck.pop(),deck.pop(),deck.pop()];
    held=[];
    state='drawing';
    dealBtn.disabled=true; drawBtn.disabled=false;
    nameEl.textContent=''; msgEl.textContent='Click cards to HOLD, then Draw.';
    renderHand();
  }

  function draw() {
    hand=hand.map((c,i)=>held.includes(i)?c:deck.pop());
    state='done';
    drawBtn.disabled=true; dealBtn.disabled=false;
    const result=evalHand(hand);
    nameEl.textContent=result.name;
    held=hand.map((_,i)=>i); renderHand();
    held=[];
    if (result.mult>0) {
      const win=bet*result.mult;
      balance+=win;
      msgEl.textContent=`${result.name}! You win $${win}! 🎉`;
    } else {
      msgEl.textContent=`${result.name}. You lose $${bet}.`;
    }
    bet=0; updateUI();
    if (balance<=0){ msgEl.textContent+=' Game over! Reloading...'; setTimeout(()=>{ balance=1000; updateUI(); msgEl.textContent='Balance reset to $1000.'; handEl.innerHTML=''; nameEl.textContent=''; },2000); }
  }

  dealBtn.addEventListener('click', deal);
  drawBtn.addEventListener('click', draw);
  updateUI();
}

// ============================
// BACCARAT
// ============================
function initBaccarat(content) {
  let balance=1000, bet=0, betSide='', deck=[];

  const balEl   = content.querySelector('.casino-balance');
  const betEl   = content.querySelector('.casino-bet-display');
  const msgEl   = content.querySelector('.baccarat-msg');
  const phEl    = content.querySelector('.player-hand');
  const bhEl    = content.querySelector('.banker-hand');
  const psEl    = content.querySelector('.player-score');
  const bsEl    = content.querySelector('.banker-score');
  const dealBtn = content.querySelector('.baccarat-deal-btn');
  const newBtn  = content.querySelector('.baccarat-new-btn');
  const histEl  = content.querySelector('.baccarat-hist-dots');

  function updateUI(){ balEl.textContent=balance; betEl.textContent=bet; }
  function setBet(v){ bet=v; updateUI(); dealBtn.disabled=(!betSide||bet<=0); }
  function getBet(){ return bet; }
  function getBalance(){ return balance; }

  content.querySelectorAll('.casino-chip:not(.casino-chip-clear)').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const amt=parseInt(btn.dataset.amount);
      if(getBet()+amt>getBalance()) return;
      setBet(getBet()+amt);
    });
  });
  const clr=content.querySelector('.casino-chip-clear');
  if(clr) clr.addEventListener('click', ()=>setBet(0));

  content.querySelectorAll('.baccarat-side-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      betSide=btn.dataset.side;
      content.querySelectorAll('.baccarat-side-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      dealBtn.disabled = (bet<=0);
      msgEl.textContent=`Betting on ${betSide.toUpperCase()}. Set amount and click Deal.`;
    });
  });

  function bacScore(hand){ return hand.reduce((s,c)=>{ const v=cardVal(c.v); return s+(v>=10?0:v); },0)%10; }

  function dealRound() {
    if (!betSide){ msgEl.textContent='Choose Player, Banker, or Tie first!'; return; }
    if (bet<=0){ msgEl.textContent='Place a bet first!'; return; }
    balance-=bet; updateUI();
    deck=shuffleDeck(makeDeck());
    let ph=[deck.pop(),deck.pop()];
    let bh=[deck.pop(),deck.pop()];
    let ps=bacScore(ph), bs=bacScore(bh);

    const natural = ps>=8||bs>=8;
    if (!natural) {
      if (ps<=5){ ph.push(deck.pop()); ps=bacScore(ph); }
      const p3=ph[2]?cardVal(ph[2].v)%10:null;
      if (p3===null) { if(bs<=5) bh.push(deck.pop()); }
      else {
        if(bs<=2||(bs===3&&p3!==8)||(bs===4&&[2,3,4,5,6,7].includes(p3))||(bs===5&&[4,5,6,7].includes(p3))||(bs===6&&[6,7].includes(p3)))
          bh.push(deck.pop());
      }
      bs=bacScore(bh);
    }

    phEl.innerHTML=ph.map(c=>renderCard(c)).join('');
    bhEl.innerHTML=bh.map(c=>renderCard(c)).join('');
    psEl.textContent=ps; bsEl.textContent=bs;

    let result;
    if (ps>bs) result='player';
    else if (bs>ps) result='banker';
    else result='tie';

    if (result===betSide) {
      let payout;
      if (betSide==='player') payout=bet*2;
      else if (betSide==='banker') payout=Math.floor(bet*1.95);
      else payout=bet*9;
      balance+=payout;
      msgEl.textContent=`${result.toUpperCase()} wins! You win $${payout}! 🎉`;
    } else if (result==='tie'&&betSide!=='tie') {
      balance+=bet;
      msgEl.textContent='Tie! Bet returned.';
    } else {
      msgEl.textContent=`${result.toUpperCase()} wins. You lose $${bet}.`;
    }

    const dot=document.createElement('span');
    dot.className='baccarat-dot baccarat-dot-'+result;
    dot.title=result.toUpperCase()[0]; dot.textContent=result.toUpperCase()[0];
    histEl.appendChild(dot);
    if(histEl.children.length>20) histEl.removeChild(histEl.firstChild);

    bet=0; betSide=''; updateUI();
    content.querySelectorAll('.baccarat-side-btn').forEach(b=>b.classList.remove('active'));
    dealBtn.disabled=true;
    if (balance<=0){ msgEl.textContent+=' Game over! Reloading...'; setTimeout(()=>{ balance=1000; updateUI(); msgEl.textContent='Balance reset to $1000.'; phEl.innerHTML=''; bhEl.innerHTML=''; psEl.textContent='0'; bsEl.textContent='0'; },2000); }
  }

  newBtn.addEventListener('click', ()=>{
    phEl.innerHTML=''; bhEl.innerHTML=''; psEl.textContent='0'; bsEl.textContent='0';
    msgEl.textContent='Place your bet on Player, Banker, or Tie!';
    bet=0; betSide=''; updateUI(); dealBtn.disabled=true;
    content.querySelectorAll('.baccarat-side-btn').forEach(b=>b.classList.remove('active'));
  });
  dealBtn.addEventListener('click', dealRound);
  updateUI();
}

// ============================
// GAMES FOLDER
// ============================
function initGames(content) {
  content.querySelectorAll('.games-item').forEach(item => {
    item.addEventListener('dblclick', () => {
      const app = item.dataset.app;
      if (app) openApp(app);
    });
    item.addEventListener('click', () => {
      content.querySelectorAll('.games-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
}

// ============================
// CK PROJECTS FOLDER
// ============================
function initCkProjects(content) {
  content.querySelectorAll('.ckproj-item').forEach(item => {
    item.addEventListener('dblclick', () => {
      const url = item.dataset.url;
      if (url) window.open(url, '_blank');
    });
    item.addEventListener('click', () => {
      content.querySelectorAll('.ckproj-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
}

// ============================
// GENERIC DIALOG
// ============================
function openDialog(title, message, buttons, icon = 'ℹ️') {
  if (windows['__dialog__']) return;

  const cfg = {
    title,
    icon: 'iexplore',
    width: 380,
    height: 180,
    tpl: null,
    onOpen: null,
  };

  const container = document.getElementById('windows-container');
  const winEl = document.createElement('div');
  winEl.className = 'window focused';
  winEl.dataset.wid = '__dialog__';
  winEl.style.width  = '380px';
  winEl.style.height = 'auto';
  winEl.style.left   = ((container.offsetWidth  - 380) / 2) + 'px';
  winEl.style.top    = ((container.offsetHeight - 180) / 2) + 'px';
  winEl.style.zIndex = ++zCounter;

  const titlebar = document.createElement('div');
  titlebar.className = 'win-titlebar';
  titlebar.innerHTML = `
    <div class="win-icon">${APP_ICONS['iexplore']}</div>
    <div class="win-title">${title}</div>
    <div class="win-controls">
      <button class="win-btn win-btn-close" title="Close">✕</button>
    </div>
  `;

  const body = document.createElement('div');
  body.className = 'win-error-body';
  body.innerHTML = `<div class="win-error-icon">${icon}</div><div>${message.replace(/\n/g, '<br>')}</div>`;

  const btnRow = document.createElement('div');
  btnRow.className = 'win-error-btns';
  buttons.forEach(label => {
    const b = document.createElement('button');
    b.className = 'win-dialog-btn';
    b.textContent = label;
    b.addEventListener('click', () => closeDialog());
    btnRow.appendChild(b);
  });

  winEl.appendChild(titlebar);
  winEl.appendChild(body);
  winEl.appendChild(btnRow);
  container.appendChild(winEl);

  windows['__dialog__'] = { el: winEl, id: '__dialog__', minimized: false, maximized: false, content: body };

  titlebar.querySelector('.win-btn-close').addEventListener('click', closeDialog);
  winEl.addEventListener('mousedown', () => focusWindow('__dialog__'));
  makeDraggable(winEl, titlebar, windows['__dialog__']);
  focusWindow('__dialog__');
}

function closeDialog() {
  const w = windows['__dialog__'];
  if (w) { w.el.remove(); delete windows['__dialog__']; }
}

// ============================
// MS PAINT
// ============================
let paintTool = 'pencil';
let paintDrawing = false;
let paintLastX = 0, paintLastY = 0;
let paintShapeStart = null;
let paintSnapshot = null;
let paintCanvas = null;
let paintCtx = null;

function initPaint(content) {
  paintCanvas = content.querySelector('#paint-canvas');
  if (!paintCanvas) return;
  paintCtx = paintCanvas.getContext('2d');

  // Fill white
  paintCtx.fillStyle = '#fff';
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);

  paintCanvas.addEventListener('mousedown', paintStart);
  paintCanvas.addEventListener('mousemove', paintMove);
  paintCanvas.addEventListener('mouseup', paintEnd);
  paintCanvas.addEventListener('mouseleave', paintEnd);
  paintCanvas.addEventListener('contextmenu', e => e.preventDefault());

  // File menu wiring for Paint
  const paintFileTrigger = content.querySelector('#paint-file-trigger');
  const paintFileMenu = content.querySelector('#paint-file-menu');
  if (paintFileTrigger && paintFileMenu) {
    paintFileTrigger.addEventListener('click', e => { e.stopPropagation(); paintFileMenu.classList.toggle('hidden'); });
    document.addEventListener('click', () => paintFileMenu.classList.add('hidden'));
  }

  // Open image file
  const paintOpenBtn = content.querySelector('#paint-open-btn');
  const paintFileInput = content.querySelector('#paint-file-input');
  if (paintOpenBtn && paintFileInput) {
    paintOpenBtn.addEventListener('click', () => {
      paintFileMenu?.classList.add('hidden');
      paintFileInput.click();
    });
    paintFileInput.addEventListener('change', () => {
      const file = paintFileInput.files[0];
      if (!file) return;
      const img = new Image();
      img.onload = () => {
        // Resize canvas to fit image
        paintCanvas.width = Math.min(img.width, 1200);
        paintCanvas.height = Math.min(img.height, 800);
        paintCtx.fillStyle = '#fff';
        paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
        paintCtx.drawImage(img, 0, 0, paintCanvas.width, paintCanvas.height);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
      paintFileInput.value = '';
    });
  }

  // Save as PNG
  const paintSaveBtn = content.querySelector('#paint-save-btn');
  if (paintSaveBtn) {
    paintSaveBtn.addEventListener('click', () => {
      paintFileMenu?.classList.add('hidden');
      const fname = prompt('Save as:', 'drawing.png') || 'drawing.png';
      const link = document.createElement('a');
      link.download = fname;
      link.href = paintCanvas.toDataURL('image/png');
      link.click();
    });
  }
}

function selectPaintTool(tool, btn) {
  paintTool = tool;
  document.querySelectorAll('.paint-tool').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function getPaintColor() {
  const c = document.getElementById('paint-color');
  return c ? c.value : '#000000';
}
function getPaintBgColor() {
  const c = document.getElementById('paint-bgcolor');
  return c ? c.value : '#ffffff';
}
function getPaintSize() {
  const s = document.getElementById('paint-size');
  return s ? parseInt(s.value) : 4;
}

function paintStart(e) {
  if (!paintCtx) return;
  paintDrawing = true;
  const r = paintCanvas.getBoundingClientRect();
  paintLastX = e.clientX - r.left;
  paintLastY = e.clientY - r.top;

  if (paintTool === 'fill') {
    floodFill(Math.round(paintLastX), Math.round(paintLastY), getPaintColor());
    paintDrawing = false;
    return;
  }
  if (['rect','ellipse','line'].includes(paintTool)) {
    paintShapeStart = { x: paintLastX, y: paintLastY };
    paintSnapshot = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
  }
  if (paintTool === 'pencil' || paintTool === 'eraser') {
    paintCtx.beginPath();
    paintCtx.arc(paintLastX, paintLastY, getPaintSize() / 2, 0, Math.PI * 2);
    paintCtx.fillStyle = paintTool === 'eraser' ? getPaintBgColor() : getPaintColor();
    paintCtx.fill();
  }
}

function paintMove(e) {
  if (!paintDrawing || !paintCtx) return;
  const r = paintCanvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  const status = document.getElementById('paint-status');
  if (status) status.textContent = `${Math.round(x)}, ${Math.round(y)}`;

  if (paintTool === 'pencil' || paintTool === 'eraser') {
    paintCtx.beginPath();
    paintCtx.moveTo(paintLastX, paintLastY);
    paintCtx.lineTo(x, y);
    paintCtx.strokeStyle = paintTool === 'eraser' ? getPaintBgColor() : getPaintColor();
    paintCtx.lineWidth = getPaintSize();
    paintCtx.lineCap = 'round';
    paintCtx.lineJoin = 'round';
    paintCtx.stroke();
  } else if (paintSnapshot && paintShapeStart) {
    paintCtx.putImageData(paintSnapshot, 0, 0);
    paintCtx.beginPath();
    paintCtx.strokeStyle = getPaintColor();
    paintCtx.fillStyle = getPaintColor();
    paintCtx.lineWidth = getPaintSize();
    if (paintTool === 'rect') {
      paintCtx.strokeRect(paintShapeStart.x, paintShapeStart.y, x - paintShapeStart.x, y - paintShapeStart.y);
    } else if (paintTool === 'ellipse') {
      const cx = (paintShapeStart.x + x) / 2;
      const cy = (paintShapeStart.y + y) / 2;
      const rx = Math.abs(x - paintShapeStart.x) / 2;
      const ry = Math.abs(y - paintShapeStart.y) / 2;
      paintCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      paintCtx.stroke();
    } else if (paintTool === 'line') {
      paintCtx.moveTo(paintShapeStart.x, paintShapeStart.y);
      paintCtx.lineTo(x, y);
      paintCtx.stroke();
    }
  }

  paintLastX = x;
  paintLastY = y;
}

function paintEnd() {
  paintDrawing = false;
  paintShapeStart = null;
  paintSnapshot = null;
}

function clearPaintCanvas() {
  if (!paintCtx || !paintCanvas) return;
  paintCtx.fillStyle = getPaintBgColor();
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
}

function repaintCanvas() {
  // Called after resize — no-op (canvas retains content in DOM)
}

// Simple flood fill
function floodFill(startX, startY, fillColor) {
  if (!paintCtx || !paintCanvas) return;
  const imgData = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
  const data = imgData.data;
  const idx = (startY * paintCanvas.width + startX) * 4;
  const tr = data[idx], tg = data[idx+1], tb = data[idx+2], ta = data[idx+3];

  const fill = hexToRgb(fillColor);
  if (!fill) return;
  if (tr === fill.r && tg === fill.g && tb === fill.b) return;

  const stack = [[startX, startY]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cx >= paintCanvas.width || cy < 0 || cy >= paintCanvas.height) continue;
    const ci = (cy * paintCanvas.width + cx) * 4;
    if (data[ci] !== tr || data[ci+1] !== tg || data[ci+2] !== tb || data[ci+3] !== ta) continue;
    data[ci]   = fill.r;
    data[ci+1] = fill.g;
    data[ci+2] = fill.b;
    data[ci+3] = 255;
    stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
  }
  paintCtx.putImageData(imgData, 0, 0);
}

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : null;
}

// ============================
// WINAMP
// ============================
let waPlaying = false;
let waCurrentTrack = 0;
let waTimeSeconds = 0;
let waTimerInterval = null;
let waVizInterval = null;
let waVizCtx = null;

const waTracks = [
  'Daft Punk - One More Time',
  'Basement Jaxx - Where\'s Your Head At',
  'Fatboy Slim - Praise You',
  'Gorillaz - Clint Eastwood',
  'The Prodigy - Firestarter',
];

function initWinamp(content) {
  const vizCanvas = content.querySelector('#winamp-canvas');
  if (vizCanvas) waVizCtx = vizCanvas.getContext('2d');
}

function waPlay() {
  waPlaying = true;
  document.getElementById('winamp-indicator').textContent = '▶';
  startWaTimer();
  startWaViz();
}

function waPause() {
  waPlaying = false;
  document.getElementById('winamp-indicator').textContent = '⏸';
  clearInterval(waTimerInterval);
}

function waStop() {
  waPlaying = false;
  waTimeSeconds = 0;
  document.getElementById('winamp-indicator').textContent = '■';
  clearInterval(waTimerInterval);
  updateWaTime();
  const pf = document.getElementById('winamp-progress-fill');
  if (pf) pf.style.width = '0%';
}

function stopWinamp() {
  waStop();
  clearInterval(waVizInterval);
}

function waPrev() {
  waCurrentTrack = (waCurrentTrack - 1 + waTracks.length) % waTracks.length;
  waSelectTrackById(waCurrentTrack);
}

function waNext() {
  waCurrentTrack = (waCurrentTrack + 1) % waTracks.length;
  waSelectTrackById(waCurrentTrack);
}

function waSelectTrack(idx, el) {
  waCurrentTrack = idx;
  document.querySelectorAll('.wa-track').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  updateWaTrackName();
  waTimeSeconds = 0;
  if (waPlaying) { clearInterval(waTimerInterval); startWaTimer(); }
}

function waSelectTrackById(idx) {
  const tracks = document.querySelectorAll('.wa-track');
  tracks.forEach((t, i) => t.classList.toggle('active', i === idx));
  updateWaTrackName();
  waTimeSeconds = 0;
  updateWaTime();
}

function updateWaTrackName() {
  const el = document.getElementById('winamp-track-name');
  if (el) el.textContent = waTracks[waCurrentTrack] + ' \u00a0\u00a0\u00a0\u00a0\u00a0';
}

function startWaTimer() {
  clearInterval(waTimerInterval);
  waTimerInterval = setInterval(() => {
    if (!waPlaying) return;
    waTimeSeconds++;
    updateWaTime();
    const pf = document.getElementById('winamp-progress-fill');
    const totalSec = 200 + waCurrentTrack * 40;
    if (pf) pf.style.width = Math.min(100, (waTimeSeconds / totalSec) * 100) + '%';
    if (waTimeSeconds >= totalSec) waNext();
  }, 1000);
}

function updateWaTime() {
  const el = document.getElementById('winamp-time');
  if (!el) return;
  const m = Math.floor(waTimeSeconds / 60);
  const s = (waTimeSeconds % 60).toString().padStart(2, '0');
  el.textContent = `${m}:${s}`;
}

function startWaViz() {
  clearInterval(waVizInterval);
  waVizInterval = setInterval(() => {
    if (!waVizCtx || !waPlaying) return;
    const w = 200, h = 30;
    waVizCtx.fillStyle = '#000';
    waVizCtx.fillRect(0, 0, w, h);
    const bars = 25;
    const bw = w / bars - 1;
    for (let i = 0; i < bars; i++) {
      const amp = Math.random();
      const bh = 3 + amp * (h - 4);
      const hue = 170 + amp * 60;
      waVizCtx.fillStyle = `hsl(${hue}, 100%, ${40 + amp * 40}%)`;
      waVizCtx.fillRect(i * (bw + 1), h - bh, bw, bh);
    }
  }, 80);
}

// ============================
// RECYCLE BIN
// ============================
function emptyRecycleBin() {
  const content = document.getElementById('recyclebin-content');
  const status = document.getElementById('recyclebin-status');
  if (content) content.innerHTML = '<div class="recycle-empty-msg">The Recycle Bin is empty.</div>';
  if (status) status.textContent = '0 objects';
}

// ============================
// SHUTDOWN
// ============================
function shutdownAnimation() {
  closeStartMenu();
  // Close all windows
  Object.keys(windows).forEach(id => closeWindow(id));
  const overlay = document.getElementById('shutdown-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    // After 4 seconds, "reboot"
    setTimeout(() => {
      overlay.classList.add('hidden');
      // Re-show boot screen
      const boot = document.createElement('div');
      boot.id = 'boot-screen';
      boot.innerHTML = `
        <div class="boot-logo">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <rect x="2" y="2" width="36" height="36" fill="#d32f2f"/>
            <rect x="42" y="2" width="36" height="36" fill="#388e3c"/>
            <rect x="2" y="42" width="36" height="36" fill="#1976d2"/>
            <rect x="42" y="42" width="36" height="36" fill="#f57f17"/>
          </svg>
          <div class="boot-text">Microsoft Windows XP</div>
          <div class="boot-subtitle">PROFESSIONAL</div>
        </div>
        <div class="boot-progress-wrap">
          <div class="boot-progress-bar"><div class="boot-progress-fill"></div></div>
        </div>
        <div class="boot-copy">Copyright © 2001 Microsoft Corporation</div>
      `;
      document.body.appendChild(boot);
      setTimeout(() => boot.remove(), 3200);
    }, 4000);
  }
}

// ============================
// MINESWEEPER
// ============================
function initMinesweeper(content) {
  // ── Config ──────────────────────────────────────────────────────────────
  const DIFFICULTIES = {
    beginner:     { rows:  9, cols:  9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert:       { rows: 16, cols: 30, mines: 99 },
  };

  // ── State ────────────────────────────────────────────────────────────────
  let rows, cols, totalMines;
  let board = [];        // board[r][c] = { mine, revealed, flagged, count }
  let gameState;         // 'idle' | 'playing' | 'won' | 'lost'
  let timerInterval = null;
  let timerVal = 0;
  let difficulty = 'beginner';

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const mineCountEl = content.querySelector('#ms-mine-count');
  const smileyBtn   = content.querySelector('#ms-smiley');
  const timerEl     = content.querySelector('#ms-timer');
  const gridEl      = content.querySelector('#ms-grid');
  const diffSel     = content.querySelector('#ms-difficulty');

  // ── Helpers ───────────────────────────────────────────────────────────────
  function pad3(n) { return String(Math.max(-99, Math.min(999, n))).padStart(3, '0'); }

  function setMineCount(n) { mineCountEl.textContent = pad3(n); }
  function setTimer(n)     { timerEl.textContent = pad3(n); }
  function setSmiley(s)    { smileyBtn.textContent = s; }

  function neighbors(r, c) {
    const res = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) res.push([nr, nc]);
    }
    return res;
  }

  function countFlags() {
    let f = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (board[r][c].flagged) f++;
    return f;
  }

  function cellEl(r, c) { return gridEl.querySelector(`[data-r="${r}"][data-c="${c}"]`); }

  function renderCell(r, c) {
    const el = cellEl(r, c);
    if (!el) return;
    const cell = board[r][c];
    el.className = 'ms-cell';
    el.textContent = '';

    if (!cell.revealed) {
      el.classList.add('ms-hidden');
      if (cell.flagged) {
        el.classList.add('ms-flagged');
        el.textContent = '🚩';
      }
      return;
    }

    el.classList.add('ms-revealed');
    if (cell.mine) {
      el.classList.add('ms-mine');
      el.textContent = '💣';
      return;
    }
    if (cell.count > 0) {
      el.classList.add('ms-num-' + cell.count);
      el.textContent = cell.count;
    }
  }

  function renderAll() {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) renderCell(r, c);
  }

  // ── Board init ────────────────────────────────────────────────────────────
  function initBoard(safeR, safeC) {
    // Place mines avoiding the safe cell and its neighbors
    const safe = new Set();
    safe.add(safeR * cols + safeC);
    neighbors(safeR, safeC).forEach(([r, c]) => safe.add(r * cols + c));

    const positions = [];
    for (let i = 0; i < rows * cols; i++) if (!safe.has(i)) positions.push(i);
    // Fisher-Yates shuffle then take first totalMines
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    const mineSet = new Set(positions.slice(0, totalMines));

    for (let r = 0; r < rows; r++) {
      board[r] = [];
      for (let c = 0; c < cols; c++) {
        board[r][c] = { mine: mineSet.has(r * cols + c), revealed: false, flagged: false, count: 0 };
      }
    }
    // Compute neighbor counts
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine) {
        board[r][c].count = neighbors(r, c).filter(([nr, nc]) => board[nr][nc].mine).length;
      }
    }
  }

  // ── Flood fill reveal ─────────────────────────────────────────────────────
  function floodReveal(r, c) {
    const stack = [[r, c]];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      const cell = board[cr][cc];
      if (cell.revealed || cell.flagged) continue;
      cell.revealed = true;
      renderCell(cr, cc);
      if (cell.count === 0 && !cell.mine) {
        neighbors(cr, cc).forEach(([nr, nc]) => {
          if (!board[nr][nc].revealed && !board[nr][nc].flagged) stack.push([nr, nc]);
        });
      }
    }
  }

  // ── Win / lose check ──────────────────────────────────────────────────────
  function checkWin() {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (!cell.mine && !cell.revealed) return false;
    }
    return true;
  }

  function doLose(clickR, clickC) {
    gameState = 'lost';
    clearInterval(timerInterval);
    setSmiley('😵');
    // Reveal all mines; mark incorrectly-flagged cells
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell.mine && !cell.flagged) { cell.revealed = true; renderCell(r, c); }
      if (!cell.mine && cell.flagged) {
        const el = cellEl(r, c);
        if (el) { el.textContent = '❌'; el.classList.add('ms-wrong-flag'); }
      }
    }
    // Mark the clicked mine red
    const el = cellEl(clickR, clickC);
    if (el) el.classList.add('ms-mine-hit');
  }

  function doWin() {
    gameState = 'won';
    clearInterval(timerInterval);
    setSmiley('😎');
    setMineCount(pad3(0));
    // Flag all un-flagged mines
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (board[r][c].mine && !board[r][c].flagged) {
        board[r][c].flagged = true;
        renderCell(r, c);
      }
    }
  }

  // ── Timer ─────────────────────────────────────────────────────────────────
  function startTimer() {
    clearInterval(timerInterval);
    timerVal = 0;
    setTimer(0);
    timerInterval = setInterval(() => {
      timerVal = Math.min(999, timerVal + 1);
      setTimer(timerVal);
    }, 1000);
  }

  // ── New game ──────────────────────────────────────────────────────────────
  function newGame() {
    const cfg = DIFFICULTIES[difficulty] || DIFFICULTIES.beginner;
    rows = cfg.rows; cols = cfg.cols; totalMines = cfg.mines;

    clearInterval(timerInterval);
    timerVal = 0;
    gameState = 'idle';
    board = [];

    setSmiley('🙂');
    setMineCount(pad3(totalMines));
    setTimer(0);

    // Build empty board placeholder
    for (let r = 0; r < rows; r++) {
      board[r] = [];
      for (let c = 0; c < cols; c++) {
        board[r][c] = { mine: false, revealed: false, flagged: false, count: 0 };
      }
    }

    // Build grid DOM
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 16px)`;
    gridEl.innerHTML = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'ms-cell ms-hidden';
        cell.dataset.r = r;
        cell.dataset.c = c;

        cell.addEventListener('mousedown', e => {
          if (gameState === 'won' || gameState === 'lost') return;
          if (e.button === 0) setSmiley('😮');
        });
        cell.addEventListener('mouseup', e => {
          if (gameState === 'won' || gameState === 'lost') return;
          if (e.button === 0) setSmiley('🙂');
        });

        cell.addEventListener('click', e => {
          if (gameState === 'won' || gameState === 'lost') return;
          const r2 = +cell.dataset.r, c2 = +cell.dataset.c;
          const data = board[r2][c2];
          if (data.flagged || data.revealed) return;

          if (gameState === 'idle') {
            initBoard(r2, c2);
            gameState = 'playing';
            startTimer();
          }

          if (board[r2][c2].mine) { doLose(r2, c2); return; }
          floodReveal(r2, c2);
          if (checkWin()) doWin();
          setMineCount(pad3(totalMines - countFlags()));
        });

        cell.addEventListener('contextmenu', e => {
          e.preventDefault();
          if (gameState === 'won' || gameState === 'lost') return;
          const r2 = +cell.dataset.r, c2 = +cell.dataset.c;
          const data = board[r2][c2];
          if (data.revealed) return;
          data.flagged = !data.flagged;
          renderCell(r2, c2);
          setMineCount(pad3(totalMines - countFlags()));
        });

        // Chord: middle-click or dblclick — auto-reveal neighbors if flag count matches
        function chord(e) {
          if (e && e.preventDefault) e.preventDefault();
          if (gameState !== 'playing') return;
          const r2 = +cell.dataset.r, c2 = +cell.dataset.c;
          const data = board[r2][c2];
          if (!data.revealed || data.count === 0) return;
          const nbrs = neighbors(r2, c2);
          const flagCount = nbrs.filter(([nr, nc]) => board[nr][nc].flagged).length;
          if (flagCount !== data.count) return;
          let hitMine = false;
          nbrs.forEach(([nr, nc]) => {
            if (!board[nr][nc].revealed && !board[nr][nc].flagged) {
              if (board[nr][nc].mine) { doLose(nr, nc); hitMine = true; }
              else { floodReveal(nr, nc); }
            }
          });
          if (!hitMine && checkWin()) doWin();
          setMineCount(pad3(totalMines - countFlags()));
        }
        cell.addEventListener('dblclick', chord);
        cell.addEventListener('auxclick', chord);

        gridEl.appendChild(cell);
      }
    }
  }

  // ── Wire up controls ──────────────────────────────────────────────────────
  smileyBtn.addEventListener('click', newGame);

  // Game menu toggle
  const gameMenuTrigger = content.querySelector('#ms-game-menu-trigger');
  const gameMenuDrop    = content.querySelector('#ms-game-menu');
  if (gameMenuTrigger && gameMenuDrop) {
    gameMenuTrigger.style.position = 'relative';
    gameMenuTrigger.addEventListener('click', e => {
      e.stopPropagation();
      gameMenuDrop.classList.toggle('hidden');
    });
    document.addEventListener('click', () => gameMenuDrop.classList.add('hidden'));
  }

  if (diffSel) {
    diffSel.addEventListener('change', () => {
      difficulty = diffSel.value;
      newGame();
    });
  }

  // ── Context-menu "New Game" via Game menu ─────────────────────────────────
  const newGameBtn = content.querySelector('#ms-new-game');
  if (newGameBtn) newGameBtn.addEventListener('click', newGame);

  // Difficulty menu items
  ['beginner','intermediate','expert'].forEach(d => {
    const btn = content.querySelector(`#ms-diff-${d}`);
    if (btn) btn.addEventListener('click', () => {
      difficulty = d;
      if (diffSel) diffSel.value = d;
      newGame();
    });
  });

  // ── Start ─────────────────────────────────────────────────────────────────
  newGame();
}

// ============================
// WINDOWS MEDIA PLAYER
// ============================

// Videos served from the /videos/ folder at project root.
// Add mp4 filenames here — they'll appear in the playlist automatically.
const WMP_VIDEO_LIST = [
  // e.g. 'my_clip.mp4'
  // The player also supports opening any local file via File > Open
];

// Attempt to auto-discover files in /videos/ via a manifest if present,
// otherwise fall back to WMP_VIDEO_LIST above.
async function wmpLoadPlaylist() {
  try {
    const res = await fetch('/videos/');
    if (!res.ok) return [...WMP_VIDEO_LIST];
    const text = await res.text();
    // Parse <a href> links from a directory listing
    const matches = [...text.matchAll(/href="([^"?#]+\.(?:mp4|webm|ogg|mov|mkv|avi|mp3|wav|ogg|flac))"/gi)];
    const found = matches.map(m => m[1].replace(/^.*\//, ''));
    return found.length ? found : [...WMP_VIDEO_LIST];
  } catch {
    return [...WMP_VIDEO_LIST];
  }
}

function initWMP(content) {
  const root       = content.querySelector('#wmp-root');
  const videoEl    = content.querySelector('#wmp-video');
  const nowPlaying = content.querySelector('#wmp-now-playing');
  const playBtn    = content.querySelector('#wmp-play');
  const stopBtn    = content.querySelector('#wmp-stop');
  const prevBtn    = content.querySelector('#wmp-prev');
  const nextBtn    = content.querySelector('#wmp-next');
  const rewBtn     = content.querySelector('#wmp-rew');
  const fwdBtn     = content.querySelector('#wmp-fwd');
  const seekEl     = content.querySelector('#wmp-seek');
  const volEl      = content.querySelector('#wmp-vol');
  const curTimeEl  = content.querySelector('#wmp-cur-time');
  const durTimeEl  = content.querySelector('#wmp-dur-time');
  const playlistBody = content.querySelector('#wmp-playlist-body');
  const fileInput  = content.querySelector('#wmp-file-input');
  const fsBtn      = content.querySelector('#wmp-fs');

  if (!videoEl) return;

  // ── State ─────────────────────────────────────────────────────────────────
  let playlist = [];   // { name, src } objects
  let currentIdx = -1;
  let seeking = false;
  let currentSkin = 'classic';

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmtTime(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function setSkin(skin) {
    currentSkin = skin;
    root.dataset.skin = skin;
    // Update active marker in menu
    content.querySelectorAll('.wmp-skin-item').forEach(el => {
      el.classList.toggle('active', el.dataset.skin === skin);
    });
  }

  function renderPlaylist() {
    playlistBody.innerHTML = '';
    playlist.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'wmp-pl-row' + (i === currentIdx ? ' active' : '');
      row.textContent = item.name;
      row.addEventListener('dblclick', () => loadTrack(i));
      playlistBody.appendChild(row);
    });
  }

  function loadTrack(idx) {
    if (idx < 0 || idx >= playlist.length) return;
    currentIdx = idx;
    const item = playlist[idx];
    videoEl.src = item.src;
    nowPlaying.textContent = item.name;
    renderPlaylist();
    videoEl.play().catch(() => {});
    playBtn.textContent = '⏸';
  }

  function addToPlaylist(name, src) {
    playlist.push({ name, src });
    renderPlaylist();
    if (playlist.length === 1) loadTrack(0);
  }

  // ── Controls ──────────────────────────────────────────────────────────────
  playBtn.addEventListener('click', () => {
    if (!videoEl.src && playlist.length) { loadTrack(0); return; }
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      playBtn.textContent = '⏸';
    } else {
      videoEl.pause();
      playBtn.textContent = '▶';
    }
  });

  stopBtn.addEventListener('click', () => {
    videoEl.pause();
    videoEl.currentTime = 0;
    playBtn.textContent = '▶';
  });

  prevBtn.addEventListener('click', () => {
    if (currentIdx > 0) loadTrack(currentIdx - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (currentIdx < playlist.length - 1) loadTrack(currentIdx + 1);
  });

  rewBtn.addEventListener('click', () => {
    videoEl.currentTime = Math.max(0, videoEl.currentTime - 10);
  });

  fwdBtn.addEventListener('click', () => {
    videoEl.currentTime = Math.min(videoEl.duration || 0, videoEl.currentTime + 10);
  });

  // Seek bar
  seekEl.addEventListener('mousedown', () => { seeking = true; });
  seekEl.addEventListener('input', () => {
    if (videoEl.duration) {
      videoEl.currentTime = (seekEl.value / 1000) * videoEl.duration;
    }
  });
  seekEl.addEventListener('change', () => { seeking = false; });

  // Volume
  volEl.addEventListener('input', () => {
    videoEl.volume = volEl.value / 100;
  });
  videoEl.volume = volEl.value / 100;

  // Time update
  videoEl.addEventListener('timeupdate', () => {
    if (!seeking && videoEl.duration) {
      seekEl.value = (videoEl.currentTime / videoEl.duration) * 1000;
    }
    curTimeEl.textContent = fmtTime(videoEl.currentTime);
    durTimeEl.textContent = fmtTime(videoEl.duration);
  });

  videoEl.addEventListener('ended', () => {
    playBtn.textContent = '▶';
    if (currentIdx < playlist.length - 1) {
      loadTrack(currentIdx + 1);
    }
  });

  videoEl.addEventListener('play',  () => { playBtn.textContent = '⏸'; });
  videoEl.addEventListener('pause', () => { playBtn.textContent = '▶'; });

  // Fullscreen
  fsBtn.addEventListener('click', () => {
    if (videoEl.requestFullscreen) videoEl.requestFullscreen();
    else if (videoEl.webkitRequestFullscreen) videoEl.webkitRequestFullscreen();
  });

  // ── Menus ─────────────────────────────────────────────────────────────────
  function setupMenu(triggerId, menuId) {
    const trigger = content.querySelector(`#${triggerId}`);
    const menu    = content.querySelector(`#${menuId}`);
    if (!trigger || !menu) return;
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      content.querySelectorAll('.wmp-dropdown').forEach(d => d !== menu && d.classList.add('hidden'));
      menu.classList.toggle('hidden');
    });
  }
  setupMenu('wmp-file-trigger', 'wmp-file-menu');
  setupMenu('wmp-view-trigger', 'wmp-view-menu');

  document.addEventListener('click', () => {
    content.querySelectorAll('.wmp-dropdown').forEach(d => d.classList.add('hidden'));
  });

  // ── Helper: ingest a FileList / File array ────────────────────────────────
  function ingestFiles(files) {
    let firstNew = playlist.length;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) return;
      const url = URL.createObjectURL(file);
      playlist.push({ name: file.name, src: url });
    });
    renderPlaylist();
    if (currentIdx < 0 && playlist.length > 0) loadTrack(firstNew);
  }

  // File > Open (multi)
  const openFileItem = content.querySelector('#wmp-open-file');
  if (openFileItem) {
    openFileItem.addEventListener('click', () => {
      fileInput.click();
      content.querySelectorAll('.wmp-dropdown').forEach(d => d.classList.add('hidden'));
    });
  }
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      ingestFiles(fileInput.files);
      fileInput.value = '';
    });
  }

  // File > Clear Playlist
  const clearBtn = content.querySelector('#wmp-clear-playlist');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      content.querySelectorAll('.wmp-dropdown').forEach(d => d.classList.add('hidden'));
      videoEl.pause();
      videoEl.src = '';
      playlist = [];
      currentIdx = -1;
      renderPlaylist();
      nowPlaying.textContent = 'Drop files or use File → Open';
      playBtn.textContent = '▶';
      seekEl.value = 0;
      curTimeEl.textContent = '0:00';
      durTimeEl.textContent = '0:00';
      // Show drop overlay again
      const dropOverlay = content.querySelector('#wmp-drop-overlay');
      if (dropOverlay) dropOverlay.classList.add('visible');
    });
  }

  // ── Drag and drop onto video panel ────────────────────────────────────────
  const videoPanel = content.querySelector('#wmp-video-panel');
  const dropOverlay = content.querySelector('#wmp-drop-overlay');

  if (videoPanel) {
    videoPanel.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      if (dropOverlay) dropOverlay.classList.add('visible');
    });
    videoPanel.addEventListener('dragleave', e => {
      if (!videoPanel.contains(e.relatedTarget)) {
        if (dropOverlay) dropOverlay.classList.remove('visible');
      }
    });
    videoPanel.addEventListener('drop', e => {
      e.preventDefault();
      if (dropOverlay) dropOverlay.classList.remove('visible');
      ingestFiles(e.dataTransfer.files);
    });
    // Hide overlay once a track is loaded
    videoEl.addEventListener('loadedmetadata', () => {
      if (dropOverlay) dropOverlay.classList.remove('visible');
    });
    // Show overlay when playlist is empty
    if (playlist.length === 0 && dropOverlay) dropOverlay.classList.add('visible');
  }

  // Skin switcher
  content.querySelectorAll('.wmp-skin-item').forEach(el => {
    el.addEventListener('click', () => {
      setSkin(el.dataset.skin);
      content.querySelectorAll('.wmp-dropdown').forEach(d => d.classList.add('hidden'));
    });
  });

  // ── Load /videos/ playlist ────────────────────────────────────────────────
  wmpLoadPlaylist().then(files => {
    files.forEach(filename => {
      const name = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      addToPlaylist(name, `/videos/${filename}`);
    });
    // Show overlay if still no content
    if (playlist.length === 0 && dropOverlay) dropOverlay.classList.add('visible');
  });

  // ── Visualizer ────────────────────────────────────────────────────────────
  const vizCanvas  = content.querySelector('#wmp-viz');
  let audioCtx     = null;
  let analyser     = null;
  let sourceNode   = null;
  let vizMode      = 'none';
  let vizRafId     = null;
  let vizFrame     = 0;          // incrementing frame counter
  // galaxy star state
  const STAR_COUNT = 180;
  const stars      = Array.from({length: STAR_COUNT}, () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: Math.random(),
    px: 0, py: 0,
  }));
  // milkdrop plasma state
  let mdPhase = 0;

  function ensureAudioCtx() {
    if (audioCtx) return true;
    try {
      audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
      analyser  = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      sourceNode = audioCtx.createMediaElementSource(videoEl);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
      return true;
    } catch(e) {
      console.warn('WMP AudioContext failed:', e);
      return false;
    }
  }

  function resumeCtx() {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  videoEl.addEventListener('play', resumeCtx);

  // ── draw helpers ───────────────────────────────────────────────────────────
  function getFreqData() {
    const buf = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buf);
    return buf;
  }
  function getTimeData() {
    const buf = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buf);
    return buf;
  }
  // Skin accent colors for canvas
  const SKIN_COLORS = {
    classic: { bg: '#111',  bar: '#316ac5', line: '#00ccff', glow: '#4488ff' },
    luna:    { bg: '#06080f', bar: '#1e88e5', line: '#42d8ff', glow: '#00aaff' },
    compact: { bg: '#0a0a0a', bar: '#888888', line: '#cccccc', glow: '#aaaaaa' },
    dark:    { bg: '#050505', bar: '#e84393', line: '#ff69b4', glow: '#ff00aa' },
  };
  function sc() { return SKIN_COLORS[currentSkin] || SKIN_COLORS.classic; }

  // ── Visualizer: Spectrum Bars ──────────────────────────────────────────────
  function drawBars(ctx, w, h) {
    const data   = getFreqData();
    const colors = sc();
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    const barCount = Math.min(80, data.length);
    const bw = w / barCount - 1;
    for (let i = 0; i < barCount; i++) {
      const v    = data[i] / 255;
      const bh   = v * h * 0.95;
      const hue  = 200 + (i / barCount) * 160;
      const grad = ctx.createLinearGradient(0, h, 0, h - bh);
      grad.addColorStop(0, colors.bar);
      grad.addColorStop(1, colors.glow);
      ctx.fillStyle = grad;
      ctx.fillRect(i * (bw + 1), h - bh, bw, bh);
      // peak dot
      ctx.fillStyle = '#fff';
      ctx.fillRect(i * (bw + 1), h - bh - 2, bw, 2);
    }
    // reflection
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.scale(1, -1);
    ctx.translate(0, -h * 2);
    for (let i = 0; i < barCount; i++) {
      const v = data[i] / 255;
      const bh = v * h * 0.95;
      ctx.fillStyle = colors.bar;
      ctx.fillRect(i * (bw + 1), h - bh, bw, bh);
    }
    ctx.restore();
  }

  // ── Visualizer: Oscilloscope ──────────────────────────────────────────────
  function drawOscilloscope(ctx, w, h) {
    const data   = getTimeData();
    const colors = sc();
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    // glow line
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur  = 12;
    ctx.strokeStyle = colors.line;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    const step = w / data.length;
    for (let i = 0; i < data.length; i++) {
      const y = ((data[i] / 128) - 1) * (h * 0.45) + h / 2;
      i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * step, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // center line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
    ctx.stroke();
  }

  // ── Visualizer: Radial Burst ──────────────────────────────────────────────
  function drawRadial(ctx, w, h) {
    const data   = getFreqData();
    const colors = sc();
    ctx.fillStyle = colors.bg + 'ee';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const bars = 128;
    const r0   = Math.min(w, h) * 0.18;
    const rMax = Math.min(w, h) * 0.46;

    for (let i = 0; i < bars; i++) {
      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
      const v     = data[Math.floor(i * data.length / bars)] / 255;
      const rEnd  = r0 + v * (rMax - r0);
      const t     = i / bars;
      const hue   = (t * 300 + vizFrame * 0.5) % 360;

      ctx.save();
      ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.shadowBlur  = 8;
      ctx.strokeStyle = `hsl(${hue},100%,${55 + v * 35}%)`;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r0, cy + Math.sin(angle) * r0);
      ctx.lineTo(cx + Math.cos(angle) * rEnd, cy + Math.sin(angle) * rEnd);
      ctx.stroke();
      ctx.restore();
    }

    // inner ring
    ctx.save();
    ctx.strokeStyle = colors.glow + '55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── Visualizer: Galaxy ────────────────────────────────────────────────────
  function drawGalaxy(ctx, w, h) {
    const freq   = getFreqData();
    const colors = sc();
    // Bass energy → star speed
    const bass   = (freq[0] + freq[1] + freq[2] + freq[3]) / (4 * 255);
    const energy = bass * 3 + 0.4;

    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    stars.forEach(s => {
      s.px = s.x / s.z;
      s.py = s.y / s.z;
      s.z -= 0.008 * energy;
      if (s.z <= 0) {
        s.x = Math.random() * 2 - 1;
        s.y = Math.random() * 2 - 1;
        s.z = 1;
        s.px = s.x; s.py = s.y;
      }
      const sx   = (s.x / s.z) * (w * 0.5) + cx;
      const sy   = (s.y / s.z) * (h  * 0.5) + cy;
      const opx  = s.px * (w * 0.5) + cx;
      const opy  = s.py * (h  * 0.5) + cy;
      const size = Math.max(0, (1 - s.z) * 3);
      const hue  = (vizFrame * 0.3 + s.z * 200) % 360;
      ctx.strokeStyle = `hsl(${hue},90%,${70 + bass * 30}%)`;
      ctx.lineWidth   = size * 0.8;
      ctx.beginPath();
      ctx.moveTo(opx, opy);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    });

    // Radial frequency ring around center
    const ringR = Math.min(w, h) * 0.12 + bass * 30;
    ctx.save();
    ctx.strokeStyle = colors.glow + '88';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── Visualizer: Milkdrop plasma ────────────────────────────────────────────
  function drawMilkdrop(ctx, w, h) {
    const freq   = getFreqData();
    const time   = getTimeData();
    const colors = sc();
    const bass   = (freq[0] + freq[1] + freq[2]) / (3 * 255);
    const mid    = (freq[10] + freq[20] + freq[30]) / (3 * 255);
    const hi     = (freq[60] + freq[80]) / (2 * 255);

    mdPhase += 0.018 + bass * 0.04;

    // plasma background
    const imgData = ctx.createImageData(w, h);
    const d = imgData.data;
    // subsampled for speed — write every 2nd pixel then scale
    const step = 4; // sample every 4px block
    for (let py = 0; py < h; py += step) {
      for (let px = 0; px < w; px += step) {
        const nx = (px / w) * 2 - 1;
        const ny = (py / h) * 2 - 1;
        const r  = Math.sqrt(nx*nx + ny*ny);
        const a  = Math.atan2(ny, nx);
        const v1 = Math.sin(nx * (3 + mid * 4) + mdPhase);
        const v2 = Math.sin(ny * (3 + hi  * 3) + mdPhase * 1.3);
        const v3 = Math.sin(r  * (5 + bass * 6) - mdPhase * 2);
        const v4 = Math.sin((nx + ny) * (2 + mid * 2) + mdPhase * 0.7);
        const val = (v1 + v2 + v3 + v4) / 4; // -1..1
        // map to colour
        let hue, sat, lit;
        if (currentSkin === 'dark') {
          hue = ((val + 1) * 180 + mdPhase * 30) % 360;
          sat = 90; lit = 30 + val * 30;
        } else if (currentSkin === 'luna') {
          hue = 190 + val * 60;
          sat = 80; lit = 30 + val * 35;
        } else {
          hue = (val + 1) * 180;
          sat = 70; lit = 25 + val * 30;
        }
        // hsl→rgb
        const h2 = ((hue % 360) + 360) % 360;
        const s2 = Math.max(0, Math.min(100, sat)) / 100;
        const l2 = Math.max(0, Math.min(100, lit)) / 100;
        const c2 = (1 - Math.abs(2 * l2 - 1)) * s2;
        const x2 = c2 * (1 - Math.abs((h2 / 60) % 2 - 1));
        const m2 = l2 - c2 / 2;
        let rr=0,gg=0,bb=0;
        if      (h2 < 60)  { rr=c2; gg=x2; }
        else if (h2 < 120) { rr=x2; gg=c2; }
        else if (h2 < 180) { gg=c2; bb=x2; }
        else if (h2 < 240) { gg=x2; bb=c2; }
        else if (h2 < 300) { rr=x2; bb=c2; }
        else               { rr=c2; bb=x2; }
        const R = Math.round((rr+m2)*255);
        const G = Math.round((gg+m2)*255);
        const B = Math.round((bb+m2)*255);
        // fill block
        for (let dy = 0; dy < step && py+dy < h; dy++) {
          for (let dx = 0; dx < step && px+dx < w; dx++) {
            const idx = ((py+dy) * w + (px+dx)) * 4;
            d[idx]   = R; d[idx+1] = G; d[idx+2] = B; d[idx+3] = 255;
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // oscilloscope overlay
    ctx.save();
    ctx.globalAlpha   = 0.65;
    ctx.shadowColor   = colors.glow;
    ctx.shadowBlur    = 8;
    ctx.strokeStyle   = '#fff';
    ctx.lineWidth     = 1.5;
    ctx.beginPath();
    const sw = w / time.length;
    for (let i = 0; i < time.length; i++) {
      const y = ((time[i] / 128) - 1) * h * 0.35 + h / 2;
      i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * sw, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ── Render loop ────────────────────────────────────────────────────────────
  function vizLoop() {
    vizRafId = requestAnimationFrame(vizLoop);
    vizFrame++;
    if (!vizCanvas || vizMode === 'none') return;
    const w = vizCanvas.width, h = vizCanvas.height;
    if (w === 0 || h === 0) return;
    const ctx = vizCanvas.getContext('2d');
    switch (vizMode) {
      case 'bars':         drawBars(ctx, w, h);         break;
      case 'oscilloscope': drawOscilloscope(ctx, w, h); break;
      case 'radial':       drawRadial(ctx, w, h);       break;
      case 'galaxy':       drawGalaxy(ctx, w, h);       break;
      case 'milkdrop':     drawMilkdrop(ctx, w, h);     break;
    }
  }

  // Keep canvas dimensions in sync with its layout size
  function syncCanvasSize() {
    if (!vizCanvas) return;
    const rect = vizCanvas.getBoundingClientRect();
    if (rect.width > 0  && vizCanvas.width  !== Math.round(rect.width))  vizCanvas.width  = Math.round(rect.width);
    if (rect.height > 0 && vizCanvas.height !== Math.round(rect.height)) vizCanvas.height = Math.round(rect.height);
  }
  const sizeObs = new ResizeObserver(syncCanvasSize);
  if (vizCanvas) sizeObs.observe(vizCanvas);

  function setViz(mode) {
    vizMode = mode;
    // update active checkmark
    content.querySelectorAll('.wmp-viz-item').forEach(el => {
      el.classList.toggle('active', el.dataset.viz === mode);
    });
    if (!vizCanvas) return;
    if (mode === 'none') {
      vizCanvas.classList.remove('wmp-viz-visible');
      videoEl.classList.remove('wmp-video-hidden');
    } else {
      if (!ensureAudioCtx()) return;
      resumeCtx();
      syncCanvasSize();
      vizCanvas.classList.add('wmp-viz-visible');
      // hide video for audio-only viz, but keep it if playing video
      const isVideoFile = videoEl.videoWidth > 0;
      if (isVideoFile) {
        vizCanvas.classList.add('wmp-viz-overlay');
      } else {
        vizCanvas.classList.remove('wmp-viz-overlay');
        videoEl.classList.add('wmp-video-hidden');
      }
    }
  }

  // Viz menu
  setupMenu('wmp-viz-trigger', 'wmp-viz-menu');
  content.querySelectorAll('.wmp-viz-item').forEach(el => {
    el.addEventListener('click', () => {
      setViz(el.dataset.viz);
      content.querySelectorAll('.wmp-dropdown').forEach(d => d.classList.add('hidden'));
    });
  });

  // When video metadata loads, update overlay vs replace behaviour
  videoEl.addEventListener('loadedmetadata', () => {
    if (vizMode !== 'none') setViz(vizMode);
  });

  // Start the render loop
  vizLoop();

  // Cleanup when the WMP window is closed (window removal from DOM)
  const winEl = content.closest('.window');
  if (winEl) {
    const killObs = new MutationObserver(() => {
      if (!document.contains(winEl)) {
        cancelAnimationFrame(vizRafId);
        sizeObs.disconnect();
        killObs.disconnect();
        if (audioCtx) { audioCtx.close(); audioCtx = null; }
      }
    });
    killObs.observe(document.body, { childList: true, subtree: true });
  }

  // ── Initial skin ─────────────────────────────────────────────────────────
  setSkin('classic');
}

// ============================
// SOLITAIRE — Klondike
// ============================
function initSolitaire(content) {
  // ── constants ──────────────────────────────────────────────────────────────
  const SUITS   = ['♠','♥','♦','♣'];
  const RANKS   = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const RED     = new Set(['♥','♦']);
  const RANK_V  = Object.fromEntries(RANKS.map((r,i) => [r, i+1]));

  // ── state ──────────────────────────────────────────────────────────────────
  let stock      = [];   // array of card objects
  let waste      = [];
  let tableau    = [[],[],[],[],[],[],[]];
  let foundation = [[],[],[],[]];
  let score      = 0;
  let drawMode   = 1;    // 1 or 3
  let selected   = null; // { src:'stock'|'waste'|'tab-N'|'found-N', cards:[] }
  let history    = [];   // for undo — snapshots of { stock, waste, tableau, foundation, score }

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const root       = content.querySelector('.sol-root');
  const stockEl    = content.querySelector('#sol-stock');
  const wasteEl    = content.querySelector('#sol-waste');
  const foundEls   = [0,1,2,3].map(i => content.querySelector(`#sol-found-${i}`));
  const colEls     = [0,1,2,3,4,5,6].map(i => content.querySelector(`#sol-col-${i}`));
  const statusEl   = content.querySelector('#sol-status');
  const scoreEl    = content.querySelector('#sol-score');

  // ── menu ───────────────────────────────────────────────────────────────────
  const gameTrigger = content.querySelector('#sol-game-trigger');
  const gameMenu    = content.querySelector('#sol-game-menu');
  gameTrigger.addEventListener('click', e => {
    e.stopPropagation();
    gameMenu.classList.toggle('hidden');
  });
  document.addEventListener('click', () => gameMenu.classList.add('hidden'));
  content.querySelector('#sol-new-game').addEventListener('click', () => { gameMenu.classList.add('hidden'); newGame(); });
  content.querySelector('#sol-undo').addEventListener('click',     () => { gameMenu.classList.add('hidden'); undoMove(); });
  content.querySelector('#sol-draw1').addEventListener('click',    () => { gameMenu.classList.add('hidden'); drawMode=1; statusEl.textContent='Draw 1 mode'; newGame(); });
  content.querySelector('#sol-draw3').addEventListener('click',    () => { gameMenu.classList.add('hidden'); drawMode=3; statusEl.textContent='Draw 3 mode'; newGame(); });

  // ── helpers ────────────────────────────────────────────────────────────────
  function makeCard(rank, suit) {
    return { rank, suit, faceUp: false };
  }
  function makeDeck() {
    const deck = [];
    for (const suit of SUITS)
      for (const rank of RANKS)
        deck.push(makeCard(rank, suit));
    return deck;
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  function snapshot() {
    return JSON.parse(JSON.stringify({ stock, waste, tableau, foundation, score }));
  }
  function saveHistory() {
    history.push(snapshot());
    if (history.length > 100) history.shift();
  }

  // ── game logic ─────────────────────────────────────────────────────────────
  function canPlaceOnTableau(card, col) {
    if (col.length === 0) return RANK_V[card.rank] === 13; // only King on empty
    const top = col[col.length - 1];
    if (!top.faceUp) return false;
    return RANK_V[card.rank] === RANK_V[top.rank] - 1 &&
           RED.has(card.suit) !== RED.has(top.suit);
  }
  function canPlaceOnFoundation(card, fnd) {
    if (fnd.length === 0) return card.rank === 'A';
    const top = fnd[fnd.length - 1];
    return top.suit === card.suit && RANK_V[card.rank] === RANK_V[top.rank] + 1;
  }
  function autoFoundation(card) {
    for (let i = 0; i < 4; i++) {
      if (canPlaceOnFoundation(card, foundation[i])) return i;
    }
    return -1;
  }
  function checkWin() {
    if (foundation.every(f => f.length === 13)) {
      statusEl.textContent = '🎉 You Win! Deal again?';
      addScore(200);
    }
  }

  // ── drawing to DOM ─────────────────────────────────────────────────────────
  function cardEl(card, extraClass) {
    const d = document.createElement('div');
    d.className = 'sol-card' +
      (card.faceUp ? (' ' + (RED.has(card.suit) ? 'red' : 'black')) : ' face-down') +
      (extraClass ? ' ' + extraClass : '');
    if (card.faceUp) {
      const cornerTL = document.createElement('div');
      cornerTL.className = 'sol-corner sol-tl';
      cornerTL.innerHTML = `<span class="sol-rank">${card.rank}</span><span class="sol-suit">${card.suit}</span>`;
      const cornerBR = document.createElement('div');
      cornerBR.className = 'sol-corner sol-br';
      cornerBR.innerHTML = `<span class="sol-rank">${card.rank}</span><span class="sol-suit">${card.suit}</span>`;
      const center = document.createElement('div');
      center.className = 'sol-center-suit';
      center.textContent = card.suit;
      d.appendChild(cornerTL);
      d.appendChild(center);
      d.appendChild(cornerBR);
    }
    return d;
  }

  function renderStock() {
    stockEl.innerHTML = '';
    if (stock.length === 0) {
      stockEl.innerHTML = '<div class="sol-empty-label">↺</div>';
    } else {
      const top = document.createElement('div');
      top.className = 'sol-card face-down';
      top.dataset.count = stock.length;
      stockEl.appendChild(top);
    }
  }
  function renderWaste() {
    wasteEl.innerHTML = '';
    if (waste.length === 0) return;
    const visCount = Math.min(drawMode === 3 ? 3 : 1, waste.length);
    for (let i = waste.length - visCount; i < waste.length; i++) {
      const c = waste[i];
      const el = cardEl(c, i === waste.length - 1 ? 'sol-waste-top' : 'sol-waste-fan');
      el.style.position = 'absolute';
      el.style.left = (drawMode === 3 ? (i - (waste.length - visCount)) * 18 : 0) + 'px';
      el.style.zIndex = i - (waste.length - visCount);
      if (i === waste.length - 1) el.classList.add('clickable');
      wasteEl.style.position = 'relative';
      wasteEl.appendChild(el);
    }
  }
  function renderFoundations() {
    foundEls.forEach((el, i) => {
      el.innerHTML = '';
      if (foundation[i].length === 0) {
        el.innerHTML = `<div class="sol-suit-hint">${SUITS[i]}</div>`;
      } else {
        const top = foundation[i][foundation[i].length - 1];
        el.appendChild(cardEl(top));
      }
    });
  }
  function renderTableau() {
    colEls.forEach((colEl, ci) => {
      colEl.innerHTML = '';
      const col = tableau[ci];
      if (col.length === 0) {
        colEl.innerHTML = '<div class="sol-empty-col"></div>';
        return;
      }
      col.forEach((card, idx) => {
        const el = cardEl(card);
        el.style.top = (idx * (card.faceUp ? 22 : 14)) + 'px';
        el.style.zIndex = idx;
        el.style.position = 'absolute';
        colEl.appendChild(el);
      });
      // set column min-height
      const lastCard = col[col.length - 1];
      const lastIdx  = col.length - 1;
      colEl.style.minHeight = (lastIdx * (lastCard.faceUp ? 22 : 14) + 90) + 'px';
    });
  }
  function render() {
    renderStock();
    renderWaste();
    renderFoundations();
    renderTableau();
    scoreEl.textContent = 'Score: ' + score;
    attachHandlers();
  }

  // ── scoring ────────────────────────────────────────────────────────────────
  function addScore(n) {
    score = Math.max(0, score + n);
    scoreEl.textContent = 'Score: ' + score;
  }

  // ── new game ───────────────────────────────────────────────────────────────
  function newGame() {
    const deck = makeDeck();
    shuffle(deck);
    stock = deck;
    waste = [];
    tableau = [[],[],[],[],[],[],[]];
    foundation = [[],[],[],[]];
    score = 0;
    history = [];
    selected = null;
    clearSelection();
    // deal: col i gets i+1 cards, last one face-up
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = stock.pop();
        card.faceUp = (j === i);
        tableau[i].push(card);
      }
    }
    statusEl.textContent = 'Click a card to select, click a target to move';
    render();
  }

  // ── undo ───────────────────────────────────────────────────────────────────
  function undoMove() {
    if (history.length === 0) { statusEl.textContent = 'Nothing to undo'; return; }
    const s = history.pop();
    stock      = s.stock;
    waste      = s.waste;
    tableau    = s.tableau;
    foundation = s.foundation;
    score      = s.score;
    selected   = null;
    clearSelection();
    render();
  }

  // ── selection helpers ──────────────────────────────────────────────────────
  function clearSelection() {
    selected = null;
    content.querySelectorAll('.sol-card.selected').forEach(el => el.classList.remove('selected'));
    statusEl.textContent = 'Click a card to select, click a target to move';
  }

  // ── move execution ─────────────────────────────────────────────────────────
  function moveCards(cards, destType, destIdx) {
    // remove from source
    if (selected.src === 'waste') {
      waste.pop();
    } else if (selected.src.startsWith('tab-')) {
      const ci = parseInt(selected.src.split('-')[1]);
      tableau[ci].splice(tableau[ci].length - cards.length, cards.length);
      // flip new top card of source col
      if (tableau[ci].length > 0) {
        const newTop = tableau[ci][tableau[ci].length - 1];
        if (!newTop.faceUp) { newTop.faceUp = true; addScore(5); }
      }
    } else if (selected.src.startsWith('found-')) {
      const fi = parseInt(selected.src.split('-')[1]);
      foundation[fi].pop();
    }

    // add to dest
    if (destType === 'tab') {
      const prevLen = tableau[destIdx].length;
      cards.forEach(c => tableau[destIdx].push(c));
      // score
      if (selected.src === 'waste') addScore(10);
      else if (selected.src.startsWith('found-')) addScore(0);
      else addScore(prevLen === 0 ? 0 : 5);
    } else if (destType === 'found') {
      foundation[destIdx].push(cards[0]);
      if (selected.src === 'waste') addScore(15);
      else addScore(10);
    }

    selected = null;
    clearSelection();
    render();
    checkWin();
  }

  // ── click on stock ─────────────────────────────────────────────────────────
  function clickStock() {
    if (stock.length === 0) {
      // reset
      saveHistory();
      while (waste.length) {
        const c = waste.pop();
        c.faceUp = false;
        stock.push(c);
      }
      addScore(-100);
      render();
      return;
    }
    saveHistory();
    const n = Math.min(drawMode, stock.length);
    for (let i = 0; i < n; i++) {
      const c = stock.pop();
      c.faceUp = true;
      waste.push(c);
    }
    clearSelection();
    render();
  }

  // ── click on waste top ─────────────────────────────────────────────────────
  function clickWasteTop() {
    if (waste.length === 0) return;
    if (selected && selected.src === 'waste') { clearSelection(); return; }
    if (selected) { clearSelection(); }
    const card = waste[waste.length - 1];
    selected = { src: 'waste', cards: [card] };
    render();
    // highlight
    const topEl = wasteEl.querySelector('.sol-waste-top') || wasteEl.lastElementChild;
    if (topEl) topEl.classList.add('selected');
    statusEl.textContent = `Selected: ${card.rank}${card.suit} — click a target pile`;
  }

  // ── click on foundation pile ───────────────────────────────────────────────
  function clickFoundation(fi) {
    if (selected) {
      if (selected.cards.length === 1 && canPlaceOnFoundation(selected.cards[0], foundation[fi])) {
        saveHistory();
        moveCards(selected.cards, 'found', fi);
      } else {
        // pick up from foundation if clicking it with nothing selected
        if (selected.src === `found-${fi}`) { clearSelection(); return; }
        clearSelection();
      }
    } else {
      // select top of this foundation pile
      if (foundation[fi].length === 0) return;
      const card = foundation[fi][foundation[fi].length - 1];
      selected = { src: `found-${fi}`, cards: [card] };
      render();
      foundEls[fi].lastElementChild?.classList.add('selected');
      statusEl.textContent = `Selected: ${card.rank}${card.suit} (from foundation)`;
    }
  }

  // ── click on tableau card ──────────────────────────────────────────────────
  function clickTableauCard(ci, cardIdx) {
    const col  = tableau[ci];
    const card = col[cardIdx];
    if (!card.faceUp) {
      // flip only if it's the last card
      if (cardIdx === col.length - 1) {
        saveHistory();
        card.faceUp = true;
        addScore(5);
        render();
      }
      return;
    }

    if (selected) {
      // try to move onto this column
      if (selected.src === `tab-${ci}`) { clearSelection(); return; }
      if (canPlaceOnTableau(selected.cards[0], col.slice(0, cardIdx + 1))) {
        // dropping onto a mid-card doesn't make sense; only drop onto top
        clearSelection();
        return;
      }
      // drop onto this col (top card must be at cardIdx === col.length-1)
      if (cardIdx === col.length - 1 && canPlaceOnTableau(selected.cards[0], col)) {
        saveHistory();
        moveCards(selected.cards, 'tab', ci);
      } else {
        clearSelection();
      }
      return;
    }

    // select from cardIdx to end of column
    const cards = col.slice(cardIdx);
    selected = { src: `tab-${ci}`, cards };
    render();
    // highlight selected cards
    const cardEls = colEls[ci].querySelectorAll('.sol-card');
    for (let i = cardIdx; i < cardEls.length; i++) {
      cardEls[i].classList.add('selected');
    }
    statusEl.textContent = `Selected: ${card.rank}${card.suit} (${cards.length} card${cards.length>1?'s':''}) — click a target`;
  }

  // ── double-click on card → auto-foundation ────────────────────────────────
  function dblClickCard(src, cardIdx) {
    let card;
    if (src === 'waste') {
      if (waste.length === 0) return;
      card = waste[waste.length - 1];
    } else if (src.startsWith('tab-')) {
      const ci = parseInt(src.split('-')[1]);
      const col = tableau[ci];
      if (cardIdx !== col.length - 1) return;
      card = col[cardIdx];
      if (!card.faceUp) return;
    } else return;

    const fi = autoFoundation(card);
    if (fi === -1) { statusEl.textContent = `Can't move ${card.rank}${card.suit} to foundation yet`; return; }
    selected = { src, cards: [card] };
    saveHistory();
    moveCards([card], 'found', fi);
  }

  // ── click on empty tableau column ─────────────────────────────────────────
  function clickEmptyCol(ci) {
    if (!selected) return;
    if (canPlaceOnTableau(selected.cards[0], tableau[ci])) {
      saveHistory();
      moveCards(selected.cards, 'tab', ci);
    } else {
      clearSelection();
    }
  }

  // ── attach all event handlers after each render ────────────────────────────
  function attachHandlers() {
    // stock
    stockEl.onclick = () => { if (selected) clearSelection(); clickStock(); };

    // waste
    const wasteTopEl = wasteEl.querySelector('.sol-waste-top') || wasteEl.lastElementChild;
    if (wasteTopEl && wasteTopEl.classList.contains('sol-card')) {
      wasteTopEl.onclick = e => { e.stopPropagation(); clickWasteTop(); };
      wasteTopEl.ondblclick = e => { e.stopPropagation(); dblClickCard('waste', 0); };
    }
    wasteEl.onclick = () => { if (!waste.length) return; clickWasteTop(); };

    // foundations
    foundEls.forEach((el, fi) => {
      el.onclick = e => { e.stopPropagation(); clickFoundation(fi); };
    });

    // tableau columns
    colEls.forEach((colEl, ci) => {
      const col = tableau[ci];
      const cards = colEl.querySelectorAll('.sol-card');
      cards.forEach((el, idx) => {
        el.onclick = e => { e.stopPropagation(); clickTableauCard(ci, idx); };
        el.ondblclick = e => { e.stopPropagation(); dblClickCard(`tab-${ci}`, idx); };
      });
      // empty col click
      const emptyEl = colEl.querySelector('.sol-empty-col');
      if (emptyEl) emptyEl.onclick = () => clickEmptyCol(ci);
      // clicking col background when empty
      if (col.length === 0) colEl.onclick = () => clickEmptyCol(ci);
    });
  }

  // ── kick off ───────────────────────────────────────────────────────────────
  newGame();
}

// ============================
// VIEW CITY — stub (real impl in main.js / cityScene.js)
// ============================

// This will be replaced by main.js after the module loads.
// Defined here so APP_CONFIG can reference it at parse time.
function initViewCity(content) {
  const canvas = content.querySelector('.viewcity-canvas');
  if (!canvas) return;
  // main.js overwrites window.initViewCity; if it hasn't yet, retry.
  if (window.initViewCity !== initViewCity) {
    window.initViewCity(content);
  }
}

// ============================
// MUSIC VISUALISER
// ============================
function initMusicViz(content) {
  const canvas = content.querySelector('#musicviz-canvas');
  const fileInput = content.querySelector('#musicviz-file-input');
  const playBtn = content.querySelector('#musicviz-play');
  const stopBtn = content.querySelector('#musicviz-stop');
  const nextBtn = content.querySelector('#musicviz-next');
  const modeSelect = content.querySelector('#musicviz-mode');
  const nowPlaying = content.querySelector('#musicviz-now-playing');
  const volSlider = content.querySelector('#musicviz-vol');
  const presetSelect = content.querySelector('#musicviz-preset');
  const speedSlider = content.querySelector('#musicviz-speed');
  const speedVal = content.querySelector('#musicviz-speed-val');
  const pitchSlider = content.querySelector('#musicviz-pitch');
  const pitchVal = content.querySelector('#musicviz-pitch-val');
  const reverbSlider = content.querySelector('#musicviz-reverb');
  const reverbVal = content.querySelector('#musicviz-reverb-val');
  const bassSlider = content.querySelector('#musicviz-bass');
  const bassVal = content.querySelector('#musicviz-bass-val');
  const queueList = content.querySelector('#musicviz-queue');

  let activeQueue = [];
  let queueIndex = -1;

  function loadQueueIndex(index) {
    if (index >= 0 && index < activeQueue.length) {
      queueIndex = index;
      const file = activeQueue[index];
      audioEl.src = URL.createObjectURL(file);
      nowPlaying.textContent = file.name;
      ensureAudio();
      audioEl.play();
      highlightQueueItem();
    }
  }

  function playNextInQueue() {
    if (activeQueue.length > 0 && queueIndex < activeQueue.length - 1) {
      loadQueueIndex(queueIndex + 1);
    }
  }

  function renderQueue() {
    if (!queueList) return;
    queueList.innerHTML = '';
    activeQueue.forEach((file, idx) => {
      const li = document.createElement('li');
      li.textContent = file.name;
      li.addEventListener('click', () => loadQueueIndex(idx));
      if (idx === queueIndex) li.style.fontWeight = 'bold';
      queueList.appendChild(li);
    });
  }

  function highlightQueueItem() {
    if (!queueList) return;
    const items = queueList.querySelectorAll('li');
    items.forEach((item, idx) => {
      item.style.fontWeight = idx === queueIndex ? 'bold' : 'normal';
      item.style.color = idx === queueIndex ? '#00e5ff' : '#ccc';
    });
  }
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let audioCtx = null, analyser = null, sourceNode = null, gainNode = null;
  let convolverNode = null, reverbGainNode = null, dryGainNode = null;
  let bassFilter = null;
  let audioEl = new Audio();
  audioEl.crossOrigin = 'anonymous';
  // Keep the element volume at 1.0 – volume control is done via gainNode so
  // there is no double-attenuation and no hidden lossy resampling from the
  // browser's own volume path.
  audioEl.volume = 1.0;
  let rafId = null;
  let vizMode = 'bars';

  // ---- Build reverb impulse response (exponential decay stereo noise) ----
  function createReverbBuffer(actx, duration = 2.5, decay = 3.0) {
    const sampleRate = actx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buf = actx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buf;
  }

  function ensureAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'playback' });
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.82;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = (volSlider ? volSlider.value / 100 : 0.8);

    bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = 'lowShelf';
    bassFilter.frequency.value = 200;
    bassFilter.gain.value = 0;  // 0 dB = no effect until user moves slider

    dryGainNode = audioCtx.createGain();
    dryGainNode.gain.value = 1.0;

    reverbGainNode = audioCtx.createGain();
    reverbGainNode.gain.value = 0.0;

    convolverNode = audioCtx.createConvolver();
    convolverNode.buffer = createReverbBuffer(audioCtx);

    sourceNode = audioCtx.createMediaElementSource(audioEl);

    // Disable default browser time-stretching to prevent muddy transients on speed change
    if ('preservesPitch' in audioEl) audioEl.preservesPitch = false;

    // ---- ROUTING ----
    // Analyser is a dead-end branch so it never intercepts the main audio path
    sourceNode.connect(analyser);

    // By default: sourceNode -> gainNode -> dryGainNode -> destination
    // The BiquadFilter (bass) is physically removed from the graph when at 0dB
    // because even at 0dB, an IIR filter alters the phase response, causing a
    // smeared/muddy sound.
    sourceNode.connect(gainNode);

    gainNode.connect(dryGainNode);
    dryGainNode.connect(audioCtx.destination);
  }

  // Track graph connections
  let reverbConnected = false;
  let bassConnected = false;

  function ensureReverbConnected() {
    if (reverbConnected || !audioCtx) return;
    gainNode.connect(convolverNode);
    convolverNode.connect(reverbGainNode);
    reverbGainNode.connect(audioCtx.destination);
    reverbConnected = true;
  }

  function ensureReverbDisconnected() {
    if (!reverbConnected || !audioCtx) return;
    try { gainNode.disconnect(convolverNode); } catch (_) {}
    try { convolverNode.disconnect(reverbGainNode); } catch (_) {}
    try { reverbGainNode.disconnect(audioCtx.destination); } catch (_) {}
    reverbConnected = false;
  }

  function updateBassRouting(v) {
    if (!audioCtx) return;
    if (v > 0) {
      if (!bassConnected) {
        sourceNode.disconnect(gainNode);
        sourceNode.connect(bassFilter);
        bassFilter.connect(gainNode);
        bassConnected = true;
      }
      bassFilter.gain.setTargetAtTime(v, audioCtx.currentTime, 0.05);
    } else {
      if (bassConnected) {
        sourceNode.disconnect(bassFilter);
        bassFilter.disconnect(gainNode);
        sourceNode.connect(gainNode);
        bassConnected = false;
      }
      bassFilter.gain.value = 0;
    }
  }

  // Apply a preset — sets speed + pitch + reverb
  const PRESETS = {
    'normal':        { speed: 1.00, pitch:  0,  reverb: 0  },
    'nightcore':     { speed: 1.15, pitch:  4,  reverb: 0  },
    'nightcore+':    { speed: 1.30, pitch:  7,  reverb: 0  },
    'slowed':        { speed: 0.80, pitch:  0,  reverb: 0  },
    'slowed-reverb': { speed: 0.80, pitch: -2,  reverb: 65 },
  };

  function computeRate(speed, semitones) {
    return speed * Math.pow(2, semitones / 12);
  }

  function applyPreset(key) {
    const p = PRESETS[key] || PRESETS['normal'];
    const rate = computeRate(p.speed, p.pitch);
    audioEl.playbackRate = rate;
    if (speedSlider) speedSlider.value = p.speed;
    if (speedVal) speedVal.textContent = p.speed.toFixed(2) + '×';
    if (pitchSlider) pitchSlider.value = p.pitch;
    const stLabel = p.pitch > 0 ? '+' + p.pitch : String(p.pitch);
    if (pitchVal) pitchVal.textContent = stLabel + ' st';
    const rev = p.reverb;
    if (reverbSlider) reverbSlider.value = rev;
    if (reverbVal) reverbVal.textContent = rev + '%';
    setReverbWet(rev / 100);
  }

  function setReverbWet(wet) {
    // wet 0‥1: dryGain = 1-wet, reverbGain = wet
    // Only wire the convolver into the graph when reverb is actually in use,
    // so that default (clean) playback is unaffected by the convolver.
    if (!audioCtx) return;
    if (wet > 0) {
      ensureReverbConnected();
      dryGainNode.gain.setTargetAtTime(1 - wet, audioCtx.currentTime, 0.05);
      reverbGainNode.gain.setTargetAtTime(wet, audioCtx.currentTime, 0.05);
    } else {
      dryGainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.05);
      reverbGainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
      // Delay disconnecting until the tail has faded (1 s)
      setTimeout(ensureReverbDisconnected, 1000);
    }
  }

  if (volSlider) {
    volSlider.addEventListener('input', () => {
      if (gainNode) gainNode.gain.value = volSlider.value / 100;
      // Do NOT touch audioEl.volume – keep it at 1.0 so all attenuation goes
      // through gainNode and stays clean inside the Web Audio graph.
    });
  }

  if (speedSlider) {
    speedSlider.addEventListener('input', () => {
      const speed = parseFloat(speedSlider.value);
      const semitones = parseFloat(pitchSlider?.value ?? 0);
      audioEl.playbackRate = computeRate(speed, semitones);
      if (speedVal) speedVal.textContent = speed.toFixed(2) + '×';
      // deselect preset if it no longer matches
      if (presetSelect) {
        const matched = Object.entries(PRESETS).find(([, p]) =>
          Math.abs(p.speed - speed) < 0.01 &&
          Math.abs(p.pitch - semitones) < 0.3 &&
          Math.abs(p.reverb - parseFloat(reverbSlider?.value ?? 0)) < 1
        );
        presetSelect.value = matched ? matched[0] : 'normal';
      }
    });
  }

  if (pitchSlider) {
    pitchSlider.addEventListener('input', () => {
      const semitones = parseFloat(pitchSlider.value);
      const speed = parseFloat(speedSlider?.value ?? 1);
      audioEl.playbackRate = computeRate(speed, semitones);
      const stLabel = semitones > 0 ? '+' + semitones : String(semitones);
      if (pitchVal) pitchVal.textContent = stLabel + ' st';
      // deselect preset if it no longer matches
      if (presetSelect) {
        const matched = Object.entries(PRESETS).find(([, p]) =>
          Math.abs(p.speed - speed) < 0.01 &&
          Math.abs(p.pitch - semitones) < 0.3 &&
          Math.abs(p.reverb - parseFloat(reverbSlider?.value ?? 0)) < 1
        );
        presetSelect.value = matched ? matched[0] : 'normal';
      }
    });
  }

  if (reverbSlider) {
    reverbSlider.addEventListener('input', () => {
      const v = parseInt(reverbSlider.value);
      if (reverbVal) reverbVal.textContent = v + '%';
      if (audioCtx) setReverbWet(v / 100);
    });
  }

  if (bassSlider) {
    bassSlider.addEventListener('input', () => {
      const v = parseFloat(bassSlider.value);
      if (bassVal) bassVal.textContent = v.toFixed(1) + ' dB';
      if (audioCtx) updateBassRouting(v);
    });
  }

  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      ensureAudio();
      applyPreset(presetSelect.value);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const files = Array.from(fileInput.files);
      if (files.length === 0) return;
      activeQueue = activeQueue.concat(files);
      renderQueue();
      if (queueIndex === -1) {
        loadQueueIndex(activeQueue.length - files.length); // Play the first newly added file
      }
      fileInput.value = '';
    });
  }
  
  audioEl.addEventListener('ended', playNextInQueue);

  if (playBtn) playBtn.addEventListener('click', () => { if (audioEl.src) { ensureAudio(); audioEl.play(); } else fileInput?.click(); });
  if (stopBtn) stopBtn.addEventListener('click', () => { audioEl.pause(); audioEl.currentTime = 0; });
  if (nextBtn) nextBtn.addEventListener('click', playNextInQueue);
  if (modeSelect) modeSelect.addEventListener('change', () => { vizMode = modeSelect.value; });

  function getFreq() { const b = new Uint8Array(analyser.frequencyBinCount); analyser.getByteFrequencyData(b); return b; }
  function getTime() { const b = new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(b); return b; }

  // Channel split helper
  function getBass(d) { let s = 0; for (let i = 0; i < 8; i++) s += d[i]; return s / (8 * 255); }
  function getMid(d) { let s = 0; for (let i = 15; i < 60; i++) s += d[i]; return s / (45 * 255); }
  function getTreble(d) { let s = 0; for (let i = 80; i < 200; i++) s += d[i]; return s / (120 * 255); }

  function draw() {
    rafId = requestAnimationFrame(draw);
    const w = canvas.width, h = canvas.height;
    if (!analyser || w === 0) return;

    const freq = getFreq();
    const time = getTime();
    const bass = getBass(freq), mid = getMid(freq), treble = getTreble(freq);

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, w, h);

    if (vizMode === 'bars') {
      // Bass bars (left), Mid bars (center), Treble bars (right)
      const sections = [
        { start: 0, end: 10, color: '#ff4444', label: 'BASS', x: 0, w: w / 3 },
        { start: 15, end: 60, color: '#44ff44', label: 'MID', x: w / 3, w: w / 3 },
        { start: 60, end: 200, color: '#4488ff', label: 'TREBLE', x: (w / 3) * 2, w: w / 3 }
      ];
      sections.forEach(sec => {
        const count = sec.end - sec.start;
        const bw = sec.w / count - 1;
        for (let i = 0; i < count; i++) {
          const v = freq[sec.start + i] / 255;
          const bh = v * h * 0.85;
          ctx.fillStyle = sec.color;
          ctx.globalAlpha = 0.3 + v * 0.7;
          ctx.fillRect(sec.x + i * (bw + 1), h - bh, bw, bh);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = sec.color;
        ctx.font = '10px monospace';
        ctx.fillText(sec.label, sec.x + 4, 14);
      });
      // Channel meters
      ctx.fillStyle = '#ff4444'; ctx.fillRect(10, h - 20, bass * (w / 3 - 20), 6);
      ctx.fillStyle = '#44ff44'; ctx.fillRect(w / 3 + 10, h - 20, mid * (w / 3 - 20), 6);
      ctx.fillStyle = '#4488ff'; ctx.fillRect((w / 3) * 2 + 10, h - 20, treble * (w / 3 - 20), 6);
    } else if (vizMode === 'wave') {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      const step = w / time.length;
      for (let i = 0; i < time.length; i++) {
        const y = ((time[i] / 128) - 1) * (h * 0.4) + h / 2;
        i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * step, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Channel indicators
      const barH = 30;
      ctx.fillStyle = `rgba(255,68,68,${bass})`; ctx.fillRect(0, 0, 8, barH * bass * 3);
      ctx.fillStyle = `rgba(68,255,68,${mid})`; ctx.fillRect(10, 0, 8, barH * mid * 3);
      ctx.fillStyle = `rgba(68,136,255,${treble})`; ctx.fillRect(20, 0, 8, barH * treble * 3);
    } else if (vizMode === 'radial') {
      const cx = w / 2, cy = h / 2;
      const bars = 128;
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2;
        const v = freq[Math.floor(i * freq.length / bars)] / 255;
        const r0 = 40 + bass * 20;
        const r1 = r0 + v * (Math.min(w, h) * 0.35);
        const hue = (i / bars) * 360;
        ctx.strokeStyle = `hsl(${hue},100%,${50 + v * 40}%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r0, cy + Math.sin(angle) * r0);
        ctx.lineTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
        ctx.stroke();
      }
    }
  }

  // Sync canvas size
  function syncSize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0) canvas.width = Math.round(rect.width);
    if (rect.height > 0) canvas.height = Math.round(rect.height);
  }
  const obs = new ResizeObserver(syncSize);
  obs.observe(canvas);
  syncSize();
  draw();

  // Cleanup
  const winEl = content.closest('.window');
  if (winEl) {
    const mo = new MutationObserver(() => {
      if (!document.contains(winEl)) {
        cancelAnimationFrame(rafId);
        obs.disconnect();
        mo.disconnect();
        audioEl.pause();
        if (audioCtx) audioCtx.close();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
}

// ============================
// CALCULATOR
// ============================
function initCalculator(content) {
  const display = content.querySelector('#calc-display');
  const buttons = content.querySelectorAll('.calc-btn');
  if (!display) return;

  let current = '0', previous = '', operator = '', resetNext = false;

  function updateDisplay() { display.value = current; }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      const act = btn.dataset.action;

      if (val !== undefined) {
        if (val === '.') {
          if (current.includes('.')) return;
          current += '.';
        } else {
          if (current === '0' || resetNext) { current = val; resetNext = false; }
          else current += val;
        }
        updateDisplay();
        return;
      }

      if (act === 'clear') { current = '0'; previous = ''; operator = ''; updateDisplay(); return; }
      if (act === 'ce') { current = '0'; updateDisplay(); return; }
      if (act === 'back') { current = current.slice(0, -1) || '0'; updateDisplay(); return; }
      if (act === 'negate') { current = String(-parseFloat(current)); updateDisplay(); return; }
      if (act === 'percent') { current = String(parseFloat(current) / 100); updateDisplay(); return; }
      if (act === 'sqrt') { current = String(Math.sqrt(parseFloat(current))); updateDisplay(); return; }
      if (act === 'inv') { const v = parseFloat(current); current = v === 0 ? 'Error' : String(1 / v); updateDisplay(); return; }

      if (['+', '-', '*', '/'].includes(act)) {
        if (previous && operator && !resetNext) {
          current = String(calc(parseFloat(previous), parseFloat(current), operator));
        }
        previous = current;
        operator = act;
        resetNext = true;
        updateDisplay();
        return;
      }

      if (act === '=') {
        if (previous && operator) {
          current = String(calc(parseFloat(previous), parseFloat(current), operator));
          previous = '';
          operator = '';
          resetNext = true;
          updateDisplay();
        }
      }
    });
  });

  function calc(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? 'Error' : a / b;
      default: return b;
    }
  }
}

// ============================
// LAMBDA CALCULUS & BRAINFUCK IDE
// ============================
function initLambdaIDE(content) {
  const langSelect = content.querySelector('#ide-lang');
  const editor = content.querySelector('#ide-editor');
  const output = content.querySelector('#ide-output');
  const runBtn = content.querySelector('#ide-run');
  const clearBtn = content.querySelector('#ide-clear');
  const saveBtn = content.querySelector('#ide-save');
  const loadBtn = content.querySelector('#ide-load');
  const fileInput = content.querySelector('#ide-file-input');
  const savedList = content.querySelector('#ide-saved-list');
  if (!editor) return;

  // Load saved programs from localStorage
  function getSaved() {
    try { return JSON.parse(localStorage.getItem('ide_programs') || '{}'); } catch { return {}; }
  }
  function setSaved(obj) { localStorage.setItem('ide_programs', JSON.stringify(obj)); }

  function renderSaved() {
    if (!savedList) return;
    const progs = getSaved();
    savedList.innerHTML = '';
    Object.keys(progs).forEach(name => {
      const row = document.createElement('div');
      row.className = 'ide-saved-row';
      row.innerHTML = `<span class="ide-saved-name">${name}</span><button class="ide-saved-del" title="Delete">✕</button>`;
      row.querySelector('.ide-saved-name').addEventListener('click', () => {
        editor.value = progs[name].code;
        langSelect.value = progs[name].lang;
        output.textContent = '';
      });
      row.querySelector('.ide-saved-del').addEventListener('click', () => {
        delete progs[name];
        setSaved(progs);
        renderSaved();
      });
      savedList.appendChild(row);
    });
  }
  renderSaved();

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = prompt('Program name:', 'my_program');
      if (!name) return;
      const progs = getSaved();
      progs[name] = { code: editor.value, lang: langSelect.value };
      setSaved(progs);
      renderSaved();
      // Also download the file
      const ext = langSelect.value === 'bf' ? '.bf' : '.lc';
      const blob = new Blob([editor.value], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name + ext;
      a.click();
    });
  }

  if (loadBtn && fileInput) {
    loadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => { editor.value = e.target.result; };
      reader.readAsText(file);
      fileInput.value = '';
    });
  }

  if (clearBtn) clearBtn.addEventListener('click', () => { output.textContent = ''; });

  // ── Brainfuck interpreter ──
  function runBF(code, input = '') {
    const cells = new Uint8Array(30000);
    let ptr = 0, ip = 0, inputIdx = 0, out = '', steps = 0;
    const maxSteps = 5000000;

    // Build jump table
    const jumps = {};
    const stack = [];
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '[') stack.push(i);
      else if (code[i] === ']') {
        if (stack.length === 0) return 'Error: Unmatched ]';
        const j = stack.pop();
        jumps[j] = i;
        jumps[i] = j;
      }
    }
    if (stack.length) return 'Error: Unmatched [';

    while (ip < code.length && steps < maxSteps) {
      steps++;
      const c = code[ip];
      switch (c) {
        case '>': ptr++; if (ptr >= 30000) ptr = 0; break;
        case '<': ptr--; if (ptr < 0) ptr = 29999; break;
        case '+': cells[ptr] = (cells[ptr] + 1) & 255; break;
        case '-': cells[ptr] = (cells[ptr] - 1) & 255; break;
        case '.': out += String.fromCharCode(cells[ptr]); break;
        case ',': cells[ptr] = inputIdx < input.length ? input.charCodeAt(inputIdx++) : 0; break;
        case '[': if (cells[ptr] === 0) ip = jumps[ip]; break;
        case ']': if (cells[ptr] !== 0) ip = jumps[ip]; break;
      }
      ip++;
    }
    if (steps >= maxSteps) out += '\n[Execution limit reached]';
    return out || '(no output)';
  }

  // ── Lambda Calculus interpreter ──
  function runLambda(code) {
    // Simple untyped lambda calculus parser & evaluator
    // Syntax: \x.body  or  λx.body  for abstraction, (f x) for application
    try {
      const tokens = tokenizeLambda(code.trim());
      const ast = parseLambda(tokens);
      const result = evalLambda(ast, {}, 0);
      return lambdaToString(result);
    } catch (e) {
      return 'Error: ' + e.message;
    }
  }

  function tokenizeLambda(s) {
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      if (/\s/.test(s[i])) { i++; continue; }
      if (s[i] === '(' || s[i] === ')') { tokens.push(s[i++]); continue; }
      if (s[i] === '\\' || s[i] === 'λ') { tokens.push('λ'); i++; continue; }
      if (s[i] === '.') { tokens.push('.'); i++; continue; }
      let name = '';
      while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) name += s[i++];
      if (name) tokens.push(name);
    }
    return tokens;
  }

  function parseLambda(tokens) {
    let pos = 0;
    function peek() { return tokens[pos]; }
    function next() { return tokens[pos++]; }

    function parseExpr() {
      let node = parseAtom();
      // Application: left-associate atoms
      while (pos < tokens.length && peek() !== ')' && peek() !== undefined) {
        const right = parseAtom();
        if (!right) break;
        node = { type: 'app', func: node, arg: right };
      }
      return node;
    }

    function parseAtom() {
      const t = peek();
      if (!t || t === ')') return null;
      if (t === 'λ') {
        next(); // consume λ
        const param = next();
        if (peek() === '.') next(); // consume .
        const body = parseExpr();
        return { type: 'abs', param, body };
      }
      if (t === '(') {
        next(); // consume (
        const expr = parseExpr();
        if (peek() === ')') next(); // consume )
        return expr;
      }
      // Variable
      next();
      return { type: 'var', name: t };
    }

    const result = parseExpr();
    return result;
  }

  function evalLambda(node, env, depth) {
    if (depth > 1000) throw new Error('Recursion limit exceeded');
    if (!node) throw new Error('Empty expression');

    switch (node.type) {
      case 'var':
        if (env.hasOwnProperty(node.name)) return env[node.name];
        return node; // free variable
      case 'abs':
        return { type: 'closure', param: node.param, body: node.body, env: { ...env } };
      case 'app': {
        const func = evalLambda(node.func, env, depth + 1);
        const arg = evalLambda(node.arg, env, depth + 1);
        if (func.type === 'closure') {
          const newEnv = { ...func.env, [func.param]: arg };
          return evalLambda(func.body, newEnv, depth + 1);
        }
        return { type: 'app', func, arg };
      }
      case 'closure':
        return node;
      default:
        return node;
    }
  }

  function lambdaToString(node) {
    if (!node) return '()';
    switch (node.type) {
      case 'var': return node.name;
      case 'abs': return `(λ${node.param}.${lambdaToString(node.body)})`;
      case 'closure': return `(λ${node.param}.${lambdaToString(node.body)})`;
      case 'app': return `(${lambdaToString(node.func)} ${lambdaToString(node.arg)})`;
      default: return JSON.stringify(node);
    }
  }

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      const lang = langSelect.value;
      const code = editor.value;
      if (!code.trim()) { output.textContent = '(empty program)'; return; }
      let result;
      if (lang === 'bf') {
        const userInput = prompt('Program input (for , commands):', '') || '';
        result = runBF(code, userInput);
      } else {
        result = runLambda(code);
      }
      output.textContent = result;
    });
  }
}

// ============================
// SPREADSHEET
// ============================
function initSpreadsheet(content) {
  const ROWS = 20, COLS = 10;
  const table = content.querySelector('#spreadsheet-table');
  const formulaBar = content.querySelector('#spreadsheet-formula');
  const cellRef = content.querySelector('#spreadsheet-cellref');
  const saveBtn = content.querySelector('#spreadsheet-save');
  if (!table) return;

  const data = {}; // key: "A1" => { raw: "=A2+1", value: "5" }
  let selectedCell = null;

  function colName(c) { return String.fromCharCode(65 + c); }
  function cellKey(r, c) { return colName(c) + (r + 1); }

  // Build table
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headRow.innerHTML = '<th class="ss-corner"></th>';
  for (let c = 0; c < COLS; c++) {
    headRow.innerHTML += `<th class="ss-col-header">${colName(c)}</th>`;
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (let r = 0; r < ROWS; r++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="ss-row-header">${r + 1}</td>`;
    for (let c = 0; c < COLS; c++) {
      const td = document.createElement('td');
      td.className = 'ss-cell';
      td.dataset.row = r;
      td.dataset.col = c;
      td.contentEditable = true;
      td.addEventListener('focus', () => {
        selectedCell = { r, c };
        if (cellRef) cellRef.textContent = cellKey(r, c);
        const key = cellKey(r, c);
        if (formulaBar) formulaBar.value = data[key]?.raw || td.textContent;
        content.querySelectorAll('.ss-cell.selected').forEach(el => el.classList.remove('selected'));
        td.classList.add('selected');
      });
      td.addEventListener('blur', () => {
        const key = cellKey(r, c);
        const val = td.textContent.trim();
        data[key] = { raw: val, value: val };
        recalcAll();
      });
      td.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          td.blur();
          // Move down
          const next = tbody.querySelector(`[data-row="${r + 1}"][data-col="${c}"]`);
          if (next) next.focus();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          td.blur();
          const next = tbody.querySelector(`[data-row="${r}"][data-col="${c + 1}"]`);
          if (next) next.focus();
        }
      });
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  // Formula bar sync
  if (formulaBar) {
    formulaBar.addEventListener('keydown', e => {
      if (e.key === 'Enter' && selectedCell) {
        e.preventDefault();
        const key = cellKey(selectedCell.r, selectedCell.c);
        const val = formulaBar.value;
        data[key] = { raw: val, value: val };
        const td = tbody.querySelector(`[data-row="${selectedCell.r}"][data-col="${selectedCell.c}"]`);
        if (td) td.textContent = val;
        recalcAll();
      }
    });
  }

  function getCellValue(key) {
    if (!data[key]) return 0;
    const val = data[key].value;
    return isNaN(parseFloat(val)) ? val : parseFloat(val);
  }

  function evaluateFormula(raw) {
    if (!raw || !raw.startsWith('=')) return raw;
    let expr = raw.substring(1);
    // Replace cell references with values
    expr = expr.replace(/([A-Z])(\d+)/gi, (_, col, row) => {
      const key = col.toUpperCase() + row;
      const v = getCellValue(key);
      return typeof v === 'number' ? v : 0;
    });
    // Simple SUM function
    expr = expr.replace(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, c1, r1, c2, r2) => {
      let sum = 0;
      const startCol = c1.toUpperCase().charCodeAt(0) - 65;
      const endCol = c2.toUpperCase().charCodeAt(0) - 65;
      const startRow = parseInt(r1) - 1;
      const endRow = parseInt(r2) - 1;
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const v = getCellValue(cellKey(r, c));
          sum += typeof v === 'number' ? v : 0;
        }
      }
      return sum;
    });
    try { return String(Function('"use strict"; return (' + expr + ')')()).substring(0, 20); }
    catch { return '#ERR'; }
  }

  function recalcAll() {
    // Two passes for simple dependency resolution
    for (let pass = 0; pass < 2; pass++) {
      for (const key of Object.keys(data)) {
        if (data[key].raw && data[key].raw.startsWith('=')) {
          data[key].value = evaluateFormula(data[key].raw);
        }
      }
    }
    // Update DOM
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = cellKey(r, c);
        const td = tbody.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (td && data[key]) {
          const display = data[key].raw?.startsWith('=') ? data[key].value : data[key].raw;
          if (td !== document.activeElement) td.textContent = display || '';
        }
      }
    }
  }

  // Save as CSV
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const fname = prompt('Save as:', 'spreadsheet.csv') || 'spreadsheet.csv';
      let csv = '';
      // Header
      csv += ',' + Array.from({ length: COLS }, (_, c) => colName(c)).join(',') + '\n';
      for (let r = 0; r < ROWS; r++) {
        let row = (r + 1).toString();
        for (let c = 0; c < COLS; c++) {
          const key = cellKey(r, c);
          let val = data[key]?.value || '';
          if (typeof val === 'string' && val.includes(',')) val = '"' + val + '"';
          row += ',' + val;
        }
        csv += row + '\n';
      }
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fname;
      a.click();
    });
  }
}

// ============================
// CONWAY'S GAME OF LIFE
// ============================
const CONWAY_PRESETS = {
  glider: {
    name: 'Glider',
    cells: [[0,1],[1,2],[2,0],[2,1],[2,2]],
    ox: 5, oy: 5,
  },
  blinker: {
    name: 'Blinker (Period 2)',
    cells: [[0,0],[1,0],[2,0]],
    ox: 10, oy: 10,
  },
  toad: {
    name: 'Toad (Period 2)',
    cells: [[1,0],[2,0],[3,0],[0,1],[1,1],[2,1]],
    ox: 10, oy: 10,
  },
  beacon: {
    name: 'Beacon (Period 2)',
    cells: [[0,0],[1,0],[0,1],[3,2],[2,3],[3,3]],
    ox: 10, oy: 10,
  },
  pulsar: {
    name: 'Pulsar (Period 3)',
    cells: [
      [2,0],[3,0],[4,0],[8,0],[9,0],[10,0],
      [0,2],[5,2],[7,2],[12,2],
      [0,3],[5,3],[7,3],[12,3],
      [0,4],[5,4],[7,4],[12,4],
      [2,5],[3,5],[4,5],[8,5],[9,5],[10,5],
      [2,7],[3,7],[4,7],[8,7],[9,7],[10,7],
      [0,8],[5,8],[7,8],[12,8],
      [0,9],[5,9],[7,9],[12,9],
      [0,10],[5,10],[7,10],[12,10],
      [2,12],[3,12],[4,12],[8,12],[9,12],[10,12],
    ],
    ox: 10, oy: 5,
  },
  pentadecathlon: {
    name: 'Pentadecathlon (Period 15)',
    cells: [
      [1,0],[1,1],[0,2],[2,2],[1,3],[1,4],[1,5],[1,6],[0,7],[2,7],[1,8],[1,9],
    ],
    ox: 20, oy: 5,
  },
  rpentomino: {
    name: 'R-Pentomino',
    cells: [[1,0],[2,0],[0,1],[1,1],[1,2]],
    ox: 20, oy: 20,
  },
  diehard: {
    name: 'Diehard (dies gen 130)',
    cells: [[6,0],[0,1],[1,1],[1,2],[5,2],[6,2],[7,2]],
    ox: 10, oy: 20,
  },
  acorn: {
    name: 'Acorn',
    cells: [[1,0],[3,1],[0,2],[1,2],[4,2],[5,2],[6,2]],
    ox: 20, oy: 20,
  },
  gospergun: {
    name: 'Gosper Glider Gun',
    cells: [
      [24,0],
      [22,1],[24,1],
      [12,2],[13,2],[20,2],[21,2],[34,2],[35,2],
      [11,3],[15,3],[20,3],[21,3],[34,3],[35,3],
      [0,4],[1,4],[10,4],[16,4],[20,4],[21,4],
      [0,5],[1,5],[10,5],[14,5],[16,5],[17,5],[22,5],[24,5],
      [10,6],[16,6],[24,6],
      [11,7],[15,7],
      [12,8],[13,8],
    ],
    ox: 2, oy: 5,
  },
  lwss: {
    name: 'Lightweight Spaceship',
    cells: [[1,0],[4,0],[0,1],[0,2],[4,2],[0,3],[1,3],[2,3],[3,3]],
    ox: 5, oy: 10,
  },
  infinite1: {
    name: 'Infinite Growth #1',
    cells: [
      [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[9,0],[10,0],[11,0],[12,0],[13,0],
      [17,0],[18,0],[19,0],
      [26,0],[27,0],[28,0],[29,0],[30,0],[31,0],[32,0],[34,0],[35,0],[36,0],[37,0],[38,0],
    ],
    ox: 5, oy: 20,
  },
};

function initConwayLife(content) {
  const canvas   = content.querySelector('#conway-canvas');
  const wrap     = content.querySelector('.conway-canvas-wrap');
  const ppBtn    = content.querySelector('#conway-playpause');
  const stepBtn  = content.querySelector('#conway-step');
  const clearBtn = content.querySelector('#conway-clear');
  const presetSel= content.querySelector('#conway-preset');
  const speedSlider = content.querySelector('#conway-speed');
  const speedVal = content.querySelector('#conway-speed-val');
  const zoomSel  = content.querySelector('#conway-zoom');
  const genLabel = content.querySelector('#conway-gen');
  const popLabel = content.querySelector('#conway-pop');

  if (!canvas) return;

  let CELL = parseInt(zoomSel.value) || 8;
  let COLS, ROWS;
  let grid, nextGrid;
  let running = false;
  let rafId = null;
  let gen = 0;
  let lastTick = 0;
  let gensPerSec = parseInt(speedSlider.value) || 10;
  const ALIVE_COLOR  = '#00e5ff';
  const DEAD_COLOR   = '#0a0e1a';
  const GRID_COLOR   = '#111a28';

  function resize() {
    CELL = parseInt(zoomSel.value) || 8;
    const W = wrap.clientWidth  || 660;
    const H = wrap.clientHeight || 400;
    canvas.width  = W;
    canvas.height = H;
    COLS = Math.floor(W / CELL);
    ROWS = Math.floor(H / CELL);
    const old = grid;
    grid     = new Uint8Array(COLS * ROWS);
    nextGrid = new Uint8Array(COLS * ROWS);
    if (old && COLS > 0 && ROWS > 0) {
      const prevCols = Math.round(wrap.clientWidth  / (parseInt(zoomSel.value) || 8));
      for (let r = 0; r < Math.min(ROWS, prevCols); r++) {
        for (let c = 0; c < Math.min(COLS, prevCols); c++) {
          if (old[r * prevCols + c]) grid[r * COLS + c] = 1;
        }
      }
    }
    draw();
  }

  function idx(c, r) { return r * COLS + c; }

  function draw() {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = DEAD_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = GRID_COLOR;
    for (let c = 0; c <= COLS; c++) {
      ctx.fillRect(c * CELL, 0, 1, canvas.height);
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.fillRect(0, r * CELL, canvas.width, 1);
    }
    ctx.fillStyle = ALIVE_COLOR;
    let pop = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[idx(c, r)]) {
          pop++;
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 1, CELL - 1);
        }
      }
    }
    genLabel.textContent = `Gen: ${gen}`;
    popLabel.textContent = `Pop: ${pop}`;
  }

  function neighbors(c, r) {
    let n = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = (r + dr + ROWS) % ROWS;
        const nc = (c + dc + COLS) % COLS;
        n += grid[idx(nc, nr)];
      }
    }
    return n;
  }

  function step() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const n = neighbors(c, r);
        const alive = grid[idx(c, r)];
        nextGrid[idx(c, r)] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
      }
    }
    [grid, nextGrid] = [nextGrid, grid];
    gen++;
    draw();
  }

  function loop(ts) {
    if (!running) return;
    const interval = 1000 / gensPerSec;
    if (ts - lastTick >= interval) {
      step();
      lastTick = ts;
    }
    rafId = requestAnimationFrame(loop);
  }

  function play() {
    running = true;
    ppBtn.textContent = '⏸ Pause';
    lastTick = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function pause() {
    running = false;
    ppBtn.textContent = '▶ Play';
    if (rafId) cancelAnimationFrame(rafId);
  }

  function clear() {
    pause();
    grid.fill(0);
    gen = 0;
    draw();
  }

  function loadPreset(key) {
    if (!key) return;
    const preset = CONWAY_PRESETS[key];
    if (!preset) return;
    grid.fill(0);
    gen = 0;
    const ox = preset.ox || 0;
    const oy = preset.oy || 0;
    for (const [c, r] of preset.cells) {
      const cc = ox + c, rr = oy + r;
      if (cc >= 0 && cc < COLS && rr >= 0 && rr < ROWS) {
        grid[idx(cc, rr)] = 1;
      }
    }
    draw();
  }

  // ---- Controls ----
  ppBtn.addEventListener('click', () => running ? pause() : play());
  stepBtn.addEventListener('click', () => { pause(); step(); });
  clearBtn.addEventListener('click', clear);

  presetSel.addEventListener('change', () => {
    clear();
    loadPreset(presetSel.value);
  });

  speedSlider.addEventListener('input', () => {
    gensPerSec = parseInt(speedSlider.value);
    speedVal.textContent = `${gensPerSec} gen/s`;
  });

  zoomSel.addEventListener('change', () => {
    resize();
    draw();
  });

  // ---- Drawing on canvas ----
  let painting = false;
  let paintMode = 1;

  canvas.addEventListener('mousedown', (e) => {
    painting = true;
    paintMode = e.button === 2 ? 0 : 1;
    const c = Math.floor(e.offsetX / CELL);
    const r = Math.floor(e.offsetY / CELL);
    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
      grid[idx(c, r)] = paintMode;
      draw();
    }
    e.preventDefault();
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!painting) return;
    const c = Math.floor(e.offsetX / CELL);
    const r = Math.floor(e.offsetY / CELL);
    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
      grid[idx(c, r)] = paintMode;
      draw();
    }
  });
  canvas.addEventListener('mouseup', () => { painting = false; });
  canvas.addEventListener('mouseleave', () => { painting = false; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  // ---- Init ----
  resize();
  // Default: load glider
  presetSel.value = 'glider';
  loadPreset('glider');

  // Re-size when window is resized
  const ro = new ResizeObserver(() => resize());
  ro.observe(wrap);
}

// ============================
// Expose globals for Vite module scope
// ============================
window.windows        = windows;
window.openApp        = openApp;
window.closeWindow    = closeWindow;
window.minimizeWindow = minimizeWindow;
window.toggleMaximize = toggleMaximize;
window.focusWindow    = focusWindow;
window.initViewCity   = initViewCity;
window.initMusicViz   = initMusicViz;
window.initCalculator = initCalculator;
window.initLambdaIDE  = initLambdaIDE;
window.initSpreadsheet = initSpreadsheet;
window.initScenes3d   = initScenes3d;
window.APP_CONFIG     = APP_CONFIG;
// IE browser functions (called by inline onclick handlers in template)
window.ieGo       = ieGo;
window.ieNavigate = ieNavigate;
window.ieBack     = ieBack;
window.ieForward  = ieForward;
window.ieRefresh  = ieRefresh;
window.ieHome     = ieHome;
// CK Projects
window.initCkProjects  = initCkProjects;
// Conway's Game of Life
window.initConwayLife  = initConwayLife;
// Games folder
window.initGames       = initGames;
// New Games
window.initTetris      = initTetris;
window.initBlackjack   = initBlackjack;
window.initPoker       = initPoker;
window.initBaccarat    = initBaccarat;

import { startCity, stopCity, cityPause, cityReset, cityWireframe } from './cityScene.js';
import { startSpaceship, stopSpaceship, spaceshipPause, spaceshipReset, setSpaceMode } from './spaceshipScene.js';
import { startOcean, stopOcean, oceanPause, oceanReset } from './oceanScene.js';
import { startCrystal, stopCrystal, crystalPause, crystalReset } from './crystalScene.js';
import './desktop.js';

console.log('[ViewCity] main.js loaded — patching init functions');

function doInitViewCity(content) {
  console.log('[ViewCity] doInitViewCity called');

  const canvas = content.querySelector('.viewcity-canvas');
  if (!canvas) {
    console.error('[ViewCity] ERROR: Canvas not found in template');
    return;
  }

  const wrap = canvas.closest('.viewcity-wrap') || canvas.parentElement;

  function tryStart(count = 0) {
    let w = wrap ? wrap.clientWidth : 0;
    let h = wrap ? wrap.clientHeight : 0;

    console.log(`[ViewCity] tryStart #${count} — size ${w}×${h}`);

    if (w < 100 || h < 100) {
      w = 800;
      h = 560;
    }

    if (w > 0 && h > 0) {
      console.log(`[ViewCity] Starting 3D scene at ${w}×${h}px`);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.background = 'transparent';

      try {
        startCity(canvas);
        console.log('[ViewCity] startCity() called successfully');
      } catch (err) {
        console.error('[ViewCity] CRITICAL ERROR in startCity:', err);
      }
    } else if (count < 100) {
      setTimeout(() => tryStart(count + 1), 16);   // more reliable than RAF for layout
    } else {
      console.warn('[ViewCity] Using forced fallback size');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(800 * dpr);
      canvas.height = Math.floor(560 * dpr);
      canvas.style.background = 'transparent';

      try {
        startCity(canvas);
      } catch (err) {
        console.error('[ViewCity] Fallback startCity failed:', err);
      }
    }
  }

  // Start polling (gives window layout time to settle)
  setTimeout(() => tryStart(), 30);
}

// Patch everything
window.initViewCity = doInitViewCity;

function patchAppConfig() {
  if (window.APP_CONFIG && window.APP_CONFIG.viewcity) {
    window.APP_CONFIG.viewcity.onOpen = doInitViewCity;
    console.log('[ViewCity] APP_CONFIG patched successfully');
  } else {
    setTimeout(patchAppConfig, 10);
  }
}
patchAppConfig();

// Global controls (unchanged)
window._vcTogglePause = function () {
  const win = window.windows?.viewcity;
  if (!win) return;
  const canvas = win.content.querySelector('.viewcity-canvas');
  if (!canvas) return;
  const paused = cityPause(canvas);
  win.content.querySelectorAll('.vc-btn').forEach(b => {
    if (b.textContent.includes('Pause') || b.textContent.includes('Play'))
      b.textContent = paused ? '▶ Play' : '⏸ Pause';
  });
};

window._vcReset = function () {
  const win = window.windows?.viewcity;
  if (!win) return;
  const canvas = win.content.querySelector('.viewcity-canvas');
  if (canvas) cityReset(canvas);
};

window._vcToggleWireframe = function (cb) {
  const win = window.windows?.viewcity;
  if (!win) return;
  const canvas = win.content.querySelector('.viewcity-canvas');
  if (canvas) cityWireframe(canvas, cb.checked);
};

// ============================================================
//  VIEW SPACESHIP  wiring
// ============================================================
function doInitViewSpaceship(content) {
  console.log('[ViewSpaceship] doInitViewSpaceship called');

  const canvas = content.querySelector('.viewspaceship-canvas');
  if (!canvas) {
    console.error('[ViewSpaceship] ERROR: Canvas not found in template');
    return;
  }

  const wrap = canvas.closest('.viewspaceship-wrap') || canvas.parentElement;

  function tryStart(count = 0) {
    let w = wrap ? wrap.clientWidth : 0;
    let h = wrap ? wrap.clientHeight : 0;

    if (w < 100 || h < 100) { w = 820; h = 580; }

    if (w > 0 && h > 0) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.background = 'transparent';
      try {
        startSpaceship(canvas);
        console.log('[ViewSpaceship] startSpaceship() called successfully');
      } catch (err) {
        console.error('[ViewSpaceship] CRITICAL ERROR in startSpaceship:', err);
      }
    } else if (count < 100) {
      setTimeout(() => tryStart(count + 1), 16);
    } else {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(820 * dpr);
      canvas.height = Math.floor(580 * dpr);
      canvas.style.background = 'transparent';
      try { startSpaceship(canvas); } catch(err) {
        console.error('[ViewSpaceship] Fallback startSpaceship failed:', err);
      }
    }
  }

  setTimeout(() => tryStart(), 30);
}

window.initViewSpaceship = doInitViewSpaceship;

function patchSpaceshipConfig() {
  if (window.APP_CONFIG && window.APP_CONFIG.viewspaceship) {
    window.APP_CONFIG.viewspaceship.onOpen = doInitViewSpaceship;
    console.log('[ViewSpaceship] APP_CONFIG patched successfully');
  } else {
    setTimeout(patchSpaceshipConfig, 10);
  }
}
patchSpaceshipConfig();

window._vsTogglePause = function () {
  const win = window.windows?.viewspaceship;
  if (!win) return;
  const canvas = win.content.querySelector('.viewspaceship-canvas');
  if (!canvas) return;
  const paused = spaceshipPause(canvas);
  win.content.querySelectorAll('.vc-btn').forEach(b => {
    if (b.textContent.includes('Pause') || b.textContent.includes('Play'))
      b.textContent = paused ? '▶ Play' : '⏸ Pause';
  });
};

window._vsReset = function () {
  const win = window.windows?.viewspaceship;
  if (!win) return;
  const canvas = win.content.querySelector('.viewspaceship-canvas');
  if (canvas) spaceshipReset(canvas);
};

window._vsToggleSpace = function (cb) {
  const win = window.windows?.viewspaceship;
  if (!win) return;
  const canvas = win.content.querySelector('.viewspaceship-canvas');
  if (canvas) setSpaceMode(canvas, cb.checked);
};

// ============================================================
//  VIEW OCEAN  wiring
// ============================================================
function doInitViewOcean(content) {
  console.log('[ViewOcean] doInitViewOcean called');

  const canvas = content.querySelector('.viewocean-canvas');
  if (!canvas) {
    console.error('[ViewOcean] ERROR: Canvas not found in template');
    return;
  }

  const wrap = canvas.closest('.viewocean-wrap') || canvas.parentElement;

  function tryStart(count = 0) {
    let w = wrap ? wrap.clientWidth : 0;
    let h = wrap ? wrap.clientHeight : 0;

    if (w < 100 || h < 100) { w = 820; h = 580; }

    if (w > 0 && h > 0) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.background = 'transparent';
      try {
        startOcean(canvas);
        console.log('[ViewOcean] startOcean() called successfully');
      } catch (err) {
        console.error('[ViewOcean] CRITICAL ERROR in startOcean:', err);
      }
    } else if (count < 100) {
      setTimeout(() => tryStart(count + 1), 16);
    } else {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(820 * dpr);
      canvas.height = Math.floor(580 * dpr);
      canvas.style.background = 'transparent';
      try { startOcean(canvas); } catch(err) {
        console.error('[ViewOcean] Fallback startOcean failed:', err);
      }
    }
  }

  setTimeout(() => tryStart(), 30);
}

window.initViewOcean = doInitViewOcean;

function patchOceanConfig() {
  if (window.APP_CONFIG && window.APP_CONFIG.viewocean) {
    window.APP_CONFIG.viewocean.onOpen = doInitViewOcean;
    console.log('[ViewOcean] APP_CONFIG patched successfully');
  } else {
    setTimeout(patchOceanConfig, 10);
  }
}
patchOceanConfig();

window._voTogglePause = function () {
  const win = window.windows?.viewocean;
  if (!win) return;
  const canvas = win.content.querySelector('.viewocean-canvas');
  if (!canvas) return;
  const paused = oceanPause(canvas);
  win.content.querySelectorAll('.vc-btn').forEach(b => {
    if (b.textContent.includes('Pause') || b.textContent.includes('Play'))
      b.textContent = paused ? '▶ Play' : '⏸ Pause';
  });
};

window._voReset = function () {
  const win = window.windows?.viewocean;
  if (!win) return;
  const canvas = win.content.querySelector('.viewocean-canvas');
  if (canvas) oceanReset(canvas);
};

// ============================================================
//  VIEW CRYSTAL  wiring
// ============================================================
function doInitViewCrystal(content) {
  console.log('[ViewCrystal] doInitViewCrystal called');

  const canvas = content.querySelector('.viewcrystal-canvas');
  if (!canvas) {
    console.error('[ViewCrystal] ERROR: Canvas not found in template');
    return;
  }

  const wrap = canvas.closest('.viewcrystal-wrap') || canvas.parentElement;

  function tryStart(count = 0) {
    let w = wrap ? wrap.clientWidth : 0;
    let h = wrap ? wrap.clientHeight : 0;

    if (w < 100 || h < 100) { w = 820; h = 580; }

    if (w > 0 && h > 0) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.background = 'transparent';
      try {
        startCrystal(canvas);
        console.log('[ViewCrystal] startCrystal() called successfully');
      } catch (err) {
        console.error('[ViewCrystal] CRITICAL ERROR in startCrystal:', err);
      }
    } else if (count < 100) {
      setTimeout(() => tryStart(count + 1), 16);
    } else {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = Math.floor(820 * dpr);
      canvas.height = Math.floor(580 * dpr);
      canvas.style.background = 'transparent';
      try { startCrystal(canvas); } catch(err) {
        console.error('[ViewCrystal] Fallback startCrystal failed:', err);
      }
    }
  }

  setTimeout(() => tryStart(), 30);
}

window.initViewCrystal = doInitViewCrystal;

function patchCrystalConfig() {
  if (window.APP_CONFIG && window.APP_CONFIG.viewcrystal) {
    window.APP_CONFIG.viewcrystal.onOpen = doInitViewCrystal;
    console.log('[ViewCrystal] APP_CONFIG patched successfully');
  } else {
    setTimeout(patchCrystalConfig, 10);
  }
}
patchCrystalConfig();

window._vcrTogglePause = function () {
  const win = window.windows?.viewcrystal;
  if (!win) return;
  const canvas = win.content.querySelector('.viewcrystal-canvas');
  if (!canvas) return;
  const paused = crystalPause(canvas);
  win.content.querySelectorAll('.vc-btn').forEach(b => {
    if (b.textContent.includes('Pause') || b.textContent.includes('Play'))
      b.textContent = paused ? '▶ Play' : '⏸ Pause';
  });
};

window._vcrReset = function () {
  const win = window.windows?.viewcrystal;
  if (!win) return;
  const canvas = win.content.querySelector('.viewcrystal-canvas');
  if (canvas) crystalReset(canvas);
};

// ============================================================
//  Cleanup
// ============================================================
function patchCloseWindow() {
  if (typeof window.closeWindow === 'function') {
    const _origClose = window.closeWindow;
    window.closeWindow = function (appId) {
      if (appId === 'viewcity') {
        const win = window.windows?.viewcity;
        if (win) {
          const canvas = win.content.querySelector('.viewcity-canvas');
          if (canvas) stopCity(canvas);
        }
      }
      if (appId === 'viewspaceship') {
        const win = window.windows?.viewspaceship;
        if (win) {
          const canvas = win.content.querySelector('.viewspaceship-canvas');
          if (canvas) stopSpaceship(canvas);
        }
      }
      if (appId === 'viewocean') {
        const win = window.windows?.viewocean;
        if (win) {
          const canvas = win.content.querySelector('.viewocean-canvas');
          if (canvas) stopOcean(canvas);
        }
      }
      if (appId === 'viewcrystal') {
        const win = window.windows?.viewcrystal;
        if (win) {
          const canvas = win.content.querySelector('.viewcrystal-canvas');
          if (canvas) stopCrystal(canvas);
        }
      }
      _origClose(appId);
    };
  } else {
    setTimeout(patchCloseWindow, 20);
  }
}
patchCloseWindow();

// TV Remote Control navigation support
// Works with Tizen, webOS, Android TV, Roku, and standard keyboards
(function () {
  'use strict';

  const TV_KEY = {
    LEFT: [37, 4],
    RIGHT: [39, 5],
    UP: [38, 19],
    DOWN: [40, 20],
    ENTER: [13, 10],
    BACK: [8, 10009, 27, 461],
    EXIT: [10009, 27],
    PLAY_PAUSE: [32, 415, 19, 10252, 164],
    RED: [403, 108],
    GREEN: [404, 20],
    YELLOW: [405, 21],
    BLUE: [406, 22],
  };

  function isTvKey(e, keys) {
    return keys.some((k) => e.keyCode === k || e.key === String(k));
  }

  // Convert TV key events to custom events for the player
  document.addEventListener('keydown', function (e) {
    var detail = { keyCode: e.keyCode, key: e.key, ctrl: e.ctrlKey, alt: e.altKey };

    if (isTvKey(e, TV_KEY.BACK) || isTvKey(e, TV_KEY.EXIT)) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('tv-back', { detail }));
    }

    if (isTvKey(e, TV_KEY.ENTER)) {
      // Find focused element or clickable
      var active = document.activeElement;
      if (active && active.tagName === 'A') {
        active.click();
      }
    }

    if (isTvKey(e, TV_KEY.PLAY_PAUSE)) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('tv-playpause', { detail }));
    }

    window.dispatchEvent(new CustomEvent('tv-keydown', { detail }));
  });

  // Add focus ring for TV navigation
  var style = document.createElement('style');
  style.textContent = `
    *:focus { outline: 3px solid #22c55e !important; outline-offset: 2px; }
    :focus:not(:focus-visible) { outline: none; }
    :focus-visible { outline: 3px solid #22c55e !important; outline-offset: 2px; }
    a:focus, button:focus, [tabindex]:focus { outline: 3px solid #22c55e !important; }
  `;
  document.head.appendChild(style);

  // Auto-hide mouse cursor when inactive on TV
  var cursorTimer;
  function showCursor() {
    document.body.style.cursor = 'default';
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(function () {
      document.body.style.cursor = 'none';
    }, 3000);
  }
  document.addEventListener('mousemove', showCursor);
  document.addEventListener('keydown', function () {
    document.body.style.cursor = 'default';
  });
  showCursor();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }
})();

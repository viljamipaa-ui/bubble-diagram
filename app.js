(function () {
  "use strict";

  // ---------- Room groups (clusters) ----------
  // Each cluster gets its own hue; individual rooms vary in lightness within
  // that hue family so the grouping reads clearly at a glance. Colors here
  // are just the defaults — the user can override any cluster's color from
  // the sidebar legend (stored in state.clusterColors).
  var CLUSTERS = [
    { key: "aula", label: "Aula ja yleisön palvelutilat", hue: 16, sat: 58, light: 56 },
    { key: "vuokrattavat", label: "Vuokrattavat palvelutilat", hue: 42, sat: 62, light: 55 },
    { key: "tapahtuma", label: "Tapahtumatilat", hue: 335, sat: 42, light: 54 },
    { key: "oppiminen", label: "Oppimisen ja tekemisen tilat", hue: 174, sat: 38, light: 45 },
    { key: "henkilokunta", label: "Henkilökunnan tilat", hue: 262, sat: 32, light: 62 },
    { key: "kiinteisto", label: "Kiinteistön tilat", hue: 208, sat: 24, light: 56 },
    { key: "tekniset", label: "Tekniset tilat", hue: 40, sat: 4, light: 58 }
  ];

  function clusterOf(key) {
    for (var i = 0; i < CLUSTERS.length; i++) if (CLUSTERS[i].key === key) return CLUSTERS[i];
    return CLUSTERS[CLUSTERS.length - 1];
  }

  function clusterColorBase(key) {
    var override = state.clusterColors[key];
    if (override) return override;
    var base = clusterOf(key);
    return { hue: base.hue, sat: base.sat, light: base.light };
  }

  var SHADE_OFFSETS = [0, -9, 7, -15, 13, -5, 10];
  function colorForRoom(room) {
    var base = clusterColorBase(room.cluster);
    var group = state.rooms.filter(function (r) { return r.cluster === room.cluster; });
    var idx = group.findIndex(function (r) { return r.id === room.id; });
    var offset = SHADE_OFFSETS[((idx % SHADE_OFFSETS.length) + SHADE_OFFSETS.length) % SHADE_OFFSETS.length];
    var light = Math.min(80, Math.max(26, base.light + offset));
    return "hsl(" + base.hue + " " + base.sat + "% " + light + "%)";
  }

  function hexToHsl(hex) {
    hex = hex.replace("#", "");
    var r = parseInt(hex.substr(0, 2), 16) / 255;
    var g = parseInt(hex.substr(2, 2), 16) / 255;
    var b = parseInt(hex.substr(4, 2), 16) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { hue: Math.round(h * 360), sat: Math.round(s * 100), light: Math.round(l * 100) };
  }

  function hslToHex(hue, sat, light) {
    var h = hue / 360, s = sat / 100, l = light / 100, r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var hue2rgb = function (p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    function toHex(x) { var v = Math.round(x * 255).toString(16); return v.length === 1 ? "0" + v : v; }
    return "#" + toHex(r) + toHex(g) + toHex(b);
  }

  // ---------- Default room programme ----------
  // Ground floor: public-facing and technical/property clusters.
  // Upper floor: work, learning and staff clusters.
  function defaultRooms() {
    return [
      // Aula ja yleisön palvelutilat (yht. 800 m²) — Kerros 1
      { id: "d1", name: "Eteistoiminnot", area: 130, cluster: "aula", storey: 1, note: "Lastenvaunusäilytys n. 30 m², lukittavat lokerikot 50 kpl, vaatesäilytys n. 150 hlölle." },
      { id: "d2", name: "Asiakas-WC:t", area: 70, cluster: "aula", storey: 1, note: "Hajautetaan kerroksiin, sis. LE-WC:t." },
      { id: "d3", name: "Vauvanhoitohuone", area: 10, cluster: "aula", storey: 1, note: "Lastenvaunusäilytyksen ja WC-tilojen läheisyydessä." },
      { id: "d4", name: "Yleisön palvelutilat", area: 100, cluster: "aula", storey: 1, note: "Vastaanotto/neuvonta + valvomo 40 m², asiakaspalvelupisteet 40 m², kopiointi/tulostus/skannaus 20 m²." },
      { id: "d5", name: "Oleskelualueet", area: 300, cluster: "aula", storey: 1, note: "Jakautuvat ympäri julkista tilaa virikkeellisiksi liikennetiloiksi." },
      { id: "d6", name: "Esiintymislava", area: 30, cluster: "aula", storey: 1, note: "Liittyy oleskelualueeseen, varustettu ääni- ja valotekniikalla." },
      { id: "d7", name: "Pop-up -alue", area: 50, cluster: "aula", storey: 1, note: "Tilavaraus, liittyy oleskelualueeseen." },
      { id: "d8", name: "Lehtisali", area: 200, cluster: "aula", storey: 1, note: "Näköyhteys kadulle/kaupunkiin, luonnonvaloa." },

      // Vuokrattavat palvelutilat (yht. 400 m²) — Kerros 1
      { id: "d9", name: "Kahvila", area: 200, cluster: "vuokrattavat", storey: 1, note: "Sisältää keittiötilat 20 m² ja henkilöstön sosiaalitilat n. 10 m²." },
      { id: "d10", name: "Liiketilat", area: 200, cluster: "vuokrattavat", storey: 1, note: "Esim. kirjakauppa; yhteiset WC- ja sosiaalitilat kahvilan kanssa." },

      // Tapahtumatilat (yht. 500 m²) — Kerros 1
      { id: "d11", name: "Elokuva- ja teatterisali", area: 250, cluster: "tapahtuma", storey: 1, note: "Etuosassa näyttämö live-esiintymisiä varten; sisältää konehuoneen 20 m²." },
      { id: "d12", name: "Backstage", area: 50, cluster: "tapahtuma", storey: 1, note: "Lukittavat kaapit, pienoiskeittiö, 2 pukeutumistilaa, 2 WC:tä, 2 suihkua." },
      { id: "d13", name: "Näyttelytila Wilhelmiina", area: 200, cluster: "tapahtuma", storey: 1, note: "Muunneltava tila laadukkaille näyttelyille." },

      // Oppimisen ja tekemisen tilat (yht. 500 m²) — Kerros 2
      { id: "d14", name: "Miinu-toimistoalue", area: 200, cluster: "oppiminen", storey: 2, note: "Avoin tila 150 m², 4–5 työhuonetta (yht. 50 m²) ja kopiointi/tulostus/skannauspiste." },
      { id: "d15", name: "Musiikki-, äänitys- ja videostudio", area: 50, cluster: "oppiminen", storey: 2, note: "Varustettu AV-laitteilla ja tietokoneilla." },
      { id: "d16", name: "TV- ja radiostudio", area: 50, cluster: "oppiminen", storey: 2, note: "TV-studion valaistus ja äänentoistojärjestelmä." },
      { id: "d17", name: "XR- ja pelihuoneet", area: 200, cluster: "oppiminen", storey: 2, note: "VR-/AR-esitystila 100 m² ja konsolipelihuone 100 m²." },

      // Henkilökunnan tilat (yht. 200 m²) — Kerros 2
      { id: "d18", name: "Eteinen ja vaatesäilytys", area: 20, cluster: "henkilokunta", storey: 2 },
      { id: "d19", name: "Taukotila", area: 20, cluster: "henkilokunta", storey: 2, note: "Sisältää keittiön." },
      { id: "d20", name: "Puku- ja pesutilat", area: 30, cluster: "henkilokunta", storey: 2, note: "Miehille ja naisille erikseen tai unisex-ratkaisu." },
      { id: "d21", name: "WC-tilat", area: 15, cluster: "henkilokunta", storey: 2, note: "Sukupuolieroteltu tai unisex + inva-WC." },
      { id: "d22", name: "Avotyöpisteet ja tiimialue", area: 65, cluster: "henkilokunta", storey: 2, note: "Työpisteet 10 henkilölle." },
      { id: "d23", name: "Hiljainen tila", area: 14, cluster: "henkilokunta", storey: 2, note: "2–5 kpl à 4 m², esim. puhelinkoppeja." },
      { id: "d24", name: "Neuvotteluhuone 1", area: 15, cluster: "henkilokunta", storey: 2, note: "Yhdistettävissä toiseen neuvotteluhuoneeseen." },
      { id: "d25", name: "Neuvotteluhuone 2", area: 15, cluster: "henkilokunta", storey: 2, note: "Yhdistettävissä toiseen neuvotteluhuoneeseen." },

      // Kiinteistön tilat (yht. n. 150 m²) — Kerros 1
      { id: "d26", name: "Valvomo ja palvelintila", area: 20, cluster: "kiinteisto", storey: 1, note: "N. 10 palvelinta, voi sijaita kellarissa." },
      { id: "d27", name: "Siivoustilat", area: 30, cluster: "kiinteisto", storey: 1, note: "Siivouskeskus 15 m² + siivouskomerot 1 kpl/kerros á 5 m²." },
      { id: "d28", name: "Jätehuone", area: 50, cluster: "kiinteisto", storey: 1, note: "Liittyy huolto- ja lastausalueeseen." },
      { id: "d29", name: "Kiinteistönhoidon varasto", area: 50, cluster: "kiinteisto", storey: 1, note: "Liittyy huolto- ja lastausalueeseen." },

      // Tekniset tilat (ei lasketa varsinaiseen ohjelma-alaan) — Kerros 1
      { id: "d30", name: "LJH / SPK / SPR", area: 150, cluster: "tekniset", storey: 1, note: "Yhteensä. Ei lasketa ohjelma-alaan." },
      { id: "d31", name: "IV-konehuoneet", area: 400, cluster: "tekniset", storey: 1, note: "2–3 kpl yhteensä. Ei lasketa ohjelma-alaan." }
    ];
  }

  // Waste from the retail units also routes through Jätehuone — a real
  // cross-cluster functional link, shown by default alongside the
  // auto-generated same-cluster connections.
  function defaultCustomLinks() {
    return [{ id: "link-default-1", a: "d28", b: "d10" }];
  }

  var STORAGE_KEY = "kuplakaavio-data-fi-v4";
  var state = {
    rooms: [],
    projectName: "Kulttuuri- ja kohtaamistalon tilaohjelma",
    viewMode: "combined",   // 'combined' | 'storeys'
    shapeMode: "circles",   // 'circles' | 'rects'
    storeyCount: 2,
    clusterColors: {},      // cluster key -> {hue, sat, light} override
    customLinks: [],        // [{id, a: roomId, b: roomId}]
    viewStates: {},         // diagram key -> {zoom, tx, ty}  (per-diagram pan/zoom)
    positions: {},          // circles, combined: id -> {x, y, r}
    storeyPositions: {},    // circles, per storey: storeyNumber -> { id -> {x, y, r} }
    tiles: {},              // rects, combined: id -> {x, y, w, h}, plus __k (m² per px²)
    storeyTiles: {}         // rects, per storey
  };

  var ZOOM_MIN = 0.4, ZOOM_MAX = 4;
  var MARGIN_RATIO = 0.5; // extra pannable background on each side, relative to viewport size

  var nextId = 1;
  function makeId() { return "room-" + (nextId++) + "-" + Date.now().toString(36); }

  // ---------- Persistence ----------
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        rooms: state.rooms,
        projectName: state.projectName,
        viewMode: state.viewMode,
        shapeMode: state.shapeMode,
        storeyCount: state.storeyCount,
        clusterColors: state.clusterColors,
        customLinks: state.customLinks,
        viewStates: state.viewStates,
        positions: state.positions,
        storeyPositions: state.storeyPositions,
        tiles: state.tiles,
        storeyTiles: state.storeyTiles
      }));
    } catch (e) { /* ignore quota / privacy errors */ }
  }

  var saveDebounceTimer = null;
  function scheduleSave() {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(save, 300);
  }

  function isOldTileFormat(bucket) {
    var key = Object.keys(bucket || {}).filter(function (k) { return k !== "__k"; })[0];
    return !!(key && bucket[key] && typeof bucket[key].path === "string");
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.rooms)) return false;
      state.rooms = data.rooms;
      state.projectName = data.projectName || state.projectName;
      state.viewMode = data.viewMode === "storeys" ? "storeys" : "combined";
      state.shapeMode = data.shapeMode === "rects" ? "rects" : "circles";
      state.storeyCount = data.storeyCount || 2;
      state.clusterColors = data.clusterColors && typeof data.clusterColors === "object" ? data.clusterColors : {};
      state.customLinks = Array.isArray(data.customLinks) ? data.customLinks : [];
      state.viewStates = data.viewStates || {};
      state.positions = data.positions || {};
      state.storeyPositions = data.storeyPositions || {};
      state.tiles = data.tiles || {};
      state.storeyTiles = data.storeyTiles || {};
      // Migrate away from an older (polyomino-path) tile format.
      if (isOldTileFormat(state.tiles)) state.tiles = {};
      Object.keys(state.storeyTiles).forEach(function (s) {
        if (isOldTileFormat(state.storeyTiles[s])) state.storeyTiles[s] = {};
      });
      return true;
    } catch (e) { return false; }
  }

  // ---------- Adjacency ----------
  // Automatic: hub-and-spoke within each cluster (largest room is the hub).
  function computeLinks(rooms) {
    var byCluster = {};
    rooms.forEach(function (r) {
      (byCluster[r.cluster] = byCluster[r.cluster] || []).push(r);
    });
    var links = [];
    Object.keys(byCluster).forEach(function (key) {
      var group = byCluster[key];
      if (group.length < 2) return;
      var hub = group.reduce(function (a, b) { return b.area > a.area ? b : a; });
      group.forEach(function (r) {
        if (r.id !== hub.id) links.push({ source: hub.id, target: r.id });
      });
    });
    return links;
  }

  // Automatic cluster links plus any user-drawn custom links (e.g. a waste
  // room serving spaces outside its own cluster) — not restricted to
  // same-cluster pairs.
  function computeAllLinks(rooms) {
    var ids = {};
    rooms.forEach(function (r) { ids[r.id] = true; });
    var auto = computeLinks(rooms).map(function (l) { return { source: l.source, target: l.target, custom: false }; });
    var custom = state.customLinks
      .filter(function (l) { return ids[l.a] && ids[l.b]; })
      .map(function (l) { return { source: l.a, target: l.b, custom: true }; });
    return auto.concat(custom);
  }

  // ---------- Layout A: force-based circle packing ----------
  function packLayout(rooms, width, height) {
    if (rooms.length === 0) return {};

    var totalArea = rooms.reduce(function (s, r) { return s + Math.max(r.area, 1); }, 0);
    var fillRatio = 0.5;
    var k = Math.sqrt((fillRatio * width * height) / (Math.PI * totalArea));
    k = Math.max(k, 1);

    var cx = width / 2, cy = height / 2;
    var nodes = rooms.map(function (r, i) {
      var angle = (i / rooms.length) * Math.PI * 2;
      var startR = Math.min(width, height) * 0.3;
      return {
        id: r.id,
        r: Math.max(k * Math.sqrt(Math.max(r.area, 1)), 14),
        x: cx + Math.cos(angle) * startR + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * startR + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0
      };
    });
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });

    var links = computeAllLinks(rooms).filter(function (l) { return byId[l.source] && byId[l.target]; });

    var iterations = 400;
    var padding = 6;
    var damping = 0.82;

    for (var it = 0; it < iterations; it++) {
      var cool = 1 - it / iterations;

      nodes.forEach(function (n) {
        n.fx = (cx - n.x) * 0.008;
        n.fy = (cy - n.y) * 0.008;
      });

      links.forEach(function (l) {
        var a = byId[l.source], b = byId[l.target];
        var dx = b.x - a.x, dy = b.y - a.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        var desired = a.r + b.r + 4;
        if (dist > desired) {
          var diff = (dist - desired) * 0.06;
          var ux = dx / dist, uy = dy / dist;
          a.fx += ux * diff; a.fy += uy * diff;
          b.fx -= ux * diff; b.fy -= uy * diff;
        }
      });

      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var dx = b.x - a.x, dy = b.y - a.y;
          var dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          var minDist = a.r + b.r + padding;
          if (dist < minDist) {
            var overlap = (minDist - dist) * 0.5;
            var ux = dx / dist, uy = dy / dist;
            a.fx -= ux * overlap; a.fy -= uy * overlap;
            b.fx += ux * overlap; b.fy += uy * overlap;
          }
        }
      }

      nodes.forEach(function (n) {
        n.vx = (n.vx + n.fx) * damping * (0.3 + 0.7 * cool + 0.3);
        n.vy = (n.vy + n.fy) * damping * (0.3 + 0.7 * cool + 0.3);
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.min(width - n.r, Math.max(n.r, n.x));
        n.y = Math.min(height - n.r, Math.max(n.r, n.y));
      });
    }

    var positions = {};
    nodes.forEach(function (n) { positions[n.id] = { x: n.x, y: n.y, r: n.r }; });
    return positions;
  }

  // ---------- Layout B: rectangular treemap (straight lines, zero gaps) ----------
  // Recursively splits a rectangle between two groups of items in proportion
  // to their combined value, always along the rectangle's longer side. Used
  // twice: once to carve the canvas into per-cluster zones, then again
  // inside each zone to carve out the individual rooms.
  function splitTreemap(items, x, y, w, h, out) {
    if (items.length === 0) return;
    if (items.length === 1) { out[items[0].id] = { x: x, y: y, w: w, h: h }; return; }

    var sorted = items.slice().sort(function (a, b) { return b.value - a.value; });
    var total = sorted.reduce(function (s, i) { return s + i.value; }, 0);
    if (total <= 0) { out[sorted[0].id] = { x: x, y: y, w: w, h: h }; return; }

    var cum = 0, splitIdx = 0;
    for (var i = 0; i < sorted.length; i++) {
      cum += sorted[i].value;
      if (cum >= total / 2) { splitIdx = i; break; }
    }
    if (splitIdx >= sorted.length - 1) splitIdx = sorted.length - 2;
    if (splitIdx < 0) splitIdx = 0;

    var groupA = sorted.slice(0, splitIdx + 1);
    var groupB = sorted.slice(splitIdx + 1);
    var fracA = groupA.reduce(function (s, i) { return s + i.value; }, 0) / total;

    if (w >= h) {
      var wA = w * fracA;
      splitTreemap(groupA, x, y, wA, h, out);
      splitTreemap(groupB, x + wA, y, w - wA, h, out);
    } else {
      var hA = h * fracA;
      splitTreemap(groupA, x, y, w, hA, out);
      splitTreemap(groupB, x, y + hA, w, h - hA, out);
    }
  }

  function rectLayout(rooms, width, height) {
    if (rooms.length === 0) return {};

    var totalArea = rooms.reduce(function (s, r) { return s + Math.max(r.area, 1); }, 0);
    var k = totalArea / Math.max(width * height, 1); // m² per px²

    var byCluster = {};
    rooms.forEach(function (r) { (byCluster[r.cluster] = byCluster[r.cluster] || []).push(r); });
    var clusterItems = Object.keys(byCluster).map(function (key) {
      return { id: key, value: byCluster[key].reduce(function (s, r) { return s + Math.max(r.area, 1); }, 0) };
    });

    var clusterRects = {};
    splitTreemap(clusterItems, 0, 0, width, height, clusterRects);

    var result = {};
    Object.keys(byCluster).forEach(function (key) {
      var rect = clusterRects[key];
      var items = byCluster[key].map(function (r) { return { id: r.id, value: Math.max(r.area, 1) }; });
      splitTreemap(items, rect.x, rect.y, rect.w, rect.h, result);
    });
    result.__k = k;
    return result;
  }

  function layoutFor(rooms, width, height) {
    return state.shapeMode === "rects" ? rectLayout(rooms, width, height) : packLayout(rooms, width, height);
  }

  // ---------- Diagram descriptors (1 for combined view, N for storeys view) ----------
  var canvasArea = document.querySelector(".canvas-area");
  var canvasContainer = document.getElementById("canvas-container");
  var emptyState = document.getElementById("empty-state");

  function containerSize() {
    return {
      width: canvasArea.clientWidth || 900,
      height: canvasArea.clientHeight || 600
    };
  }

  function getStoreyNumbers() {
    var arr = [];
    for (var i = 1; i <= state.storeyCount; i++) arr.push(i);
    return arr;
  }

  function ensureViewState(key) {
    if (!state.viewStates[key]) state.viewStates[key] = { zoom: 1, tx: 0, ty: 0 };
    return state.viewStates[key];
  }

  function buildDiagrams() {
    var size = containerSize();
    var isRects = state.shapeMode === "rects";

    if (state.viewMode === "combined") {
      var store = isRects ? state.tiles : state.positions;
      return [{
        key: "combined",
        title: null,
        rooms: state.rooms,
        width: size.width,
        height: size.height,
        marginX: size.width * MARGIN_RATIO,
        marginY: size.height * MARGIN_RATIO,
        viewState: ensureViewState("combined"),
        getLayout: function () { return store; },
        setLayout: function (p) { store = p; if (isRects) state.tiles = p; else state.positions = p; }
      }];
    }

    var storeys = getStoreyNumbers();
    var n = Math.max(storeys.length, 1);
    var gap = 16;
    var panelWidth = Math.max((size.width - gap * (n - 1)) / n, 180);
    var panelHeight = Math.max(size.height - 46, 180);
    return storeys.map(function (s) {
      var bucket = isRects ? state.storeyTiles : state.storeyPositions;
      if (!bucket[s]) bucket[s] = {};
      return {
        key: (isRects ? "tile-storey-" : "storey-") + s,
        title: "Kerros " + s,
        rooms: state.rooms.filter(function (r) { return r.storey === s; }),
        width: panelWidth,
        height: panelHeight,
        marginX: panelWidth * MARGIN_RATIO,
        marginY: panelHeight * MARGIN_RATIO,
        viewState: ensureViewState((isRects ? "tile-storey-" : "storey-") + s),
        getLayout: function () { return bucket[s]; },
        setLayout: function (p) { bucket[s] = p; }
      };
    });
  }

  function repackAll() {
    buildDiagrams().forEach(function (d) {
      d.setLayout(layoutFor(d.rooms, d.width, d.height));
    });
    render();
    save();
  }

  // Redraws using whatever layout each diagram already has, only computing
  // a fresh one where a room has no entry yet (e.g. a brand new room, or
  // the first time this shape/view combination has ever been shown).
  // This is what makes toggling Kuplat/Pohjapiirros or Yhtenäinen/
  // Kerroksittain remember prior placement instead of re-rolling it.
  function ensureLayouts() {
    buildDiagrams().forEach(function (d) {
      var layout = d.getLayout();
      var stale = d.rooms.some(function (r) { return !layout[r.id]; });
      if (stale) d.setLayout(layoutFor(d.rooms, d.width, d.height));
    });
    render();
    save();
  }

  // ---------- View transform helpers (pan + zoom, per diagram) ----------
  function clampView(vs, d) {
    var txMin = d.width - (d.width + d.marginX) * vs.zoom;
    var txMax = d.marginX * vs.zoom;
    vs.tx = txMin > txMax ? (txMin + txMax) / 2 : Math.min(txMax, Math.max(txMin, vs.tx));

    var tyMin = d.height - (d.height + d.marginY) * vs.zoom;
    var tyMax = d.marginY * vs.zoom;
    vs.ty = tyMin > tyMax ? (tyMin + tyMax) / 2 : Math.min(tyMax, Math.max(tyMin, vs.ty));
  }

  function applyZoomAtPoint(vs, ax, ay, factor, d) {
    var newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, vs.zoom * factor));
    var realFactor = newZoom / vs.zoom;
    vs.tx = ax * (1 - realFactor) + realFactor * vs.tx;
    vs.ty = ay * (1 - realFactor) + realFactor * vs.ty;
    vs.zoom = newZoom;
    clampView(vs, d);
  }

  function transformString(vs) {
    return "translate(" + vs.tx + "," + vs.ty + ") scale(" + vs.zoom + ")";
  }

  function updateTransform(svg, vs) {
    var g = svg.querySelector(".zoom-group");
    if (g) g.setAttribute("transform", transformString(vs));
  }

  // ---------- Rendering ----------
  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    }
    return el;
  }

  function labelPositions(pos) {
    return {
      nameY: pos.y - (pos.r > 26 ? 2 : -4),
      subY: pos.y + (pos.r > 26 ? 16 : 10)
    };
  }

  var dotPatternSeq = 0;

  function renderDiagram(d) {
    var wrapper = document.createElement("div");
    if (d.title) {
      wrapper.className = "storey-panel";
      var header = document.createElement("div");
      header.className = "storey-panel-header";
      var h3 = document.createElement("h3");
      h3.textContent = d.title;
      var totalArea = d.rooms.reduce(function (s, r) { return s + Number(r.area || 0); }, 0);
      var span = document.createElement("span");
      span.textContent = d.rooms.length + " tilaa · " + totalArea + " m²";
      header.appendChild(h3);
      header.appendChild(span);
      wrapper.appendChild(header);
    } else {
      wrapper.style.width = "100%";
      wrapper.style.height = "100%";
    }

    var svg = svgEl("svg", { class: "bubble-svg", width: d.width, height: d.height });
    wrapper.appendChild(svg);
    canvasContainer.appendChild(wrapper);

    var vs = d.viewState;

    var patternId = "dots-" + (dotPatternSeq++);
    var defs = svgEl("defs");
    var pattern = svgEl("pattern", { id: patternId, width: 22, height: 22, patternUnits: "userSpaceOnUse" });
    pattern.appendChild(svgEl("circle", { cx: 1.2, cy: 1.2, r: 1.2, fill: "#e3d8c8" }));
    defs.appendChild(pattern);
    svg.appendChild(defs);
    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: d.width, height: d.height, fill: "#faf5ef" }));

    var zoomGroup = svgEl("g", { class: "zoom-group", transform: transformString(vs) });
    svg.appendChild(zoomGroup);

    zoomGroup.appendChild(svgEl("rect", {
      x: -d.marginX, y: -d.marginY,
      width: d.width + d.marginX * 2, height: d.height + d.marginY * 2,
      fill: "url(#" + patternId + ")"
    }));

    var linksLayer = svgEl("g");
    var shapesLayer = svgEl("g");
    zoomGroup.appendChild(linksLayer);
    zoomGroup.appendChild(shapesLayer);

    var layout = d.getLayout();
    var isRects = state.shapeMode === "rects";

    computeAllLinks(d.rooms).forEach(function (l) {
      var pa = layout[l.source], pb = layout[l.target];
      if (!pa || !pb) return;
      var cxA = isRects ? pa.x + pa.w / 2 : pa.x, cyA = isRects ? pa.y + pa.h / 2 : pa.y;
      var cxB = isRects ? pb.x + pb.w / 2 : pb.x, cyB = isRects ? pb.y + pb.h / 2 : pb.y;
      var line = svgEl("line", {
        class: l.custom ? "link-line link-line-custom" : "link-line",
        x1: cxA, y1: cyA, x2: cxB, y2: cyB
      });
      line.dataset.source = l.source;
      line.dataset.target = l.target;
      linksLayer.appendChild(line);
    });

    d.rooms.forEach(function (r) {
      var item = layout[r.id];
      if (!item) return;
      var cluster = clusterOf(r.cluster);
      var isTechnical = cluster.key === "tekniset";
      var g = svgEl("g", { class: "bubble-group", "data-id": r.id });

      if (r.note) {
        var title = svgEl("title");
        title.textContent = r.name + " — " + r.note;
        g.appendChild(title);
      }

      if (isRects) {
        var rect = item;
        var pad = 1.5;
        var clipId = "clip-" + r.id.replace(/[^a-zA-Z0-9_-]/g, "");
        var clipPath = svgEl("clipPath", { id: clipId });
        var clipRectEl = svgEl("rect", { x: rect.x, y: rect.y, width: rect.w, height: rect.h });
        clipPath.appendChild(clipRectEl);
        defs.appendChild(clipPath);
        g.__clipRectEl = clipRectEl;

        var rectAttrs = {
          class: "room-rect",
          x: rect.x + pad, y: rect.y + pad,
          width: Math.max(0, rect.w - pad * 2), height: Math.max(0, rect.h - pad * 2),
          fill: colorForRoom(r),
          stroke: isTechnical ? "#726c62" : "rgba(0,0,0,0.18)",
          "stroke-width": isTechnical ? "2" : "1.5"
        };
        if (isTechnical) rectAttrs["stroke-dasharray"] = "6 4";
        var rectEl = svgEl("rect", rectAttrs);
        rectEl.style.fillOpacity = "0.9";
        g.appendChild(rectEl);

        var cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
        var labelGroup = svgEl("g", { "clip-path": "url(#" + clipId + ")" });
        var l1 = svgEl("text", { class: "bubble-label", x: cx, y: cy - 6 });
        l1.textContent = r.name;
        var l2 = svgEl("text", { class: "bubble-sublabel", x: cx, y: cy + 12 });
        l2.textContent = r.area + " m²";
        labelGroup.appendChild(l1);
        labelGroup.appendChild(l2);
        g.appendChild(labelGroup);

        rectEl.addEventListener("pointerdown", function (evt) { startRectMove(evt, svg, layout, r.id, d); });

        if (Math.min(rect.w, rect.h) >= 16) {
          // Treemap corners are often shared by 2-4 rooms at the exact same
          // point. Nudging each room's own handle inward from its corner
          // (instead of drawing it exactly on the shared point) keeps every
          // room's handle a separate, clickable target instead of only the
          // topmost one in the DOM being reachable.
          var nudgeX = Math.min(7, rect.w / 4), nudgeY = Math.min(7, rect.h / 4);
          [
            { k: "tl", x: rect.x + nudgeX, y: rect.y + nudgeY },
            { k: "tr", x: rect.x + rect.w - nudgeX, y: rect.y + nudgeY },
            { k: "bl", x: rect.x + nudgeX, y: rect.y + rect.h - nudgeY },
            { k: "br", x: rect.x + rect.w - nudgeX, y: rect.y + rect.h - nudgeY }
          ].forEach(function (c) {
            var handle = svgEl("rect", {
              class: "resize-handle", "data-corner": c.k,
              x: c.x - 4.5, y: c.y - 4.5, width: 9, height: 9
            });
            handle.addEventListener("pointerdown", function (evt) { startResize(evt, svg, layout, r.id, c.k, d); });
            g.appendChild(handle);
          });
        }
      } else {
        var circleAttrs = {
          cx: item.x, cy: item.y, r: item.r,
          fill: colorForRoom(r),
          stroke: isTechnical ? "#726c62" : "rgba(0,0,0,0.15)",
          "stroke-width": isTechnical ? "1.5" : "1"
        };
        if (isTechnical) circleAttrs["stroke-dasharray"] = "5 4";
        var circle = svgEl("circle", circleAttrs);
        circle.style.fillOpacity = "0.88";
        g.appendChild(circle);

        var lp = labelPositions(item);
        var label = svgEl("text", { class: "bubble-label", x: item.x, y: lp.nameY });
        label.textContent = r.name;
        var sub = svgEl("text", { class: "bubble-sublabel", x: item.x, y: lp.subY });
        sub.textContent = r.area + " m²";

        if (item.r >= 20) {
          g.appendChild(label);
          g.appendChild(sub);
        } else if (item.r >= 12) {
          g.appendChild(label);
        }

        g.addEventListener("pointerdown", function (evt) { startDrag(evt, svg, layout, r.id, d); });
      }

      shapesLayer.appendChild(g);
    });

    // Scroll wheel always zooms (centered on the cursor); dragging empty
    // canvas pans. Dragging a room shape stops this from firing.
    svg.addEventListener("wheel", function (e) {
      e.preventDefault();
      var rect = svg.getBoundingClientRect();
      var ax = e.clientX - rect.left, ay = e.clientY - rect.top;
      var factor = Math.pow(1.0015, -e.deltaY);
      applyZoomAtPoint(vs, ax, ay, factor, d);
      updateTransform(svg, vs);
      scheduleSave();
    }, { passive: false });

    svg.addEventListener("pointerdown", function (evt) { startPan(evt, svg, vs, d); });
  }

  function render() {
    var rooms = state.rooms;
    emptyState.hidden = rooms.length > 0;
    canvasContainer.innerHTML = "";
    canvasContainer.className = "canvas-container " + (state.viewMode === "combined" ? "combined" : "storeys");

    if (rooms.length > 0) {
      buildDiagrams().forEach(renderDiagram);
    }

    updateSummary();
    updateTable();
    updateLegend();
  }

  // ---------- Panning (drag empty canvas) ----------
  var panState = null;

  function startPan(evt, svg, vs, d) {
    panState = {
      svg: svg, vs: vs, d: d,
      startX: evt.clientX, startY: evt.clientY,
      startTx: vs.tx, startTy: vs.ty
    };
    window.addEventListener("pointermove", onPan);
    window.addEventListener("pointerup", endPan);
  }

  function onPan(evt) {
    if (!panState) return;
    panState.vs.tx = panState.startTx + (evt.clientX - panState.startX);
    panState.vs.ty = panState.startTy + (evt.clientY - panState.startY);
    clampView(panState.vs, panState.d);
    updateTransform(panState.svg, panState.vs);
  }

  function endPan() {
    window.removeEventListener("pointermove", onPan);
    window.removeEventListener("pointerup", endPan);
    if (panState) save();
    panState = null;
  }

  // Converts a pointer event to diagram-local (unscaled) coordinates,
  // inverting the diagram's current pan + zoom transform.
  function toLocalPoint(evt, svg, vs) {
    var rect = svg.getBoundingClientRect();
    var lx = evt.clientX - rect.left;
    var ly = evt.clientY - rect.top;
    return {
      x: (lx - vs.tx) / vs.zoom,
      y: (ly - vs.ty) / vs.zoom
    };
  }

  // ---------- Dragging a circle (circles mode) ----------
  var dragging = null;

  function updateBubblePositions(svg, positions, id) {
    var pos = positions[id];
    if (!pos) return;
    var g = svg.querySelector('[data-id="' + id + '"]');
    if (g) {
      var circle = g.querySelector("circle");
      circle.setAttribute("cx", pos.x);
      circle.setAttribute("cy", pos.y);
      var lp = labelPositions(pos);
      var texts = g.querySelectorAll("text");
      texts.forEach(function (t, i) {
        t.setAttribute("x", pos.x);
        t.setAttribute("y", i === 0 ? lp.nameY : lp.subY);
      });
    }
    svg.querySelectorAll("line").forEach(function (line) {
      if (line.dataset.source === id) {
        line.setAttribute("x1", pos.x);
        line.setAttribute("y1", pos.y);
      }
      if (line.dataset.target === id) {
        line.setAttribute("x2", pos.x);
        line.setAttribute("y2", pos.y);
      }
    });
  }

  function startDrag(evt, svg, positions, id, d) {
    evt.preventDefault();
    evt.stopPropagation(); // don't also start a canvas pan
    var pos = positions[id];
    if (!pos) return;
    var local = toLocalPoint(evt, svg, d.viewState);
    dragging = {
      kind: "circle", svg: svg, positions: positions, id: id, d: d,
      offsetX: local.x - pos.x, offsetY: local.y - pos.y
    };
    window.addEventListener("pointermove", onDrag);
    window.addEventListener("pointerup", endDrag);
  }

  // ---------- Dragging / resizing a rectangle (rects mode) ----------
  function updateRectVisual(svg, layout, id) {
    var rect = layout[id];
    if (!rect) return;
    var g = svg.querySelector('[data-id="' + id + '"]');
    if (!g) return;
    var pad = 1.5;
    var rectEl = g.querySelector(".room-rect");
    if (rectEl) {
      rectEl.setAttribute("x", rect.x + pad);
      rectEl.setAttribute("y", rect.y + pad);
      rectEl.setAttribute("width", Math.max(0, rect.w - pad * 2));
      rectEl.setAttribute("height", Math.max(0, rect.h - pad * 2));
    }
    var cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
    var texts = g.querySelectorAll("text");
    var room = state.rooms.find(function (r) { return r.id === id; });
    if (texts[0]) { texts[0].setAttribute("x", cx); texts[0].setAttribute("y", cy - 6); }
    if (texts[1]) {
      texts[1].setAttribute("x", cx);
      texts[1].setAttribute("y", cy + 12);
      if (room) texts[1].textContent = room.area + " m²";
    }
    if (g.__clipRectEl) {
      g.__clipRectEl.setAttribute("x", rect.x);
      g.__clipRectEl.setAttribute("y", rect.y);
      g.__clipRectEl.setAttribute("width", rect.w);
      g.__clipRectEl.setAttribute("height", rect.h);
    }
    var nudgeX = Math.min(7, rect.w / 4), nudgeY = Math.min(7, rect.h / 4);
    var coords = {
      tl: [rect.x + nudgeX, rect.y + nudgeY], tr: [rect.x + rect.w - nudgeX, rect.y + nudgeY],
      bl: [rect.x + nudgeX, rect.y + rect.h - nudgeY], br: [rect.x + rect.w - nudgeX, rect.y + rect.h - nudgeY]
    };
    g.querySelectorAll(".resize-handle").forEach(function (h) {
      var c = coords[h.dataset.corner];
      h.setAttribute("x", c[0] - 4.5);
      h.setAttribute("y", c[1] - 4.5);
    });
  }

  function startRectMove(evt, svg, layout, id, d) {
    evt.preventDefault();
    evt.stopPropagation();
    var rect = layout[id];
    if (!rect) return;
    var local = toLocalPoint(evt, svg, d.viewState);
    dragging = {
      kind: "rect-move", svg: svg, layout: layout, id: id, d: d,
      offsetX: local.x - rect.x, offsetY: local.y - rect.y
    };
    window.addEventListener("pointermove", onDrag);
    window.addEventListener("pointerup", endDrag);
  }

  function onDrag(evt) {
    if (!dragging) return;
    var local = toLocalPoint(evt, dragging.svg, dragging.d.viewState);
    var d = dragging.d;
    if (dragging.kind === "circle") {
      var pos = dragging.positions[dragging.id];
      var r = pos.r;
      pos.x = Math.min(d.width + d.marginX - r, Math.max(r - d.marginX, local.x - dragging.offsetX));
      pos.y = Math.min(d.height + d.marginY - r, Math.max(r - d.marginY, local.y - dragging.offsetY));
      updateBubblePositions(dragging.svg, dragging.positions, dragging.id);
    } else if (dragging.kind === "rect-move") {
      var rect = dragging.layout[dragging.id];
      rect.x = Math.min(d.width + d.marginX - rect.w, Math.max(-d.marginX, local.x - dragging.offsetX));
      rect.y = Math.min(d.height + d.marginY - rect.h, Math.max(-d.marginY, local.y - dragging.offsetY));
      updateRectVisual(dragging.svg, dragging.layout, dragging.id);
    }
  }

  function endDrag() {
    window.removeEventListener("pointermove", onDrag);
    window.removeEventListener("pointerup", endDrag);
    if (dragging) save();
    dragging = null;
  }

  var resizing = null;

  function startResize(evt, svg, layout, id, corner, d) {
    evt.preventDefault();
    evt.stopPropagation();
    var rect = layout[id];
    if (!rect) return;
    resizing = {
      svg: svg, layout: layout, id: id, corner: corner, d: d,
      orig: { x: rect.x, y: rect.y, w: rect.w, h: rect.h }
    };
    window.addEventListener("pointermove", onResize);
    window.addEventListener("pointerup", endResize);
  }

  function onResize(evt) {
    if (!resizing) return;
    var d = resizing.d;
    var local = toLocalPoint(evt, resizing.svg, d.viewState);
    var o = resizing.orig;
    var minSize = 12;
    var px = Math.min(d.width + d.marginX, Math.max(-d.marginX, local.x));
    var py = Math.min(d.height + d.marginY, Math.max(-d.marginY, local.y));
    var left = o.x, top = o.y, right = o.x + o.w, bottom = o.y + o.h;

    if (resizing.corner === "tl") { left = Math.min(px, right - minSize); top = Math.min(py, bottom - minSize); }
    else if (resizing.corner === "tr") { right = Math.max(px, left + minSize); top = Math.min(py, bottom - minSize); }
    else if (resizing.corner === "bl") { left = Math.min(px, right - minSize); bottom = Math.max(py, top + minSize); }
    else { right = Math.max(px, left + minSize); bottom = Math.max(py, top + minSize); }

    var rect = resizing.layout[resizing.id];
    rect.x = left; rect.y = top; rect.w = right - left; rect.h = bottom - top;

    var k = resizing.layout.__k || 1;
    var room = state.rooms.find(function (rm) { return rm.id === resizing.id; });
    if (room) room.area = Math.max(1, Math.round(rect.w * rect.h * k));

    updateRectVisual(resizing.svg, resizing.layout, resizing.id);
    scheduleUiRefresh();
  }

  function endResize() {
    window.removeEventListener("pointermove", onResize);
    window.removeEventListener("pointerup", endResize);
    if (resizing) save();
    resizing = null;
  }

  var uiRefreshPending = false;
  function scheduleUiRefresh() {
    if (uiRefreshPending) return;
    uiRefreshPending = true;
    requestAnimationFrame(function () {
      uiRefreshPending = false;
      updateSummary();
      updateTable();
      updateLegend();
    });
  }

  // Editing a room's m² directly (sidebar table): in rects mode this
  // rescales that one rectangle in place (keeping its center fixed) so the
  // change is reflected geometrically without disturbing other rooms; in
  // circles mode it's simplest to just repack, since a circle's radius is
  // derived from every room's area together.
  function applyAreaChange(room, newArea) {
    room.area = Math.max(1, Math.round(newArea));
    if (state.shapeMode === "rects") {
      buildDiagrams().forEach(function (d) {
        var layout = d.getLayout();
        var rect = layout[room.id];
        if (!rect) return;
        var k = layout.__k || 1;
        var targetPx = room.area / k;
        var curPx = rect.w * rect.h;
        var scale = curPx > 0 ? Math.sqrt(targetPx / curPx) : 1;
        var cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
        rect.w = Math.max(12, rect.w * scale);
        rect.h = Math.max(12, rect.h * scale);
        rect.x = cx - rect.w / 2;
        rect.y = cy - rect.h / 2;
      });
      render();
      save();
    } else {
      repackAll();
    }
  }

  // ---------- Sidebar: table, legend, summary, custom links ----------
  var tbody = document.getElementById("room-tbody");
  var summaryEl = document.getElementById("room-summary");
  var clusterLegend = document.getElementById("cluster-legend");
  var newClusterSelect = document.getElementById("new-cluster");
  var newStoreySelect = document.getElementById("new-storey");
  var linkRoomA = document.getElementById("link-room-a");
  var linkRoomB = document.getElementById("link-room-b");
  var customLinksList = document.getElementById("custom-links-list");

  function updateSummary() {
    var count = state.rooms.length;
    var total = state.rooms.reduce(function (s, r) { return s + Number(r.area || 0); }, 0);
    summaryEl.textContent = count + " tilaa · " + total + " m²";
  }

  function storeyOptionsHtml(selected) {
    var html = "";
    getStoreyNumbers().forEach(function (s) {
      html += '<option value="' + s + '"' + (s === selected ? " selected" : "") + ">" + s + "</option>";
    });
    return html;
  }

  function updateTable() {
    tbody.innerHTML = "";
    CLUSTERS.forEach(function (cluster) {
      var rooms = state.rooms.filter(function (r) { return r.cluster === cluster.key; });
      if (rooms.length === 0) return;

      var groupTr = document.createElement("tr");
      groupTr.className = "group-row";
      var groupTd = document.createElement("td");
      groupTd.colSpan = 5;
      var titleWrap = document.createElement("div");
      titleWrap.className = "group-title";
      var dot = document.createElement("span");
      dot.className = "type-dot";
      var colorBase = clusterColorBase(cluster.key);
      dot.style.background = "hsl(" + colorBase.hue + " " + colorBase.sat + "% " + colorBase.light + "%)";
      var label = document.createElement("span");
      label.textContent = cluster.label;
      var totalArea = rooms.reduce(function (s, r) { return s + Number(r.area || 0); }, 0);
      var total = document.createElement("span");
      total.className = "group-total";
      total.textContent = totalArea + " m²";
      titleWrap.appendChild(dot);
      titleWrap.appendChild(label);
      titleWrap.appendChild(total);
      groupTd.appendChild(titleWrap);
      groupTr.appendChild(groupTd);
      tbody.appendChild(groupTr);

      rooms
        .slice()
        .sort(function (a, b) { return b.area - a.area; })
        .forEach(function (r) {
          var tr = document.createElement("tr");

          var tdName = document.createElement("td");
          tdName.className = "name";
          tdName.textContent = r.name;
          if (r.note) tdName.title = r.note;

          var tdArea = document.createElement("td");
          tdArea.className = "area";
          var areaInput = document.createElement("input");
          areaInput.type = "number";
          areaInput.min = "1";
          areaInput.className = "area-input";
          areaInput.value = r.area;
          areaInput.title = "Muokkaa pinta-alaa";
          areaInput.addEventListener("change", function () {
            var v = parseInt(areaInput.value, 10);
            if (!v || v <= 0) { areaInput.value = r.area; return; }
            applyAreaChange(r, v);
          });
          tdArea.appendChild(areaInput);

          var tdType = document.createElement("td");
          tdType.className = "type";
          var typeDot = document.createElement("span");
          typeDot.className = "type-dot";
          typeDot.style.background = colorForRoom(r);
          typeDot.title = cluster.label;
          tdType.appendChild(typeDot);

          var tdStorey = document.createElement("td");
          tdStorey.className = "storey";
          var storeySelect = document.createElement("select");
          storeySelect.className = "storey-select";
          storeySelect.innerHTML = storeyOptionsHtml(r.storey);
          storeySelect.addEventListener("change", function () {
            r.storey = parseInt(storeySelect.value, 10);
            repackAll();
          });
          tdStorey.appendChild(storeySelect);

          var tdAction = document.createElement("td");
          tdAction.className = "action";
          var delBtn = document.createElement("button");
          delBtn.className = "del-btn";
          delBtn.textContent = "×";
          delBtn.title = "Poista " + r.name;
          delBtn.addEventListener("click", function () { removeRoom(r.id); });
          tdAction.appendChild(delBtn);

          tr.appendChild(tdName);
          tr.appendChild(tdArea);
          tr.appendChild(tdType);
          tr.appendChild(tdStorey);
          tr.appendChild(tdAction);
          tbody.appendChild(tr);
        });
    });

    populateLinkRoomSelects();
    updateCustomLinksList();
  }

  function updateLegend() {
    clusterLegend.innerHTML = "";
    CLUSTERS.forEach(function (cluster) {
      var rooms = state.rooms.filter(function (r) { return r.cluster === cluster.key; });
      if (rooms.length === 0) return;
      var totalArea = rooms.reduce(function (s, r) { return s + Number(r.area || 0); }, 0);
      var colorBase = clusterColorBase(cluster.key);

      var item = document.createElement("div");
      item.className = "cluster-legend-item";

      var picker = document.createElement("input");
      picker.type = "color";
      picker.className = "swatch-picker";
      picker.value = hslToHex(colorBase.hue, colorBase.sat, colorBase.light);
      picker.title = "Vaihda ryhmän \"" + cluster.label + "\" väri";
      picker.addEventListener("input", function () {
        state.clusterColors[cluster.key] = hexToHsl(picker.value);
        render();
        save();
      });

      var name = document.createElement("span");
      name.className = "name";
      name.textContent = cluster.label;
      var total = document.createElement("span");
      total.className = "total";
      total.textContent = totalArea + " m²";
      item.appendChild(picker);
      item.appendChild(name);
      item.appendChild(total);
      clusterLegend.appendChild(item);
    });
  }

  function populateClusterSelect() {
    newClusterSelect.innerHTML = "";
    CLUSTERS.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.key;
      opt.textContent = c.label;
      newClusterSelect.appendChild(opt);
    });
  }

  function populateNewStoreySelect() {
    var prev = newStoreySelect.value;
    newStoreySelect.innerHTML = storeyOptionsHtml(prev ? parseInt(prev, 10) : 1);
  }

  function populateLinkRoomSelects() {
    [linkRoomA, linkRoomB].forEach(function (sel) {
      var prev = sel.value;
      sel.innerHTML = "";
      state.rooms
        .slice()
        .sort(function (a, b) { return a.name.localeCompare(b.name, "fi"); })
        .forEach(function (r) {
          var opt = document.createElement("option");
          opt.value = r.id;
          opt.textContent = r.name;
          sel.appendChild(opt);
        });
      if (prev && state.rooms.some(function (r) { return r.id === prev; })) sel.value = prev;
    });
  }

  function updateCustomLinksList() {
    customLinksList.innerHTML = "";
    state.customLinks.forEach(function (link) {
      var a = state.rooms.find(function (r) { return r.id === link.a; });
      var b = state.rooms.find(function (r) { return r.id === link.b; });
      if (!a || !b) return;
      var li = document.createElement("li");
      var span = document.createElement("span");
      span.textContent = a.name + " ↔ " + b.name;
      var del = document.createElement("button");
      del.className = "del-btn";
      del.textContent = "×";
      del.title = "Poista yhteys";
      del.addEventListener("click", function () {
        state.customLinks = state.customLinks.filter(function (l) { return l.id !== link.id; });
        render();
        save();
      });
      li.appendChild(span);
      li.appendChild(del);
      customLinksList.appendChild(li);
    });
  }

  // ---------- Actions ----------
  function removeRoom(id) {
    state.rooms = state.rooms.filter(function (r) { return r.id !== id; });
    delete state.positions[id];
    delete state.tiles[id];
    Object.keys(state.storeyPositions).forEach(function (s) { delete state.storeyPositions[s][id]; });
    Object.keys(state.storeyTiles).forEach(function (s) { delete state.storeyTiles[s][id]; });
    state.customLinks = state.customLinks.filter(function (l) { return l.a !== id && l.b !== id; });
    if (state.rooms.length === 0) {
      render();
      save();
    } else {
      repackAll();
    }
  }

  function addRoom(name, area, cluster, storey) {
    state.rooms.push({ id: makeId(), name: name, area: area, cluster: cluster, storey: storey });
    repackAll();
  }

  function resetViews() {
    state.viewStates = {};
  }

  function clearAll() {
    if (state.rooms.length && !window.confirm("Tyhjennetäänkö koko huoneohjelma?")) return;
    state.rooms = [];
    state.positions = {};
    state.storeyPositions = {};
    state.tiles = {};
    state.storeyTiles = {};
    state.customLinks = [];
    resetViews();
    render();
    save();
  }

  function loadDefaults() {
    state.rooms = defaultRooms();
    state.customLinks = defaultCustomLinks();
    state.storeyCount = 2;
    document.getElementById("storey-count").textContent = state.storeyCount;
    populateNewStoreySelect();
    resetViews();
    repackAll();
  }

  function exportSvg() {
    var diagrams = buildDiagrams();
    var isRects = state.shapeMode === "rects";
    var gapX = 24;
    var titleHeight = state.viewMode === "storeys" ? 34 : 0;
    var totalWidth = diagrams.reduce(function (s, d) { return s + d.width; }, 0) + gapX * Math.max(diagrams.length - 1, 0);
    var totalHeight = Math.max.apply(null, diagrams.map(function (d) { return d.height; })) + titleHeight;

    var out = svgEl("svg", { xmlns: "http://www.w3.org/2000/svg", width: totalWidth, height: totalHeight });
    out.appendChild(svgEl("rect", { x: 0, y: 0, width: totalWidth, height: totalHeight, fill: "#faf5ef" }));
    var exportDefs = svgEl("defs");
    out.appendChild(exportDefs);

    var xOffset = 0;
    diagrams.forEach(function (d, diagramIdx) {
      var g = svgEl("g", { transform: "translate(" + xOffset + "," + titleHeight + ")" });
      if (d.title) {
        var t = svgEl("text", { x: 0, y: -12, "font-size": "15", "font-weight": "700", fill: "#2c2622" });
        t.textContent = d.title;
        out.appendChild((function () {
          var tg = svgEl("g", { transform: "translate(" + xOffset + "," + titleHeight + ")" });
          tg.appendChild(t);
          return tg;
        })());
      }
      var layout = d.getLayout();

      computeAllLinks(d.rooms).forEach(function (l) {
        var pa = layout[l.source], pb = layout[l.target];
        if (!pa || !pb) return;
        var cxA = isRects ? pa.x + pa.w / 2 : pa.x, cyA = isRects ? pa.y + pa.h / 2 : pa.y;
        var cxB = isRects ? pb.x + pb.w / 2 : pb.x, cyB = isRects ? pb.y + pb.h / 2 : pb.y;
        g.appendChild(svgEl("line", {
          x1: cxA, y1: cyA, x2: cxB, y2: cyB,
          stroke: l.custom ? "#b5573f" : "#b9b0a3",
          "stroke-width": "5", "stroke-linecap": "round",
          opacity: l.custom ? "0.8" : "0.55",
          "stroke-dasharray": l.custom ? "2 9" : ""
        }));
      });

      d.rooms.forEach(function (r) {
        var item = layout[r.id];
        if (!item) return;
        var cluster = clusterOf(r.cluster);
        var isTechnical = cluster.key === "tekniset";

        if (isRects) {
          var rect = item;
          var pad = 1.5;
          var rectAttrs = {
            x: rect.x + pad, y: rect.y + pad,
            width: Math.max(0, rect.w - pad * 2), height: Math.max(0, rect.h - pad * 2),
            fill: colorForRoom(r), "fill-opacity": "0.9",
            stroke: isTechnical ? "#726c62" : "rgba(0,0,0,0.18)",
            "stroke-width": isTechnical ? "2" : "1.5"
          };
          if (isTechnical) rectAttrs["stroke-dasharray"] = "6 4";
          g.appendChild(svgEl("rect", rectAttrs));

          var exClipId = "export-rect-clip-" + diagramIdx + "-" + r.id.replace(/[^a-zA-Z0-9_-]/g, "");
          var exClip = svgEl("clipPath", { id: exClipId });
          exClip.appendChild(svgEl("rect", { x: rect.x, y: rect.y, width: rect.w, height: rect.h }));
          exportDefs.appendChild(exClip);
          var labelGroup = svgEl("g", { "clip-path": "url(#" + exClipId + ")" });

          var cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
          var l1 = svgEl("text", { x: cx, y: cy - 6, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#2c2622" });
          l1.textContent = r.name;
          var l2 = svgEl("text", { x: cx, y: cy + 12, "text-anchor": "middle", "font-size": "11", fill: "#4a433c" });
          l2.textContent = r.area + " m²";
          labelGroup.appendChild(l1);
          labelGroup.appendChild(l2);
          g.appendChild(labelGroup);
        } else {
          var circleAttrs = {
            cx: item.x, cy: item.y, r: item.r,
            fill: colorForRoom(r), "fill-opacity": "0.88",
            stroke: isTechnical ? "#726c62" : "rgba(0,0,0,0.15)",
            "stroke-width": isTechnical ? "1.5" : "1"
          };
          if (isTechnical) circleAttrs["stroke-dasharray"] = "5 4";
          g.appendChild(svgEl("circle", circleAttrs));
          var lp = labelPositions(item);
          if (item.r >= 20) {
            var label = svgEl("text", { x: item.x, y: lp.nameY, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#2c2622" });
            label.textContent = r.name;
            var sub = svgEl("text", { x: item.x, y: lp.subY, "text-anchor": "middle", "font-size": "11", fill: "#4a433c" });
            sub.textContent = r.area + " m²";
            g.appendChild(label);
            g.appendChild(sub);
          } else if (item.r >= 12) {
            var label2 = svgEl("text", { x: item.x, y: item.y + 4, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#2c2622" });
            label2.textContent = r.name;
            g.appendChild(label2);
          }
        }
      });
      out.appendChild(g);
      xOffset += d.width + gapX;
    });

    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(out);
    var blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var filename = (state.projectName || "kuplakaavio").trim().replace(/[^\wäöåÄÖÅ\- ]/g, "").replace(/\s+/g, "-");
    a.href = url;
    a.download = (filename || "kuplakaavio") + ".svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---------- Wiring ----------
  document.getElementById("repack-btn").addEventListener("click", repackAll);
  document.getElementById("export-btn").addEventListener("click", exportSvg);
  document.getElementById("clear-all").addEventListener("click", clearAll);
  document.getElementById("load-sample").addEventListener("click", loadDefaults);

  document.getElementById("project-name").addEventListener("input", function (e) {
    state.projectName = e.target.value;
    save();
  });

  document.getElementById("add-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = document.getElementById("new-name");
    var areaEl = document.getElementById("new-area");
    var name = nameEl.value.trim();
    var area = parseInt(areaEl.value, 10);
    if (!name || !area || area <= 0) return;
    addRoom(name, area, newClusterSelect.value, parseInt(newStoreySelect.value, 10));
    nameEl.value = "";
    areaEl.value = "";
    nameEl.focus();
  });

  function wireCollapsible(toggleId, bodyId) {
    var toggle = document.getElementById(toggleId);
    var body = document.getElementById(bodyId);
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      body.classList.toggle("collapsed", expanded);
    });
  }
  wireCollapsible("legend-toggle", "legend-body");
  wireCollapsible("links-toggle", "links-body");

  document.getElementById("link-add-btn").addEventListener("click", function () {
    var a = linkRoomA.value, b = linkRoomB.value;
    if (!a || !b || a === b) return;
    var exists = state.customLinks.some(function (l) {
      return (l.a === a && l.b === b) || (l.a === b && l.b === a);
    });
    if (exists) return;
    state.customLinks.push({ id: "link-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), a: a, b: b });
    render();
    save();
  });

  document.getElementById("reset-colors-btn").addEventListener("click", function () {
    state.clusterColors = {};
    render();
    save();
  });

  var viewToggle = document.getElementById("view-toggle");
  viewToggle.addEventListener("click", function (e) {
    var btn = e.target.closest(".toggle-btn");
    if (!btn) return;
    var mode = btn.dataset.view;
    if (mode === state.viewMode) return;
    state.viewMode = mode;
    viewToggle.querySelectorAll(".toggle-btn").forEach(function (b) {
      b.classList.toggle("active", b === btn);
    });
    ensureLayouts();
  });

  var shapeToggle = document.getElementById("shape-toggle");
  shapeToggle.addEventListener("click", function (e) {
    var btn = e.target.closest(".toggle-btn");
    if (!btn) return;
    var mode = btn.dataset.shape;
    if (mode === state.shapeMode) return;
    state.shapeMode = mode;
    shapeToggle.querySelectorAll(".toggle-btn").forEach(function (b) {
      b.classList.toggle("active", b === btn);
    });
    ensureLayouts();
  });

  var storeyCountEl = document.getElementById("storey-count");
  function setStoreyCount(n) {
    n = Math.max(1, Math.min(8, n));
    if (n === state.storeyCount) return;
    if (n < state.storeyCount) {
      state.rooms.forEach(function (r) { if (r.storey > n) r.storey = n; });
    }
    state.storeyCount = n;
    storeyCountEl.textContent = n;
    populateNewStoreySelect();
    ensureLayouts();
  }
  document.getElementById("storey-plus").addEventListener("click", function () { setStoreyCount(state.storeyCount + 1); });
  document.getElementById("storey-minus").addEventListener("click", function () { setStoreyCount(state.storeyCount - 1); });

  document.getElementById("zoom-reset").addEventListener("click", function () {
    resetViews();
    render();
    save();
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(ensureLayouts, 200);
  });

  // ---------- Init ----------
  populateClusterSelect();
  document.getElementById("project-name").value = state.projectName;

  if (load()) {
    document.getElementById("project-name").value = state.projectName;
    storeyCountEl.textContent = state.storeyCount;
    viewToggle.querySelectorAll(".toggle-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.view === state.viewMode);
    });
    shapeToggle.querySelectorAll(".toggle-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.shape === state.shapeMode);
    });
    populateNewStoreySelect();
    ensureLayouts();
  } else {
    populateNewStoreySelect();
    loadDefaults();
  }
})();

(function () {
  "use strict";

  // ---------- Room groups (clusters) ----------
  // Each cluster gets its own hue; individual rooms vary in lightness within
  // that hue family so the grouping reads clearly at a glance.
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

  var SHADE_OFFSETS = [0, -9, 7, -15, 13, -5, 10];
  function colorForRoom(room) {
    var cluster = clusterOf(room.cluster);
    var group = state.rooms.filter(function (r) { return r.cluster === room.cluster; });
    var idx = group.findIndex(function (r) { return r.id === room.id; });
    var offset = SHADE_OFFSETS[((idx % SHADE_OFFSETS.length) + SHADE_OFFSETS.length) % SHADE_OFFSETS.length];
    var light = Math.min(80, Math.max(26, cluster.light + offset));
    return "hsl(" + cluster.hue + " " + cluster.sat + "% " + light + "%)";
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

  var STORAGE_KEY = "kuplakaavio-data-fi-v3";
  var state = {
    rooms: [],
    projectName: "Kulttuuri- ja kohtaamistalon tilaohjelma",
    viewMode: "combined",   // 'combined' | 'storeys'
    shapeMode: "circles",   // 'circles' | 'interlock'
    storeyCount: 2,
    viewStates: {},         // diagram key -> {zoom, tx, ty}  (per-diagram pan/zoom)
    positions: {},          // circles, combined: id -> {x, y, r}
    storeyPositions: {},    // circles, per storey: storeyNumber -> { id -> {x, y, r} }
    tiles: {},              // interlock, combined: id -> {path, labelX, labelY, bboxW, bboxH}
    storeyTiles: {}         // interlock, per storey
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

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.rooms)) return false;
      state.rooms = data.rooms;
      state.projectName = data.projectName || state.projectName;
      state.viewMode = data.viewMode === "storeys" ? "storeys" : "combined";
      state.shapeMode = data.shapeMode === "interlock" ? "interlock" : "circles";
      state.storeyCount = data.storeyCount || 2;
      state.viewStates = data.viewStates || {};
      state.positions = data.positions || {};
      state.storeyPositions = data.storeyPositions || {};
      state.tiles = data.tiles || {};
      state.storeyTiles = data.storeyTiles || {};
      return true;
    } catch (e) { return false; }
  }

  // ---------- Adjacency: hub-and-spoke within each cluster ----------
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

    var links = computeLinks(rooms).filter(function (l) { return byId[l.source] && byId[l.target]; });

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

  // ---------- Layout B: interlocking polyomino tiling ----------
  // Rooms are grown from seeds (placed via the same clustering used for
  // circle packing) as connected grid regions, competing cell-by-cell for
  // territory until every room's quota is met or the grid is exhausted.
  // Because two rooms' regions only ever meet at a shared cell edge, the
  // result tiles the canvas with zero gaps — genuine interlocking shapes,
  // including concave L/T/staircase footprints, not just circles.
  function computeGridPlan(rooms, width, height) {
    var totalArea = rooms.reduce(function (s, r) { return s + Math.max(r.area, 1); }, 0);
    var targetCells = 3200;
    var cellRealArea = totalArea / targetCells;
    var quotas = {};
    var neededTotal = 0;
    rooms.forEach(function (r) {
      var q = Math.max(1, Math.round(Math.max(r.area, 1) / cellRealArea));
      quotas[r.id] = q;
      neededTotal += q;
    });
    var inflated = Math.ceil(neededTotal * 1.18);
    var aspect = width / Math.max(height, 1);
    var cols = Math.max(6, Math.round(Math.sqrt(inflated * aspect)));
    var rows = Math.max(6, Math.round(inflated / cols));
    return { cols: cols, rows: rows, quotas: quotas };
  }

  // Traces the outer (and any inner) boundary of a set of grid cells into
  // one or more closed rectilinear polygons, returned as an SVG path 'd'.
  function cellsToPath(cells, has, cellW, cellH) {
    var edges = [];
    cells.forEach(function (cell) {
      var c = cell.c, r = cell.r;
      if (!has(c, r - 1)) edges.push({ x1: c, y1: r, x2: c + 1, y2: r });         // top
      if (!has(c, r + 1)) edges.push({ x1: c + 1, y1: r + 1, x2: c, y2: r + 1 }); // bottom
      if (!has(c - 1, r)) edges.push({ x1: c, y1: r + 1, x2: c, y2: r });         // left
      if (!has(c + 1, r)) edges.push({ x1: c + 1, y1: r, x2: c + 1, y2: r + 1 }); // right
    });

    var fromMap = {};
    edges.forEach(function (e, idx) {
      var key = e.x1 + "," + e.y1;
      (fromMap[key] = fromMap[key] || []).push(idx);
    });

    var visited = new Array(edges.length).fill(false);
    var loops = [];
    for (var i = 0; i < edges.length; i++) {
      if (visited[i]) continue;
      var loopPts = [];
      var startKey = edges[i].x1 + "," + edges[i].y1;
      var currentIdx = i;
      var guard = 0;
      while (guard++ < edges.length + 5) {
        visited[currentIdx] = true;
        var e = edges[currentIdx];
        loopPts.push({ x: e.x1, y: e.y1 });
        var nextKey = e.x2 + "," + e.y2;
        if (nextKey === startKey) break;
        var candidates = (fromMap[nextKey] || []).filter(function (idx) { return !visited[idx]; });
        if (candidates.length === 0) break;
        currentIdx = candidates[0];
      }
      if (loopPts.length >= 3) loops.push(loopPts);
    }

    loops = loops.map(function (pts) {
      var n = pts.length;
      var out = [];
      for (var i = 0; i < n; i++) {
        var prev = pts[(i - 1 + n) % n], cur = pts[i], next = pts[(i + 1) % n];
        var collinear = (prev.x === cur.x && cur.x === next.x) || (prev.y === cur.y && cur.y === next.y);
        if (!collinear) out.push(cur);
      }
      return out.length >= 3 ? out : pts;
    });

    return loops.map(function (pts) {
      return "M " + pts.map(function (p) {
        return (p.x * cellW).toFixed(1) + "," + (p.y * cellH).toFixed(1);
      }).join(" L ") + " Z";
    }).join(" ");
  }

  function tileLayout(rooms, width, height) {
    if (rooms.length === 0) return {};

    var plan = computeGridPlan(rooms, width, height);
    var cols = plan.cols, rows = plan.rows, quotas = plan.quotas;
    var cellW = width / cols, cellH = height / rows;

    // Reuse the circle-packing simulation purely to get good seed centers:
    // same-cluster rooms end up near each other, hubs central, exactly like
    // the bubble view — the tiling just fills in the gaps between them.
    var seedPositions = packLayout(rooms, width, height);

    var occupied = new Array(rows);
    for (var ri = 0; ri < rows; ri++) occupied[ri] = new Array(cols).fill(null);

    function cellFree(c, r) {
      return c >= 0 && c < cols && r >= 0 && r < rows && occupied[r][c] === null;
    }

    function nearestFreeCell(c0, r0) {
      if (cellFree(c0, r0)) return { c: c0, r: r0 };
      var maxRadius = cols + rows;
      for (var radius = 1; radius < maxRadius; radius++) {
        for (var dc = -radius; dc <= radius; dc++) {
          var dr = radius - Math.abs(dc);
          var rowOptions = dr === 0 ? [0] : [dr, -dr];
          for (var k = 0; k < rowOptions.length; k++) {
            var c = c0 + dc, r = r0 + rowOptions[k];
            if (cellFree(c, r)) return { c: c, r: r };
          }
        }
      }
      return null;
    }

    function pushNeighbors(entry, c, r) {
      [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]].forEach(function (nb) {
        if (cellFree(nb[0], nb[1])) entry.frontier.push({ c: nb[0], r: nb[1] });
      });
    }

    var active = [];
    rooms.forEach(function (room) {
      var sp = seedPositions[room.id];
      if (!sp) return;
      var c0 = Math.min(cols - 1, Math.max(0, Math.floor(sp.x / cellW)));
      var r0 = Math.min(rows - 1, Math.max(0, Math.floor(sp.y / cellH)));
      var seed = nearestFreeCell(c0, r0);
      if (!seed) return;
      occupied[seed.r][seed.c] = room.id;
      var entry = { id: room.id, remaining: Math.max(0, quotas[room.id] - 1), frontier: [] };
      pushNeighbors(entry, seed.c, seed.r);
      active.push(entry);
    });

    var pending = active.filter(function (e) { return e.remaining > 0; });
    while (pending.length > 0) {
      for (var i = pending.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = pending[i]; pending[i] = pending[j]; pending[j] = tmp;
      }
      var next = [];
      pending.forEach(function (entry) {
        var claimed = null;
        while (entry.frontier.length > 0) {
          var cand = entry.frontier.shift();
          if (cellFree(cand.c, cand.r)) { claimed = cand; break; }
        }
        if (claimed) {
          occupied[claimed.r][claimed.c] = entry.id;
          entry.remaining--;
          pushNeighbors(entry, claimed.c, claimed.r);
          if (entry.remaining > 0 && entry.frontier.length > 0) next.push(entry);
        }
      });
      pending = next;
    }

    var cellsByRoom = {};
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var id = occupied[r][c];
        if (id === null) continue;
        (cellsByRoom[id] = cellsByRoom[id] || []).push({ c: c, r: r });
      }
    }

    var result = {};
    Object.keys(cellsByRoom).forEach(function (id) {
      var cells = cellsByRoom[id];
      var cellSet = {};
      cells.forEach(function (cell) { cellSet[cell.c + "," + cell.r] = true; });
      function has(c, r) { return !!cellSet[c + "," + r]; }

      var sumX = 0, sumY = 0, minC = Infinity, maxC = -Infinity, minR = Infinity, maxR = -Infinity;
      cells.forEach(function (cell) {
        sumX += (cell.c + 0.5) * cellW;
        sumY += (cell.r + 0.5) * cellH;
        if (cell.c < minC) minC = cell.c;
        if (cell.c > maxC) maxC = cell.c;
        if (cell.r < minR) minR = cell.r;
        if (cell.r > maxR) maxR = cell.r;
      });

      result[id] = {
        path: cellsToPath(cells, has, cellW, cellH),
        labelX: sumX / cells.length,
        labelY: sumY / cells.length,
        bboxW: (maxC - minC + 1) * cellW,
        bboxH: (maxR - minR + 1) * cellH
      };
    });
    return result;
  }

  function layoutFor(rooms, width, height) {
    return state.shapeMode === "interlock" ? tileLayout(rooms, width, height) : packLayout(rooms, width, height);
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
    var interlock = state.shapeMode === "interlock";

    if (state.viewMode === "combined") {
      var store = interlock ? state.tiles : state.positions;
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
        setLayout: function (p) { store = p; if (interlock) state.tiles = p; else state.positions = p; }
      }];
    }

    var storeys = getStoreyNumbers();
    var n = Math.max(storeys.length, 1);
    var gap = 16;
    var panelWidth = Math.max((size.width - gap * (n - 1)) / n, 180);
    var panelHeight = Math.max(size.height - 46, 180);
    return storeys.map(function (s) {
      var bucket = interlock ? state.storeyTiles : state.storeyPositions;
      if (!bucket[s]) bucket[s] = {};
      return {
        key: (interlock ? "tile-storey-" : "storey-") + s,
        title: "Kerros " + s,
        rooms: state.rooms.filter(function (r) { return r.storey === s; }),
        width: panelWidth,
        height: panelHeight,
        marginX: panelWidth * MARGIN_RATIO,
        marginY: panelHeight * MARGIN_RATIO,
        viewState: ensureViewState((interlock ? "tile-storey-" : "storey-") + s),
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
    var interlock = state.shapeMode === "interlock";

    if (!interlock) {
      computeLinks(d.rooms).forEach(function (l) {
        var pa = layout[l.source], pb = layout[l.target];
        if (!pa || !pb) return;
        var line = svgEl("line", { class: "link-line", x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y });
        line.dataset.source = l.source;
        line.dataset.target = l.target;
        linksLayer.appendChild(line);
      });
    }

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

      if (interlock) {
        var pathAttrs = {
          d: item.path,
          fill: colorForRoom(r),
          "fill-rule": "evenodd",
          stroke: isTechnical ? "#726c62" : "#faf5ef",
          "stroke-width": isTechnical ? "2.5" : "3"
        };
        if (isTechnical) pathAttrs["stroke-dasharray"] = "6 4";
        var shape = svgEl("path", pathAttrs);
        shape.style.fillOpacity = "0.92";
        g.appendChild(shape);

        // Clip labels to this room's own shape so text on small/irregular
        // pieces never spills visually into a neighboring tile.
        var clipId = "clip-" + r.id.replace(/[^a-zA-Z0-9_-]/g, "");
        var clipPath = svgEl("clipPath", { id: clipId });
        clipPath.appendChild(svgEl("path", { d: item.path, "fill-rule": "evenodd" }));
        defs.appendChild(clipPath);
        var labelGroup = svgEl("g", { "clip-path": "url(#" + clipId + ")" });

        var minDim = Math.min(item.bboxW, item.bboxH);
        if (minDim >= 40) {
          var l1 = svgEl("text", { class: "bubble-label", x: item.labelX, y: item.labelY - 6 });
          l1.textContent = r.name;
          var l2 = svgEl("text", { class: "bubble-sublabel", x: item.labelX, y: item.labelY + 12 });
          l2.textContent = r.area + " m²";
          labelGroup.appendChild(l1);
          labelGroup.appendChild(l2);
        } else if (minDim >= 22) {
          var l3 = svgEl("text", { class: "bubble-label", x: item.labelX, y: item.labelY + 4 });
          l3.textContent = r.name;
          labelGroup.appendChild(l3);
        }
        g.appendChild(labelGroup);
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
    // canvas pans. Dragging a bubble (circles mode) stops this from firing.
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

  // ---------- Dragging a single bubble (circles mode only) ----------
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

  function startDrag(evt, svg, positions, id, d) {
    evt.preventDefault();
    evt.stopPropagation(); // don't also start a canvas pan
    var pos = positions[id];
    if (!pos) return;
    var local = toLocalPoint(evt, svg, d.viewState);
    dragging = {
      svg: svg, positions: positions, id: id, d: d,
      offsetX: local.x - pos.x, offsetY: local.y - pos.y
    };
    window.addEventListener("pointermove", onDrag);
    window.addEventListener("pointerup", endDrag);
  }

  function onDrag(evt) {
    if (!dragging) return;
    var local = toLocalPoint(evt, dragging.svg, dragging.d.viewState);
    var pos = dragging.positions[dragging.id];
    var r = pos.r;
    var x = local.x - dragging.offsetX;
    var y = local.y - dragging.offsetY;
    var d = dragging.d;
    pos.x = Math.min(d.width + d.marginX - r, Math.max(r - d.marginX, x));
    pos.y = Math.min(d.height + d.marginY - r, Math.max(r - d.marginY, y));
    updateBubblePositions(dragging.svg, dragging.positions, dragging.id);
  }

  function endDrag() {
    window.removeEventListener("pointermove", onDrag);
    window.removeEventListener("pointerup", endDrag);
    if (dragging) save();
    dragging = null;
  }

  // ---------- Sidebar: table, legend, summary ----------
  var tbody = document.getElementById("room-tbody");
  var summaryEl = document.getElementById("room-summary");
  var clusterLegend = document.getElementById("cluster-legend");
  var newClusterSelect = document.getElementById("new-cluster");
  var newStoreySelect = document.getElementById("new-storey");

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
      dot.style.background = "hsl(" + cluster.hue + " " + cluster.sat + "% " + cluster.light + "%)";
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
          tdArea.textContent = r.area;

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
  }

  function updateLegend() {
    clusterLegend.innerHTML = "";
    CLUSTERS.forEach(function (cluster) {
      var rooms = state.rooms.filter(function (r) { return r.cluster === cluster.key; });
      if (rooms.length === 0) return;
      var totalArea = rooms.reduce(function (s, r) { return s + Number(r.area || 0); }, 0);

      var item = document.createElement("div");
      item.className = "cluster-legend-item";
      var swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = "hsl(" + cluster.hue + " " + cluster.sat + "% " + cluster.light + "%)";
      var name = document.createElement("span");
      name.className = "name";
      name.textContent = cluster.label;
      var total = document.createElement("span");
      total.className = "total";
      total.textContent = totalArea + " m²";
      item.appendChild(swatch);
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

  // ---------- Actions ----------
  function removeRoom(id) {
    state.rooms = state.rooms.filter(function (r) { return r.id !== id; });
    delete state.positions[id];
    delete state.tiles[id];
    Object.keys(state.storeyPositions).forEach(function (s) { delete state.storeyPositions[s][id]; });
    Object.keys(state.storeyTiles).forEach(function (s) { delete state.storeyTiles[s][id]; });
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
    resetViews();
    render();
    save();
  }

  function loadDefaults() {
    state.rooms = defaultRooms();
    state.storeyCount = 2;
    document.getElementById("storey-count").textContent = state.storeyCount;
    populateNewStoreySelect();
    resetViews();
    repackAll();
  }

  function exportSvg() {
    var diagrams = buildDiagrams();
    var interlock = state.shapeMode === "interlock";
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

      if (!interlock) {
        computeLinks(d.rooms).forEach(function (l) {
          var pa = layout[l.source], pb = layout[l.target];
          if (!pa || !pb) return;
          g.appendChild(svgEl("line", {
            x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y,
            stroke: "#b9b0a3", "stroke-width": "5", "stroke-linecap": "round", opacity: "0.55"
          }));
        });
      }

      d.rooms.forEach(function (r) {
        var item = layout[r.id];
        if (!item) return;
        var cluster = clusterOf(r.cluster);
        var isTechnical = cluster.key === "tekniset";

        if (interlock) {
          var pathAttrs = {
            d: item.path, fill: colorForRoom(r), "fill-opacity": "0.92", "fill-rule": "evenodd",
            stroke: isTechnical ? "#726c62" : "#faf5ef", "stroke-width": isTechnical ? "2.5" : "3"
          };
          if (isTechnical) pathAttrs["stroke-dasharray"] = "6 4";
          g.appendChild(svgEl("path", pathAttrs));

          var clipId = "export-clip-" + diagramIdx + "-" + r.id.replace(/[^a-zA-Z0-9_-]/g, "");
          var clipPath = svgEl("clipPath", { id: clipId });
          clipPath.appendChild(svgEl("path", { d: item.path, "fill-rule": "evenodd" }));
          exportDefs.appendChild(clipPath);
          var labelGroup = svgEl("g", { "clip-path": "url(#" + clipId + ")" });

          var minDim = Math.min(item.bboxW, item.bboxH);
          if (minDim >= 40) {
            var l1 = svgEl("text", { x: item.labelX, y: item.labelY - 6, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#2c2622" });
            l1.textContent = r.name;
            var l2 = svgEl("text", { x: item.labelX, y: item.labelY + 12, "text-anchor": "middle", "font-size": "11", fill: "#4a433c" });
            l2.textContent = r.area + " m²";
            labelGroup.appendChild(l1);
            labelGroup.appendChild(l2);
          } else if (minDim >= 22) {
            var l3 = svgEl("text", { x: item.labelX, y: item.labelY + 4, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#2c2622" });
            l3.textContent = r.name;
            labelGroup.appendChild(l3);
          }
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

  var legendToggle = document.getElementById("legend-toggle");
  var legendBody = document.getElementById("legend-body");
  legendToggle.addEventListener("click", function () {
    var expanded = legendToggle.getAttribute("aria-expanded") === "true";
    legendToggle.setAttribute("aria-expanded", String(!expanded));
    legendBody.classList.toggle("collapsed", expanded);
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
    repackAll();
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
    repackAll();
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
    repackAll();
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
    resizeTimer = setTimeout(repackAll, 200);
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
    var currentLayoutEmpty = state.viewMode === "combined"
      ? Object.keys(state.shapeMode === "interlock" ? state.tiles : state.positions).length === 0
      : getStoreyNumbers().every(function (s) {
        var bucket = state.shapeMode === "interlock" ? state.storeyTiles : state.storeyPositions;
        return !bucket[s] || Object.keys(bucket[s]).length === 0;
      });
    if (state.rooms.length > 0 && currentLayoutEmpty) {
      repackAll();
    } else {
      render();
    }
  } else {
    populateNewStoreySelect();
    loadDefaults();
  }
})();

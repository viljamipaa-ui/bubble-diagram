(function () {
  "use strict";

  // ---------- Room types ----------
  var TYPES = [
    { key: "Olohuone", color: "#c97b63" },
    { key: "Makuuhuone", color: "#7f9c88" },
    { key: "Keittiö", color: "#d9a441" },
    { key: "Kylpyhuone", color: "#7fa2c4" },
    { key: "Liikennetila", color: "#9c9c94" },
    { key: "Työtila", color: "#a08cc0" },
    { key: "Varasto", color: "#8f8a7a" },
    { key: "Ulko / Terassi", color: "#93b98a" }
  ];

  function colorForType(type) {
    var t = TYPES.find(function (t) { return t.key === type; });
    return t ? t.color : "#a3a3a3";
  }

  function sampleRooms() {
    return [
      { id: "r1", name: "Takapiha", area: 40, type: "Ulko / Terassi" },
      { id: "r2", name: "Olohuone", area: 28, type: "Olohuone" },
      { id: "r3", name: "Makuuhuone 3", area: 24, type: "Makuuhuone" },
      { id: "r4", name: "Keittiö / Ruokailu", area: 22, type: "Keittiö" },
      { id: "r5", name: "Päämakuuhuone", area: 18, type: "Makuuhuone" },
      { id: "r6", name: "Terassi", area: 14, type: "Ulko / Terassi" },
      { id: "r7", name: "Makuuhuone 2", area: 13, type: "Makuuhuone" },
      { id: "r8", name: "Tasanne / Porras", area: 10, type: "Liikennetila" },
      { id: "r9", name: "Työhuone", area: 9, type: "Työtila" },
      { id: "r10", name: "Eteinen", area: 8, type: "Liikennetila" },
      { id: "r11", name: "Kylpyhuone", area: 6, type: "Kylpyhuone" },
      { id: "r12", name: "Kodinhoitohuone", area: 5, type: "Varasto" },
      { id: "r13", name: "Oma kylpyhuone", area: 4, type: "Kylpyhuone" }
    ];
  }

  var STORAGE_KEY = "kuplakaavio-data-fi";
  var state = {
    rooms: [],
    projectName: "Esimerkki asuinrakennuksen tarveselvitys",
    positions: {} // id -> {x, y}
  };

  var nextId = 1;
  function makeId() { return "room-" + (nextId++) + "-" + Date.now().toString(36); }

  // ---------- Persistence ----------
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        rooms: state.rooms,
        projectName: state.projectName,
        positions: state.positions
      }));
    } catch (e) { /* ignore quota / privacy errors */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.rooms)) return false;
      state.rooms = data.rooms;
      state.projectName = data.projectName || state.projectName;
      state.positions = data.positions || {};
      return true;
    } catch (e) { return false; }
  }

  // ---------- Adjacency heuristic ----------
  function computeLinks(rooms) {
    var byType = {};
    rooms.forEach(function (r) {
      (byType[r.type] = byType[r.type] || []).push(r);
    });
    var links = [];
    var seen = {};
    function add(a, b) {
      if (a === b) return;
      var key = a < b ? a + "|" + b : b + "|" + a;
      if (seen[key]) return;
      seen[key] = true;
      links.push({ source: a, target: b });
    }

    var circulation = byType["Liikennetila"] || [];
    var kitchens = byType["Keittiö"] || [];
    var living = byType["Olohuone"] || [];
    var bedrooms = byType["Makuuhuone"] || [];
    var baths = byType["Kylpyhuone"] || [];
    var storage = byType["Varasto"] || [];
    var outdoor = byType["Ulko / Terassi"] || [];

    // Circulation acts as the hub connecting to every other room.
    circulation.forEach(function (c) {
      rooms.forEach(function (r) { if (r.id !== c.id) add(c.id, r.id); });
    });

    // Kitchen opens onto living room.
    kitchens.forEach(function (k) {
      living.forEach(function (l) { add(k.id, l.id); });
    });

    // Every bedroom sits near a bathroom.
    bedrooms.forEach(function (b, i) {
      if (baths.length === 0) return;
      var bath = baths[i % baths.length];
      add(b.id, bath.id);
    });

    // Utility/storage serves the kitchen.
    storage.forEach(function (s) {
      kitchens.forEach(function (k) { add(s.id, k.id); });
    });

    // Outdoor spaces relate to living room / kitchen.
    outdoor.forEach(function (o) {
      (living.length ? living : kitchens).forEach(function (r) { add(o.id, r.id); });
    });

    return links;
  }

  // ---------- Force-based circle packing ----------
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
        r: Math.max(k * Math.sqrt(Math.max(r.area, 1)), 16),
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

  // ---------- Rendering ----------
  var svg = document.getElementById("canvas");
  var canvasArea = document.querySelector(".canvas-area");
  var emptyState = document.getElementById("empty-state");
  var linksGroup, bubblesGroup;
  var dragging = null;

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    }
    return el;
  }

  function ensureLayers() {
    svg.innerHTML = "";
    linksGroup = svgEl("g", { id: "links-layer" });
    bubblesGroup = svgEl("g", { id: "bubbles-layer" });
    svg.appendChild(linksGroup);
    svg.appendChild(bubblesGroup);
  }

  function currentSize() {
    return {
      width: canvasArea.clientWidth || 800,
      height: canvasArea.clientHeight || 600
    };
  }

  function render() {
    var rooms = state.rooms;
    emptyState.hidden = rooms.length > 0;
    ensureLayers();
    if (rooms.length === 0) return;

    var links = computeLinks(rooms);

    // draw links
    links.forEach(function (l) {
      var pa = state.positions[l.source], pb = state.positions[l.target];
      if (!pa || !pb) return;
      var line = svgEl("line", {
        class: "link-line",
        x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y
      });
      linksGroup.appendChild(line);
      line.dataset.source = l.source;
      line.dataset.target = l.target;
    });

    // draw bubbles
    rooms.forEach(function (r) {
      var pos = state.positions[r.id];
      if (!pos) return;
      var g = svgEl("g", { class: "bubble-group", "data-id": r.id });

      var circle = svgEl("circle", {
        cx: pos.x, cy: pos.y, r: pos.r,
        fill: colorForType(r.type),
        stroke: "rgba(0,0,0,0.12)",
        "stroke-width": "1"
      });
      circle.style.fillOpacity = "0.88";

      var label = svgEl("text", {
        class: "bubble-label",
        x: pos.x, y: pos.y - (pos.r > 26 ? 2 : -4)
      });
      label.textContent = r.name;

      var sub = svgEl("text", {
        class: "bubble-sublabel",
        x: pos.x, y: pos.y + (pos.r > 26 ? 16 : 10)
      });
      sub.textContent = r.area + " m²";

      g.appendChild(circle);
      if (pos.r >= 20) {
        g.appendChild(label);
        g.appendChild(sub);
      } else if (pos.r >= 12) {
        g.appendChild(label);
      }

      g.addEventListener("pointerdown", function (evt) { startDrag(evt, r.id); });
      bubblesGroup.appendChild(g);
    });

    updateSummary();
    updateTable();
    updateLegend();
  }

  function updateBubblePositions(id) {
    var pos = state.positions[id];
    var g = bubblesGroup.querySelector('[data-id="' + id + '"]');
    if (g && pos) {
      var circle = g.querySelector("circle");
      circle.setAttribute("cx", pos.x);
      circle.setAttribute("cy", pos.y);
      var texts = g.querySelectorAll("text");
      texts.forEach(function (t, i) {
        t.setAttribute("x", pos.x);
        t.setAttribute("y", i === 0 ? pos.y - (pos.r > 26 ? 2 : -4) : pos.y + (pos.r > 26 ? 16 : 10));
      });
    }
    linksGroup.querySelectorAll("line").forEach(function (line) {
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

  function startDrag(evt, id) {
    evt.preventDefault();
    var pos = state.positions[id];
    if (!pos) return;
    var rect = svg.getBoundingClientRect();
    dragging = {
      id: id,
      offsetX: evt.clientX - rect.left - pos.x,
      offsetY: evt.clientY - rect.top - pos.y
    };
    window.addEventListener("pointermove", onDrag);
    window.addEventListener("pointerup", endDrag);
  }

  function onDrag(evt) {
    if (!dragging) return;
    var rect = svg.getBoundingClientRect();
    var pos = state.positions[dragging.id];
    var r = pos.r;
    var x = evt.clientX - rect.left - dragging.offsetX;
    var y = evt.clientY - rect.top - dragging.offsetY;
    pos.x = Math.min(rect.width - r, Math.max(r, x));
    pos.y = Math.min(rect.height - r, Math.max(r, y));
    updateBubblePositions(dragging.id);
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
  var typeLegend = document.getElementById("type-legend");
  var typeSelect = document.getElementById("new-type");

  function updateSummary() {
    var count = state.rooms.length;
    var total = state.rooms.reduce(function (s, r) { return s + Number(r.area || 0); }, 0);
    summaryEl.textContent = count + " huonetta · " + total + " m²";
  }

  function updateTable() {
    tbody.innerHTML = "";
    state.rooms
      .slice()
      .sort(function (a, b) { return b.area - a.area; })
      .forEach(function (r) {
        var tr = document.createElement("tr");

        var tdName = document.createElement("td");
        tdName.className = "name";
        tdName.textContent = r.name;

        var tdArea = document.createElement("td");
        tdArea.className = "area";
        tdArea.textContent = r.area;

        var tdType = document.createElement("td");
        tdType.className = "type";
        var dot = document.createElement("span");
        dot.className = "type-dot";
        dot.style.background = colorForType(r.type);
        dot.title = r.type;
        tdType.appendChild(dot);

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
        tr.appendChild(tdAction);
        tbody.appendChild(tr);
      });
  }

  function updateLegend() {
    typeLegend.innerHTML = "";
    var used = {};
    state.rooms.forEach(function (r) { used[r.type] = true; });
    TYPES.filter(function (t) { return used[t.key]; }).forEach(function (t) {
      var item = document.createElement("div");
      item.className = "type-legend-item";
      var dot = document.createElement("span");
      dot.className = "type-dot";
      dot.style.background = t.color;
      var label = document.createElement("span");
      label.textContent = t.key;
      item.appendChild(dot);
      item.appendChild(label);
      typeLegend.appendChild(item);
    });
  }

  function populateTypeSelect() {
    typeSelect.innerHTML = "";
    TYPES.forEach(function (t) {
      var opt = document.createElement("option");
      opt.value = t.key;
      opt.textContent = t.key;
      typeSelect.appendChild(opt);
    });
  }

  // ---------- Actions ----------
  function repack() {
    var size = currentSize();
    state.positions = packLayout(state.rooms, size.width, size.height);
    render();
    save();
  }

  function removeRoom(id) {
    state.rooms = state.rooms.filter(function (r) { return r.id !== id; });
    delete state.positions[id];
    if (state.rooms.length === 0) {
      render();
    } else {
      repack();
    }
    save();
  }

  function addRoom(name, area, type) {
    var room = { id: makeId(), name: name, area: area, type: type };
    state.rooms.push(room);
    repack();
  }

  function clearAll() {
    if (state.rooms.length && !window.confirm("Tyhjennetäänkö koko huoneohjelma?")) return;
    state.rooms = [];
    state.positions = {};
    render();
    save();
  }

  function loadSample() {
    state.rooms = sampleRooms();
    repack();
  }

  function exportSvg() {
    var clone = svg.cloneNode(true);
    var size = currentSize();
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", size.width);
    clone.setAttribute("height", size.height);
    var bg = svgEl("rect", { x: 0, y: 0, width: size.width, height: size.height, fill: "#faf5ef" });
    clone.insertBefore(bg, clone.firstChild);

    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(clone);
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
  document.getElementById("repack-btn").addEventListener("click", repack);
  document.getElementById("export-btn").addEventListener("click", exportSvg);
  document.getElementById("clear-all").addEventListener("click", clearAll);
  document.getElementById("load-sample").addEventListener("click", loadSample);

  document.getElementById("project-name").addEventListener("input", function (e) {
    state.projectName = e.target.value;
    save();
  });

  document.getElementById("add-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = document.getElementById("new-name");
    var areaEl = document.getElementById("new-area");
    var typeEl = document.getElementById("new-type");
    var name = nameEl.value.trim();
    var area = parseInt(areaEl.value, 10);
    if (!name || !area || area <= 0) return;
    addRoom(name, area, typeEl.value);
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

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(repack, 200);
  });

  // ---------- Init ----------
  populateTypeSelect();
  document.getElementById("project-name").value = state.projectName;

  if (load()) {
    document.getElementById("project-name").value = state.projectName;
    var size = currentSize();
    if (state.rooms.length && Object.keys(state.positions).length === 0) {
      state.positions = packLayout(state.rooms, size.width, size.height);
    }
    render();
  } else {
    loadSample();
  }
})();

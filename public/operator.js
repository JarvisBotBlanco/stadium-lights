(() => {
  // src/shared/layout/parseLayout.js
  var SEAT_SPREAD = 10;
  function parseLayout(raw) {
    if (!raw || !Array.isArray(raw.sections) || raw.sections.length === 0) {
      throw new Error("Layout inv\xE1lido: se requiere al menos una secci\xF3n");
    }
    const seats = [];
    let gridRows = 0;
    let gridCols = 0;
    for (const section of raw.sections) {
      if (!section.id || !Array.isArray(section.tables)) {
        throw new Error(`Secci\xF3n inv\xE1lida: ${section.id || "sin id"}`);
      }
      for (const table of section.tables) {
        if (!table.id || typeof table.seats !== "number" || table.seats < 1) {
          throw new Error(`Mesa inv\xE1lida en ${section.id}: ${table.id || "sin id"}`);
        }
        for (let seatIndex = 0; seatIndex < table.seats; seatIndex++) {
          const row = table.row;
          const col = table.col * SEAT_SPREAD + seatIndex;
          gridRows = Math.max(gridRows, row + 1);
          gridCols = Math.max(gridCols, col + 1);
          seats.push({
            sectionId: section.id,
            sectionLabel: section.label || section.id,
            tableId: table.id,
            tableLabel: table.label || table.id,
            seatIndex,
            tableRow: table.row,
            tableCol: table.col,
            row,
            col,
            seatKey: `${section.id}:${table.id}:${seatIndex}`,
            label: `${section.label || section.id} \xB7 ${table.label || table.id} \xB7 Asiento ${seatIndex + 1}`
          });
        }
      }
    }
    return {
      ...raw,
      seats,
      grid: { rows: gridRows, cols: gridCols },
      seatCount: seats.length
    };
  }

  // src/shared/patterns/presets.js
  function buildMexicoFlagFrames(grid) {
    const frames = [];
    for (let stripe = 0; stripe < 3; stripe++) {
      const color = stripe === 0 ? "#006847" : stripe === 1 ? "#FFFFFF" : "#CE1126";
      const cells = [];
      const colStart = Math.floor(stripe * grid.cols / 3);
      const colEnd = Math.floor((stripe + 1) * grid.cols / 3);
      for (let r = 0; r < grid.rows; r++) {
        for (let c = colStart; c < colEnd; c++) {
          cells.push([r, c, color]);
        }
      }
      frames.push({ cells, intervalMs: 1 });
    }
    return frames;
  }
  function buildFireFrames(grid, count = 10) {
    const fireColors = [
      "#FF0000",
      "#FF3300",
      "#FF6600",
      "#FF9900",
      "#FFCC00",
      "#FFFF00"
    ];
    const frames = [];
    for (let i = 0; i < count; i++) {
      const cells = [];
      for (let r = 0; r < grid.rows; r++) {
        for (let c = 0; c < grid.cols; c++) {
          const colorIdx = Math.floor(Math.random() * fireColors.length);
          cells.push([r, c, fireColors[colorIdx]]);
        }
      }
      frames.push({ cells, intervalMs: 200 });
    }
    return frames;
  }
  function buildHeartbeatFrames() {
    const red = "#FF0000";
    return [
      { all: red, intervalMs: 300 },
      { all: "#000000", intervalMs: 200 },
      { all: red, intervalMs: 300 },
      { all: "#000000", intervalMs: 800 },
      { all: red, intervalMs: 300 },
      { all: "#000000", intervalMs: 200 },
      { all: red, intervalMs: 300 },
      { all: "#000000", intervalMs: 1500 }
    ];
  }
  function buildCountdownFrames(grid) {
    const colors = ["#FFFFFF", "#FFFF00", "#FF6600", "#00FF00"];
    const labels = ["3", "2", "1", "GO"];
    return labels.map((label, i) => ({
      all: colors[i],
      intervalMs: 800,
      label
    }));
  }
  function buildPresetPatterns(grid) {
    return {
      heartbeat: {
        action: "sequence",
        name: "Latido",
        frames: buildHeartbeatFrames(),
        intervalMs: 300
      },
      flagMexico: {
        action: "sequence",
        name: "Bandera MX",
        frames: buildMexicoFlagFrames(grid),
        intervalMs: 1
      },
      fire: {
        action: "sequence",
        name: "Fuego",
        frames: buildFireFrames(grid),
        intervalMs: 200
      },
      countdown: {
        action: "sequence",
        name: "Countdown",
        frames: buildCountdownFrames(grid),
        intervalMs: 800
      }
    };
  }

  // src/shared/patterns/rainbow.js
  function computeRainbowColor(seat, grid, pattern) {
    const hue = (seat.col / Math.max(grid.cols, 1) * 360 + seat.row / Math.max(grid.rows, 1) * 30) % 360;
    return `hsl(${hue}, 100%, 50%)`;
  }

  // src/shared/patterns/wave.js
  function computeWaveColor(seat, grid, pattern, elapsedMs) {
    const { direction = "left-right", speed = 200, color = "#007AFF" } = pattern;
    const delay = speed;
    const holdMs = delay * 3;
    let steps;
    if (direction === "left-right") {
      steps = seat.col;
    } else if (direction === "right-left") {
      steps = grid.cols - 1 - seat.col;
    } else if (direction === "top-bottom") {
      steps = seat.row;
    } else if (direction === "bottom-top") {
      steps = grid.rows - 1 - seat.row;
    } else if (direction === "table-order") {
      steps = pattern.waveStep ?? 0;
    } else {
      steps = seat.col;
    }
    const startMs = steps * delay;
    if (elapsedMs < startMs) return null;
    if (elapsedMs < startMs + holdMs) return color;
    return null;
  }

  // src/shared/patterns/sequence.js
  function computeSequenceColor(seat, pattern, elapsedMs) {
    const { frames = [], intervalMs = 500 } = pattern;
    if (!frames.length) return null;
    let t = 0;
    for (const frame of frames) {
      const duration = frame.intervalMs ?? intervalMs;
      if (elapsedMs >= t && elapsedMs < t + duration) {
        if (frame.all) return frame.all;
        if (frame.cells) {
          const cell = frame.cells.find(
            (c) => c[0] === seat.row && c[1] === seat.col
          );
          return cell ? cell[2] : null;
        }
        return null;
      }
      t += duration;
    }
    return null;
  }
  function getSequenceDuration(pattern) {
    const { frames = [], intervalMs = 500 } = pattern;
    return frames.reduce(
      (sum, f) => sum + (f.intervalMs ?? intervalMs),
      0
    );
  }

  // src/shared/patterns/strobe.js
  function computeStrobeState(pattern, elapsedMs) {
    const interval = pattern.interval || 150;
    const duration = pattern.duration || 3e3;
    const color = pattern.color || "#FFFFFF";
    if (elapsedMs >= duration) return null;
    const phase = Math.floor(elapsedMs / interval);
    return phase % 2 === 0 ? color : "off";
  }
  function getStrobeDuration(pattern) {
    return pattern.duration || 3e3;
  }

  // src/shared/patterns/color.js
  function computeColorAt(seat, pattern, elapsedMs) {
    void seat;
    void elapsedMs;
    return pattern.color || "#FFFFFF";
  }
  function computeFlashColor(seat, pattern, elapsedMs) {
    void seat;
    const duration = pattern.duration || 500;
    if (elapsedMs < duration) return pattern.color || "#FFFFFF";
    return null;
  }
  function getFlashDuration(pattern) {
    return pattern.duration || 500;
  }

  // src/shared/patterns/index.js
  function computeSeatColor(seat, grid, pattern, elapsedMs, tableWaveIndex) {
    const enriched = { ...pattern, grid };
    if (pattern.action === "wave" && pattern.direction === "table-order" && tableWaveIndex) {
      enriched.waveStep = tableWaveIndex.get(`${seat.sectionId}:${seat.tableId}`) ?? 0;
    }
    switch (pattern.action) {
      case "color":
        return computeColorAt(seat, enriched, elapsedMs);
      case "off":
        return null;
      case "flash":
        return computeFlashColor(seat, enriched, elapsedMs);
      case "strobe":
        return computeStrobeState(enriched, elapsedMs) === "off" ? null : computeStrobeState(enriched, elapsedMs);
      case "wave":
        return computeWaveColor(seat, grid, enriched, elapsedMs);
      case "sequence":
        return computeSequenceColor(seat, enriched, elapsedMs);
      case "rainbow":
        return computeRainbowColor(seat, grid, enriched);
      default:
        return null;
    }
  }
  function getPatternDuration(pattern, grid) {
    switch (pattern.action) {
      case "strobe":
        return getStrobeDuration(pattern);
      case "flash":
        return getFlashDuration(pattern);
      case "sequence":
        return getSequenceDuration(pattern);
      case "rainbow":
        return pattern.duration || 5e3;
      case "wave": {
        const speed = pattern.speed || 200;
        if (pattern.direction === "table-order") {
          const tableCount = pattern.tableCount || grid.cols;
          return tableCount * speed + speed * 3;
        }
        const steps = pattern.direction === "left-right" || pattern.direction === "right-left" ? grid.cols : grid.rows;
        return steps * speed + speed * 3;
      }
      case "color":
      case "off":
      default:
        return 0;
    }
  }

  // src/shared/layout/waveOrder.js
  function buildTableWaveIndex(layout2) {
    const tables = /* @__PURE__ */ new Map();
    for (const section of layout2.sections) {
      for (const table of section.tables) {
        const key = `${section.id}:${table.id}`;
        if (!tables.has(key)) {
          tables.set(key, { tableRow: table.row, tableCol: table.col, key });
        }
      }
    }
    const sorted = [...tables.values()].sort((a, b) => {
      if (a.tableRow !== b.tableRow) return a.tableRow - b.tableRow;
      return a.tableCol - b.tableCol;
    });
    const indexByKey = /* @__PURE__ */ new Map();
    sorted.forEach((t, i) => indexByKey.set(t.key, i));
    return indexByKey;
  }

  // src/shared/patterns/simulator.js
  var ShowSimulator = class {
    /**
     * @param {ReturnType<import('../layout/parseLayout.js').parseLayout>} layout
     * @param {object} [options]
     */
    constructor(layout2, options = {}) {
      this.layout = layout2;
      this.fillPercent = options.fillPercent ?? 100;
      this.realOccupied = new Set(options.realSeatKeys || []);
      this.tableWaveIndex = buildTableWaveIndex(layout2);
      this._rafId = null;
      this._running = false;
      this.onFrame = options.onFrame || (() => {
      });
    }
    setFillPercent(percent) {
      this.fillPercent = Math.max(0, Math.min(100, percent));
    }
    setRealOccupied(seatKeys) {
      this.realOccupied = new Set(seatKeys);
    }
    /**
     * Asientos activos según fill % (determinístico).
     * @returns {import('../layout/parseLayout.js').ParsedSeat[]}
     */
    getActiveSeats() {
      const total = this.layout.seats.length;
      const count = Math.ceil(this.fillPercent / 100 * total);
      return this.layout.seats.slice(0, count);
    }
    /**
     * @param {object} pattern
     * @param {number} [startTime]
     */
    play(pattern, startTime = Date.now()) {
      this.stop();
      this._running = true;
      const grid = this.layout.grid;
      const enriched = {
        ...pattern,
        grid,
        tableCount: this.tableWaveIndex.size
      };
      const duration = getPatternDuration(enriched, grid) || 5e3;
      const endTime = startTime + duration + 500;
      const tick = () => {
        if (!this._running) return;
        const now = Date.now();
        const elapsed = now - startTime;
        const colors = /* @__PURE__ */ new Map();
        for (const seat of this.getActiveSeats()) {
          const color = computeSeatColor(
            seat,
            grid,
            enriched,
            elapsed,
            this.tableWaveIndex
          );
          colors.set(seat.seatKey, {
            color,
            isReal: this.realOccupied.has(seat.seatKey)
          });
        }
        this.onFrame(colors, elapsed);
        if (now < endTime) {
          this._rafId = requestAnimationFrame(tick);
        } else {
          this._running = false;
          this.onFrame(/* @__PURE__ */ new Map(), elapsed);
        }
      };
      this._rafId = requestAnimationFrame(tick);
    }
    stop() {
      this._running = false;
      if (this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = null;
      }
    }
  };

  // src/client/operator/preview/VenueCanvas.js
  var VenueCanvas = class {
    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
      this.container = container;
      this.layout = null;
      this.connectedKeys = /* @__PURE__ */ new Set();
      this.colors = /* @__PURE__ */ new Map();
      this.onSeatClick = null;
      this.svg = null;
    }
    /**
     * @param {ReturnType<typeof parseLayout>} layout
     */
    setLayout(layout2) {
      this.layout = layout2;
      this.render();
    }
    setConnected(clients) {
      this.connectedKeys = new Set(
        (clients || []).map((c) => c.seatKey).filter(Boolean)
      );
      this.updateSeatStyles();
    }
    /**
     * @param {Map<string, { color: string|null, isReal: boolean }>} colorMap
     */
    applyColors(colorMap) {
      this.colors = colorMap || /* @__PURE__ */ new Map();
      this.updateSeatStyles();
    }
    render() {
      if (!this.layout) return;
      const cellW = 36;
      const cellH = 28;
      const pad = 40;
      const sectionGap = 30;
      let yOffset = pad;
      const parts = [];
      parts.push(
        `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 800 ${this._calcHeight(cellH, pad, sectionGap)}" class="venue-svg">`
      );
      parts.push(
        `<rect x="280" y="10" width="240" height="60" rx="8" fill="#21262d" stroke="#30363d"/>`,
        `<text x="400" y="48" text-anchor="middle" fill="#8b949e" font-size="14">PISTA / ARENA</text>`
      );
      for (const section of this.layout.sections) {
        const maxCol = Math.max(...section.tables.map((t) => t.col), 0);
        const maxRow = Math.max(...section.tables.map((t) => t.row), 0);
        const sectionW = (maxCol + 1) * (cellW + 4) + 20;
        parts.push(
          `<text x="20" y="${yOffset + 14}" fill="#58a6ff" font-size="13" font-weight="600">${section.label}</text>`
        );
        yOffset += 22;
        for (const table of section.tables) {
          const x = 20 + table.col * (cellW + 4);
          const y = yOffset + table.row * (cellH + 4);
          const seats = table.seats;
          for (let s = 0; s < seats; s++) {
            const seatKey = `${section.id}:${table.id}:${s}`;
            const sx = x + s % 3 * 11;
            const sy = y + Math.floor(s / 3) * 11;
            parts.push(
              `<rect class="seat" data-key="${seatKey}" data-section="${section.id}" data-table="${table.id}" data-seat="${s}" x="${sx}" y="${sy}" width="9" height="9" rx="2" fill="#21262d" stroke="#30363d"/>`
            );
          }
          parts.push(
            `<rect class="table-bg" x="${x - 2}" y="${y - 2}" width="${Math.min(seats, 3) * 11 + 4}" height="${Math.ceil(seats / 3) * 11 + 4}" rx="4" fill="none" stroke="#484f58" stroke-dasharray="2"/>`,
            `<text x="${x}" y="${y - 6}" fill="#484f58" font-size="9">${table.label || table.id}</text>`
          );
        }
        yOffset += (maxRow + 1) * (cellH + 4) + sectionGap;
      }
      parts.push("</svg>");
      this.container.innerHTML = parts.join("\n");
      this.svg = this.container.querySelector("svg");
      this.container.querySelectorAll(".seat").forEach((el) => {
        el.addEventListener("click", () => {
          if (this.onSeatClick) {
            this.onSeatClick({
              sectionId: el.dataset.section,
              tableId: el.dataset.table,
              seatIndex: parseInt(el.dataset.seat, 10),
              seatKey: el.dataset.key
            });
          }
        });
      });
      this.updateSeatStyles();
    }
    _calcHeight(cellH, pad, sectionGap) {
      let h = 100 + pad;
      for (const section of this.layout.sections) {
        const maxRow = Math.max(...section.tables.map((t) => t.row), 0);
        h += 22 + (maxRow + 1) * (cellH + 4) + sectionGap;
      }
      return Math.max(h, 400);
    }
    updateSeatStyles() {
      if (!this.container) return;
      this.container.querySelectorAll(".seat").forEach((el) => {
        const key = el.dataset.key;
        const colorData = this.colors.get(key);
        const isConnected = this.connectedKeys.has(key);
        if (colorData?.color) {
          el.setAttribute("fill", colorData.color);
          el.setAttribute("stroke", colorData.color);
        } else if (isConnected) {
          el.setAttribute("fill", "#238636");
          el.setAttribute("stroke", "#3fb950");
        } else if (colorData && !colorData.isReal) {
          el.setAttribute("fill", "#484f58");
          el.setAttribute("stroke", "#6e7681");
        } else {
          el.setAttribute("fill", "#21262d");
          el.setAttribute("stroke", "#30363d");
        }
      });
    }
  };

  // src/client/operator/preview/FillControls.js
  var FillControls = class {
    /**
     * @param {object} options
     * @param {(percent: number) => void} options.onFillChange
     * @param {(enabled: boolean) => void} options.onDryRunChange
     */
    constructor({ fillSlider, dryRunToggle, onFillChange, onDryRunChange }) {
      this.fillSlider = fillSlider;
      this.dryRunToggle = dryRunToggle;
      this.onFillChange = onFillChange;
      this.onDryRunChange = onDryRunChange;
      if (fillSlider) {
        fillSlider.addEventListener("input", () => {
          onFillChange(parseInt(fillSlider.value, 10));
        });
      }
      if (dryRunToggle) {
        dryRunToggle.addEventListener("change", () => {
          onDryRunChange(dryRunToggle.checked);
        });
      }
    }
    getFillPercent() {
      return parseInt(this.fillSlider?.value || "100", 10);
    }
    isDryRun() {
      return !!this.dryRunToggle?.checked;
    }
  };

  // src/client/operator/main.js
  var socket;
  var eventId = "hipico-demo";
  var layout = null;
  var connectedClients = [];
  var simulator = null;
  var dryRun = true;
  var fillPercent = 100;
  var PRESETS = [
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF6600",
    "#9B59B6",
    "#007AFF",
    "#006847",
    "#CE1126",
    "#1a472a",
    "#58a6ff"
  ];
  var venueCanvas = new VenueCanvas(document.getElementById("venueCanvas"));
  function addLog(msg) {
    const log = document.getElementById("log");
    const time = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    log.innerHTML += `<div><span style="color:#484f58">${time}</span> ${msg}</div>`;
    log.scrollTop = log.scrollHeight;
  }
  function updateQr() {
    const url = `${window.location.origin}/?event=${eventId}`;
    document.getElementById("qrUrl").textContent = url;
    drawQr(url);
  }
  function drawQr(text) {
    const canvas = document.getElementById("qrCanvas");
    const ctx = canvas.getContext("2d");
    const size = 160;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    const modules = encodeQrSimple(text);
    const moduleSize = Math.floor(size / modules.length);
    ctx.fillStyle = "#000000";
    for (let r = 0; r < modules.length; r++) {
      for (let c = 0; c < modules[r].length; c++) {
        if (modules[r][c]) {
          ctx.fillRect(c * moduleSize, r * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }
  function encodeQrSimple(text) {
    const n = 21;
    const grid = Array.from({ length: n }, () => Array(n).fill(false));
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const r = (code * 7 + i * 3) % n;
      const c = (code * 11 + i * 5) % n;
      grid[r][c] = true;
      grid[(r + 3) % n][(c + 5) % n] = true;
    }
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        grid[i][j] = true;
        grid[i][n - 1 - j] = true;
        grid[n - 1 - i][j] = true;
      }
    }
    return grid;
  }
  async function createEvent(id, presetId) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: id, presetId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error creando evento");
    }
    return parseLayout((await res.json()).layout);
  }
  function initSimulator() {
    if (simulator) simulator.stop();
    simulator = new ShowSimulator(layout, {
      fillPercent,
      realSeatKeys: connectedClients.map((c) => c.seatKey),
      onFrame: (colors) => venueCanvas.applyColors(colors)
    });
  }
  function triggerPattern(pattern) {
    if (!layout) return;
    pattern.grid = layout.grid;
    if (dryRun && simulator) {
      simulator.setFillPercent(fillPercent);
      simulator.setRealOccupied(connectedClients.map((c) => c.seatKey));
      simulator.play(pattern);
      addLog(`Preview: ${pattern.name || pattern.action}`);
      return;
    }
    socket.emit("trigger_pattern", {
      eventId,
      pattern,
      dryRun: false
    });
    if (simulator) {
      simulator.setFillPercent(fillPercent);
      simulator.setRealOccupied(connectedClients.map((c) => c.seatKey));
      simulator.play(pattern);
    }
    addLog(`Enviado: ${pattern.name || pattern.action}`);
  }
  function buildPatterns() {
    const grid = layout?.grid || { rows: 6, cols: 80 };
    const presets = buildPresetPatterns(grid);
    const color = document.getElementById("colorPicker").value;
    return {
      strobe: {
        action: "strobe",
        name: "Estroboscopio",
        interval: 150,
        duration: 3e3,
        color
      },
      "wave-lr": {
        action: "wave",
        name: "Ola \u2192",
        direction: "left-right",
        speed: 200,
        color
      },
      "wave-table": {
        action: "wave",
        name: "Ola orden f\xEDsico",
        direction: "table-order",
        speed: 250,
        color,
        tableCount: layout?.sections.reduce((s, sec) => s + sec.tables.length, 0)
      },
      rainbow: {
        action: "rainbow",
        name: "Arco\xEDris",
        duration: 5e3
      },
      heartbeat: presets.heartbeat,
      flag: presets.flagMexico,
      fire: presets.fire,
      countdown: presets.countdown
    };
  }
  function connectOps() {
    eventId = document.getElementById("eventIdInput").value || "hipico-demo";
    const presetId = document.getElementById("presetSelect").value;
    document.getElementById("currentEvent").textContent = eventId;
    updateQr();
    createEvent(eventId, presetId).then((l) => {
      layout = l;
      document.getElementById("layoutJson").value = JSON.stringify(
        {
          eventId: layout.eventId,
          name: layout.name,
          branding: layout.branding,
          sections: layout.sections
        },
        null,
        2
      );
      venueCanvas.setLayout(layout);
      initSimulator();
    }).catch((err) => addLog("Error: " + err.message));
    if (socket) socket.disconnect();
    socket = io();
    socket.on("connect", () => {
      socket.emit("join_ops", { eventId });
      addLog("Operador conectado");
    });
    socket.on("ops_ready", (data) => {
      if (data.layout) {
        layout = parseLayout(data.layout);
        venueCanvas.setLayout(layout);
        initSimulator();
      }
      connectedClients = data.clients || [];
      document.getElementById("participantCount").textContent = data.participantCount;
      document.getElementById("coveragePercent").textContent = `${data.coverage?.percent ?? 0}%`;
      venueCanvas.setConnected(connectedClients);
      addLog(`${data.participantCount} participantes`);
    });
    socket.on("participant_update", (data) => {
      connectedClients = data.clients || [];
      document.getElementById("participantCount").textContent = data.count;
      document.getElementById("coveragePercent").textContent = `${data.coverage?.percent ?? 0}%`;
      venueCanvas.setConnected(connectedClients);
      if (simulator) {
        simulator.setRealOccupied(connectedClients.map((c) => c.seatKey));
      }
    });
    socket.on("pattern_sent", (data) => {
      addLog(`Broadcast: ${data.name || data.action}`);
    });
  }
  function buildPresetColors() {
    const container = document.getElementById("presetColors");
    PRESETS.forEach((color) => {
      const el = document.createElement("div");
      el.className = "preset-color";
      el.style.background = color;
      el.onclick = () => {
        document.getElementById("colorPicker").value = color;
        triggerPattern({ action: "color", color, name: `Color ${color}` });
      };
      container.appendChild(el);
    });
  }
  document.getElementById("connectBtn").onclick = connectOps;
  document.getElementById("applyColorBtn").onclick = () => {
    triggerPattern({
      action: "color",
      color: document.getElementById("colorPicker").value,
      name: "Color s\xF3lido"
    });
  };
  document.getElementById("offBtn").onclick = () => {
    triggerPattern({ action: "off", name: "Off" });
    venueCanvas.applyColors(/* @__PURE__ */ new Map());
  };
  document.querySelectorAll("[data-pattern]").forEach((btn) => {
    btn.onclick = () => {
      const patterns = buildPatterns();
      triggerPattern(patterns[btn.dataset.pattern]);
    };
  });
  new FillControls({
    fillSlider: document.getElementById("fillSlider"),
    dryRunToggle: document.getElementById("dryRunToggle"),
    onFillChange: (percent) => {
      fillPercent = percent;
      document.getElementById("fillLabel").textContent = `${percent}%`;
      if (simulator) simulator.setFillPercent(percent);
    },
    onDryRunChange: (enabled) => {
      dryRun = enabled;
      addLog(enabled ? "Dry-run ON" : "Dry-run OFF \u2014 env\xEDo directo");
    }
  });
  document.getElementById("exportLayoutBtn").onclick = () => {
    if (!layout) return;
    const json = JSON.stringify(
      {
        eventId: layout.eventId,
        name: layout.name,
        branding: layout.branding,
        sections: layout.sections
      },
      null,
      2
    );
    document.getElementById("layoutJson").value = json;
    addLog("Layout exportado al editor");
  };
  document.getElementById("importLayoutBtn").onclick = async () => {
    try {
      const raw = JSON.parse(document.getElementById("layoutJson").value);
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, layout: raw })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      layout = parseLayout(data.layout);
      venueCanvas.setLayout(layout);
      initSimulator();
      addLog("Layout importado");
      connectOps();
    } catch (err) {
      addLog("Import error: " + err.message);
    }
  };
  venueCanvas.onSeatClick = ({ sectionId, tableId, seatIndex }) => {
    const color = document.getElementById("colorPicker").value;
    socket?.emit("set_pixel", {
      eventId,
      sectionId,
      tableId,
      seatIndex,
      color
    });
    addLog(`Pixel ${sectionId}/${tableId}/${seatIndex + 1}`);
  };
  buildPresetColors();
  connectOps();
})();

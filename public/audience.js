(() => {
  // src/shared/sync/clock.js
  function computeClockOffset(samples) {
    if (!samples.length) return 0;
    const sorted = [...samples].sort((a, b) => a.rtt - b.rtt);
    const best = sorted.slice(0, Math.min(4, sorted.length));
    return best.reduce((sum, s) => sum + s.offset, 0) / best.length;
  }
  async function syncClockWithSocket(socket2, rounds = 8) {
    const samples = [];
    for (let i = 0; i < rounds; i++) {
      const t1 = performance.now();
      const result = await new Promise((resolve) => {
        socket2.emit("time_ping", {}, resolve);
      });
      const t4 = performance.now();
      const rtt = t4 - t1;
      samples.push({
        offset: result.serverTime - Date.now() - rtt / 2,
        rtt
      });
      await new Promise((r) => setTimeout(r, 100));
    }
    return computeClockOffset(samples);
  }
  async function waitUntilExecute(executeAt, clockOffset2) {
    const delay = executeAt + clockOffset2 - Date.now();
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // src/shared/patterns/rainbow.js
  function computeRainbowColor(seat, grid, pattern) {
    const hue = (seat.col / Math.max(grid.cols, 1) * 360 + seat.row / Math.max(grid.rows, 1) * 30) % 360;
    return `hsl(${hue}, 100%, 50%)`;
  }

  // src/shared/patterns/wave.js
  async function executeWave(seat, pattern, { showColor: showColor2, hideColor: hideColor2 }) {
    const grid = pattern.grid || { rows: 6, cols: 8 };
    const { direction = "left-right", speed = 200, color = "#007AFF" } = pattern;
    let steps;
    if (direction === "left-right") steps = seat.col;
    else if (direction === "right-left") steps = grid.cols - 1 - seat.col;
    else if (direction === "top-bottom") steps = seat.row;
    else if (direction === "bottom-top") steps = grid.rows - 1 - seat.row;
    else if (direction === "table-order") steps = pattern.waveStep ?? 0;
    else steps = seat.col;
    await new Promise((r) => setTimeout(r, steps * speed));
    showColor2(color);
    await new Promise((r) => setTimeout(r, speed * 3));
    hideColor2();
  }

  // src/shared/patterns/sequence.js
  async function executeSequence(seat, pattern, { showColor: showColor2, hideColor: hideColor2 }) {
    const { frames = [], intervalMs = 500 } = pattern;
    for (const frame of frames) {
      if (frame.all) {
        showColor2(frame.all);
      } else if (frame.cells) {
        const cell = frame.cells.find(
          (c) => c[0] === seat.row && c[1] === seat.col
        );
        if (cell) showColor2(cell[2]);
        else hideColor2();
      }
      await new Promise(
        (r) => setTimeout(r, frame.intervalMs ?? intervalMs)
      );
    }
    hideColor2();
  }

  // src/shared/patterns/strobe.js
  async function executeStrobe(pattern, { showColor: showColor2, hideColor: hideColor2 }) {
    const interval = pattern.interval || 150;
    const duration = pattern.duration || 3e3;
    const color = pattern.color || "#FFFFFF";
    const start = Date.now();
    while (Date.now() - start < duration) {
      showColor2(color);
      await new Promise((r) => setTimeout(r, interval));
      hideColor2();
      await new Promise((r) => setTimeout(r, interval));
    }
    hideColor2();
  }

  // src/shared/patterns/color.js
  async function executeFlash(pattern, { showColor: showColor2, hideColor: hideColor2 }) {
    showColor2(pattern.color || "#FFFFFF");
    await new Promise((r) => setTimeout(r, pattern.duration || 500));
    hideColor2();
  }

  // src/shared/patterns/index.js
  async function executePattern(seat, pattern, clockOffset2, callbacks) {
    if (pattern.executeAt) {
      await waitUntilExecute(pattern.executeAt, clockOffset2);
    }
    const ctx = { ...callbacks, seat, grid: pattern.grid };
    switch (pattern.action) {
      case "color":
        callbacks.showColor(pattern.color || "#FFFFFF");
        break;
      case "off":
        callbacks.hideColor();
        break;
      case "flash":
        await executeFlash(pattern, callbacks);
        break;
      case "strobe":
        await executeStrobe(pattern, callbacks);
        break;
      case "wave":
        await executeWave(seat, pattern, callbacks);
        break;
      case "sequence":
        await executeSequence(seat, pattern, callbacks);
        break;
      case "rainbow":
        callbacks.showColor(computeRainbowColor(seat, pattern.grid, pattern));
        await new Promise((r) => setTimeout(r, pattern.duration || 5e3));
        callbacks.hideColor();
        break;
      default:
        break;
    }
    return ctx;
  }

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

  // src/client/audience/main.js
  var params = new URLSearchParams(window.location.search);
  var eventId = params.get("event") || "hipico-demo";
  var socket;
  var layout;
  var clockOffset = 0;
  var mySeat = null;
  var sessionToken = localStorage.getItem(`sl_token_${eventId}`);
  var selectedSection = null;
  var selectedTable = null;
  var occupancy = /* @__PURE__ */ new Set();
  var screens = {
    welcome: document.getElementById("welcomeScreen"),
    section: document.getElementById("sectionScreen"),
    table: document.getElementById("tableScreen"),
    seat: document.getElementById("seatScreen"),
    waiting: document.getElementById("waitingScreen")
  };
  function showScreen(name) {
    Object.values(screens).forEach((el) => el.classList.remove("active"));
    if (screens[name]) screens[name].classList.add("active");
  }
  async function loadLayout() {
    const res = await fetch(`/api/layout/${eventId}`);
    if (!res.ok) throw new Error("No se pudo cargar el evento");
    layout = parseLayout(await res.json());
    if (layout.branding?.primaryColor) {
      document.querySelector('meta[name="theme-color"]').content = layout.branding.primaryColor;
    }
  }
  function renderSections() {
    const list = document.getElementById("sectionList");
    list.innerHTML = "";
    for (const section of layout.sections) {
      const btn = document.createElement("button");
      btn.className = "section-btn";
      btn.textContent = `${section.label} (${section.tables.length} mesas)`;
      btn.onclick = () => {
        selectedSection = section;
        renderTables();
        showScreen("table");
      };
      list.appendChild(btn);
    }
  }
  function renderTables() {
    document.getElementById("tableScreenTitle").textContent = selectedSection.label;
    const map = document.getElementById("tableMap");
    map.innerHTML = "";
    const maxCol = Math.max(...selectedSection.tables.map((t) => t.col), 0) + 1;
    map.style.gridTemplateColumns = `repeat(${Math.min(maxCol, 4)}, 1fr)`;
    for (const table of selectedSection.tables) {
      const cell = document.createElement("button");
      cell.className = "table-cell";
      cell.textContent = table.label || table.id;
      const fullyOccupied = isTableFull(selectedSection.id, table);
      if (fullyOccupied) cell.classList.add("occupied");
      cell.onclick = () => {
        if (fullyOccupied) return;
        selectedTable = table;
        renderSeats();
        showScreen("seat");
      };
      map.appendChild(cell);
    }
  }
  function isTableFull(sectionId, table) {
    for (let i = 0; i < table.seats; i++) {
      if (!occupancy.has(`${sectionId}:${table.id}:${i}`)) return false;
    }
    return true;
  }
  function renderSeats() {
    document.getElementById("seatScreenTitle").textContent = `${selectedTable.label || selectedTable.id}`;
    const picker = document.getElementById("seatPicker");
    picker.innerHTML = "";
    document.getElementById("joinError").style.display = "none";
    for (let i = 0; i < selectedTable.seats; i++) {
      const key = `${selectedSection.id}:${selectedTable.id}:${i}`;
      const btn = document.createElement("button");
      btn.className = "seat-btn";
      btn.textContent = i + 1;
      if (occupancy.has(key)) btn.classList.add("occupied");
      btn.onclick = () => joinSeat(i);
      picker.appendChild(btn);
    }
  }
  function connectSocket() {
    socket = io({ reconnection: true, reconnectionDelay: 1e3 });
    socket.on("connect", async () => {
      document.getElementById("infoOverlay").textContent = "\u{1F7E2} Conectado";
      clockOffset = await syncClockWithSocket(socket);
      socket.emit("get_occupancy", { eventId });
      if (sessionToken) {
        tryReconnect();
      }
    });
    socket.on("disconnect", () => {
      document.getElementById("infoOverlay").textContent = "\u{1F534} Desconectado";
    });
    socket.on("occupancy_update", (data) => {
      occupancy = new Set((data.occupancy || []).map((o) => o.seatKey));
      if (screens.seat.classList.contains("active")) renderSeats();
      if (screens.table.classList.contains("active")) renderTables();
    });
    socket.on("join_error", (data) => {
      const err = document.getElementById("joinError");
      err.textContent = data.error || "Error al unirse";
      err.style.display = "block";
      sessionToken = null;
      localStorage.removeItem(`sl_token_${eventId}`);
    });
    socket.on("joined", (data) => {
      mySeat = data;
      sessionToken = data.sessionToken;
      localStorage.setItem(`sl_token_${eventId}`, sessionToken);
      showScreen("waiting");
      document.getElementById("positionBadge").textContent = data.label;
      document.getElementById("statusText").textContent = `${data.participantCount} participantes conectados`;
      requestWakeLock();
    });
    socket.on("pattern", (data) => {
      runPattern(data);
    });
    socket.on("pixel", (data) => {
      showColor(data.color);
    });
  }
  function tryReconnect() {
    socket.emit("join_event", {
      eventId,
      sessionToken
    });
  }
  function joinSeat(seatIndex) {
    socket.emit("join_event", {
      eventId,
      sectionId: selectedSection.id,
      tableId: selectedTable.id,
      seatIndex
    });
  }
  function autoJoinSeat() {
    socket.emit("join_event", {
      eventId,
      sectionId: selectedSection.id,
      tableId: selectedTable.id,
      autoAssignSeat: true
    });
  }
  async function runPattern(pattern) {
    const seat = {
      sectionId: mySeat.sectionId,
      tableId: mySeat.tableId,
      seatIndex: mySeat.seatIndex,
      row: mySeat.row,
      col: mySeat.col,
      seatKey: mySeat.seatKey
    };
    const enriched = { ...pattern, grid: layout?.grid || pattern.grid };
    if (pattern.action === "wave" && pattern.direction === "table-order" && layout) {
      const waveIndex = buildTableWaveIndex(layout);
      enriched.waveStep = waveIndex.get(`${seat.sectionId}:${seat.tableId}`) ?? 0;
    }
    await executePattern(seat, enriched, clockOffset, { showColor, hideColor });
  }
  function showColor(color) {
    const show = document.getElementById("showScreen");
    show.style.display = "block";
    show.style.backgroundColor = color;
    document.querySelector('meta[name="theme-color"]').content = color;
  }
  function hideColor() {
    document.getElementById("showScreen").style.display = "none";
    const brand = layout?.branding?.primaryColor || "#1a472a";
    document.querySelector('meta[name="theme-color"]').content = brand;
  }
  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        await navigator.wakeLock.request("screen");
      }
    } catch {
    }
  }
  document.getElementById("startBtn").onclick = () => {
    renderSections();
    showScreen("section");
  };
  document.getElementById("autoSeatBtn").onclick = autoJoinSeat;
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.onclick = () => showScreen(btn.dataset.back);
  });
  async function init() {
    try {
      await loadLayout();
      connectSocket();
    } catch (err) {
      document.getElementById("infoOverlay").textContent = "\u274C " + err.message;
    }
  }
  init();
})();

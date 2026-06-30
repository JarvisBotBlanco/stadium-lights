/**
 * Calcula offset de reloj estilo NTP a partir de muestras RTT.
 * @param {Array<{ offset: number, rtt: number }>} samples
 * @returns {number}
 */
export function computeClockOffset(samples) {
  if (!samples.length) return 0;
  const sorted = [...samples].sort((a, b) => a.rtt - b.rtt);
  const best = sorted.slice(0, Math.min(4, sorted.length));
  return best.reduce((sum, s) => sum + s.offset, 0) / best.length;
}

/**
 * Sincroniza reloj contra un socket con evento time_ping.
 * @param {{ emit: Function }} socket
 * @param {number} [rounds=8]
 * @returns {Promise<number>}
 */
export async function syncClockWithSocket(socket, rounds = 8) {
  const samples = [];
  for (let i = 0; i < rounds; i++) {
    const t1 = performance.now();
    const result = await new Promise((resolve) => {
      socket.emit('time_ping', {}, resolve);
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

/**
 * Espera hasta executeAt ajustado por clockOffset.
 * @param {number} executeAt
 * @param {number} clockOffset
 */
export async function waitUntilExecute(executeAt, clockOffset) {
  const delay = executeAt + clockOffset - Date.now();
  if (delay > 0) {
    await new Promise((r) => setTimeout(r, delay));
  }
}

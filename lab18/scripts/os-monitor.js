const os = require('os');
const fs = require('fs');

const group = 'ББМО-01-23';
let warningsCount = 0;

function getCpuInfo() {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  for (const cpu of cpus) {
    user += cpu.times.user; nice += cpu.times.nice; sys += cpu.times.sys;
    idle += cpu.times.idle; irq += cpu.times.irq;
  }
  return { user, nice, sys, idle, irq, total: user + nice + sys + idle + irq };
}

function logWarning(msg) {
  warningsCount++;
  const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const line = `[${time}] [${group}] Предупреждение: ${msg}\n`;
  fs.appendFileSync('monitor.log', line);
  console.log(`\n⚠ ${msg}`);
}

console.log(`Мониторинг (группа ${group}). Ctrl+C для выхода.`);

let prevCpu = getCpuInfo();

const interval = setInterval(() => {
  const currentCpu = getCpuInfo();
  const totalDiff = currentCpu.total - prevCpu.total;
  const idleDiff = currentCpu.idle - prevCpu.idle;
  const busyDiff = totalDiff - idleDiff;
  
  const cpuPercent = (busyDiff / totalDiff) * 100;
  const freeMem = os.freemem() / (1024 ** 3);
  const totalMem = os.totalmem() / (1024 ** 3);
  const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;

  process.stdout.write(`\rCPU: ${cpuPercent.toFixed(1)}% | RAM: ${usedMemPercent.toFixed(1)}% (${freeMem.toFixed(2)} ГБ свободно)    `);

  if (cpuPercent > 80) logWarning(`Критическая загрузка CPU: ${cpuPercent.toFixed(1)}%`);
  else if (cpuPercent > 50) logWarning(`Высокая загрузка CPU: ${cpuPercent.toFixed(1)}%`);

  if (freeMem < totalMem * 0.1) logWarning(`Мало свободной памяти: ${freeMem.toFixed(2)} ГБ`);

  prevCpu = currentCpu;
}, 2000);

process.on('SIGINT', () => {
  clearInterval(interval);
  console.log(`\nМониторинг остановлен. Предупреждений: ${warningsCount}`);
  process.exit(0);
});
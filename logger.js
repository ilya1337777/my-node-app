const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'logs.txt');


function formatLogEntry(event, data) {
  const timestamp = new Date().toISOString();
  const payload = data === undefined ? '' : JSON.stringify(data);
  return `[${timestamp}] ${event}: ${payload}\n`;
}

function writeLog(event, data) {
  const line = formatLogEntry(event, data);

  fs.appendFile(LOG_FILE, line, 'utf8', (err) => {
    if (err) {
      console.error('❌ Ошибка записи в лог:', err.message);
    }
  });
}

function setupLogger(app) {
  app.on('server:started', (port) => {
    writeLog('server:started', { port });
  });

  app.on('request:received', (req) => {
    writeLog('request:received', { method: req.method, url: req.url });
  });


  app.on('server:stopped', () => {
    writeLog('server:stopped', {});
  });
}

module.exports = { setupLogger };
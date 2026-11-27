const http = require('http');
const fs = require('fs');
const path = require('path');

const group = 'ББМО-01-23';
const metrics = { total: 0, byMethod: {}, byStatus: {} };
const logStream = fs.createWriteStream('access.log', { flags: 'a' });

function log(req, status) {
  const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const line = `[${time}] [${group}] ${req.method} ${req.url} ${status}\n`;
  logStream.write(line);
  console.log(line.trim());
  
  metrics.total++;
  metrics.byMethod[req.method] = (metrics.byMethod[req.method] || 0) + 1;
  metrics.byStatus[status] = (metrics.byStatus[status] || 0) + 1;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  res.setHeader('X-Group', encodeURIComponent(group));

  if (pathname === '/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ group, ...metrics, uptime: process.uptime() }, null, 2));
    return log(req, 200);
  }

  if (pathname === '/stream') {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    const stream = fs.createReadStream(__filename);
    stream.pipe(res);
    return log(req, 200);
  }

  if (pathname.startsWith('/static/')) {
    let filePath = path.join(__dirname, 'public', pathname.replace('/static/', ''));
    
    if (!filePath.startsWith(path.join(__dirname, 'public'))) {
      res.writeHead(403); res.end('403 Forbidden');
      return log(req, 403);
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404); res.end('404 Not Found');
        return log(req, 404);
      }
      
      const ext = path.extname(filePath);
      const mime = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : 'text/plain';
      
      res.writeHead(200, { 
        'Content-Type': mime + '; charset=utf-8',
        'Cache-Control': 'max-age=60' 
      });
      res.end(data);
      log(req, 200);
    });
    return;
  }

  res.writeHead(404); res.end('Not Found');
  log(req, 404);
});

server.listen(3000, () => {
  console.log(`[INFO] HTTP-сервер запущен на порту 3000`);
  console.log(`[INFO] Группа: ${group}`);
});
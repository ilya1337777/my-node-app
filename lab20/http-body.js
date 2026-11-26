const http = require('http');
const querystring = require('querystring');
const MAX_BODY_SIZE = 1024 * 1024;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && (req.url === '/echo' || req.url === '/form')) {
    let body = ''; let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        res.writeHead(413, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('413 Payload Too Large'); req.destroy(); return;
      }
      body += chunk.toString();
    });
    req.on('end', () => {
      if (size > MAX_BODY_SIZE) return;
      console.log(`Размер тела: ${size} байт`);
      const contentType = req.headers['content-type'] || '';
      if (req.url === '/echo') {
        if (contentType.includes('application/json')) {
          try {
            const json = JSON.parse(body);
            json.group = 'ББМО-01-23';
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(json, null, 2));
          } catch (e) { res.writeHead(400); res.end('Invalid JSON'); }
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(body);
        }
      } else if (req.url === '/form') {
        const parsed = querystring.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(parsed, null, 2));
      }
    });
  } else { res.writeHead(404); res.end('Not Found'); }
});

server.listen(3002, () => console.log('Сервер тела на порту 3002'));
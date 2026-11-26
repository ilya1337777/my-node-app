const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/headers' && req.method === 'GET') {
    const responseData = { headers: req.headers, method: req.method, url: req.url, httpVersion: req.httpVersion };
    res.writeHead(200, { 
      'Content-Type': 'application/json; charset=utf-8', 
      'X-Powered-By': 'Node.js', 
      'X-Group': encodeURIComponent('ББМО-01-23') 
    });
    res.end(JSON.stringify(responseData, null, 2));
  } else if (req.url === '/headers/set' && req.method === 'GET') {
    res.setHeader('X-Powered-By', 'Node.js');
    res.setHeader('X-Group', encodeURIComponent('ББМО-01-23'));
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.writeHead(200);
    res.end('<h1>Заголовки установлены</h1>');
  } else if (req.url === '/headers/check' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Group', encodeURIComponent('ББМО-01-23'));
    res.writeHead(200);
    res.end(JSON.stringify({ 
      hasContentType: res.hasHeader('Content-Type'), 
      hasXGroup: res.hasHeader('X-Group'), 
      hasUnknown: res.hasHeader('X-Unknown') 
    }, null, 2));
  } else {
    res.writeHead(404); res.end('Not Found');
  }
});

server.listen(3001, () => console.log('Сервер заголовков на порту 3001'));
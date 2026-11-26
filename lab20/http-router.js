const http = require('http');
const url = require('url');

let students = [
  { id: 1, name: 'Иван', group: 'ББМО-01-23' },
  { id: 2, name: 'Мария', group: 'ББМО-01-23' }
];

const routes = [
  { method: 'GET', pattern: /^\/api\/students$/, handler: getStudents },
  { method: 'GET', pattern: /^\/api\/students\/(\d+)$/, handler: getStudent },
  { method: 'POST', pattern: /^\/api\/students$/, handler: createStudent },
  { method: 'PUT', pattern: /^\/api\/students\/(\d+)$/, handler: updateStudent },
  { method: 'DELETE', pattern: /^\/api\/students\/(\d+)$/, handler: deleteStudent }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  let matchedRoute = null;
  let routeParams = [];

  for (const route of routes) {
    const match = path.match(route.pattern);
    if (match) {
      if (route.method === req.method) { matchedRoute = route; routeParams = match.slice(1); break; }
    }
  }

  if (matchedRoute) { matchedRoute.handler(req, res, routeParams, parsedUrl.query); }
  else {
    let pathExists = routes.some(r => path.match(r.pattern));
    if (pathExists) { res.writeHead(405); res.end('405 Method Not Allowed'); }
    else { res.writeHead(404); res.end('404 Not Found'); }
  }
});

function getStudents(req, res, params, query) {
  let result = students;
  if (query.group) result = result.filter(s => s.group === query.group);
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(result, null, 2));
}
function getStudent(req, res, params) {
  const id = parseInt(params[0]);
  const student = students.find(s => s.id === id);
  if (student) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(student, null, 2)); }
  else { res.writeHead(404); res.end('Not Found'); }
}
function createStudent(req, res) {
  let body = ''; req.on('data', c => body += c);
  req.on('end', () => {
    const newStudent = JSON.parse(body); newStudent.id = students.length + 1; students.push(newStudent);
    res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(newStudent, null, 2));
  });
}
function updateStudent(req, res, params) {
  const id = parseInt(params[0]); let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    const updateData = JSON.parse(body);
    const student = students.find(s => s.id === id);
    if (student) { Object.assign(student, updateData); res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(student, null, 2)); }
    else { res.writeHead(404); res.end('Not Found'); }
  });
}
function deleteStudent(req, res, params) {
  const id = parseInt(params[0]);
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) { students.splice(index, 1); res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ deleted: true, id }, null, 2)); }
  else { res.writeHead(404); res.end('Not Found'); }
}

server.listen(3003, () => console.log('Сервер REST API на порту 3003'));
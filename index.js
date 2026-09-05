const http = require('http'); 

let pi = 0;
for (let i = 1; i <= 500; i++) {
    let n = i * 2;
    let term = 4 / (n * (n + 1) * (n + 2));
    if (i % 2 === 1) {
        pi += term;
    } else {
        pi -= term;
    }
}
pi = 3 + pi;


const journalNumber = 5; 
const factor = Math.pow(10, journalNumber);
const roundedPi = Math.round(pi * factor) / factor;

const server = http.createServer((req, res) => {
    
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    
   
    res.write("Иванов Иван Иванович\n");
    res.write("Группа ИСП-311\n");
    res.write("Число ПИ: " + roundedPi + "\n");
    
    res.end(); 
});

server.listen(3000, () => {
    console.log("Сервер успешно запущен в вебе на http://localhost:3000");
});

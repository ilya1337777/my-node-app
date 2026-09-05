console.log("Романюк Илья Сергеевич"); 
console.log("401"); 
let pi = 0;
for (let i = 0; i < 2000000; i++) {
    pi += (Math.pow(-1, i)) / (2 * i + 1);
}
pi = pi * 4;

console.log("Число ПИ: " + pi);

// ขั้นที่ 1: Import Express
const express = require('express'); // เติมให้ถูก

// ขั้นที่ 2: สร้าง app  
const app = express(); // เติมให้ถูก

// ขั้นที่ 3: กำหนด PORT
const PORT = 3001;

// ขั้นที่ 4: สร้าง route แรก
app.get('/', (req, res) => {
    res.send("<h1>Hello Agent Wallboard!</h1>");
}); // เติม method และ response function

// ขั้นที่ 5: เริ่ม server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
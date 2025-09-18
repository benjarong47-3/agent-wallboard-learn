// ขั้นที่ 1: Import Express
const express = require('express'); // เติมให้ถูก
const app = express(); // เติมให้ถูก

// Agent data (Step 2.1)
const agents = [
    {
        code: "A001",
        name: "John Doe",
        status: "Available",
        team: "Sales",
        lastActive: new Date().toISOString(),
    },
    {
        code: "A002",
        name: "Maria Chan",
        status: "Busy",
        team: "Support",
        lastActive: new Date().toISOString(),
    },
    {
        code: "A003",
        name: "Lee Wong",
        status: "Offline",
        team: "Retention",
        lastActive: new Date().toISOString(),
    }
];

// ขั้นที่ 3: กำหนด PORT
const PORT = 3001;

// ขั้นที่ 4: สร้าง route แรก
app.get('/', (req, res) => {
    res.send("<h1>Hello Agent Wallboard!</h1>");
}); // เติม method และ response function

// เพิ่ม route /health
app.get('/health', (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

// เพิ่ม route /agents คืนค่า agents array
app.get('/agents', (req, res) => {
    res.json(agents);
});

// เพิ่ม API route /api/agents 
app.get('/api/agents', (req, res) => {
    res.json({
        success: true,
        data: agents,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});

// เพิ่ม route /api/agents/count
app.get('/api/agents/count', (req, res) => {
    res.json({
        success: true,
        count: agents.length,
        timestamp: new Date().toISOString()
    });
});

// ขั้นที่ 5: เริ่ม server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
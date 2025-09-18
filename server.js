// ขั้นที่ 1: Import Express
const express = require('express'); // เติมให้ถูก
const cors = require('cors'); // เพิ่ม CORS
const app = express(); // เติมให้ถูก

// เพิ่ม CORS middleware
app.use(cors());

// เพิ่ม JSON middleware (สำคัญมาก)
app.use(express.json());

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

// ขั้นที่ 2: สร้าง route structure
// ย้าย logic ปรับสถานะมาเป็นฟังก์ชัน แล้วแมปทั้ง PUT และ PATCH
function handleStatusChange(req, res) {
    // Step 1: ดึง agent code จาก URL
    const agentCode = req.params.code; // เติม

    // หา agent ในระบบ ก่อนอ่าน body เพื่อให้กรณี agent ไม่พบ ส่ง 404 ได้ทันที
    const agent = agents.find(a => a.code === agentCode);
    if (!agent) {
        return res.status(404).json({
            success: false,
            error: "Agent not found",
            timestamp: new Date().toISOString()
        });
    }

    // Step 2: ดึง status ใหม่จาก body (รองรับกรณี req.body เป็น undefined)
    const newStatus = (req.body || {}).status;

    // Validation: ตรวจสอบว่ามี status มาหรือไม่
    if (!newStatus) {
        return res.status(400).json({
            success: false,
            error: "Missing 'status' in request body",
            timestamp: new Date().toISOString()
        });
    }

    // ตรวจสอบ valid statuses
    const validStatuses = ["Available", "Active", "Wrap Up", "Not Ready", "Busy", "Offline"];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            error: "Invalid status",
            validStatuses,
            timestamp: new Date().toISOString()
        });
    }

    // Workflow: กำหนด allowed transitions (จาก -> ไปได้)
    const allowed = {
        "Available": ["Active", "Not Ready", "Busy", "Offline", "Available"],
        "Active": ["Wrap Up", "Not Ready", "Busy", "Offline", "Active"],
        "Wrap Up": ["Available", "Not Ready", "Offline", "Wrap Up"],
        "Not Ready": ["Available", "Offline", "Not Ready"],
        "Busy": ["Wrap Up", "Available", "Offline", "Busy"],
        "Offline": ["Available", "Offline"]
    };

    // บันทึกสถานะเก่า
    const oldStatus = agent.status;

    // idempotent: ถ้าไม่เปลี่ยนสถานะ ให้ตอบ success (log ด้วย)
    if (oldStatus === newStatus) {
        console.log(`[${new Date().toISOString()}] Agent ${agentCode}: ${oldStatus} → ${newStatus}`);
        return res.json({
            success: true,
            code: agent.code,
            oldStatus,
            newStatus,
            message: "No change",
            timestamp: new Date().toISOString()
        });
    }

    // ตรวจสอบว่า transition ถูกอนุญาตหรือไม่
    const allowedTargets = allowed[oldStatus] || [];
    if (!allowedTargets.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            error: "Transition not allowed",
            from: oldStatus,
            to: newStatus,
            allowed: allowedTargets,
            timestamp: new Date().toISOString()
        });
    }

    // บันทึกสถานะและเวลาล่าสุด (log)
    console.log(`[${new Date().toISOString()}] Agent ${agentCode}: ${oldStatus} → ${newStatus}`);
    agent.status = newStatus;
    agent.lastActive = new Date().toISOString();

    // ตอบกลับ
    res.json({
        success: true,
        code: agent.code,
        oldStatus,
        newStatus: agent.status,
        timestamp: new Date().toISOString()
    });
}

// แมปทั้งสอง method
app.put('/api/agents/:code/status', handleStatusChange);
app.patch('/api/agents/:code/status', handleStatusChange);

// Agent Login
app.post('/api/agents/:code/login', (req, res) => {
    const agentCode = req.params.code;
    const { name } = req.body || {};

    // หา agent หรือสร้างใหม่
    let agent = agents.find(a => a.code === agentCode);
    const now = new Date().toISOString();

    if (!agent) {
        agent = {
            code: agentCode,
            name: name || `Agent ${agentCode}`,
            status: "Available",
            team: "Unassigned",
            lastActive: now,
            loginTime: now
        };
        agents.push(agent);
    } else {
        agent.name = name || agent.name;
        agent.status = "Available";
        agent.loginTime = now;
        agent.lastActive = now;
    }

    console.log(`[${now}] Agent ${agentCode} logged in (name=${agent.name})`);
    return res.json({
        success: true,
        code: agent.code,
        status: agent.status,
        loginTime: agent.loginTime,
        timestamp: now
    });
});

// Agent Logout
app.post('/api/agents/:code/logout', (req, res) => {
    const agentCode = req.params.code;
    const agent = agents.find(a => a.code === agentCode);
    const now = new Date().toISOString();

    if (!agent) {
        return res.status(404).json({
            success: false,
            error: "Agent not found",
            timestamp: now
        });
    }

    // set offline and remove loginTime
    agent.status = "Offline";
    delete agent.loginTime;
    agent.lastActive = now;

    console.log(`[${now}] Agent ${agentCode} logged out`);
    return res.json({
        success: true,
        code: agent.code,
        status: agent.status,
        timestamp: now
    });
});

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

// เพิ่ม route /api/dashboard/stats (อัพเดทให้ตรง response format ที่ต้องการ)
app.get('/api/dashboard/stats', (req, res) => {
    const totalAgents = agents.length;

    function pct(n) {
        return totalAgents > 0 ? Math.round((n / totalAgents) * 100) : 0;
    }

    const counts = {
        available: agents.filter(a => a.status === "Available").length,
        active: agents.filter(a => a.status === "Active").length,
        wrapUp: agents.filter(a => a.status === "Wrap Up").length,
        notReady: agents.filter(a => a.status === "Not Ready").length,
        offline: agents.filter(a => a.status === "Offline").length
    };

    const statusBreakdown = {
        available: { count: counts.available, percent: pct(counts.available) },
        active: { count: counts.active, percent: pct(counts.active) },
        wrapUp: { count: counts.wrapUp, percent: pct(counts.wrapUp) },
        notReady: { count: counts.notReady, percent: pct(counts.notReady) },
        offline: { count: counts.offline, percent: pct(counts.offline) }
    };

    res.json({
        success: true,
        data: {
            total: totalAgents,
            statusBreakdown,
            timestamp: new Date().toISOString()
        }
    });
});

// ขั้นที่ 5: เริ่ม server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
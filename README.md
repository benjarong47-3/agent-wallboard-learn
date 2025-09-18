# โปรเจกต์เรียนรู้ Agent Wallboard

โปรเจกต์นี้คือ Backend Server อย่างง่ายสำหรับ "Agent Wallboard" ของ Call Center ซึ่งถูกพัฒนาขึ้นเพื่อเป็น Workshop ในชั้นเรียนของวิชา ENGCE301 เพื่อฝึกฝนการใช้งาน Node.js, Express, และแนวคิดเกี่ยวกับ RESTful API

เซิร์ฟเวอร์นี้มี API Endpoints สำหรับจัดการข้อมูล Agent, ติดตามสถานะ (เช่น Available, Busy, Offline), และแสดงผลสถิติอย่างง่าย

## ฟีเจอร์ (Features)

-   แสดงรายชื่อ Agent ทั้งหมดและสถานะปัจจุบัน
-   ฟังก์ชันสำหรับ Agent ในการ Login และ Logout
-   อัปเดตสถานะของ Agent พร้อมการตรวจสอบความถูกต้องของการเปลี่ยนสถานะ
-   แสดงผลสถิติบน Dashboard (จำนวน Agent ทั้งหมด, สรุปตามสถานะ)
-   สร้างขึ้นด้วย Node.js และ Express
-   รองรับ CORS สำหรับการเชื่อมต่อกับ Frontend

## การเริ่มต้นใช้งาน (Getting Started)

### สิ่งที่ต้องมี (Prerequisites)

ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้ง [Node.js](https://nodejs.org/) และ [npm](https://www.npmjs.com/) บนเครื่องของคุณเรียบร้อยแล้ว

### การติดตั้ง (Installation)

1.  Clone a repository (หากคุณยังไม่มี):
    ```bash
    git clone https://github.com/benjarong47-3/agent-wallboard-learn.git
    cd agent-wallboard-learn
    ```
2.  ติดตั้ง Dependencies ที่จำเป็น:
    ```bash
    npm install
    ```

## คำสั่งที่ใช้งานได้ (Available Scripts)

ในไดเรกทอรีของโปรเจกต์ คุณสามารถรันคำสั่งต่อไปนี้ได้:

-   **`npm start`**
    รันเซิร์ฟเวอร์ในโหมดปกติโดยใช้ `node`

-   **`npm run dev`**
    รันเซิร์ฟเวอร์ในโหมดพัฒนา (Development Mode) โดยใช้ `nodemon` ซึ่งจะรีสตาร์ทเซิร์ฟเวอร์โดยอัตโนมัติเมื่อมีการเปลี่ยนแปลงไฟล์

## API Endpoints

เซิร์ฟเวอร์จะทำงานบน `http://localhost:3001`

### Health Check (ตรวจสอบสถานะเซิร์ฟเวอร์)

-   **`GET /health`**
    คืนค่าสถานะของเซิร์ฟเวอร์
    ```json
    {
      "status": "OK",
      "timestamp": "2023-10-27T10:00:00.000Z"
    }
    ```

### Agent Management (การจัดการ Agent)

-   **`GET /api/agents`**
    คืนค่ารายชื่อ Agent ทั้งหมด

-   **`POST /api/agents/:code/login`**
    สำหรับให้ Agent ทำการ Login โดยจะตั้งสถานะเป็น "Available" หากยังไม่มี Agent ดังกล่าวในระบบ ระบบจะสร้าง Agent ใหม่ขึ้นมา
    -   `:code` (string): รหัสเฉพาะของ Agent (เช่น `A001`)
    -   **Body (ไม่บังคับ):** `{ "name": "Agent Name" }`

-   **`POST /api/agents/:code/logout`**
    สำหรับให้ Agent ทำการ Logout โดยจะตั้งสถานะเป็น "Offline"
    -   `:code` (string): รหัสเฉพาะของ Agent

-   **`PUT /api/agents/:code/status`** หรือ **`PATCH /api/agents/:code/status`**
    อัปเดตสถานะของ Agent โดย Request จะถูกปฏิเสธหากการเปลี่ยนสถานะนั้นไม่ได้รับอนุญาต
    -   `:code` (string): รหัสเฉพาะของ Agent
    -   **Body (บังคับ):** `{ "status": "NewStatus" }`
    -   สถานะที่ถูกต้อง: `"Available"`, `"Active"`, `"Wrap Up"`, `"Not Ready"`, `"Busy"`, `"Offline"`

### Dashboard (แดชบอร์ด)

-   **`GET /api/dashboard/stats`**
    คืนค่าข้อมูลสถิติเกี่ยวกับ Agent รวมถึงจำนวนทั้งหมดและรายละเอียดตามสถานะ
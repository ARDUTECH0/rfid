# CheckPoint – Smart RFID Attendance System

CheckPoint is a smart employee attendance system using RFID cards. It allows real-time tracking of check-ins and check-outs, user registration, auto-refreshing logs, and PDF exporting – all via a clean React interface.

---
## 🌐 Connect with Ardu Tech

<div align="center">

[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)]([https://www.youtube.com/@ArduTech](https://www.youtube.com/@ArduTechs))
[![TikTok](https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logo=tiktok&logoColor=white)]([https://www.tiktok.com/@ardutech](https://www.tiktok.com/@ardutechse))
[![Email](https://img.shields.io/badge/Contact-Email-orange?style=for-the-badge&logo=gmail&logoColor=white)](mailto:seifemadat@gmail.com)

</div>

---
## 🚀 Features

- 📲 Add new users via RFID card
- 🧾 Real-time attendance log
- 🧑‍💼 View and delete registered users
- 📄 Export PDF attendance report
- 🔄 Auto-refreshing data every 2 seconds
- 🌍 Timezone-aware (Cairo, Egypt)
- 🖥️ Responsive design (works on desktop + mobile)

---

## 🧩 Technologies

- Frontend: React + Vite
- Styling: Custom CSS
- PDF: jsPDF + jsPDF-AutoTable
- Backend: Express.js + MySQL

---

## 📦 Folder Structure (Frontend)

```
src/
├── components/       # Reusable UI components (Input, Button, Table)
├── pages/            # Main Home.jsx page
├── styles/           # CSS styles
└── main.jsx          # App entry
```

---

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the React App

```bash
npm run dev
```

The app runs on: [http://localhost:5173](http://localhost:5173)

---

## 🌐 Backend Requirements

Make sure you have a Node.js backend running with:

| Endpoint                  | Method | Purpose                  |
|---------------------------|--------|--------------------------|
| `/api/users`              | GET    | Fetch all users          |
| `/api/users`              | POST   | Add new user             |
| `/api/users/:uid`         | DELETE | Delete user by UID       |
| `/api/users/pending`      | GET    | Get UID waiting to be added |
| `/api/attendance`         | GET    | Get full attendance log  |
| `/api/attendance`         | POST   | Submit card scan (check-in/out) |

> ⚠️ You must handle attendance logic, UID detection, and "pending UID" queue in your server.

---

## 📄 PDF Export Sample

Click the **Export PDF** button to download a full log of the attendance with proper Cairo time formatting.

---

## ✅ Notes

- Make sure your backend is available at `http://localhost:3000`
- Use timezone `"Africa/Cairo"` in both frontend and backend
- For late check-out validation: compare time with `17:00` in server logic.

---

## 📸 Screenshots

> Add your UI screenshots here

---

# MIT Non-Commercial License (Custom)

Copyright (c) 2025 Eng. Seif Eldin — Ardu Tech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to use,
copy, modify, merge, publish, and distribute copies of the Software for
**personal, educational, or research purposes only**, subject to the following conditions:

1. **Commercial use is strictly prohibited.**
   This includes selling, sublicensing, or using the Software as part of any
   paid or revenue-generating product or service without prior written consent
   from the copyright holder.

2. The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## 🔌 Arduino + RFID Integration (ESP32 + PN532 + FastLED)

### Libraries Required:
- Adafruit_PN532
- WiFi
- HTTPClient
- FastLED
- ArduinoJson

### ✅ Sample Arduino Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_PN532.h>
#include <FastLED.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASS";
const char* serverURL = "http://192.168.1.X:3000/api/attendance";

#define PN532_IRQ   (2)
#define PN532_RESET (3)
#define LED_PIN     2
#define NUM_LEDS    4
CRGB leds[NUM_LEDS];

Adafruit_PN532 nfc(PN532_IRQ, PN532_RESET);
unsigned long ledOnTime = 0;
bool ledActive = false;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);

  nfc.begin();
  if (!nfc.getFirmwareVersion()) while (1);
  nfc.SAMConfig();

  FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(255);
  setColor(CRGB::Black);
}

void loop() {
  uint8_t uid[7];
  uint8_t uidLength;
  if (nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength)) {
    String uidStr = "";
    for (uint8_t i = 0; i < uidLength; i++) uidStr += String(uid[i], HEX);
    uidStr.toUpperCase();

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverURL);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<200> doc;
      doc["uid"] = uidStr;
      String payload;
      serializeJson(doc, payload);
      int httpCode = http.POST(payload);

      String response = http.getString();
      if (httpCode == 200) {
        StaticJsonDocument<300> resDoc;
        deserializeJson(resDoc, response);
        String status = resDoc["status"] | "";
        if (status == "checkin") setColor(CRGB::Blue);
        else if (status == "checkout") setColor(CRGB::Red);
        else setColor(CRGB::Green);
      } else {
        setColor(CRGB::Yellow);
      }
      ledOnTime = millis();
      ledActive = true;
      http.end();
    }
  }

  if (ledActive && millis() - ledOnTime > 2000) {
    setColor(CRGB::Black);
    ledActive = false;
  }
}

void setColor(CRGB color) {
  for (int i = 0; i < NUM_LEDS; i++) leds[i] = color;
  FastLED.show();
}
```

---

## 💻 Backend (Node.js + Express + MySQL)

### ✅ Required Libraries

```bash
npm install express mysql2 cors moment-timezone
```

### ✅ Sample Server Code (index.js)

```js
const express = require('express');
const mysql = require('mysql2');
const moment = require('moment-timezone');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'rfid_attendance'
});

let pendingUID = null;

app.post('/api/attendance', (req, res) => {
  const { uid } = req.body;
  db.query('SELECT * FROM users WHERE uid = ?', [uid], (err, users) => {
    if (users.length === 0) {
      pendingUID = uid;
      return res.status(404).send({ message: 'Unknown card', uid });
    }
    const user = users[0];
    db.query(
      'SELECT * FROM attendance WHERE user_id = ? AND DATE(check_in) = CURDATE() AND check_out IS NULL',
      [user.id], (err, rows) => {
        const now = moment().tz('Africa/Cairo');
        const isLate = now.hour() >= 17;

        if (rows.length > 0) {
          db.query('UPDATE attendance SET check_out = NOW() WHERE id = ?', [rows[0].id]);
          res.send({ message: 'Checked out', status: 'checkout', late: isLate });
        } else {
          db.query('INSERT INTO attendance (user_id, check_in) VALUES (?, NOW())', [user.id]);
          res.send({ message: 'Checked in', status: 'checkin' });
        }
      }
    );
  });
});

app.get('/api/attendance', (req, res) => {
  db.query(
    `SELECT a.id, u.name, a.check_in, a.check_out 
     FROM attendance a 
     JOIN users u ON a.user_id = u.id 
     ORDER BY a.check_in DESC`,
    (err, rows) => {
      res.send(rows);
    }
  );
});

app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    res.send(results);
  });
});

app.get('/api/users/pending', (req, res) => {
  if (pendingUID) res.send({ uid: pendingUID });
  else res.status(204).send();
});

app.post('/api/users', (req, res) => {
  const { name, uid } = req.body;
  db.query('INSERT INTO users (name, uid) VALUES (?, ?)', [name, uid], (err, result) => {
    pendingUID = null;
    res.send({ message: 'User added', userId: result.insertId });
  });
});

app.delete('/api/users/:uid', (req, res) => {
  const { uid } = req.params;
  db.query('SELECT id FROM users WHERE uid = ?', [uid], (err, rows) => {
    if (rows.length === 0) return res.status(404).send({ message: 'Not found' });
    const userId = rows[0].id;
    db.query('DELETE FROM attendance WHERE user_id = ?', [userId], () => {
      db.query('DELETE FROM users WHERE id = ?', [userId], () => {
        res.send({ message: 'Deleted' });
      });
    });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 🗃 MySQL Database Structure

```sql
CREATE DATABASE rfid_attendance;

USE rfid_attendance;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  uid VARCHAR(255) UNIQUE
);

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  check_in DATETIME,
  check_out DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

Now you're ready to build, deploy, and track attendance smartly using CheckPoint 🔥

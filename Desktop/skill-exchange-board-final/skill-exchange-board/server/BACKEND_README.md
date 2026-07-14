# Skill Exchange Board — Backend (server)

Ye folder aapke skill-exchange-board project ka **backend** hai
(Express + MongoDB/Mongoose), jo MERN stack ke "M" (MongoDB) aur
"E" + "N" (Express + Node) hisse ko cover karta hai.

## Isko use karne ka tareeqa

### 1. Apni repo ke root mein rakhein
Repo abhi ye jaisi honi chahiye:

    skill-exchange-board/
      client/     <- pehle se maujood (frontend, Vite+React)
      server/     <- ye folder (isi zip se)

Is zip ke andar `server` folder ko seedha apni project ke root mein
copy-paste kar dein (`client` folder ke barabar / same level pe,
uske andar nahi).

### 2. Terminal mein server folder ke andar jayen

    cd server

### 3. Packages install karein

    npm install

### 4. .env file banayen
`.env.example` ko `.env` bana kar apna MongoDB URI dalen:

    copy .env.example .env      (Windows)
    cp .env.example .env        (Mac/Linux)

Agar local MongoDB use kar rahi hain (jaise pehle Next.js wale setup
mein kiya tha), to `.env` mein ye already sahi hoga:

    MONGODB_URI=mongodb://localhost:27017/skill-exchange-board
    PORT=5000

Agar MongoDB Atlas (cloud) use karni hai to `mongodb+srv://...` wala
apna connection string dal dein.

### 5. Server chalayen

    npm run dev

Agar sab sahi hai to terminal mein ye dikhega:

    MongoDB connected: ...
    Server running on http://localhost:5000

### 6. Connection test karein
Browser mein jayen: **http://localhost:5000/api/test-db**

Agar `"success": true` wala JSON aaye, to matlab MongoDB se connection
kaam kar raha hai aur ek dummy user database mein save ho gaya hai.
MongoDB Compass mein refresh karke check kar sakti hain.

## Folder ke andar kya hai

    server/
      config/
        db.js              <- MongoDB connection
      models/
        User.js
        Listing.js
        Match.js
        Message.js
      routes/
        test.routes.js     <- connection test karne wala route
      server.js             <- main entry file (isse hi chalta hai)
      package.json
      .env.example

## Git mein add karna

    git add server
    git commit -m "Add Express + Mongoose backend (server folder)"
    git push

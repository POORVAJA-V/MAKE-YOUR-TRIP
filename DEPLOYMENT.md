# MakeYourTrip — Deployment Guide

## Step 1: Set up MongoDB Atlas (cloud database)
1. Go to [mongodb.com/cloud/atlas](https://cloud.mongodb.com) → create a free account
2. Create a free **M0 cluster**
3. Under **Database Access** → add a user with a password
4. Under **Network Access** → add `0.0.0.0/0` (allow all IPs)
5. Click **Connect** → **Drivers** → copy the connection string
   - It looks like: `mongodb+srv://user:password@cluster0.xyz.mongodb.net/travel-booking`

---

## Step 2: Deploy the Backend to Render
1. Push your project to GitHub
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo → select the **`backend`** folder as root
4. Set these environment variables in the Render dashboard:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your Atlas connection string from Step 1 |
   | `JWT_SECRET` | Any long random string (e.g. `mytr1p$ecret2024`) |
   | `PORT` | `5000` |

5. Build command: `npm install`
6. Start command: `node server.js`
7. Click **Deploy** — Render gives you a URL like `https://makeyourtrip-backend.onrender.com`

---

## Step 3: Deploy the Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add this environment variable in the Vercel dashboard:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://makeyourtrip-backend.onrender.com/api/v1` |

4. Click **Deploy** — Vercel gives you a URL like `https://makeyourtrip.vercel.app`

---

## Step 4: Seed the Production Database
Once the backend is live on Render, open its shell or run locally with the Atlas URI:

```bash
MONGODB_URI="mongodb+srv://..." node manual_seed.js
```

---

## After Deployment
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- Any user on any device worldwide can register, log in, search and book

---

## Features that work for all users
- ✅ Any city-to-city flight/train/bus search (dynamic generation)
- ✅ Hotel search for any city
- ✅ User registration & login (JWT-based, stored in MongoDB Atlas)
- ✅ Booking history per user
- ✅ QR code ticket on every booking

# 🗓️ Event Management System

A full-stack Node.js + Express + MongoDB web application for managing events with admin authentication and public views.

## 🚀 Features

- Admin login/logout using sessions
- Add, edit, delete events
- Auto-update event status (past/upcoming)
- View upcoming and past events
- Public pages for users to browse events
- EJS templates for server-side rendering

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Templating Engine**: EJS
- **Session Management**: express-session
- **CSS**: Custom styles (add your own in `/public/style.css`)

## ⚙️ How It Works

- Admin logs in at `/admin`
- Events can be created, edited, or deleted
- A background cron job (using `setInterval`) updates the event status to `past` once the event date/time is over
- Public users can view upcoming events at `/events` and past ones at `/past-events`

## 📂 Project Structure

```

├── views/             # EJS templates
├── public/            # Static CSS and assets
├── server.js          # Main server file
├── package.json
└── README.md

````

## 🧪 Local Setup

1. Clone the repo
```bash
git clone https://github.com/your-username/event-management-system.git
cd event-management-system
````

2. Install dependencies

```bash
npm install
```

3. Start MongoDB (make sure it's running locally)

4. Run the server

```bash
node server.js
```

5. Visit: [http://localhost:3000](http://localhost:3000)

## 🧑 Admin Credentials (Dummy)

You must insert an admin manually into MongoDB:

```js
{
  username: "admin",
  password: "admin123"
}
```



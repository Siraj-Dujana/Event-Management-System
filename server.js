const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/events_db", {
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Mongoose Schemas
const eventSchema = new mongoose.Schema({
  title: String,
  event_date: Date,
  opening_time: String,
  closing_time: String,
  website_url: String,
  facebook_url: String,
  status: String,
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const Event = mongoose.model("Event", eventSchema);
const Admin = mongoose.model("Admin", adminSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(
  session({
    secret: "admin",
    resave: false,
    saveUninitialized: true,
  })
);

// Cron Job to update status
setInterval(async () => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().split(" ")[0];

  try {
    await Event.updateMany(
      {
        $or: [
          { event_date: { $lt: today } },
          { event_date: today, closing_time: { $lt: currentTime } },
        ],
      },
      { status: "past" }
    );
  } catch (err) {
    console.error(err);
  }
}, 2000);

// Auth Middleware
function requireAdmin(req, res, next) {
  if (!req.session || req.session.role !== "admin") {
    return res.send("Access Denied! Session not initialized.");
  }
  next();
}

// Routes
app.get("/", (req, res) => {
  res.redirect("/events");
});

app.get("/admin", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  const admin = await Admin.findOne({ name:username,password: password });
  if (!admin) {
    return res.send('<script>alert("Invalid Credentials"); window.location.href="/admin";</script>');
  }
  req.session.role = "admin";
  res.redirect("/dashboard");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send("Error logging out.");
    res.redirect("/admin");
  });
});

app.get("/dashboard", requireAdmin, async (req, res) => {
  const upcoming_events = await Event.countDocuments({ status: "upcoming" });
  const past_events = await Event.countDocuments({ status: "past" });
  res.render("dashboard", { upcoming_events, past_events, session: req.session });
});

app.get("/events/saved", requireAdmin, async (req, res) => {
  const events = await Event.find({ status: "upcoming" });
  res.render("events_saved", { events });
});

app.get("/events/past", requireAdmin, async (req, res) => {
  const events = await Event.find({ status: "past" });
  res.render("events_saved", { events });
});

app.get("/events/new", requireAdmin, (req, res) => {
  res.render("new_event");
});

app.post("/events/create", requireAdmin, async (req, res) => {
  const { eventTitle, eventDate, openingTime, closingTime, websiteUrl, facebookUrl } = req.body;

  const newEvent = new Event({
    title: eventTitle,
    event_date: eventDate,
    opening_time: openingTime,
    closing_time: closingTime,
    website_url: websiteUrl,
    facebook_url: facebookUrl,
    status: "upcoming",
  });

  await newEvent.save();
  res.send('<script>alert("Event Added Successfully"); window.location.href="/events/new";</script>');
});

app.get("/settings", requireAdmin, (req, res) => res.render("settings"));

app.get("/scottish-event", (req, res) => res.render("Scottish_weekend"));

app.get("/events/:id/edit", requireAdmin, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).send("Event not found");
  res.render("edit_event", { event });
});

app.patch("/events/:id", requireAdmin, async (req, res) => {
  const { title, eventDate, openingTime, closingTime } = req.body;
  await Event.findByIdAndUpdate(req.params.id, {
    title,
    event_date: eventDate,
    opening_time: openingTime,
    closing_time: closingTime,
  });
  res.redirect("/events/saved");
});

app.delete("/events/:id", requireAdmin, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.redirect("/events/saved");
});

app.get("/events", async (req, res) => {
  const events = await Event.find({ status: "upcoming" });
  res.render("public_events", { events });
});

app.get("/past-events", async (req, res) => {
  const events = await Event.find({ status: "past" });
  res.render("public_past_events", { events });
});

// Server
app.listen(port, () => {
  console.log(`Server: http://localhost:${port}/`);
});

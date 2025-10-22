require('dotenv').config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const { Server } = require("socket.io");
const io = new Server(server);

const { Chess } = require("chess.js");
const chess = new Chess();

const path = require("path");
const User = require('./models/User');
const auth = require('./middleware/auth');

// Add players object
const players = {
  white: null,
  black: null
};

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chess-app')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// static files
app.use(express.static(path.join(__dirname, "public")));

// Public routes (no auth required)
app.get("/login", (req, res) => {
  // Redirect to home if already logged in
  if (req.cookies.token) {
    return res.redirect('/');
  }
  res.render("login", { title: "Login" });
});

app.get("/signup", (req, res) => {
  // Redirect to home if already logged in
  if (req.cookies.token) {
    return res.redirect('/');
  }
  res.render("signup", { title: "Sign Up" });
});

// API routes (no auth required)
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or username'
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      message: 'User created successfully',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Protected routes (auth required)
app.use(auth); // Apply auth middleware to all routes below this

app.get("/", (req, res) => {
  res.render("index", {
    title: "Chess Game",
    user: req.user
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logout successful' });
});

// Socket.IO connection with authentication
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Assign role (white/black/spectator)
  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "W");
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "B");
  } else {
    socket.emit("Spectator");
  }

  // Handle disconnect
  socket.on("disconnect", () => {
    if (players.white === socket.id) delete players.white;
    if (players.black === socket.id) delete players.black;
    console.log("User disconnected:", socket.id);
  });

  // Handle move event from client
  socket.on("move", (move) => {
    try {
      // White turn but black ne move kiya
      if (chess.turn() == "w" && players.white != socket.id) return;
      // Black turn but white ne move kiya
      if (chess.turn() == "b" && players.black != socket.id) return;

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move); // sabko broadcast karo
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid Move:", move);
        socket.emit("invalidMove", move);
      }
    } catch (error) {
      console.log("Error in move:", error);
      socket.emit("error", error);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
});
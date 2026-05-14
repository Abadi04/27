require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/veil";
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-veil-secret-change-me";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 24,
    match: /^[a-z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: "اترك لي رسالة مجهولة وسأجيب قريباً.",
    maxlength: 180
  },
  avatarUrl: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const messageSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 300,
    trim: true
  },
  reply: {
    type: String,
    default: "",
    maxlength: 800,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "يمكنك إرسال 5 رسائل فقط كل ساعة." }
});

function signToken(user) {
  return jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt
  };
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "تسجيل الدخول مطلوب." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "جلسة الدخول غير صالحة." });
  }
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const username = cleanString(req.body.username).toLowerCase();
    const email = cleanString(req.body.email).toLowerCase();
    const password = cleanString(req.body.password);

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      return res.status(400).json({ error: "اسم المستخدم يجب أن يكون 3-24 حرفاً: حروف إنجليزية، أرقام، أو _." });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "البريد الإلكتروني غير صالح." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل." });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(409).json({ error: "اسم المستخدم أو البريد مستخدم مسبقاً." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashedPassword });

    return res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ error: "تعذر إنشاء الحساب الآن." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const identifier = cleanString(req.body.identifier).toLowerCase();
    const password = cleanString(req.body.password);

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة." });
    }

    return res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ error: "تعذر تسجيل الدخول الآن." });
  }
});

app.get("/api/me", authRequired, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "المستخدم غير موجود." });
  }
  return res.json({ user: publicUser(user) });
});

app.put("/api/me", authRequired, async (req, res) => {
  try {
    const bio = cleanString(req.body.bio).slice(0, 180);
    const avatarUrl = cleanString(req.body.avatarUrl).slice(0, 500);

    if (avatarUrl && !/^https?:\/\/.+/i.test(avatarUrl)) {
      return res.status(400).json({ error: "رابط الصورة يجب أن يبدأ بـ http أو https." });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { bio, avatarUrl },
      { new: true, runValidators: true }
    );

    return res.json({ user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ error: "تعذر حفظ الإعدادات." });
  }
});

app.get("/api/user/:username", async (req, res) => {
  const username = cleanString(req.params.username).toLowerCase();
  const user = await User.findOne({ username }).select("-password -email");

  if (!user) {
    return res.status(404).json({ error: "هذا الحساب غير موجود." });
  }

  const answered = await Message.find({
    recipientId: user._id,
    reply: { $ne: "" }
  }).sort({ createdAt: -1 }).limit(30);

  return res.json({
    user: {
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    },
    answered
  });
});

app.post("/api/messages/:username", messageLimiter, async (req, res) => {
  try {
    const username = cleanString(req.params.username).toLowerCase();
    const content = cleanString(req.body.content);

    if (!content || content.length > 300) {
      return res.status(400).json({ error: "اكتب رسالة بين 1 و 300 حرف." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "هذا الحساب غير موجود." });
    }

    await Message.create({ recipientId: user._id, content });

    return res.status(201).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "تعذر إرسال الرسالة الآن." });
  }
});

app.get("/api/messages/inbox", authRequired, async (req, res) => {
  const messages = await Message.find({ recipientId: req.user.userId }).sort({ createdAt: -1 });
  const stats = {
    total: messages.length,
    unread: messages.filter((message) => !message.isRead).length,
    replied: messages.filter((message) => Boolean(message.reply)).length
  };

  await Message.updateMany({ recipientId: req.user.userId, isRead: false }, { isRead: true });

  return res.json({ messages, stats });
});

app.post("/api/messages/:id/reply", authRequired, async (req, res) => {
  try {
    const reply = cleanString(req.body.reply);

    if (!reply || reply.length > 800) {
      return res.status(400).json({ error: "اكتب رداً بين 1 و 800 حرف." });
    }

    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.userId },
      { reply, isRead: true },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ error: "الرسالة غير موجودة." });
    }

    return res.json({ message });
  } catch (error) {
    return res.status(400).json({ error: "تعذر حفظ الرد." });
  }
});

app.delete("/api/messages/:id", authRequired, async (req, res) => {
  const deleted = await Message.findOneAndDelete({ _id: req.params.id, recipientId: req.user.userId });

  if (!deleted) {
    return res.status(404).json({ error: "الرسالة غير موجودة." });
  }

  return res.json({ ok: true });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Veil is running on http://localhost:${PORT}`);
});

const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashpassword = bcrypt.hashSync(password, 10);
    const user = new User({ email, username, password: hashpassword });
    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: { _id: user._id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Please register first" });
    }

    const isPassword = bcrypt.compareSync(password, user.password);
    if (!isPassword) {
      return res.status(400).json({ message: "Check your password" });
    }

    const { password: _, ...safeUser } = user.toObject();
    return res.status(200).json({ user: safeUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const { Router } = require("express");
const router = Router();
const db = require("../db");
const { requireAuth } = require("../passport-config");
const { hashPassword, comparePassword } = require("../functions");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("username:", username);
  console.log("password:", password);

  try {
    const result = await db.query('SELECT * FROM "User" WHERE username = $1', [
      username,
    ]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "User does not exist" });
    }

    //delete user.password;
    // compare password, if match, generate token
    comparePassword(password, user.password).then((isMatch) => {
      if (isMatch) {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET
        );

        console.log("Successfully logged in!");
        return res.status(200).json({ token, user });
      } else {
        return res.status(401).json({ error: "Incorrect password" });
      }
    });
  } catch (error) {
    console.error("Error logging in user", error);
    res.status(500).json({ error: "Failed to log in user" });
  }
});

router.get("/authenticated", async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Authorization error!" });
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.query(
      'SELECT id, username, full_name FROM "User" WHERE id = $1',
      [decoded.id]
    );

    if (!user.rows[0]) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: user.rows[0], token });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    let user = await db.query('SELECT * FROM "User" WHERE username = $1', [
      req.body.username,
    ]);
    if (user.rows[0]) {
      console.log("User already exists:", user.rows[0]);
      return res.status(401).json({ error: "User already exists" });
    }
    if (req.body.username.length < 4 || req.body.username.length > 20) {
      return res
        .status(401)
        .json({ error: "Username must be between 4 and 20 characters" });
    }
    if (req.body.password.length < 8 || req.body.password.length > 20) {
      return res
        .status(401)
        .json({ error: "Password must be between 8 and 20 characters" });
    }

    const hashedPassword = await hashPassword(req.body.password);
    user = await db.query(
      'INSERT INTO "User" (full_name, username, password) VALUES ($1, $2, $3) RETURNING id',
      [req.body.name, req.body.username, hashedPassword]
    );
    // passport jwt generates a token and sends it to the client
    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET
    );
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error registering user", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

module.exports = router;

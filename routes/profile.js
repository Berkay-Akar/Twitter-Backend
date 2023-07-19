const express = require("express");
const db = require("../db");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM "User" WHERE id = $1', [id]);
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
    console.log(user);
  } catch (error) {
    console.error("Error getting user", error);
    res.status(500).json({ error: "Error getting user" });
  }
});
// add a new user
router.post("/", async (req, res) => {
  try {
    const { username, password, full_name } = req.body;
    const hashedPassword = await hashPassword(password);
    const result = await db.query(
      'INSERT INTO "User" (username, password, full_name) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, full_name]
    );
    const user = result.rows[0];
    res.status(201).json({ user });
    console.log(user);
  } catch (error) {
    console.error("Error creating user", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

// update an user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, full_name } = req.body;
    const hashedPassword = await hashPassword(password);
    const result = await db.query(
      'UPDATE "User" SET username = $1, password = $2, full_name = $3 WHERE id = $4 RETURNING *',
      [username, hashedPassword, full_name, id]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
    console.log(user, "User updated");
  } catch (error) {
    console.error("Error update user", error);
    res.status(500).json({ error: "Error update user" });
  }
});

// delete an user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM "User" WHERE id = $1', [id]);
    res.json({ message: "User deleted" });
    console.log("User deleted", result.rows[0]);
  } catch (error) {
    console.error("Error delete user", error);
    res.status(500).json({ error: "Error delete user" });
  }
});

router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("token:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.query(
      'SELECT id, username, full_name FROM "User" WHERE id = $1',
      [decoded.id]
    );

    if (!user.rows[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("user:", user.rows[0]);
    const result = await db.query(
      `SELECT JSON_BUILD_OBJECT( 'id', u.id, 'username', u.username, 'full_name', u.full_name, 'posts', JSON_AGG( JSON_BUILD_OBJECT( 'post_user', p.post_user, 'username', u.username, 'full_name', u.full_name, 'post_id', p.post_id, 'post_text', p.post_text, 'created_at', p.created_at, 'like_count', COALESCE(p.like_count, 0) )ORDER BY p.created_at DESC ) ) AS user FROM "User" u LEFT JOIN "Posts" p ON u.id = p.post_user WHERE u.id=$1 GROUP BY u.id, u.username, u.full_name;`,
      [user.rows[0].id]
    );
    const posts = result.rows;
    res.json({ posts });
    console.log("PROFILE POSTS", posts);
  } catch (error) {
    console.error("Error getting posts", error);
    res.status(500).json({ error: "Error getting posts" });
  }
});

module.exports = router;

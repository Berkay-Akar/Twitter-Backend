const express = require("express");
const db = require("../db");
const e = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// get all comments
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
    const result = await db.query(
      `SELECT c.*, u.username, u.id, p.post_text
       FROM "Comments" c
       JOIN "User" u ON c.comment_user = u.id
       JOIN "Posts" p ON c.post_id = p.post_id
       WHERE c.comment_user = $1
       ORDER BY c.created_at DESC`,
      [user.rows[0].id]
    );
    const comments = result.rows;
    res.json({ comments });
  } catch (error) {
    console.error("Error getting comments", error);
    res.status(500).json({ error: "Error getting comments" });
  }
});

// create a comment
router.post("/", async (req, res) => {
  try {
    const { post_id, comment_text, parent_comment_id } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.query(
      'SELECT id, username, full_name FROM "User" WHERE id = $1',
      [decoded.id]
    );
    if (!user.rows[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    const result = await db.query(
      'INSERT INTO "Comments" (comment_user, post_id, comment_text, parent_comment_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.rows[0].id, post_id, comment_text, parent_comment_id]
    );
    const comment = result.rows[0];
    res.json({ comment });
  } catch (error) {
    console.error("Error creating comment", error);
    res.status(500).json({ error: "Error creating comment" });
  }
});

// create comment by id
router.post("/:id", async (req, res) => {
  try {
    0;
    const { post_id } = req.query;
    const { comment_text, parent_comment_id } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.query(
      'SELECT id, username, full_name FROM "User" WHERE id = $1',
      [decoded.id]
    );
    if (!user.rows[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    const result = await db.query(
      'INSERT INTO "Comments" (comment_user, post_id, comment_text, parent_comment_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.rows[0].id, post_id, comment_text, parent_comment_id]
    );
    const comment = result.rows[0];
    res.json({ comment });
  } catch (error) {
    console.error("Error creating comment", error);
    res.status(500).json({ error: "Error creating comment" });
  }
});

// get all comments for a post
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT c.*, u.username, u.id, p.post_text
        FROM "Comments" c
        JOIN "User" u ON c.comment_user = u.id
        JOIN "Posts" p ON c.post_id = p.post_id
        LEFT JOIN "Comments" pc ON c.parent_comment_id = pc.comment_id
        WHERE c.post_id = $1
        ORDER BY c.created_at DESC`,
      [id]
    );
    const comments = result.rows;
    res.json({ comments });
  } catch (error) {
    console.error("Error getting comments", error);
    res.status(500).json({ error: "Error getting comments" });
  }
});

module.exports = router;

const express = require("express");
const db = require("../db");
const router = express.Router();

// get all comments
router.get("/", async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Comments"');
    const comments = result.rows;
    res.json({ comments });
    console.log(comments);
  } catch (error) {
    console.error("Error getting comments", error);
    res.status(500).json({ error: "Error getting comments" });
  }
});

// get all comments for a post
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM "Comments" WHERE comment_id = $1 ORDER BY created_at DESC',
      [id]
    );
    const comments = result.rows;
    res.json({ comments });
    console.log(comments);
  } catch (error) {
    console.error("Error getting comments", error);
    res.status(500).json({ error: "Error getting comments" });
  }
});

const express = require("express");
const db = require("../db");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Create a route to handle getting all likes for a specific post
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM likes WHERE post_id = $1", [
      id,
    ]);
    const likes = result.rows;
    res.json({ likes });
    console.log(likes);
  } catch (error) {
    console.error("Error getting likes", error);
    res.status(500).json({ error: "Error getting likes" });
  }
});

// Create a route to handle getting all likes for a specific user
router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM likes WHERE user_id = $1", [
      id,
    ]);
    const likes = result.rows;
    res.json({ likes });
    console.log(likes);
  } catch (error) {
    console.error("Error getting likes", error);
    res.status(500).json({ error: "Error getting likes" });
  }
});

// Posts a new like
router.post("/:id", async (req, res) => {
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

  try {
    const { id } = req.params;

    const existingLike = await db.query(
      "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
      [id, decoded.id]
    );

    if (existingLike.rows.length > 0) {
      return res.status(409).json({ error: "Post already liked by the user" });
    }

    const result = await db.query(
      "INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING *",
      [id, decoded.id]
    );

    await db.query("UPDATE likes SET is_liked = true WHERE post_id = $1", [id]);

    await db.query(
      'UPDATE "Posts" SET like_count = like_count + 1 WHERE post_id = $1',
      [id]
    );

    const like = result.rows[0];
    res.status(200).json({ like });
    console.log(like);
  } catch (error) {
    console.error("Error liking post", error);
    res.status(500).json({ error: "Error liking post" });
  }
});

// Deletes a like
router.delete("/:id", async (req, res) => {
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

  try {
    const { id } = req.params;

    const existingLike = await db.query(
      "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
      [id, decoded.id]
    );

    if (existingLike.rows.length === 0) {
      return res.status(404).json({ error: "Like not found" });
    }

    const result = await db.query(
      "DELETE FROM likes WHERE post_id = $1 AND user_id = $2",
      [id, decoded.id]
    );

    await db.query(
      'UPDATE "Posts" SET like_count = like_count - 1 WHERE post_id = $1',
      [id]
    );

    res.status(200).json({ message: "Like deleted" });
  } catch (error) {
    console.error("Error deleting like", error);
    res.status(500).json({ error: "Error deleting like" });
  }
});

module.exports = router;

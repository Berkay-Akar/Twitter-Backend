const express = require("express");
const db = require("../db");
const router = express.Router();
const jwt = require("jsonwebtoken");

// get all posts
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
      'SELECT p.*, u.username, u.id FROM "Posts" p JOIN "User" u ON p.post_user = u.id WHERE p.post_user = $1 ORDER BY p.created_at DESC',
      [user.rows[0].id]
    );
    const posts = result.rows;
    res.json({ posts });
    console.log(posts);
  } catch (error) {
    console.error("Error getting posts", error);
    res.status(500).json({ error: "Error getting posts" });
  }
});

// get all posts for a user
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM "Posts" WHERE post_user = $1 ORDER BY created_at DESC',
      [id]
    );
    const posts = result.rows;
    res.json({ posts });
    console.log(posts);
  } catch (error) {
    console.error("Error getting posts", error);
    res.status(500).json({ error: "Error getting posts" });
  }
});

// Like Post
router.post("/likes", async (req, res) => {
  try {
    const { id } = req.body;
    console.log("id:", id);
    console.log("req.body:", req.body);
    const result = await db.query(
      'UPDATE "Posts" SET like_count = like_count + 1 WHERE post_id = $1 RETURNING *',
      [id]
    );
    const post = result.rows[0];
    console.log("post:", post);
    res.status(200).json({ post });
    console.log(post);
  } catch (error) {
    console.error("Error liking post", error);
    res.status(500).json({ error: "Error liking post" });
  }
});

// create a post
router.post("/", async (req, res) => {
  try {
    const { post_user, post_text } = req.body;
    const result = await db.query(
      'INSERT INTO "Posts" (post_user, post_text) VALUES ($1, $2) RETURNING *',
      [post_user, post_text]
    );
    const post = result.rows[0];
    res.status(201).json({ post });
    console.log(post);
  } catch (error) {
    console.error("Error creating post", error);
    res.status(500).json({ error: "Error creating post" });
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { post_text } = req.body;
    const result = await db.query(
      'UPDATE "Posts" SET post_text = $2 WHERE post_id = $1 RETURNING *',
      [id, post_text]
    );
    const post = result.rows[0];
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ post });
    console.log("Post updated", post);
  } catch (error) {
    console.error("Error updating post", error);
    res.status(500).json({ error: "Error updating post" });
  }
});

// delete a post
router.delete("/", async (req, res) => {
  try {
    const { id } = req.body;
    console.log("id:", id);
    const result = await db.query(
      'DELETE FROM "Posts" WHERE post_id = $1 RETURNING *',
      [id]
    );
    const post = result.rows[0];
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ post });
    console.log("Post deleted", post);
  } catch (error) {
    console.error("Error deleting post", error);
    res.status(500).json({ error: "Error deleting post" });
  }
});

module.exports = router;

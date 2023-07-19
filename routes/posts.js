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
      'SELECT p.*, u.username, u.full_name, u.id FROM "Posts" p JOIN "User" u ON p.post_user = u.id  ORDER BY p.created_at DESC',
      []
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
    const { post_user, post_text } = req.body;
    const result = await db.query(
      'INSERT INTO "Posts" (post_user, post_text) VALUES ($1, $2) RETURNING *',
      [decoded.id, post_text]
    );
    const post = result.rows[0];
    const username = user.rows[0].username;
    const full_name = user.rows[0].full_name;
    res
      .status(201)
      .json({ post: { ...post, username }, post: { ...post, full_name } });
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
router.delete("/:id", async (req, res) => {
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

    const { id } = req.params;

    const postToDelete = await db.query(
      'SELECT * FROM "Posts" WHERE post_id = $1',
      [id]
    );
    if (!postToDelete.rows[0]) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (postToDelete.rows[0].post_user !== decoded.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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

// get sigle tweet by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT JSON_BUILD_OBJECT( 'id', p.post_id, 'text', p.post_text, 'createdat', p.created_at, 'user', JSON_BUILD_OBJECT( 'id', u.id, 'username', u.username ), 'comments', JSON_AGG( JSON_BUILD_OBJECT( 'comment_id', c.comment_id, 'comment_text', c.comment_text, 'created_at', c.created_at, 'user', JSON_BUILD_OBJECT( 'id', uc.id, 'username', uc.username ) ) ORDER BY c.created_at DESC ) ) AS post FROM "Posts" p LEFT JOIN "Comments" c ON p.post_id = c.post_id LEFT JOIN "User" u ON p.post_user = u.id LEFT JOIN "User" uc ON c.comment_user = uc.id WHERE p.post_id = $1 GROUP BY p.post_id, u.id, uc.id;`,
      [id]
    );
    const post = result.rows[0].post;
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ post });
    console.log(post);
  } catch (error) {
    console.error("Error getting post", error);
    res.status(500).json({ error: "Error getting post" });
  }
});

// /tweets/ - get all tweets for a user (home feed)

module.exports = router;

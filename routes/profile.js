const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "User"');
    const users = result.rows;
    res.json({ users });
    console.log(users);
  } catch (error) {
    console.error("Error getting users", error);
    res.status(500).json({ error: "Error getting users" });
  }
});

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

module.exports = router;

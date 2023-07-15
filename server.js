require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const postsRoutes = require("./routes/posts");
const commentsRoutes = require("./routes/comments");
const cors = require("cors");
const PORT = 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(cors());

app.use(authRoutes);
app.use("/profile", profileRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

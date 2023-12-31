require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const postsRoutes = require("./routes/tweets");
const commentsRoutes = require("./routes/comments");
const likesRoutes = require("./routes/likes");
const cors = require("cors");
const PORT = 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(cors());

app.use(authRoutes);
app.use("/profile", profileRoutes);
app.use("/tweets", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/likes", likesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

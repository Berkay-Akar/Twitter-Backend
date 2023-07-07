require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");
const PORT = 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

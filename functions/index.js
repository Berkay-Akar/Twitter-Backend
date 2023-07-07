const bcrypt = require("bcrypt");

// Generate a salt and hash a password
async function hashPassword(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// Compare a password with a hashed password
async function comparePassword(password, hashedPassword) {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}

module.exports = { hashPassword, comparePassword };

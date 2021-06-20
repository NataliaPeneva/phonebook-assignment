require("dotenv").config()
const jwt = require("jsonwebtoken")

const generateToken = (userId) => {
  return jwt.sign(userId, process.env.TOKEN_SECRET, { expiresIn: "90m" })
}

module.exports = { generateToken }

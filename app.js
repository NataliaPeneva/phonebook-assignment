const express = require("express")
const app = express()
const cors = require("cors")
const { User, Contact, PhoneNumber } = require("./models")
const { generateToken } = require("./src/utils/generateToken")

app.use(express.json())
app.use(cors())

// Create user / Signup
app.post("/users", async (req, res) => {
  try {
    const user = await User.create({ ...req.body })
    const token = generateToken({ userId: user.id })
    return res.json({
      token,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      message: "Account successfully created.",
    })
  } catch (error) {
    return res.status(400).json({ message: error.message, error })
  }
})

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({
      where: { email },
    })
    const passwordMatch = await user.comparePassword(password)
    if (!passwordMatch)
      return res
        .status(404)
        .json({ message: "The email & password do not match" })
    const userUuid = { userId: user.id }
    const token = generateToken(userUuid)
    return res.json({ token })
  } catch (error) {
    return res.status(500).json({ message: error.message, error })
  }
})

module.exports = app

const express = require("express")
const app = express()
const cors = require("cors")
const { User, Contact, PhoneNumber } = require("./models")
const { generateToken } = require("./src/utils/generateToken")
const { authenticateToken } = require("./src/middlewares/authenticateToken")
const { userIdVerification } = require("./src/middlewares/userVerification")

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

// Create new contact
app.post(
  "/users/:userId/contacts",
  authenticateToken,
  userIdVerification,
  async (req, res) => {
    const userId = req.userId
    const reqBody = req.body

    try {
      const contact = await Contact.create({
        ...reqBody,
        userId,
      })
      const phone = await PhoneNumber.create({
        ...reqBody,
        contactId: contact.id,
      })

      return res.json({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        address: contact.address,
        phoneType: phone.phoneType,
        phoneNumber: phone.phoneNumber,
        message: "Contact successfully created.",
      })
    } catch (error) {
      return res.status(500).json({ message: error.message, error })
    }
  }
)

module.exports = app

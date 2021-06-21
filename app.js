const express = require("express")
const app = express()
const cors = require("cors")
const { User, Contact, PhoneNumber } = require("./models")
const { generateToken } = require("./src/utils/generateToken")
const { authenticateToken } = require("./src/middlewares/authenticateToken")
const {
  userIdVerification,
  contactIdVerification,
} = require("./src/middlewares/userVerification")

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

// Get a sorted and paginated overview of contacts
app.get(
  "/users/:userId/contacts",
  authenticateToken,
  userIdVerification,
  async (req, res) => {
    const userId = req.userId
    const reqLimit = req.query.limit || 10
    const reqOffset = req.query.offset || 0
    const sortBy = req.query.sortBy || "alphabetically"
    try {
      const sortedContacts = await Contact.scope(sortBy).findAll({
        where: { userId },
        limit: reqLimit,
        offset: reqOffset,
        include: [{ model: PhoneNumber, as: "phoneNumber" }],
      })
      res.json({ sortedContacts })
    } catch (error) {
      return res.status(500).json({ message: error.message, error })
    }
  }
)

// Update contacts
app.patch(
  "/users/:userId/contacts/:contactId",
  authenticateToken,
  userIdVerification,
  async (req, res) => {
    // const {projectNewData} = req.body
    const requestBody = req.body
    const contactIdToUpdate = req.params.contactId
    try {
      if (Object.keys(requestBody).length === 0) {
        return res.status(400).json({ message: "Nothing to update." })
      }
      const contact = await Contact.findOne({
        where: { id: contactIdToUpdate },
      })
      const updatedContact = await contact.update({ ...requestBody })
      const phoneNumber = await PhoneNumber.findOne({
        where: { contactId: contactIdToUpdate },
      })
      const updatedPhoneNumber = await phoneNumber.update({ ...requestBody })
      return res.json({ updatedContact, updatedPhoneNumber })
    } catch (error) {
      return res.status(500).json({ message: error.message, error })
    }
  }
)

// Delete contacts
app.delete(
  "/users/:userId/contacts/:contactId",
  authenticateToken,
  userIdVerification,
  contactIdVerification,
  async (req, res) => {
    const { contactId } = req.params
    try {
      await Contact.destroy({ where: { id: contactId } })
      await PhoneNumber.destroy({ where: { contactId } })

      return res.status(204).json({ message: "Contact deleted." })
    } catch (error) {
      return res.status(500).json({ message: error.message, error })
    }
  }
)

module.exports = app

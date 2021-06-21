require("dotenv").config()
const jwt = require("jsonwebtoken")

const userIdFromToken = (headers) => {
  const authHeader = headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]
  const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
  return decoded.userId
}

const userIdVerification = async (req, res, next) => {
  const userIdFromReq = req.params.userId
  const userId = await userIdFromToken(req.headers)
  if (userIdFromReq !== userId)
    return res.status(401).json({ message: "user Id does not match" })
  req.userId = userId
  next()
}

module.exports = { userIdVerification }

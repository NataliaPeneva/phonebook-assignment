const app = require("../../app")
const supertest = require("supertest")
const request = supertest(app)
const db = require("../../models")
const jwt = require("jsonwebtoken")
const {
  fakeUser,
  fakeContact,
  fakePhoneNumber,
} = require("../utils/generateFakeData")
const { generateToken } = require("../utils/generateToken")

// setup
beforeEach(async () => {
  await db.PhoneNumber.destroy({ where: {} })
  await db.Contact.destroy({ where: {} })
  await db.User.destroy({ where: {} })
})
// tear down
afterAll(async () => {
  await db.PhoneNumber.destroy({ where: {} })
  await db.Contact.destroy({ where: {} })
  await db.User.destroy({ where: {} })
  await db.sequelize.close()
})

describe("/users (post)", () => {
  test("should create a new user", async (done) => {
    // arrange
    const body = fakeUser()
    // act
    const response = await request.post("/users").send(body)
    // assert
    expect(response.body).toBeDefined()
    expect(response.status).toBe(200)
    const createdUser = await db.User.findOne({ where: { email: body.email } })
    expect(createdUser).not.toBe(null)
    done()
  })
  test("should return an error if password is shorter than 6 characters", async (done) => {
    // arrange
    const body = fakeUser()
    body.password = "pass"

    // act
    const response = await request.post("/users").send(body)
    // assert
    expect(response.body).toBeDefined()
    expect(response.status).toBe(400)
    done()
  })
  test("should return an error if an account with the email already exists", async (done) => {
    // arrange
    const body = fakeUser()
    await db.User.create(body)

    // act
    const response = await request.post("/users").send(body)
    // assert
    expect(response.body).toBeDefined()
    expect(response.status).toBe(400)
    done()
  })
})

describe("/login (post)", () => {
  test("should respond with an access token when email and password match", async (done) => {
    // arrange
    const fakeUserData = fakeUser()
    const { id, email } = await db.User.create(fakeUserData)
    const body = { email, password: fakeUserData.password }
    // act
    const responseToken = await request.post("/login").send(body)

    // assert
    expect(responseToken.body.token).toBeDefined()
    expect(responseToken.status).toBe(200)
    const userToken = await jwt.verify(
      responseToken.body.token,
      process.env.TOKEN_SECRET
    )
    expect(userToken.userId).toBe(id)
    done()
  })

  test("should respond with an error when a user doesn't exist in the db", async (done) => {
    // arrange
    const body = {
      email: "natalia@email.com",
      password: "password",
    }

    // act
    const responseToken = await request.post("/login").send(body)

    // assert
    expect(responseToken.status).toBe(500)
    done()
  })

  test("should respond with an error when a user exists but the password doesn't match in the db", async (done) => {
    // arrange
    const { email } = await db.User.create(fakeUser())
    const body = { email, password: "blabla" }

    // act
    const responseToken = await request.post("/login").send(body)

    // assert
    expect(responseToken.status).toBe(404)
    done()
  })
})

describe("/users/:userId/contacts (post)", () => {
  test("should create a new contact if sent valid access token, contact details and phone number details", async (done) => {
    // arrange
    const { id: userId } = await db.User.create(fakeUser())
    const token = generateToken({ userId })
    const contact = fakeContact(userId)
    const phoneN = fakePhoneNumber()
    const body = {
      ...contact,
      ...phoneN,
    }
    // act
    const response = await request
      .post(`/users/${userId}/contacts`)
      .set("Authorization", `Bearer ${token}`)
      .send(body)
    // assert
    expect(response.body).toBeDefined()
    expect(response.status).toBe(200)
    const createdContact = await db.Contact.findOne({
      where: { email: body.email },
    })
    expect(createdContact).not.toBe(null)
    done()
  })
  test("should respond with an error if sent valid access token, contact details but no phone number details", async (done) => {
    // arrange
    const { id: userId } = await db.User.create(fakeUser())
    const token = generateToken({ userId })
    const contact = fakeContact()
    const body = {
      ...contact,
    }
    // act
    const response = await request
      .post(`/users/${userId}/contacts`)
      .set("Authorization", `Bearer ${token}`)
      .send(body)
    // assert
    expect(response.status).toBe(500)
    done()
  })
})

describe("/users/:userId/contacts (get)", () => {
  test("should return 8 projects sorted by date", async (done) => {
    // arrange
    const limit = 8
    const offset = 0
    const sortBy = "recent"
    // const sortBy = "date"
    const { id: userId } = await db.User.create(fakeUser())
    const token = generateToken({ userId })

    for (i = 0; i < 10; i++) {
      const contactInDb = await db.Contact.create(fakeContact(userId))
      const contactId = contactInDb.id
      await db.PhoneNumber.create(fakePhoneNumber(contactId))
    }

    // act
    const responseContacts = await request
      .get(`/users/${userId}/contacts`)
      .set("Authorization", `Bearer ${token}`)
      .query({ limit, offset, sortBy })
      .send()
    // assert
    expect(responseContacts.body).toBeDefined()
    expect(responseContacts.status).toBe(200)
    const responseLength = responseContacts.body.sortedContacts.length
    expect(responseLength).toBe(8)
    done()
  })
})

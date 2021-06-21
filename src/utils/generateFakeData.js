const faker = require("faker")

const fakeUser = () => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(8),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  }
}

const fakeContact = (userId) => {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    address: faker.address.streetAddress(true),
    userId,
  }
}

const fakePhoneNumber = (contactId) => {
  return {
    phoneType: "work",
    phoneNumber: faker.phone.phoneNumber(),
    contactId,
  }
}

module.exports = { fakeUser, fakeContact, fakePhoneNumber }

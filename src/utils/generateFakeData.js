const faker = require("faker")

const fakeUser = () => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(8),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  }
}

const fakeContact = () => {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    address: faker.address.streetAddress(true),
  }
}

const fakePhoneNumber = () => {
  return {
    phoneType: "work",
    phoneNumber: faker.phone.phoneNumber(),
  }
}

module.exports = { fakeUser, fakeContact, fakePhoneNumber }

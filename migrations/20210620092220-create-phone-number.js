"use strict"
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("phoneNumbers", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      contactId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "contacts",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      phoneType: {
        type: DataTypes.ENUM(["work", "home", "mobile", "other"]),
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable("phoneNumbers")
  },
}

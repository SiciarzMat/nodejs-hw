const ContactModel = require("../schemas/contactsSchema.js");
const UserModel = require("../schemas/usersSchema.js");

const listContacts = async () => {
  const data = await ContactModel.find();
  return data;
};

const getContactById = async (contactId) => {
  const data = await ContactModel.findById(contactId);
  return data;
};

const addNewContact = async (body) => {
  const newContact = await ContactModel.create(body);
  return newContact;
};

const removeContact = async (contactId) => {
  const result = await ContactModel.findByIdAndRemove({ _id: contactId });
  return result;
};

const updateContact = async (contactId, body) => {
  const updatedContact = await ContactModel.findByIdAndUpdate(
    { _id: contactId },
    { ...body },
    { new: true }
  );
  return updatedContact;
};

const getUserById = async (userId) => {
  const data = await UserModel.findById(userId);
  return data;
};

const addNewUser = async (body) => {
  const newUser = await UserModel.create(body);
  return newUser;
};

const getUserByMail = async (email) => {
  const foundUser = await UserModel.findOne({ email });
  return foundUser;
};

const updateToken = async (id, token) => {
  const updatedUser = await UserModel.updateOne({ _id: id }, { token });
  return updatedUser;
};

module.exports = {
  listContacts,
  getContactById,
  addNewContact,
  removeContact,
  updateContact,
  getUserById,
  addNewUser,
  getUserByMail,
  updateToken,
};
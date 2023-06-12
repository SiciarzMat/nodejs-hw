import { readFile, writeFile } from "node:fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";

const directoryName = "models";
const fileName = "contacts.json";
const contactsPath = join(directoryName, fileName);

export const listContacts = async () => {
  try {
    const contacts = await readFile(contactsPath, { encoding: "utf-8" });
    return JSON.parse(contacts);
  } catch (error) {
    throw new Error(`Something went wrong: ${error.message}`);
  }
};

export const getContactById = async (contactId) => {
  try {
    const parsedContacts = await listContacts();
    const searchedContact = parsedContacts.find(
      (contact) => contact.id === contactId
    );
    if (searchedContact) {
      return searchedContact;
    } else {
      throw new Error(`There is no contact with this id: ${contactId}`);
    }
  } catch (error) {
    throw new Error(`Something went wrong: ${error.message}`);
  }
};

export const removeContact = async (contactId) => {
  try {
    const parsedContacts = await listContacts();
    const contactIndex = parsedContacts.findIndex(
      (contact) => contact.id === contactId
    );

    if (contactIndex === -1) {
      throw new Error(`There is no contact with this id ${contactId}`);
    } else {
      const newContactsList = parsedContacts.filter(
        (contact) => contact.id !== contactId
      );
      await writeFile(contactsPath, JSON.stringify(newContactsList, null, 2));
    }
  } catch (error) {
    throw new Error(`Something went wrong: ${error.message}`);
  }
};

export const addContact = async (body) => {
  try {
    const newContact = {
      id: nanoid(),
      ...body,
    };

    const parsedContacts = await listContacts();
    const newContactsArray = [...parsedContacts, newContact];
    writeFile(contactsPath, JSON.stringify(newContactsArray, null, 2));
    return newContact;
  } catch (error) {
    throw new Error(`Something went wrong: ${error.message}`);
  }
};

export const updateContact = async (contactId, body) => {
  try {
    const parsedContacts = await listContacts();
    const contactToUpdate = parsedContacts.find(
      (contact) => contact.id === contactId
    );

    if (!contactToUpdate) {
      throw new Error(`There is no contact with this id ${contactId}`);
    } else {
      const updatedContact = { ...contactToUpdate, ...body };
      const newContactList = parsedContacts.filter(
        (contact) => contact.id !== contactId
      );
      newContactList.push(updatedContact);
      await writeFile(contactsPath, JSON.stringify(newContactList, null, 2));
      return updatedContact;
    }
  } catch (error) {
    throw new Error(error);
  }
};

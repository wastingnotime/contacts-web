import {
  createContactsWebProductionImagePublication,
} from "../src/shared/production/contactsWebImagePublication.js";

const publication = createContactsWebProductionImagePublication();

process.stdout.write(`${JSON.stringify(publication, null, 2)}\n`);

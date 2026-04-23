import {
  createContactsWebProductionImagePublication,
} from "../src/shared/production/contactsWebImagePublication.js";
import {
  writeContactsWebProductionImagePublication,
} from "../src/shared/production/publishContactsWebImagePublication.js";

const publication = createContactsWebProductionImagePublication();
const result = await writeContactsWebProductionImagePublication({ publication });

process.stdout.write(`${result.content}`);

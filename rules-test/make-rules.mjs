// Wraps the kit's support.rules block in a full rules file, with a test inbox.
import { readFileSync, writeFileSync } from 'node:fs';
const block = readFileSync('../support.rules', 'utf8').replace("return 'SUPPORT_INBOX'", "return 'help@x.com'");
writeFileSync('firestore.rules', `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n${block}  }\n}\n`);

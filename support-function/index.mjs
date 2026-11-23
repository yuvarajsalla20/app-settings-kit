/**
 * 16.0.0: The support email sender, a Firebase Cloud Function each app deploys once. It replaces the Trigger Email
 * extension, which Firebase retires on 31 March 2027.
 *
 * When `firestoreSupport` writes a message to `supportMail/{id}`, this function sends it through the support inbox's own
 * mail account (e.g., Gmail with an app password) to that same inbox, with the person's email as Reply-To, and records
 * the outcome on the document as `delivery` ({ state: 'SUCCESS' | 'ERROR', error?, endTime }).
 *
 * In the app's `functions/index.js`:
 *
 *   export { supportMail } from 'app-settings-kit/support-function';
 *
 * or, when the app's Firestore database is not in us-central1 (or nam5):
 *
 *   import { createSupportMail } from 'app-settings-kit/support-function';
 *   export const supportMail = createSupportMail({ region: 'europe-west1' });
 *
 * The first `firebase deploy --only functions` asks for SUPPORT_SMTP_USER (the inbox address), SUPPORT_APP_NAME and the
 * secret SUPPORT_SMTP_PASSWORD (the app password), and keeps them for later deploys.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { defineSecret, defineString } from 'firebase-functions/params';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import nodemailer from 'nodemailer';
import { alreadyHandled, supportMailOptions } from './mail.mjs';

export { supportMailOptions, isPlainEmail, alreadyHandled, MAIL_LIMITS } from './mail.mjs';

const SMTP_USER = defineString('SUPPORT_SMTP_USER', { description: 'The support inbox address, e.g., hellosupportcare@gmail.com. Support email is sent from and to this address.' });
const APP_NAME = defineString('SUPPORT_APP_NAME', { description: "The app's name, shown as the sender, e.g., RingRinga." });
const SMTP_PASSWORD = defineSecret('SUPPORT_SMTP_PASSWORD');
const SMTP_HOST = defineString('SUPPORT_SMTP_HOST', { default: 'smtp.gmail.com', description: 'The mail server. Gmail is smtp.gmail.com.' });

/** The function, for an app whose Firestore database is in `region`. */
export const createSupportMail = ({ region = 'us-central1' } = {}) =>
  onDocumentCreated({ document: 'supportMail/{id}', region, secrets: [SMTP_PASSWORD], retry: false, maxInstances: 2, memory: '256MiB' }, async (event) => {
    const snap = event.data;
    if (!snap) return;
    const doc = snap.data();
    if (alreadyHandled(doc)) return;
    if (!getApps().length) initializeApp();
    const ref = getFirestore().doc(snap.ref.path);
    try {
      const options = supportMailOptions(doc, SMTP_USER.value(), APP_NAME.value());
      const transport = nodemailer.createTransport({ host: SMTP_HOST.value(), port: 465, secure: true, auth: { user: SMTP_USER.value(), pass: SMTP_PASSWORD.value() } });
      const info = await transport.sendMail(options);
      await ref.update({ delivery: { state: 'SUCCESS', messageId: info.messageId ?? null, endTime: FieldValue.serverTimestamp() } });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Support email was not sent.', { id: event.params.id, error: message });
      await ref.update({ delivery: { state: 'ERROR', error: message.slice(0, 500), endTime: FieldValue.serverTimestamp() } });
    }
  });

/** The function for a database in us-central1 or nam5, the Firebase default. */
export const supportMail = createSupportMail();

/**
 * 16.0.0: The plain part of the support email sender, kept apart from Firebase so it can be tested. It turns one
 * `supportMail` document, written by `firestoreSupport`, into the message Nodemailer sends.
 */

/** The longest subject, message text and screenshot the sender accepts. The Firestore rules keep documents smaller. */
export const MAIL_LIMITS = Object.freeze({ subject: 300, text: 20_000, html: 60_000, attachments: 1, attachmentChars: 1_000_000 });

const EMAIL = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;

/** Whether `value` is one plain email address, with no name, list or line break. */
export const isPlainEmail = (value) => typeof value === 'string' && value.length <= 254 && EMAIL.test(value);

const text = (value, max, field) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`The message has no ${field}.`);
  if (value.length > max) throw new Error(`The message ${field} is longer than ${max} characters.`);
  return value;
};

/**
 * The Nodemailer message for one `supportMail` document. `inbox` is the account the sender signs in to: the email is
 * sent from it and only to it, so a document can never send to anyone else, whatever it contains. Throws an Error that
 * names the problem when the document is not a support message.
 */
export const supportMailOptions = (doc, inbox, appName) => {
  if (!isPlainEmail(inbox)) throw new Error('SUPPORT_SMTP_USER is not an email address.');
  if (!doc || typeof doc !== 'object') throw new Error('The message is empty.');
  if (typeof doc.to !== 'string' || doc.to.trim().toLowerCase() !== inbox.toLowerCase()) throw new Error('The message is not addressed to the support inbox.');
  if (!isPlainEmail(doc.replyTo)) throw new Error('The message has no valid Reply-To address.');
  const m = doc.message ?? {};
  const attachments = m.attachments ?? [];
  if (!Array.isArray(attachments) || attachments.length > MAIL_LIMITS.attachments) throw new Error('The message has too many attachments.');
  return {
    from: { name: appName ? `${appName} Support` : 'Support', address: inbox },
    to: inbox,
    replyTo: doc.replyTo,
    subject: text(m.subject, MAIL_LIMITS.subject, 'subject').replace(/[\r\n]+/g, ' '),
    text: text(m.text, MAIL_LIMITS.text, 'text'),
    ...(typeof m.html === 'string' && m.html ? { html: text(m.html, MAIL_LIMITS.html, 'html') } : {}),
    attachments: attachments.map((a, i) => {
      if (!a || a.encoding !== 'base64' || a.contentType !== 'image/jpeg' || typeof a.content !== 'string' || a.content.length > MAIL_LIMITS.attachmentChars) {
        throw new Error(`Attachment ${i + 1} is not a JPEG screenshot.`);
      }
      const filename = typeof a.filename === 'string' && /^[\w.-]{1,80}$/.test(a.filename) ? a.filename : 'screenshot.jpg';
      return { filename, content: a.content, encoding: 'base64', contentType: 'image/jpeg' };
    }),
  };
};

/** Whether a document has already been handled, so a repeated event never sends the same message twice. */
export const alreadyHandled = (doc) => !!doc?.delivery?.state;

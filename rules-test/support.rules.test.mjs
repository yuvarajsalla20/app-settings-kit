import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { doc, getDoc, setDoc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { firestoreSupport } from './sender.mjs';

// 15.0.0: checks support.rules in the Firebase emulator. Run from this folder: npm install, then npm test.

const env = await initializeTestEnvironment({ projectId: 'demo-support', firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8085 } });
const mail = (over = {}) => ({ to: 'help@x.com', replyTo: 'alex@y.com', message: { subject: 'S', text: 'T', html: '<p>T</p>' }, ...over });
const user = (uid = 'u1', email = 'alex@y.com') => env.authenticatedContext(uid, { email }).firestore();
let ok = 0, bad = 0;
const check = async (name, p) => { try { await p; ok++; console.log('PASS', name); } catch (e) { bad++; console.log('FAIL', name, e.message); } };

// The kit's own sender: five sends succeed, the sixth is refused with the limit error.
{
  const db = user();
  const t = firestoreSupport(db, { currentUser: { uid: 'u1' } });
  for (let i = 1; i <= 5; i++) await check(`kit sender message ${i}`, assertSucceeds(t.send(mail(), t.newId())));
  await check('kit sender refuses the sixth with SupportLimitError', t.send(mail(), t.newId()).then(() => { throw new Error('sent'); }, (e) => { if (e.name !== 'SupportLimitError') throw e; }));
}
// A message with an attachment.
{
  const db = user('u2', 'b@y.com');
  const t = firestoreSupport(db, { currentUser: { uid: 'u2' } });
  await check('attachment allowed', assertSucceeds(t.send(mail({ replyTo: 'B@y.com', message: { subject: 'S', text: 'T', html: 'H', attachments: [{ filename: 'a.jpg', content: 'QUJD', encoding: 'base64', contentType: 'image/jpeg' }] } }), t.newId())));
}
// Abuse attempts, each with a correct limits write in the same batch.
const attempt = async (uid, email, m, opts = {}) => {
  const db = user(uid, email);
  const id = 'm' + Math.random().toString(36).slice(2);
  const b = writeBatch(db);
  if (!opts.noLimit) b.set(doc(db, 'supportLimits', uid), { start: serverTimestamp(), count: 1, last: serverTimestamp(), lastId: opts.otherId ?? id });
  b.set(doc(db, 'supportMail', id), { ...m, uid: opts.uid ?? uid, createdAt: serverTimestamp() });
  return b.commit();
};
await check('other recipient refused', assertFails(attempt('u3', 'c@y.com', mail({ to: 'victim@z.com', replyTo: 'c@y.com' }))));
await check('recipient list refused', assertFails(attempt('u4', 'c@y.com', mail({ to: ['help@x.com', 'victim@z.com'], replyTo: 'c@y.com' }))));
await check('someone else as Reply-To refused', assertFails(attempt('u5', 'c@y.com', mail({ replyTo: 'victim@z.com' }))));
await check('cc field refused', assertFails(attempt('u6', 'c@y.com', mail({ replyTo: 'c@y.com', cc: 'victim@z.com' }))));
await check('without the hourly count refused', assertFails(attempt('u7', 'c@y.com', mail({ replyTo: 'c@y.com' }), { noLimit: true })));
await check('count tied to another message refused', assertFails(attempt('u8', 'c@y.com', mail({ replyTo: 'c@y.com' }), { otherId: 'x' })));
await check('another uid refused', assertFails(attempt('u9', 'c@y.com', mail({ replyTo: 'c@y.com' }), { uid: 'other' })));
await check('attachment path refused', assertFails(attempt('u10', 'c@y.com', mail({ replyTo: 'c@y.com', message: { subject: 'S', text: 'T', html: 'H', attachments: [{ filename: 'a', path: 'https://evil/x', encoding: 'base64', content: '' }] } }))));
await check('oversized text refused', assertFails(attempt('u11', 'c@y.com', mail({ replyTo: 'c@y.com', message: { subject: 'S', text: 'x'.repeat(5000), html: 'H' } }))));
await check('signed out refused', assertFails(setDoc(doc(env.unauthenticatedContext().firestore(), 'supportMail', 'z'), mail())));
await check('reading a sent message refused', assertFails(getDoc(doc(user(), 'supportMail', 'anything'))));
await check('resetting the count refused', assertFails(setDoc(doc(user(), 'supportLimits', 'u1'), { start: serverTimestamp(), count: 1, last: serverTimestamp(), lastId: 'q' })));
await check('reading own count allowed', assertSucceeds(getDoc(doc(user(), 'supportLimits', 'u1'))));
await check("reading another's count refused", assertFails(getDoc(doc(user('u2', 'b@y.com'), 'supportLimits', 'u1'))));
await check('a sixth message in the hour refused by the rules', assertFails((async () => {
  const db = user();
  const id = 'six';
  const b = writeBatch(db);
  const seen = (await getDoc(doc(db, 'supportLimits', 'u1'))).data();
  b.set(doc(db, 'supportLimits', 'u1'), { start: seen.start, count: 6, last: serverTimestamp(), lastId: id });
  b.set(doc(db, 'supportMail', id), { ...mail(), uid: 'u1', createdAt: serverTimestamp() });
  return b.commit();
})()));
// An hour later the window starts again.
await env.withSecurityRulesDisabled(async (c) => { await setDoc(doc(c.firestore(), 'supportLimits', 'u1'), { start: Timestamp.fromMillis(Date.now() - 2 * 3600e3), count: 5, last: Timestamp.fromMillis(Date.now() - 2 * 3600e3), lastId: 'old' }); });
{
  const t = firestoreSupport(user(), { currentUser: { uid: 'u1' } });
  await check('a new hour allows a message again', assertSucceeds(t.send(mail(), t.newId())));
}
console.log(`\n${ok} passed, ${bad} failed`);
await env.cleanup();
process.exit(bad ? 1 : 0);

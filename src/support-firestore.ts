import { Timestamp, collection, doc, getDoc, serverTimestamp, writeBatch, type Firestore } from 'firebase/firestore';
import { SUPPORT_COLLECTIONS, SupportLimitError, nextSupportWindow, type SupportMail, type SupportTransport } from './logic/support';

/** The person signed in to the app, as Firebase Auth reports them. */
interface SignedIn {
  currentUser: { uid: string } | null;
}

/**
 * 15.0.0: the kit's way to send Contact Support messages, for apps on Firebase. Each message is one document in
 * `supportMail`, which the Firebase "Trigger Email from Firestore" extension sends to the support inbox. In the same write,
 * `supportLimits/{uid}` counts the messages of the current hour. The Firestore rules in the kit's `support.rules` allow
 * only the app's own inbox as the recipient, the person's own email as Reply-To, and five messages an hour.
 *
 *   import { firestoreSupport } from 'app-settings-kit/support-firestore';
 *   <AppSettings support={firestoreSupport(db, auth)} ... />
 */
export const firestoreSupport = (db: Firestore, auth: SignedIn): SupportTransport => ({
  newId: () => doc(collection(db, SUPPORT_COLLECTIONS.mail)).id,
  accountId: () => auth.currentUser?.uid,
  send: async (mail: SupportMail, id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Contact Support needs a signed-in account.');
    const limitRef = doc(db, SUPPORT_COLLECTIONS.limits, uid);
    const seen = await getDoc(limitRef);
    const data = seen.exists() ? (seen.data() as { start?: Timestamp; count?: number }) : null;
    const current = data?.start ? { start: data.start.toMillis(), count: data.count ?? 0 } : null;
    const next = nextSupportWindow(current, Date.now());
    if (!next.ok) throw new SupportLimitError(next.nextAt);
    const batch = writeBatch(db);
    batch.set(limitRef, { start: next.fresh ? serverTimestamp() : data!.start, count: next.count, last: serverTimestamp(), lastId: id });
    batch.set(doc(db, SUPPORT_COLLECTIONS.mail, id), { ...mail, uid, createdAt: serverTimestamp() });
    try {
      await batch.commit();
    } catch (e) {
      // The phone's clock can differ from the server's: if the rules refused because the hour is full, say when it opens.
      if (current && current.count >= 4 && /permission/i.test(String((e as { code?: string }).code ?? e))) throw new SupportLimitError(current.start + 60 * 60 * 1000);
      throw e;
    }
  },
});

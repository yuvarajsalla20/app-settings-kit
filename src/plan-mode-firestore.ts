import { planModeFrom, type PlanMode } from 'app-account-kit';
import { doc, getDoc, type Firestore } from 'firebase/firestore';

/** The person signed in to the app, as Firebase Auth reports them. */
interface SignedIn {
  currentUser: { uid: string } | null;
}

/**
 * 18.1.0: the plan mode from the Firestore document `config/app`, for an app without app-subscriptions-kit (whose
 * `SubscriptionProvider` reads it already):
 *
 *   import { firestorePlanMode } from 'app-settings-kit/plan-mode-firestore';
 *   <AppSettings planMode={firestorePlanMode(db, auth)} ... />
 *
 * `planMode: "subscription"` shows the Subscription row and page; `subscriptionTesters` (a list of account ids) limits it to
 * those accounts. The document is read once per launch. Without Firebase, or when it cannot be read, the app stays free.
 */
export const firestorePlanMode = (db: Firestore | null, auth: SignedIn | null): (() => Promise<PlanMode>) => {
  let data: Promise<unknown> | null = null;
  return () => {
    if (!db) return Promise.resolve('free');
    data ??= getDoc(doc(db, 'config', 'app'))
      .then((snap) => snap.data())
      .catch(() => {
        data = null; // try again the next time Settings opens
        return undefined;
      });
    return data.then((d) => planModeFrom(d, auth?.currentUser?.uid ?? null));
  };
};

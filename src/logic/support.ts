/**
 * 15.0.0: Contact Support inside the app. Everything here is plain logic, the same in every app: the topics, the limits,
 * the reference a person quotes, the details added to each message and the email the support inbox receives.
 */

/** The topics a person can choose, in this order, with their Feather icons. */
export type SupportTopic = 'question' | 'problem' | 'billing' | 'idea';

export const SUPPORT_TOPICS: readonly { value: SupportTopic; label: string; icon: 'help-circle' | 'alert-triangle' | 'credit-card' | 'zap' }[] = Object.freeze([
  { value: 'question', label: 'Question', icon: 'help-circle' },
  { value: 'problem', label: 'Report a Problem', icon: 'alert-triangle' },
  { value: 'billing', label: 'Billing and Subscription', icon: 'credit-card' },
  { value: 'idea', label: 'Suggestion', icon: 'zap' },
]);

/** The limits the Firestore rules enforce as well (support.rules), so the page and the server agree. */
export const SUPPORT_LIMITS = Object.freeze({
  /** Characters in one message. */
  messageChars: 2000,
  /** Messages one account can send in one hour. */
  perHour: 5,
  /** The longest side of a screenshot after it is reduced on the phone. */
  screenshotSide: 1280,
  /** The largest screenshot, as base64 text, that fits in one Firestore document with room to spare. */
  screenshotChars: 700_000,
});

const HOUR_MS = 60 * 60 * 1000;

/** The collections the kit writes. The Firestore rules in support.rules name the same two. */
export const SUPPORT_COLLECTIONS = Object.freeze({ mail: 'supportMail', limits: 'supportLimits' });

/** What the account has sent within the current hour, as kept in `supportLimits/{uid}`. */
export interface SupportWindow {
  /** When the current hour began, in milliseconds. */
  start: number;
  /** Messages sent since `start`. */
  count: number;
}

/**
 * The next state of the hourly window for one more message at `now`, or the time the next message is possible when the
 * limit is reached. A window older than one hour starts again at one.
 */
export const nextSupportWindow = (current: SupportWindow | null, now: number): { ok: true; fresh: boolean; count: number } | { ok: false; nextAt: number } => {
  if (!current || now >= current.start + HOUR_MS) return { ok: true, fresh: true, count: 1 };
  if (current.count >= SUPPORT_LIMITS.perHour) return { ok: false, nextAt: current.start + HOUR_MS };
  return { ok: true, fresh: false, count: current.count + 1 };
};

/** Thrown by a sender when the hourly limit is reached. `nextAt` is when the next message is possible, in milliseconds. */
export class SupportLimitError extends Error {
  constructor(public readonly nextAt: number) {
    super('The hourly limit for support messages is reached.');
    this.name = 'SupportLimitError';
  }
}

/** The short reference a person quotes, e.g., "RR-7K2Q9F": the app's initials and six characters of the message's id. */
export const supportReference = (appName: string, id: string): string => {
  const words = appName.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^A-Za-z0-9]+/).filter(Boolean);
  const initials = (words.length > 1 ? words.slice(0, 2).map((w) => w[0]).join('') : (words[0] ?? 'AP').slice(0, 2)).toUpperCase();
  const code = id.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase().padEnd(6, '0');
  return `${initials}-${code}`;
};

/** What the page knows about the app, the phone and the account, added to every message. */
export interface SupportDetails {
  appName: string;
  /** The app's version, e.g., 1.0.0. */
  version: string;
  /** The build number, when known. */
  build?: string;
  /** "iPhone", "iPad" or the Android model, e.g., Pixel 9. */
  device: string;
  /** e.g., "iOS 26.1" or "Android 16". */
  system: string;
  /** "Free" or the plan's name. */
  plan: string;
  /** The account's id, so support can find it. Sent to the inbox only, never shown on the page. */
  uid?: string;
}

/** The one line the page shows under Details Included, e.g., "RingRinga 1.0.0 (Build 27), iPhone, iOS 26.1, Premium". */
export const supportDetailsLine = (d: SupportDetails): string =>
  [`${d.appName} ${d.version}${d.build ? ` (Build ${d.build})` : ''}`, d.device, d.system, d.plan].join(', ');

/** The Android system name for an API level, e.g., 35 is Android 15. Unknown levels read "Android (API 37)". */
const ANDROID_RELEASES: Readonly<Record<number, string>> = { 29: '10', 30: '11', 31: '12', 32: '12L', 33: '13', 34: '14', 35: '15', 36: '16' };

/** The phone and system words for `Platform.OS`, `Platform.Version` and, on Android, `Platform.constants.Model`. */
export const supportDevice = (os: string, version: string | number, model?: string, isPad?: boolean): { device: string; system: string } => {
  if (os === 'android') {
    const level = Number(version);
    const release = ANDROID_RELEASES[level];
    return { device: model?.trim() || 'Android Phone', system: release ? `Android ${release}` : `Android (API ${version})` };
  }
  if (os === 'ios') return { device: isPad ? 'iPad' : 'iPhone', system: `${isPad ? 'iPadOS' : 'iOS'} ${version}` };
  return { device: os, system: `${os} ${version}` };
};

/** A screenshot reduced on the phone, as base64 JPEG text. */
export interface SupportScreenshot {
  base64: string;
  width: number;
  height: number;
}

/** The size of a base64 screenshot in megabytes, to one decimal place, e.g., 0.4. */
export const screenshotMegabytes = (base64: string): number => Math.max(0.1, Math.round(((base64.length * 3) / 4 / 1_000_000) * 10) / 10);

/** What a person writes on the page. */
export interface SupportDraft {
  topic: SupportTopic;
  message: string;
  screenshot?: SupportScreenshot | null;
}

/** Who writes, from the account. */
export interface SupportSender {
  name?: string;
  email: string;
}

/** The email the support inbox receives, as the kit's email function (`app-settings-kit/support-function`) reads it. */
export interface SupportMail {
  /** The support inbox: always the app's `about.supportEmail`. The rules allow no other address. */
  to: string;
  /** The person's own email, so a reply from the inbox reaches them. */
  replyTo: string;
  message: {
    subject: string;
    text: string;
    html: string;
    attachments?: { filename: string; content: string; encoding: 'base64'; contentType: 'image/jpeg' }[];
  };
}

/** The message text a person can send: trimmed and within the limit. Empty when there is nothing to send. */
export const cleanSupportMessage = (text: string): string => text.trim().slice(0, SUPPORT_LIMITS.messageChars);

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Builds the email for the support inbox. The subject names the app, the topic and the reference. */
export const buildSupportMail = (input: { inbox: string; sender: SupportSender; draft: SupportDraft; details: SupportDetails; reference: string }): SupportMail => {
  const { inbox, sender, draft, details, reference } = input;
  const topic = SUPPORT_TOPICS.find((t) => t.value === draft.topic)?.label ?? SUPPORT_TOPICS[0]!.label;
  const message = cleanSupportMessage(draft.message);
  const facts: [string, string][] = [
    ['From', sender.name ? `${sender.name} <${sender.email}>` : sender.email],
    ['Topic', topic],
    ['Reference', reference],
    ['App', `${details.appName} ${details.version}${details.build ? ` (Build ${details.build})` : ''}`],
    ['Device', `${details.device}, ${details.system}`],
    ['Plan', details.plan],
    ...(details.uid ? ([['Account ID', details.uid]] as [string, string][]) : []),
  ];
  const text = `${message}\n\n---\n${facts.map(([k, v]) => `${k}: ${v}`).join('\n')}\n`;
  const html =
    `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.5;">` +
    `<p style="white-space:pre-wrap;margin:0 0 20px">${escapeHtml(message)}</p>` +
    `<table style="border-collapse:collapse;font-size:13px;opacity:0.8">` +
    facts.map(([k, v]) => `<tr><td style="padding:2px 16px 2px 0;opacity:0.7">${escapeHtml(k)}</td><td style="padding:2px 0">${escapeHtml(v)}</td></tr>`).join('') +
    `</table></div>`;
  const shot = draft.screenshot;
  return {
    to: inbox.trim(),
    replyTo: sender.email.trim(),
    message: {
      subject: `${details.appName} Support: ${topic}, ${reference}`,
      text,
      html,
      ...(shot ? { attachments: [{ filename: `${reference}-screenshot.jpg`, content: shot.base64, encoding: 'base64' as const, contentType: 'image/jpeg' as const }] } : {}),
    },
  };
};

/**
 * How the page sends a message. `firestoreSupport(db)` from `app-settings-kit/support-firestore` is the kit's own; the page asks
 * for the id first, so the reference in the email and on the confirmation is the same.
 */
export interface SupportTransport {
  /** A new message id (the Firestore document id). */
  newId: () => string;
  /** Writes the message. Rejects with `SupportLimitError` when the hourly limit is reached. */
  send: (mail: SupportMail, id: string) => Promise<void>;
  /** The signed-in account's id, added to the email so support can find the account. */
  accountId?: () => string | undefined;
  /**
   * 16.0.0: whether the owner has turned the in-app form on for this app. Off, About › Contact Support opens the Mail app,
   * as before. `firestoreSupport` reads `supportForm: true` in the Firestore document `config/app`. A transport without it is on.
   */
  formOn?: () => Promise<boolean>;
}

/** 16.0.0: the owner's switch in `config/app`. Only a literal `supportForm: true` turns the form on; anything else is Mail. */
export const supportFormSwitch = (data: unknown): boolean => !!data && typeof data === 'object' && (data as { supportForm?: unknown }).supportForm === true;

import { describe, expect, it } from 'vitest';
// @ts-expect-error The sender is plain JavaScript for Cloud Functions; its pure part is tested here.
import { alreadyHandled, isPlainEmail, needsDefaultApp, supportMailOptions } from '../support-function/mail.mjs';
import { buildSupportMail } from '../src/support/support';

const INBOX = 'help@example.com';
const mail = (over: Record<string, unknown> = {}) => ({
  ...buildSupportMail({
    inbox: INBOX,
    sender: { name: 'Dana', email: 'dana@example.com' },
    draft: { topic: 'problem', message: 'The alert did not ring.', screenshot: { base64: 'AAAA', width: 10, height: 10 } },
    details: { appName: 'RingRinga', version: '1.0.0', device: 'iPhone', system: 'iOS 26.1', plan: 'Free' },
    reference: 'RR-ABC123',
  }),
  uid: 'u1',
  ...over,
});

describe('support email sender', () => {
  it('sends a kit message from the inbox to the inbox, with Reply-To set to the person', () => {
    const o = supportMailOptions(mail(), INBOX, 'RingRinga');
    expect(o.from).toEqual({ name: 'RingRinga Support', address: INBOX });
    expect(o.to).toBe(INBOX);
    expect(o.replyTo).toBe('dana@example.com');
    expect(o.subject).toBe('RingRinga Support: Report a Problem, RR-ABC123');
    expect(o.text).toContain('The alert did not ring.');
    expect(o.html).toContain('The alert did not ring.');
    expect(o.attachments).toEqual([{ filename: 'RR-ABC123-screenshot.jpg', content: 'AAAA', encoding: 'base64', contentType: 'image/jpeg' }]);
  });

  it('matches the inbox without regard to letter case', () => {
    expect(supportMailOptions(mail({ to: 'Help@Example.com' }), INBOX, 'X').to).toBe(INBOX);
  });

  it('refuses any other recipient, so a document can never send elsewhere', () => {
    expect(() => supportMailOptions(mail({ to: 'someone@else.com' }), INBOX, 'X')).toThrow(/support inbox/);
    expect(() => supportMailOptions(mail({ to: [INBOX] }), INBOX, 'X')).toThrow(/support inbox/);
  });

  it('refuses a Reply-To that is not one plain address', () => {
    expect(() => supportMailOptions(mail({ replyTo: 'a@b.com, c@d.com' }), INBOX, 'X')).toThrow(/Reply-To/);
    expect(() => supportMailOptions(mail({ replyTo: 'a@b.com\r\nBcc: c@d.com' }), INBOX, 'X')).toThrow(/Reply-To/);
  });

  it('keeps the subject on one line', () => {
    const doc = mail();
    doc.message.subject = 'Line one\r\nBcc: x@y.com';
    expect(supportMailOptions(doc, INBOX, 'X').subject).toBe('Line one Bcc: x@y.com');
  });

  it('accepts only one JPEG screenshot, never a file path or link', () => {
    const doc = mail();
    (doc.message.attachments as unknown[]) = [{ filename: 'a.jpg', path: '/etc/passwd', encoding: 'base64', contentType: 'image/jpeg' }];
    expect(() => supportMailOptions(doc, INBOX, 'X')).toThrow(/JPEG/);
    const two = mail();
    two.message.attachments = [...two.message.attachments!, ...two.message.attachments!];
    expect(() => supportMailOptions(two, INBOX, 'X')).toThrow(/too many/);
  });

  it('replaces an unusual file name', () => {
    const doc = mail();
    doc.message.attachments![0]!.filename = '../../x.jpg';
    expect(supportMailOptions(doc, INBOX, 'X').attachments[0].filename).toBe('screenshot.jpg');
  });

  it('refuses an empty message and a misconfigured inbox', () => {
    const doc = mail();
    doc.message.text = '  ';
    expect(() => supportMailOptions(doc, INBOX, 'X')).toThrow(/text/);
    expect(() => supportMailOptions(mail(), 'not an address', 'X')).toThrow(/SUPPORT_SMTP_USER/);
  });

  it('sends a message without a screenshot', () => {
    const doc = mail();
    delete (doc.message as { attachments?: unknown }).attachments;
    expect(supportMailOptions(doc, INBOX, 'X').attachments).toEqual([]);
  });

  it('never sends the same document twice', () => {
    expect(alreadyHandled(mail())).toBe(false);
    expect(alreadyHandled(mail({ delivery: { state: 'SUCCESS' } }))).toBe(true);
    expect(isPlainEmail('a@b.co')).toBe(true);
    expect(isPlainEmail('Dana <a@b.co>')).toBe(false);
  });
});

describe('default Firebase app', () => {
  it('creates the default app when only the firebase-functions app exists', () => {
    expect(needsDefaultApp([])).toBe(true);
    expect(needsDefaultApp([{ name: '__FIREBASE_FUNCTIONS_SDK__' }])).toBe(true);
  });

  it('keeps an existing default app', () => {
    expect(needsDefaultApp([{ name: '__FIREBASE_FUNCTIONS_SDK__' }, { name: '[DEFAULT]' }])).toBe(false);
  });
});

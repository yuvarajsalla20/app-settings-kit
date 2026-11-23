import { Text, TextInput } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { AppSettings } from '../src/AppSettings';
import { SUPPORT_LIMITS, SupportLimitError, buildSupportMail, nextSupportWindow, screenshotMegabytes, supportDetailsLine, supportDevice, supportReference, type SupportTransport } from '../src/logic/support';
import { ContactSupportPage } from '../src/pages/ContactSupportPage';
import { slideSends } from '../src/parts/SlideToSend';
import { DEFAULT_SETTINGS_STRINGS as W } from '../src/strings';
import { act, mount, press, settle } from './helpers/render';
import { fullProps } from './helpers/props';
import { THEME } from './helpers/theme';

const S = W.support;
const DETAILS = { appName: 'RingRinga', version: '1.0.0', build: '27', device: 'iPhone', system: 'iOS 26.1', plan: 'Premium' };
const HOUR = 60 * 60 * 1000;

describe('15.0.0 Contact Support logic', () => {
  it('allows five messages an hour and says when the next is possible', () => {
    expect(nextSupportWindow(null, 1000)).toEqual({ ok: true, fresh: true, count: 1 });
    expect(nextSupportWindow({ start: 0, count: 4 }, 10)).toEqual({ ok: true, fresh: false, count: 5 });
    expect(nextSupportWindow({ start: 0, count: 5 }, 10)).toEqual({ ok: false, nextAt: HOUR });
    expect(nextSupportWindow({ start: 0, count: 5 }, HOUR)).toEqual({ ok: true, fresh: true, count: 1 });
    expect(SUPPORT_LIMITS.perHour).toBe(5);
  });

  it('makes a short reference from the app name and the message id', () => {
    expect(supportReference('RingRinga', 'abc123xyz')).toBe('RR-ABC123');
    expect(supportReference('Moonpenny', 'k2-q')).toBe('MO-K2Q000');
    expect(supportReference('My App', 'Zz9')).toBe('MA-ZZ9000');
  });

  it('names the phone and its system', () => {
    expect(supportDevice('android', 36, 'Pixel 9')).toEqual({ device: 'Pixel 9', system: 'Android 16' });
    expect(supportDevice('android', 40)).toEqual({ device: 'Android Phone', system: 'Android (API 40)' });
    expect(supportDevice('ios', '26.1')).toEqual({ device: 'iPhone', system: 'iOS 26.1' });
    expect(supportDevice('ios', '26.1', undefined, true)).toEqual({ device: 'iPad', system: 'iPadOS 26.1' });
    expect(supportDetailsLine(DETAILS)).toBe('RingRinga 1.0.0 (Build 27), iPhone, iOS 26.1, Premium');
  });

  it('builds the email: the inbox, Reply-To the person, a clear subject, the details and the screenshot', () => {
    const mail = buildSupportMail({
      inbox: ' help@x.com ',
      sender: { name: 'Alex', email: 'alex@y.com' },
      draft: { topic: 'problem', message: '  It <broke> & stopped.  ', screenshot: { base64: 'QUJD', width: 10, height: 20 } },
      details: { ...DETAILS, uid: 'u1' },
      reference: 'RR-ABC123',
    });
    expect(mail.to).toBe('help@x.com');
    expect(mail.replyTo).toBe('alex@y.com');
    expect(mail.message.subject).toBe('RingRinga Support: Report a Problem, RR-ABC123');
    expect(mail.message.text.startsWith('It <broke> & stopped.\n')).toBe(true);
    expect(mail.message.text).toContain('Device: iPhone, iOS 26.1');
    expect(mail.message.text).toContain('Account ID: u1');
    expect(mail.message.html).toContain('It &lt;broke&gt; &amp; stopped.');
    expect(mail.message.attachments).toEqual([{ filename: 'RR-ABC123-screenshot.jpg', content: 'QUJD', encoding: 'base64', contentType: 'image/jpeg' }]);
    expect(buildSupportMail({ inbox: 'h@x.com', sender: { email: 'a@b.com' }, draft: { topic: 'idea', message: 'x'.repeat(3000) }, details: DETAILS, reference: 'R' }).message).not.toHaveProperty('attachments');
    expect(screenshotMegabytes('A'.repeat(533_334))).toBe(0.4);
  });

  it('sends only when the knob travels most of the track', () => {
    expect(slideSends(90, 100)).toBe(true);
    expect(slideSends(50, 100)).toBe(false);
    expect(slideSends(10, 0)).toBe(false);
  });
});

const transport = (over: Partial<SupportTransport> = {}): SupportTransport => ({ newId: () => 'abc123xyz', send: vi.fn().mockResolvedValue(undefined), accountId: () => 'u1', ...over });
const page = (over: Partial<Parameters<typeof ContactSupportPage>[0]> = {}) =>
  mount(
    <ContactSupportPage theme={THEME} strings={S} appName="RingRinga" inbox="help@x.com" sender={{ name: 'Alex', email: 'alex@y.com' }} details={DETAILS} transport={transport()} pickScreenshot={async () => null} Text={Text as never} TextInput={TextInput as never} now={() => 0} {...over} />,
  );
const slider = (h: ReturnType<typeof page>) => h.root.root.findAll((n) => n.props.accessibilityHint === S.slideHint && typeof n.type === 'string')[0]!;
const slide = (h: ReturnType<typeof page>) => act(async () => void slider(h).props.onAccessibilityAction({ nativeEvent: { actionName: 'activate' } }));
const write = (h: ReturnType<typeof page>, text: string) => act(() => void h.byLabel(S.message).props.onChangeText(text));

describe('15.0.0 Contact Support page', () => {
  it('shows who the reply goes to, the topic, the message, the screenshot and the details, then Slide to Send', () => {
    const h = page();
    for (const t of [S.intro('RingRinga'), S.repliesTo, 'Alex', 'alex@y.com', S.topic, S.message, S.addScreenshot, S.details, S.slide]) expect(h.texts()).toContain(t);
    expect(h.texts()).toContain(supportDetailsLine(DETAILS));
    expect(slider(h).props.accessibilityState.disabled).toBe(true);
  });

  it('sends the message with the reference, then shows Message Sent', async () => {
    const t = transport();
    const h = page({ transport: t });
    await write(h, 'The reminder arrived late.');
    expect(slider(h).props.accessibilityState.disabled).toBe(false);
    await slide(h);
    await settle();
    expect(t.send).toHaveBeenCalledTimes(1);
    const [mail, id] = (t.send as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(id).toBe('abc123xyz');
    expect(mail.to).toBe('help@x.com');
    expect(mail.replyTo).toBe('alex@y.com');
    expect(mail.message.subject).toBe('RingRinga Support: Question, RR-ABC123');
    expect(mail.message.text).toContain('Account ID: u1');
    expect(h.has(S.sentTitle)).toBe(true);
    expect(h.has('RR-ABC123')).toBe(true);
    expect(h.has(S.sentBody('Alex', 'RingRinga', 'alex@y.com'))).toBe(true);
  });

  it('adds and removes a screenshot', async () => {
    const h = page({ pickScreenshot: async () => ({ base64: 'A'.repeat(533_334), width: 1, height: 1 }) });
    await press(h.byText(S.addScreenshot));
    await settle();
    expect(h.has(S.removeScreenshot)).toBe(true);
    expect(h.has(S.screenshotAdded(0.4))).toBe(true);
    await press(h.byText(S.removeScreenshot));
    expect(h.has(S.addScreenshot)).toBe(true);
  });

  it('explains the hourly limit and keeps the slider off until then', async () => {
    const h = page({ transport: transport({ send: vi.fn().mockRejectedValue(new SupportLimitError(HOUR)) }) });
    await write(h, 'Another question.');
    await slide(h);
    await settle();
    expect(h.texts().some((t) => t.startsWith('You have sent five messages in the last hour.'))).toBe(true);
    expect(slider(h).props.accessibilityState.disabled).toBe(true);
  });

  it('says plainly when a message could not be sent, and reports it', async () => {
    const onError = vi.fn();
    const h = page({ onError, transport: transport({ send: vi.fn().mockRejectedValue(new Error('offline')) }) });
    await write(h, 'Hello.');
    await slide(h);
    await settle();
    expect(h.has(S.failed)).toBe(true);
    expect(onError).toHaveBeenCalledWith('support-send', expect.any(Error));
  });

  it('asks a person without an email address to write to the inbox', () => {
    const h = page({ sender: { name: 'Alex' } });
    expect(h.texts()).toEqual([S.noEmail('help@x.com')]);
  });
});

describe('15.0.0 AppSettings', () => {
  it('About › Contact Support opens the in-app form in every app', async () => {
    const h = mount(<AppSettings {...fullProps()} />);
    await press(h.byLabel('About'));
    await press(h.byLabel('Contact Support'));
    expect(h.has(S.intro('My App'))).toBe(true);
    expect(h.has(S.slide)).toBe(true);
  });
});

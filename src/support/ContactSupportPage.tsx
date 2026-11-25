import Feather from '@expo/vector-icons/Feather';
import { Button, PickerRow, SettingRow, SettingsGroup, useSettingsNav, type AccountTheme } from 'app-account-kit';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { AccessibilityInfo, Linking, TextInput as RNTextInput, View } from 'react-native';
import { SUPPORT_LIMITS, SUPPORT_TOPICS, SupportLimitError, buildSupportMail, cleanSupportMessage, screenshotMegabytes, supportDetailsLine, supportReference, type SupportDetails, type SupportScreenshot, type SupportTopic, type SupportTransport } from './support';
import type { SupportStrings } from '../strings';
import { SlideToSend } from './SlideToSend';

type TextComponent = ComponentType<{ style?: unknown; numberOfLines?: number; accessibilityRole?: string; children?: unknown }>;

export interface ContactSupportPageProps {
  theme: AccountTheme;
  strings: SupportStrings;
  appName: string;
  /** The support inbox (the app's `about.supportEmail`). */
  inbox: string;
  /** The person, from the profile. Without an email address the page asks them to write to the inbox instead. */
  sender: { name?: string; email?: string };
  details: SupportDetails;
  transport: SupportTransport;
  /** Chooses and reduces a screenshot. The kit's `pickScreenshot` unless a test gives its own. */
  pickScreenshot: () => Promise<SupportScreenshot | null>;
  onError?: (where: string, error: unknown) => void;
  Text: TextComponent;
  TextInput?: ComponentType<Record<string, unknown>>;
  /** 16.0.0: a mailto: address for the inbox, for the Email Support link under Slide to Send. */
  mailUrl?: string;
  /** For tests: the time now, in milliseconds. */
  now?: () => number;
}

const timeOf = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const thousands = (n: number) => n.toLocaleString('en-US');

/**
 * 15.0.0: About › Contact Support, the same in every app. Its one job is to send one message to the app's support inbox:
 * who the reply goes to (the account's email, which cannot be changed here), a topic, the message, an optional screenshot
 * and the details added for support, then Slide to Send. After sending, the page shows Message Sent with a reference.
 */
export function ContactSupportPage(props: ContactSupportPageProps) {
  const { theme, strings: w, appName, inbox, sender, details, transport, pickScreenshot, onError, Text, mailUrl, now = Date.now } = props;
  const Input = (props.TextInput ?? RNTextInput) as ComponentType<Record<string, unknown>>;
  const nav = useSettingsNav();
  const [topic, setTopic] = useState<SupportTopic>('question');
  const [message, setMessage] = useState('');
  const [shot, setShot] = useState<SupportScreenshot | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [limitAt, setLimitAt] = useState<number | null>(null);
  const [sent, setSent] = useState<{ reference: string; at: number; topic: SupportTopic; shot: boolean } | null>(null);
  const live = useRef(true);
  useEffect(
    () => () => {
      live.current = false;
    },
    [],
  );
  useEffect(() => {
    if (sent) AccessibilityInfo.announceForAccessibility?.(w.sentTitle);
  }, [sent, w.sentTitle]);

  const muted = { color: theme.muted, fontSize: 15, lineHeight: 21 };
  // 16.0.0: anyone who prefers their own mail app can still write from it, with the same details the Mail way adds.
  const openMail = () => {
    if (!mailUrl) return;
    Linking.openURL(mailUrl).catch((e: unknown) => {
      onError?.('support-mail', e);
      if (live.current) setProblem(w.noEmail(inbox));
    });
  };
  const mailLine = mailUrl ? (
    <View style={{ alignItems: 'center', gap: 8, paddingTop: 4 }}>
      <Text style={{ color: theme.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>{w.mailInstead}</Text>
      <Button variant="quiet" small icon="mail" label={w.mailLink} onPress={openMail} />
    </View>
  ) : null;
  if (!sender.email)
    return (
      <View style={{ gap: 12 }}>
        <Text style={muted}>{w.noEmail(inbox)}</Text>
        {mailLine}
      </View>
    );
  const email = sender.email;

  if (sent) {
    const topicLabel = SUPPORT_TOPICS.find((t) => t.value === sent.topic)?.label ?? '';
    return (
      <View style={{ gap: 20 }}>
        <View style={{ alignItems: 'center', gap: 14, paddingTop: 12 }}>
          <View style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: `${theme.accent}22`, alignItems: 'center', justifyContent: 'center' }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="check" size={36} color={theme.ink} />
            </View>
          </View>
          <Text accessibilityRole="header" style={{ color: theme.text, fontSize: 26, fontWeight: '800', textAlign: 'center' }}>{w.sentTitle}</Text>
          <Text style={{ ...muted, fontSize: 16, lineHeight: 23, textAlign: 'center' }}>{w.sentBody(sender.name, appName, email)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 17, backgroundColor: theme.field }}>
            <Text style={{ color: theme.muted, fontSize: 14 }}>{w.reference}</Text>
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: '700', letterSpacing: 0.5 }}>{sent.reference}</Text>
          </View>
        </View>
        <SettingsGroup>
          <SettingRow icon="tag" tint={theme.tints.support} label={w.topic} value={topicLabel} />
          <SettingRow icon="image" tint={theme.tints.support} label={w.screenshot} value={sent.shot ? w.attached : w.none} />
          <SettingRow icon="clock" tint={theme.tints.support} label={w.sentAt} value={w.today(timeOf(sent.at))} last />
        </SettingsGroup>
        <Text style={{ ...muted, fontSize: 13, textAlign: 'center' }}>{w.quote}</Text>
        <Button variant="solid" label={w.done} onPress={() => nav?.back()} />
      </View>
    );
  }

  const text = cleanSupportMessage(message);
  const blocked = limitAt !== null && now() < limitAt;
  const addShot = async () => {
    setProblem(null);
    try {
      const picked = await pickScreenshot();
      if (picked && live.current) setShot(picked);
    } catch (e) {
      onError?.('support-screenshot', e);
      if (live.current) setProblem(w.screenshotFailed);
    }
  };
  const send = async () => {
    if (!text || busy || blocked) return;
    setBusy(true);
    setProblem(null);
    try {
      const id = transport.newId();
      const reference = supportReference(appName, id);
      const uid = transport.accountId?.();
      const mail = buildSupportMail({ inbox, sender: { name: sender.name, email }, draft: { topic, message: text, screenshot: shot }, details: uid ? { ...details, uid } : details, reference });
      await transport.send(mail, id);
      if (live.current) setSent({ reference, at: now(), topic, shot: !!shot });
    } catch (e) {
      if (!live.current) return;
      if (e instanceof SupportLimitError) setLimitAt(e.nextAt);
      else {
        onError?.('support-send', e);
        setProblem(w.failed);
      }
    } finally {
      if (live.current) setBusy(false);
    }
  };
  const topicIcon = SUPPORT_TOPICS.find((t) => t.value === topic)?.icon ?? 'help-circle';
  return (
    <View style={{ gap: 16 }}>
      <Text style={muted}>{w.intro(appName)}</Text>
      <SettingsGroup title={w.repliesTo}>
        <SettingRow icon="mail" tint={theme.tints.support} label={sender.name || email} detail={sender.name ? email : undefined} last />
      </SettingsGroup>
      <SettingsGroup title={w.topic}>
        <PickerRow<SupportTopic> icon={topicIcon} tint={theme.tints.support} label={w.topic} options={SUPPORT_TOPICS} value={topic} onChange={setTopic} last />
      </SettingsGroup>
      <SettingsGroup title={w.message}>
        <View style={{ padding: 14, gap: 6 }}>
          <Input
            value={message}
            onChangeText={(t: string) => setMessage(t.slice(0, SUPPORT_LIMITS.messageChars))}
            placeholder={w.placeholder}
            placeholderTextColor={theme.faint}
            accessibilityLabel={w.message}
            multiline
            maxLength={SUPPORT_LIMITS.messageChars}
            textAlignVertical="top"
            style={{ minHeight: 120, color: theme.text, fontSize: 16, lineHeight: 22, padding: 0 }}
          />
          <Text style={{ color: theme.muted, fontSize: 12, textAlign: 'right' }}>{w.characters(thousands(message.length), thousands(SUPPORT_LIMITS.messageChars))}</Text>
        </View>
      </SettingsGroup>
      <SettingsGroup>
        {shot ? (
          <SettingRow icon="image" tint={theme.tints.support} label={w.removeScreenshot} detail={w.screenshotAdded(screenshotMegabytes(shot.base64))} trailing="x" onPress={() => setShot(null)} />
        ) : (
          <SettingRow icon="image" tint={theme.tints.support} label={w.addScreenshot} value={w.optional} onPress={addShot} />
        )}
        <SettingRow icon="smartphone" tint={theme.tints.version} label={w.details} detail={supportDetailsLine(details)} expanded={showDetails} onPress={() => setShowDetails((v) => !v)} last>
          {showDetails ? <Text style={{ ...muted, fontSize: 13, lineHeight: 18 }}>{w.detailsNote}</Text> : null}
        </SettingRow>
      </SettingsGroup>
      {problem ? (
        <Text accessibilityRole="alert" style={{ color: theme.danger, fontSize: 14, lineHeight: 20 }}>{problem}</Text>
      ) : null}
      {blocked ? (
        <View accessibilityRole="alert" style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 18, backgroundColor: theme.field }}>
          <Feather name="clock" size={18} color={theme.muted} />
          <Text style={{ flex: 1, color: theme.text, fontSize: 14, lineHeight: 20 }}>{w.limit(SUPPORT_LIMITS.perHour, timeOf(limitAt!))}</Text>
        </View>
      ) : null}
      <SlideToSend theme={theme} label={busy ? w.sending : w.slide} hint={w.slideHint} disabled={!text || blocked} busy={busy} onSend={send} Text={Text as never} />
      {mailLine}
    </View>
  );
}

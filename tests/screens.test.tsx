import { SettingRow, SettingsGroup } from 'app-account-kit';
import { Pressable, Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { AppSettings, type AppSettingsProps } from '../src/AppSettings';
import { useSettingsNav } from '../src';
import { DataExportPage, exportMenu } from '../src/pages/DataExportPage';
import { DEFAULT_SETTINGS_STRINGS as W } from '../src/strings';
import type { ExportFormat } from '../src/types';
import { THEME } from './helpers/theme';
import { mount, press, settle } from './helpers/render';

const csv = (over: Partial<ExportFormat> = {}): ExportFormat => ({ id: 'csv', label: 'CSV File', icon: 'file-text', tint: 'mint', onExport: vi.fn().mockResolvedValue(undefined), ...over });
const pdf = (over: Partial<ExportFormat> = {}): ExportFormat => ({ id: 'pdf', label: 'PDF Report', icon: 'file', tint: 'gold', onExport: vi.fn().mockResolvedValue(undefined), ...over });

describe('Data Export page', () => {
  it('makes the file for an open format and opens the plans for a locked one (a lock per format)', async () => {
    const onLocked = vi.fn();
    const free = csv();
    const paid = pdf({ locked: true, detail: 'With totals', lockedDetail: 'VIP only', lockedValue: 'VIP only, locked', lockedBadge: <Text>LOCK</Text> });
    const h = mount(<DataExportPage formats={[free, paid]} onLocked={onLocked} />);
    expect(h.has('VIP only')).toBe(true);
    expect(h.has('With totals')).toBe(false);
    expect(h.has('LOCK')).toBe(true);
    await press(h.byText('CSV File'));
    expect(free.onExport).toHaveBeenCalledTimes(1);
    await press(h.byText('PDF Report'));
    expect(paid.onExport).not.toHaveBeenCalled();
    expect(onLocked).toHaveBeenCalledTimes(1);
  });

  it('draws the approved rows: a padlock while locked, a download icon once open', () => {
    const h = mount(<DataExportPage formats={[csv(), pdf({ locked: true })]} />);
    const icons = h.root.root.findAll((n) => n.type === 'Icon').map((n) => n.props.name);
    expect(icons).toEqual(['file-text', 'download', 'file', 'lock']);
  });

  it('makes one file at a time', async () => {
    let finish!: () => void;
    const slow = csv({ onExport: vi.fn(() => new Promise<void>((r) => (finish = r))) });
    const other = pdf();
    const h = mount(<DataExportPage formats={[slow, other]} />);
    await press(h.byText('CSV File'));
    await press(h.byText('PDF Report'));
    expect(other.onExport).not.toHaveBeenCalled();
    finish();
    await settle();
    await press(h.byText('PDF Report'));
    expect(other.onExport).toHaveBeenCalledTimes(1);
  });

  it('reports a failure and shows it in plain words, or hands it to the app', async () => {
    const onError = vi.fn();
    const broken = csv({ onExport: vi.fn().mockRejectedValue(new Error('no space')) });
    const h = mount(<DataExportPage formats={[broken]} onError={onError} renderProblem={(t) => <Text>{t}</Text>} />);
    await press(h.byText('CSV File'));
    await settle();
    expect(onError).toHaveBeenCalledWith('data-export', expect.any(Error));
    expect(h.has(W.exportFailed)).toBe(true);

    const onProblem = vi.fn();
    const h2 = mount(<DataExportPage formats={[csv({ onExport: vi.fn().mockRejectedValue(new Error('x')) })]} onProblem={onProblem} renderProblem={(t) => <Text>{t}</Text>} />);
    await press(h2.byText('CSV File'));
    await settle();
    expect(onProblem).toHaveBeenCalledWith(W.exportFailed);
    expect(h2.has(W.exportFailed)).toBe(false);
  });

  it("draws the app's own row when it passes one", () => {
    const h = mount(<DataExportPage formats={[csv({ locked: true })]} Row={({ format, onPress }) => <Text onPress={onPress}>{`${format.label} (own row, ${format.locked ? 'locked' : 'open'})`}</Text>} />);
    expect(h.has('CSV File (own row, locked)')).toBe(true);
  });
});

const props = (over: Partial<AppSettingsProps> = {}): AppSettingsProps => ({
  theme: THEME,
  onBack: vi.fn(),
  profile: { name: 'Yuva', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: async () => {} },
  ...over,
});

const rowsOnList = (texts: string[], names: string[]) => texts.filter((t) => names.includes(t));

describe('AppSettings', () => {
  const NAMES = ['About', 'Account', 'Preferences', 'Data Export', 'VIP', 'Plan', 'Family'];

  it('lists the four parents About, Account, Preferences, plan, then the app\'s other pages; Data Export is not on the list', () => {
    const h = mount(
      <AppSettings
        {...props()}
        preferences={<SettingsGroup><SettingRow icon="tag" tint="x" label="Categories" last /></SettingsGroup>}
        dataExport={{ formats: [csv()] }}
        plan={{ id: 'vip', label: 'VIP', value: 'Lite', content: <Text>VIP page</Text> }}
        extraPages={[{ id: 'family', label: 'Family', icon: 'users', content: <Text>Family page</Text> }]}
      />,
      false,
    );
    expect(rowsOnList(h.texts(), NAMES)).toEqual(['About', 'Account', 'Preferences', 'VIP', 'Family']);
  });

  it('keeps Log Out off the main list by default (3.0.0: behind the ⋯ on Account), and puts it back with exitMenu={false}', () => {
    const on = mount(<AppSettings {...props()} />, false);
    expect(on.has('Log Out')).toBe(false);
    const off = mount(<AppSettings {...props()} exitMenu={false} />, false);
    expect(off.has('Log Out')).toBe(true);
  });

  it("exitMenu place 'page' (3.2.0): an Access row on Account opens Log Out and Close Account; no ⋯", async () => {
    const h = mount(<AppSettings {...props({ actions: { confirmsWithPassword: true, onSignOut: async () => {}, onDeleteAccount: async () => {} } })} exitMenu={{ place: 'page' }} />, false);
    await press(h.byLabel('Account'));
    expect(h.has('Access')).toBe(true);
    expect(h.byLabel('More options')).toBeUndefined();
    await press(h.byLabel('Access'));
    expect(h.has('Log Out')).toBe(true);
    expect(h.has('Close Account')).toBe(true);
  });

  it('3.4.0: the Data Export pill names every format', () => {
    expect(exportMenu({ formats: [csv(), pdf()], menu: true }, () => {}).pill).toBe('CSV / PDF');
    expect(exportMenu({ formats: [csv()], menu: true }, () => {}).pill).toBe('CSV');
  });

  it('3.4.0: the same card headings in every app, and Deactivate under Log Out', async () => {
    const actions = { confirmsWithPassword: true, onSignOut: async () => {}, onDeleteAccount: async () => {} };
    const h = mount(<AppSettings {...props({ actions })} exitMenu={{ place: 'page', signOutOnAccount: true }} />, false);
    await press(h.byLabel('Account'));
    expect(h.has('Profile')).toBe(true);
    expect(h.has('Sign In')).toBe(true);
    expect(h.has('Deactivate')).toBe(true);
    expect(h.has('Access')).toBe(false);
    const own = mount(<AppSettings {...props({ actions })} strings={{ access: 'Close Account', exitGroup: '' }} exitMenu={{ place: 'page', signOutOnAccount: true }} />, false);
    await press(own.byLabel('Account'));
    expect(own.has('Close Account')).toBe(true);
    expect(own.has('Sign In')).toBe(false);
  });

  it('hides what the app leaves out, and names the plan page "Plan" until the app names it', () => {
    const h = mount(<AppSettings {...props()} plan={{ content: <Text>Plans</Text> }} />, false);
    expect(rowsOnList(h.texts(), NAMES)).toEqual(['About', 'Account', 'Plan']);
  });

  it('puts Data Export straight on Account under Your Data (3.4.0), opens its formats, and Back returns to Account', async () => {
    const strings = { dataExport: 'Downloads' };
    const h = mount(<AppSettings {...props()} settingsStrings={strings} order={['export', 'about']} dataExport={{ formats: [csv(), pdf({ locked: true })], onLocked: vi.fn() }} />, false);
    expect(rowsOnList(h.texts(), [...NAMES, 'Downloads'])).toEqual(['About', 'Account']);
    await press(h.byText('Account'));
    expect(h.has('Your Data')).toBe(true);
    await press(h.byText('Downloads'));
    expect(h.has('CSV File')).toBe(true);
    expect(h.has('PDF Report')).toBe(true);
    await press(h.byLabel('Back'));
    expect(h.has('Downloads')).toBe(true);
  });

  it('opens Data Export from the plan page through useSettingsNav, and Back returns to the plan page', async () => {
    function Perk() {
      const nav = useSettingsNav();
      return <Pressable accessibilityRole="button" accessibilityLabel="Open Data Export" onPress={() => nav?.open('export')}><Text>perk</Text></Pressable>;
    }
    const h = mount(<AppSettings {...props()} plan={{ id: 'vip', label: 'VIP', content: <Perk /> }} dataExport={{ formats: [csv()] }} />, false);
    await press(h.byText('VIP'));
    await press(h.byLabel('Open Data Export'));
    expect(h.has('CSV File')).toBe(true);
    await press(h.byLabel('Back'));
    expect(h.has('perk')).toBe(true);
  });

  it('draws the approved About: Title Case words with the app name in Rate and Share', async () => {
    const h = mount(<AppSettings {...props()} about={{ ...props().about, featuresUrl: 'https://x.y/features', rate: { appStoreId: '1' }, share: { url: 'https://x.y' }, kits: [{ name: 'Core Kit', version: '1.0.0' }] }} />, false);
    await press(h.byText('About'));
    for (const word of ['Features', 'Contact Support', 'Privacy Policy', 'Kits', 'Version']) expect(h.has(word)).toBe(true);
    expect(h.texts().some((t) => /^Rate /.test(t))).toBe(true);
    expect(h.texts().some((t) => /^Share /.test(t))).toBe(true);
  });

  it('fills Version and Kits from the build and package.json when the app passes neither', async () => {
    const { version: _drop, ...about } = props().about;
    const h = mount(
      <AppSettings
        {...props()}
        about={about}
        build={{ version: '4.18.0', buildNumber: '12', stamp: 'Nov 14, 2026 | 10:45 AM CT' }}
        kitSources={{ dependencies: { 'app-core-kit': 'git+https://github.com/x/app-core-kit.git#abcdef1234567' }, kits: [{ name: 'Core Kit', pkg: 'app-core-kit', version: 'v1.0.0' }] }}
      />,
      false,
    );
    await press(h.byText('About'));
    await press(h.byText('Version'));
    expect(h.has('v4.18.0 | Build 12')).toBe(true);
    expect(h.has('Nov 14, 2026 | 10:45 AM CT')).toBe(true);
    await press(h.byText('Kits'));
    expect(h.texts().some((t) => t.includes('Core Kit') && t.includes('abcdef1'))).toBe(true);
  });

  it('draws the approved round Back button and swipe-back by default, and keeps the app\'s own when passed', () => {
    const h = mount(<AppSettings {...props()} />, false);
    expect(h.root.root.findAll((n) => n.type === 'Animated.View').length).toBe(1);
    const back = h.root.root.findAll((n) => n.type === 'Pressable' && n.props.hitSlop === 12);
    expect(back.length).toBe(1);
    const Mine = ({ onPress }: { onPress: () => void }) => <Pressable onPress={onPress} accessibilityLabel="mine"><Text>MINE</Text></Pressable>;
    const h2 = mount(<AppSettings {...props()} components={{ BackButton: Mine }} />, false);
    expect(h2.has('MINE')).toBe(true);
  });

  it("keeps the app's own name for Preferences when it already renamed it", () => {
    const h = mount(<AppSettings {...props()} strings={{ app: 'Options' }} preferences={<Text>rows</Text>} />, false);
    expect(h.has('Options')).toBe(true);
    expect(h.has('Preferences')).toBe(false);
  });
});

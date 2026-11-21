import { Pressable, Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { AppSettings } from '../src/AppSettings';
import { DataExportPage, exportMenu } from '../src/pages/DataExportPage';
import { DEFAULT_SETTINGS_STRINGS as W } from '../src/strings';
import type { ExportFormat } from '../src/types';
import { mount, press, settle } from './helpers/render';
import { fullProps as props } from './helpers/props';

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

const rowsOnList = (texts: string[], names: string[]) => texts.filter((t) => names.includes(t));
const NAMES = ['About', 'Account', 'Profile', 'Preferences', 'Data Export', 'VIP', 'Premium', 'Plan', 'Family'];
/** The Data Export menu the kit hands to app-account-kit. */
const exportMenuOf = (h: ReturnType<typeof mount>) => h.root.root.findAll((n) => Array.isArray(n.props.items) && 'head' in n.props && typeof n.props.onPick === 'function')[0]!;

describe('AppSettings', () => {
  it("lists the four parents About, Profile, Preferences, plan, then the app's other pages; Data Export is not on the list", () => {
    const h = mount(<AppSettings {...props()} extraPages={[{ id: 'family', label: 'Family', icon: 'users', content: <Text>Family page</Text> }]} />, false);
    expect(rowsOnList(h.texts(), NAMES)).toEqual(['About', 'Profile', 'Preferences', 'Premium', 'Family']);
  });

  it('6.0.0: the order, the place of Data Export and the look are the kit\'s; what an app passes for them is ignored', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    const locked = { order: ['plan', 'about'], dataExportIn: 'preferences', plainHeaders: false, pickers: 'sheet', settingsStrings: { plan: 'X' } } as never;
    const h = mount(<AppSettings {...props()} {...(locked as object)} />, false);
    expect(rowsOnList(h.texts(), NAMES)).toEqual(['About', 'Profile', 'Preferences', 'Premium']);
    await press(h.byText('Profile'));
    expect(h.has('Data Export')).toBe(true);
    expect(warn.mock.calls.flat().join(' ')).toMatch(/order, dataExportIn, plainHeaders, pickers, settingsStrings/);
    delete (globalThis as { __DEV__?: boolean }).__DEV__;
    warn.mockRestore();
  });

  it('6.0.0: Log Out and Erase Account are always on Profile, with no ⋯, whatever exitMenu the app passes', async () => {
    for (const exitMenu of [undefined, {}, false, { place: 'menu' }] as never[]) {
      const h = mount(<AppSettings {...props()} exitMenu={exitMenu} />, false);
      expect(h.has('Log Out')).toBe(false);
      await press(h.byLabel('Profile'));
      expect(h.has('Log Out')).toBe(true);
      expect(h.has('Erase Account')).toBe(true);
      expect(h.has('Access')).toBe(false);
      expect(h.byLabel('More options')).toBeUndefined();
    }
  });

  it('9.2.0: the Data Export pill says Choose for several formats and names a single one', () => {
    expect(exportMenu({ formats: [csv(), pdf()], menu: true }, () => {}).pill).toBe('Choose');
    expect(exportMenu({ formats: [csv()], menu: true }, () => {}).pill).toBe('CSV');
  });

  it('3.4.0: the same card headings in every app; the app\'s own versions of kit words are not used', async () => {
    const h = mount(<AppSettings {...props()} />, false);
    await press(h.byLabel('Profile'));
    expect(h.has('Account')).toBe(true);
    expect(h.has('Sign In')).toBe(true);
    expect(h.has('Erase Account')).toBe(true);
    const own = mount(<AppSettings {...props()} strings={{ access: 'Close Account', exitGroup: 'Sign-in', aboutInfoGroup: 'App info' }} />, false);
    await press(own.byLabel('Profile'));
    expect(own.has('Erase Account')).toBe(true);
    expect(own.has('Close Account')).toBe(false);
    expect(own.has('Sign In')).toBe(true);
    expect(own.has('Sign-in')).toBe(false);
  });

  it("4.0.1: About's Version and Kits card is headed 'Info' in every app, even when the app passes its own word", async () => {
    const own = mount(<AppSettings {...props()} strings={{ aboutInfoGroup: 'App info' }} />, false);
    await press(own.byLabel('About'));
    expect(own.has('Info')).toBe(true);
    expect(own.has('App info')).toBe(false);
  });

  it("6.0.0: the plan row is the plan's name with the kit's icon; an app's own label or icon is not used", () => {
    const h = mount(<AppSettings {...props()} plan={{ id: 'vip', name: 'Premium', label: 'Gold', icon: 'star', content: <Text>Plans</Text> } as never} />, false);
    expect(rowsOnList(h.texts(), [...NAMES, 'Gold'])).toEqual(['About', 'Profile', 'Preferences', 'Premium']);
    const icons = h.root.root.findAll((n) => n.type === 'Icon').map((n) => n.props.name);
    expect(icons).toContain('award');
    expect(icons).not.toContain('star');
  });

  it("7.0.0: with no plan on sale (no content) the kit draws its Coming Soon page and the row reads Coming Soon", async () => {
    const h = mount(<AppSettings {...props()} plan={{ features: ['Shared household'], freeFeatures: ['Unlimited expenses'] }} />, false);
    expect(h.has('Coming Soon')).toBe(true);
    await press(h.byText('Premium'));
    expect(h.has('Every current My App feature is free. Premium will be available soon.')).toBe(true);
    expect(h.has('Compare Free and Premium')).toBe(true);
    expect(h.has('Shared household')).toBe(true);
    expect(h.has('Unlimited expenses')).toBe(true);
    // 10.0.0: the two old lists are gone.
    expect(h.has('What Premium Will Add')).toBe(false);
    expect(h.has('Free in My App Today')).toBe(false);
  });

  it('10.0.0: the comparison marks Premium features apart from free ones, in order, for screen readers too', async () => {
    const h = mount(<AppSettings {...props()} plan={{ features: [{ label: 'Repeat Alerts', detail: 'Up to 5 Times', icon: 'repeat' }, 'Workspaces'], freeFeatures: ['Sync Across Devices'] }} />, false);
    await press(h.byText('Premium'));
    const said = h.root.root.findAll((n) => n.type === 'View' && typeof n.props.accessibilityLabel === 'string' && n.props.accessibilityLabel.includes('Free:')).map((n) => n.props.accessibilityLabel);
    expect(said).toEqual([
      'Repeat Alerts, Up to 5 Times. Free: Not included. Premium: Included.',
      'Workspaces. Free: Not included. Premium: Included.',
      'Sync Across Devices. Free: Included. Premium: Included.',
    ]);
    expect(h.has('Up to 5 Times')).toBe(true);
    expect(h.has('FREE')).toBe(true);
    expect(h.has('PREMIUM')).toBe(true);
    expect(h.has('Your Plan')).toBe(false);
  });

  it("10.0.0: a plan on sale shows the app's page and then the same comparison; a subscriber's column reads Your Plan", async () => {
    const h = mount(<AppSettings {...props()} plan={{ content: <Text>Own plans</Text>, subscribed: true, features: ['Workspaces'], freeFeatures: ['Sync Across Devices'] }} />, false);
    await press(h.byText('Premium'));
    const texts = h.texts();
    expect(texts.indexOf('Own plans')).toBeGreaterThan(-1);
    expect(texts.indexOf('Compare Free and Premium')).toBeGreaterThan(texts.indexOf('Own plans'));
    expect(h.has('Your Plan')).toBe(true);
  });

  it('7.0.0: the plan is called Premium in every app; an app\'s own name (VIP, Plus) is not used', () => {
    const h = mount(<AppSettings {...props()} plan={{ name: 'Plus', content: <Text>Own plans</Text> }} />, false);
    expect(rowsOnList(h.texts(), [...NAMES, 'Plus'])).toEqual(['About', 'Profile', 'Preferences', 'Premium']);
    expect(h.has('Plus')).toBe(false);
  });

  it('7.0.0: an app whose plan is on sale keeps its own page and row value', async () => {
    const h = mount(<AppSettings {...props()} plan={{ name: 'Premium', value: 'Yearly', content: <Text>Own plans</Text> }} />, false);
    expect(h.has('Coming Soon')).toBe(false);
    expect(h.has('Yearly')).toBe(true);
    await press(h.byText('Premium'));
    expect(h.has('Own plans')).toBe(true);
  });

  it("6.0.0: Data Export is a row on Profile that opens the kit's menu, with the kit's line on top and the kit's name", async () => {
    const h = mount(<AppSettings {...props()} dataExport={{ formats: [csv(), pdf({ locked: true })], onLocked: vi.fn(), label: 'Downloads', menu: { head: 'Own line' } } as never} />, false);
    await press(h.byText('Profile'));
    expect(h.has('Data Export')).toBe(true);
    expect(h.has('Downloads')).toBe(false);
    const menu = exportMenuOf(h);
    expect(menu.props.head).toBe('Choose a Format to Export');
    expect(menu.props.items.map((i: { label: string }) => i.label)).toEqual(['CSV File', 'PDF Report']);
  });

  it('draws the approved About: the logo under the title, every row, Rate and Share from the App Store number', async () => {
    const h = mount(<AppSettings {...props()} />, false);
    await press(h.byText('About'));
    expect(h.byLabel('My App logo')).toBeTruthy();
    for (const word of ['Features', 'Contact Support', 'Privacy Policy', 'Kits', 'Version', 'Info']) expect(h.has(word)).toBe(true);
    expect(h.texts().some((t) => /^Rate /.test(t))).toBe(true);
    expect(h.texts().some((t) => /^Share /.test(t))).toBe(true);
  });

  it("8.0.0: fills Version from the app itself and Kits from its package.json; an app's own Version line or build is not used", async () => {
    const h = mount(
      <AppSettings
        {...props()}
        about={{ ...props().about, version: { number: '9', label: 'own' } } as never}
        build={{ version: '1.0.0', buildNumber: '1', stamp: 'own stamp' }}
        appPackage={{
          dependencies: { react: '19.3.0', 'app-settings-kit': 'git+https://github.com/x/app-settings-kit.git#1234567abcdef', 'app-core-kit': 'git+https://github.com/x/app-core-kit.git#abcdef1234567' },
          kitVersions: { 'app-core-kit': 'v1.7.0', 'app-settings-kit': 'v8.0.0' },
        }}
      />,
      false,
    );
    await press(h.byText('About'));
    await press(h.byText('Version'));
    // From the expo-constants / expo-application stand-ins: app.json's version, the phone's build, the build-stamp time.
    expect(h.has('v4.18.0 | Build 22')).toBe(true);
    expect(h.has('Nov 14, 2026 | 10:45 AM CT')).toBe(true);
    expect(h.has('own')).toBe(false);
    expect(h.has('own stamp')).toBe(false);
    await press(h.byText('Kits'));
    const kits = h.texts().filter((t) => t.includes(' Kit'));
    expect(kits.findIndex((t) => t.includes('Core Kit') && t.includes('v1.7.0') && t.includes('abcdef1'))).toBeLessThan(kits.findIndex((t) => t.includes('Settings Kit') && t.includes('1234567')));
    expect(h.texts().some((t) => t.includes('React'))).toBe(false);
  });

  it('8.0.0: Appearance is the kit\'s row in a Display card at the end of Preferences', async () => {
    const onChange = vi.fn();
    const h = mount(<AppSettings {...props()} appearance={{ value: 'dark', onChange }} />, false);
    await press(h.byText('Preferences'));
    const texts = h.texts();
    expect(texts.indexOf('Display')).toBeGreaterThan(texts.indexOf('Currency'));
    expect(h.has('Appearance')).toBe(true);
    const none = mount(<AppSettings {...props()} />, false);
    await press(none.byText('Preferences'));
    expect(none.has('Appearance')).toBe(false);
  });

  it("8.0.0: Security is the kit's row in Preferences, opening the app's lock page", async () => {
    const h = mount(<AppSettings {...props()} security={{ content: <Text>PIN page</Text> }} />, false);
    expect(rowsOnList(h.texts(), [...NAMES, 'Security'])).toEqual(['About', 'Profile', 'Preferences', 'Premium']);
    await press(h.byText('Preferences'));
    await press(h.byText('Security'));
    expect(h.has('PIN page')).toBe(true);
  });

  it('8.0.0: the Erase Account warning is the kit\'s; a paying person is also told to cancel the subscription first', async () => {
    for (const [subscribed, says] of [[false, false], [true, true]] as const) {
      const h = mount(<AppSettings {...props()} strings={{ deleteWarning: 'own words' }} plan={{ content: <Text>P</Text>, subscribed }} />, false);
      await press(h.byText('Profile'));
      await press(h.byText('Erase Account'));
      expect(h.has('own words')).toBe(false);
      expect(h.texts().some((t) => t.startsWith('This erases every setting'))).toBe(true);
      expect(h.texts().some((t) => t.includes('Premium subscription keeps billing'))).toBe(says);
    }
  });

  it('9.0.0: on Android the Erase Account warning says to cancel in Google Play subscriptions', async () => {
    const { Platform } = await import('react-native');
    const was = Platform.OS;
    (Platform as { OS: string }).OS = 'android';
    try {
      const h = mount(<AppSettings {...props()} plan={{ content: <Text>P</Text>, subscribed: true }} />, false);
      await press(h.byText('Profile'));
      await press(h.byText('Erase Account'));
      expect(h.texts().some((t) => t.includes('cancel it in Google Play subscriptions'))).toBe(true);
      expect(h.texts().some((t) => t.includes('Apple ID'))).toBe(false);
    } finally {
      (Platform as { OS: string }).OS = was;
    }
  });

  it('8.0.0: the kit chooses the tile colors of the plan and Data Export rows from the theme', () => {
    const h = mount(<AppSettings {...props()} plan={{ tint: 'pink', content: <Text>P</Text> } as never} />, false);
    const tints = h.root.root.findAll((n) => typeof n.props.tint === 'string').map((n) => n.props.tint);
    expect(tints).not.toContain('pink');
  });

  it("6.0.0: always draws the kit's round Back button and swipe-back, even when the app passes its own", () => {
    const Mine = ({ onPress }: { onPress: () => void }) => <Pressable onPress={onPress} accessibilityLabel="mine"><Text>MINE</Text></Pressable>;
    for (const h of [mount(<AppSettings {...props()} />, false), mount(<AppSettings {...props()} components={{ BackButton: Mine }} />, false)]) {
      expect(h.root.root.findAll((n) => n.type === 'Animated.View').length).toBe(1);
      expect(h.root.root.findAll((n) => n.type === 'Pressable' && n.props.hitSlop === 12).length).toBe(1);
      expect(h.has('MINE')).toBe(false);
    }
  });

  it('4.0.0: Preferences and Profile are the same in every app, even when the app tries to rename them', () => {
    const h = mount(<AppSettings {...props()} strings={{ app: 'Options', account: 'Me' }} />, false);
    expect(rowsOnList(h.texts(), [...NAMES, 'Options', 'Me'])).toEqual(['About', 'Profile', 'Preferences', 'Premium']);
  });
});

describe('8.0.0 Share on Android', () => {
  it('sends the Google Play page on Android when the app has one, the App Store page otherwise', async () => {
    const { Platform } = await import('react-native');
    const { playStorePage, appStorePage } = await import('../src/AppSettings');
    expect(playStorePage('com.example.app')).toBe('https://play.google.com/store/apps/details?id=com.example.app');
    expect(appStorePage(' 6830296391 ')).toBe('https://apps.apple.com/app/id6830296391');
    expect(Platform.OS).toBe('ios');
  });
});

describe('9.1.0 Google Play id from app.json', () => {
  it('reads expo.android.package, so no app passes it', async () => {
    const Constants = (await import('expo-constants')).default as { expoConfig: Record<string, unknown> };
    const { expoPlayPackage } = await import('../src/expoBuild');
    const before = Constants.expoConfig.android;
    Constants.expoConfig.android = { package: ' com.example.reminders ' };
    try {
      expect(expoPlayPackage()).toBe('com.example.reminders');
    } finally {
      Constants.expoConfig.android = before;
    }
  });
  it('has none on iPhone when app.json names no Android package', async () => {
    const { expoPlayPackage } = await import('../src/expoBuild');
    expect(expoPlayPackage()).toBeUndefined();
  });
});

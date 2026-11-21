import { SettingRow, SettingsGroup } from 'app-account-kit';
import { Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { assemblePages } from '../src/assemble';
import { AppSettings, type AppSettingsProps } from '../src/AppSettings';
import { DEFAULT_SETTINGS_STRINGS as W } from '../src/strings';
import type { ExportFormat } from '../src/types';
import { THEME } from './helpers/theme';
import { mount, press } from './helpers/render';

// 2.2.0: Data Export and the app's own pages inside Preferences, and the Account row called Profile. All opt-in.
const csv: ExportFormat = { id: 'csv', label: 'CSV File', icon: 'file-text', tint: 'mint', onExport: async () => {} };
const props = (over: Partial<AppSettingsProps> = {}): AppSettingsProps => ({
  theme: THEME,
  onBack: vi.fn(),
  profile: { name: 'Yuva', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  about: { appName: 'My App', version: { number: '1.2.0', label: 'v1.2' }, privacyUrl: 'https://x.y/p', supportEmail: 'h@x.com' },
  actions: { confirmsWithPassword: true, onSignOut: async () => {} },
  ...over,
});
const prefs = <SettingsGroup><SettingRow icon="dollar-sign" tint="x" label="Currency" last /></SettingsGroup>;
const family = { id: 'family', label: 'Connect as Family', icon: 'users', content: <Text>Family page</Text>, under: 'preferences' } as const;
const NAMES = ['About', 'Account', 'Profile', 'Preferences', 'Data Export', 'VIP', 'Connect as Family'];
const onList = (texts: string[]) => texts.filter((t) => NAMES.includes(t));

describe('assemblePages placement', () => {
  it('keeps Data Export on Account by default, exactly as 2.1', () => {
    const { extraPages } = assemblePages({ dataExport: { content: null }, strings: W });
    expect(extraPages.map((p) => [p.id, p.under])).toEqual([['export', 'account']]);
  });

  it("puts Data Export on Preferences and turns 'preferences' into app-account-kit's 'app'", () => {
    const { extraPages, hubOrder } = assemblePages({ dataExport: { content: null }, dataExportIn: 'preferences', extraPages: [family, { id: 'p', label: 'P', icon: 'award', content: null }], strings: W });
    expect(extraPages.map((p) => [p.id, p.under])).toEqual([['export', 'app'], ['family', 'app'], ['p', undefined]]);
    expect(extraPages[2]).not.toHaveProperty('under');
    expect(hubOrder).toEqual(['about', 'account', 'app', 'plan']);
  });
});

describe('AppSettings with Profile and Preferences', () => {
  it('Moonpenny layout: About, Profile, Preferences, VIP on the list; Data Export and Connect as Family inside Preferences; Back returns to Preferences', async () => {
    const h = mount(
      <AppSettings
        {...props()}
        settingsStrings={{ account: 'Profile' }}
        preferences={prefs}
        dataExportIn="preferences"
        dataExport={{ formats: [csv] }}
        plan={{ id: 'vip', label: 'VIP', content: <Text>VIP page</Text> }}
        extraPages={[family]}
      />,
      false,
    );
    expect(onList(h.texts())).toEqual(['About', 'Profile', 'Preferences', 'VIP']);
    await press(h.byText('Profile'));
    expect(h.has('Data Export')).toBe(false);
    await press(h.byLabel('Back'));
    await press(h.byText('Preferences'));
    expect(onList(h.texts())).toEqual(['Preferences', 'Data Export', 'Connect as Family']);
    expect(h.has('Currency')).toBe(true);
    await press(h.byText('Data Export'));
    expect(h.has('CSV File')).toBe(true);
    await press(h.byLabel('Back'));
    await press(h.byText('Connect as Family'));
    expect(h.has('Family page')).toBe(true);
    await press(h.byLabel('Back'));
    expect(h.has('Currency')).toBe(true);
  });

  it("strings.account still wins over settingsStrings.account; without either the row is 'Profile' (4.0.0)", () => {
    expect(onList(mount(<AppSettings {...props()} settingsStrings={{ account: 'Profile' }} strings={{ account: 'Me' }} />, false).texts())).toEqual(['About']);
    expect(mount(<AppSettings {...props()} settingsStrings={{ account: 'Profile' }} strings={{ account: 'Me' }} />, false).has('Me')).toBe(true);
    expect(onList(mount(<AppSettings {...props()} />, false).texts())).toEqual(['About', 'Profile']);
  });
});

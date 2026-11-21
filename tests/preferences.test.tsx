import { Text } from 'react-native';
import { describe, expect, it } from 'vitest';
import { assemblePages } from '../src/assemble';
import { DEFAULT_SETTINGS_STRINGS as W } from '../src/strings';

// How app pages are placed. 6.0.0: AppSettings always keeps Data Export on Profile; the app's own pages can still sit on Preferences.
const family = { id: 'family', label: 'Connect as Family', icon: 'users', content: <Text>Family page</Text>, under: 'preferences' } as const;

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

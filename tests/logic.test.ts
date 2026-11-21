import { describe, expect, it, vi } from 'vitest';
import pkg from '../package.json';
import { KIT_VERSION } from '../src/kit';
import { missingAboutParts, titleCaseStrings, createOneAtATime, DEFAULT_ORDER, hubOrder, kitList, pinnedBuild, versionLines } from '../src/logic';
import { finishesSwipe, isEdgeSwipe } from '../src/logic/swipe';

describe('kits list', () => {
  it('reads the short commit a kit is pinned to', () => {
    expect(pinnedBuild('git+https://github.com/x/app-account-kit.git#21d95520846296830d8c643187d475318c196533')).toBe('21d9552');
    expect(pinnedBuild('https://codeload.github.com/x/app-core-kit/tar.gz/6b1a0df003faa84f85b0f9b5bfc51fcac5e7527f')).toBe('6b1a0df');
    expect(pinnedBuild('^1.2.0')).toBeUndefined();
    expect(pinnedBuild(undefined)).toBeUndefined();
  });

  it('builds one entry per kit from the app package.json pins', () => {
    const deps = { 'app-core-kit': 'https://codeload.github.com/x/app-core-kit/tar.gz/6b1a0df003faa84f85b0f9b5bfc51fcac5e7527f', 'app-auth-kit': '^1.0.0' };
    expect(
      kitList(deps, [
        { name: 'Core Kit', pkg: 'app-core-kit', version: '1.6.0' },
        { name: 'Auth Kit', pkg: 'app-auth-kit', version: '1.10.0' },
        { name: 'Gone Kit', pkg: 'app-gone-kit', version: '0.1.0' },
      ]),
    ).toEqual([{ name: 'Core Kit', version: '1.6.0', build: '6b1a0df' }, { name: 'Auth Kit', version: '1.10.0' }, { name: 'Gone Kit', version: '0.1.0' }]);
  });
});

describe('version line', () => {
  it('shows the version, the store build number and the build time, as HringNring and Moonpenny do', () => {
    expect(versionLines({ version: '4.18.0', buildNumber: '12', stamp: 'Nov 14, 2026 | 10:45 AM CT' })).toEqual({
      lines: ['v4.18.0 | Build 12', 'Nov 14, 2026 | 10:45 AM CT'],
      label: 'v4.18.0 | Build 12 | Nov 14, 2026 | 10:45 AM CT',
    });
  });

  it('leaves out the build number on the web and says "dev build" without a stamp', () => {
    expect(versionLines({ version: '1.0.0', buildNumber: null, stamp: undefined }).lines).toEqual(['v1.0.0', 'dev build']);
    expect(versionLines({ version: '1.0.0', buildNumber: '3', fallbackStamp: 'local', buildWord: 'Build no.' }).lines).toEqual(['v1.0.0 | Build no. 3', 'local']);
  });
});

describe('row order', () => {
  it('is the four parents About, Account, Preferences, plan by default', () => {
    expect(DEFAULT_ORDER).toEqual(['about', 'account', 'app', 'plan']);
    expect(hubOrder()).toEqual(['about', 'account', 'app', 'plan']);
    // Data Export is never on the list, even when an older order names it.
    expect(hubOrder(['about', 'account', 'app', 'export', 'plan'])).toEqual(['about', 'account', 'app', 'plan']);
  });

  it("puts in the app's own page ids and drops repeats", () => {
    expect(hubOrder(undefined, { plan: 'vip' })).toEqual(['about', 'account', 'app', 'vip']);
    expect(hubOrder(['plan', 'about', 'family', 'vip'], { plan: 'vip', export: 'files' })).toEqual(['vip', 'about', 'family']);
  });
});

describe('one file at a time', () => {
  it('skips a second job while one runs, and reports a failure', async () => {
    const onFail = vi.fn();
    const runner = createOneAtATime(onFail);
    let finish!: () => void;
    const first = vi.fn(() => new Promise<void>((r) => (finish = r)));
    expect(runner.run(first)).toBe(true);
    expect(runner.run(vi.fn())).toBe(false);
    await Promise.resolve();
    finish();
    await new Promise((r) => setTimeout(r, 0));
    expect(runner.busy).toBe(false);
    runner.run(() => Promise.reject(new Error('disk full')));
    await new Promise((r) => setTimeout(r, 0));
    expect(onFail).toHaveBeenCalledWith(expect.objectContaining({ message: 'disk full' }));
    expect(runner.busy).toBe(false);
  });
});

describe('kit version', () => {
  it('KIT_VERSION equals package.json', () => {
    expect(KIT_VERSION).toBe(pkg.version);
  });
});

describe('the approved About page', () => {
  it('names Rate and Share with the app, in Title Case', () => {
    expect(titleCaseStrings('Moonpenny')).toMatchObject({ rate: 'Rate Moonpenny', share: 'Share Moonpenny', contactSupport: 'Contact Support', privacy: 'Privacy Policy', supportTitle: "We're Here to Help", writeToUs: 'Write to Us' });
  });

  it('lists the parts an app leaves out', () => {
    expect(missingAboutParts({})).toEqual(['logo', 'featuresUrl', 'rate', 'share', 'kits']);
    expect(missingAboutParts({ logo: 1, featuresUrl: 'https://x', rate: {}, share: {}, kits: [] })).toEqual([]);
  });
});

describe('swipe back', () => {
  it('starts only at the left edge going right, and finishes when far enough or flicked', () => {
    expect(isEdgeSwipe(10, 20, 2)).toBe(true);
    expect(isEdgeSwipe(60, 20, 2)).toBe(false);
    expect(isEdgeSwipe(10, 20, 30)).toBe(false);
    expect(finishesSwipe(200, 0, 390)).toBe(true);
    expect(finishesSwipe(40, 0.9, 390)).toBe(true);
    expect(finishesSwipe(40, 0.1, 390)).toBe(false);
  });
});

import { exportMenu } from '../src/pages/DataExportPage';

describe('exportMenu (3.3.0)', () => {
  const csv = { id: 'csv', label: 'CSV File', detail: 'Every expense', icon: 'file-text' as const, tint: '#000000', onExport: async () => {} };
  it('one format: its first word in the pill, its detail on top, a tap runs it', () => {
    const run = vi.fn();
    const m = exportMenu({ formats: [csv], menu: true }, run);
    expect(m.pill).toBe('CSV');
    expect(m.head).toBe('Every expense');
    m.onPick('csv');
    expect(run).toHaveBeenCalledWith(csv.onExport);
  });
  it('a locked format opens the plans instead', () => {
    const run = vi.fn();
    const onLocked = vi.fn();
    const m = exportMenu({ formats: [{ ...csv, locked: true }, { ...csv, id: 'pdf', label: 'PDF' }], menu: { head: 'Pick one' }, onLocked }, run);
    expect(m.pill).toBe(`${csv.label.split(' ')[0]} / PDF`); // 3.4.0: every format's short word
    expect(m.head).toBe('Pick one');
    expect(m.items.map((i) => i.icon)).toEqual(['lock', 'share']);
    m.onPick('csv');
    expect(onLocked).toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
  });
});

describe('card headings', () => {
  it('4.0.1: the Profile page does not repeat its name; the first card is headed Account', async () => {
    const { cardHeadings } = await import('../src/logic/about');
    expect(cardHeadings('HringNring')).toMatchObject({ profileGroup: 'Account', dataGroup: 'Your Data', exitGroup: 'Sign In' });
  });
});

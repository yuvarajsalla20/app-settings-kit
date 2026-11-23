import { Text } from 'react-native';
import { afterEach, describe, expect, it } from 'vitest';
import { setPlanMode } from 'app-account-kit';
import { AppSettings } from '../src/AppSettings';
import { mount, press } from './helpers/render';
import { fullProps as props } from './helpers/props';

const NAMES = ['About', 'Profile', 'Preferences', 'Subscription', 'Plan'];

describe('plan mode (18.0.0)', () => {
  afterEach(() => setPlanMode('free'));

  it('free (the default): the row reads Plan with Free beside it, has no arrow and opens nothing', async () => {
    const h = mount(<AppSettings {...props()} plan={{ content: <Text>The Subscription Page</Text>, subscribed: true }} />, false);
    expect(h.texts().filter((t) => NAMES.includes(t))).toEqual(['About', 'Profile', 'Preferences', 'Plan']);
    expect(h.has('Free')).toBe(true);
    // Not a button: nothing pressable holds it.
    expect(() => h.byText('Plan')).toThrow(/nothing pressable/);
    expect(h.has('The Subscription Page')).toBe(false);
  });

  it('free: Data Export is open to everyone with no Premium tag, and Erase Account names no subscription', async () => {
    const h = mount(<AppSettings {...props()} plan={{ content: <Text>P</Text>, subscribed: true }} />, false);
    await press(h.byText('Profile'));
    expect(h.has('Data Export')).toBe(true);
    expect(h.has('PREMIUM')).toBe(false);
    await press(h.byText('Erase Account'));
    expect(h.texts().some((t) => t.includes('Premium subscription keeps billing'))).toBe(false);
  });

  it('subscription: the Subscription row opens the plan page as before', async () => {
    setPlanMode('subscription');
    const h = mount(<AppSettings {...props()} plan={{ content: <Text>The Subscription Page</Text> }} />, false);
    expect(h.texts().filter((t) => NAMES.includes(t))).toEqual(['About', 'Profile', 'Preferences', 'Subscription']);
    await press(h.byText('Subscription'));
    expect(h.has('The Subscription Page')).toBe(true);
  });
});

import { Text } from 'react-native';
import { create } from 'react-test-renderer';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { makePageHeader } from '../src/parts/PageHeader';
import { homeGreeting, homeInitial, makeHomeHeader } from '../src/parts/HomeHeader';
import { THEME } from './helpers/theme';

describe('8.0.0 makePageHeader', () => {
  it("draws the kit's round Back button, the title and the word after it, like every Settings page", () => {
    const PageHeader = makePageHeader(THEME, { Text });
    const onBack = vi.fn();
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(<PageHeader title="Categories" titleRight="Nov 2026" onBack={onBack} backLabel="Back to Home" />);
    });
    const back = root.root.findAll((n) => n.type === 'Pressable' && n.props.accessibilityLabel === 'Back to Home');
    expect(back.length).toBe(1);
    back[0].props.onPress();
    expect(onBack).toHaveBeenCalled();
    const texts = root.root.findAll((n) => n.type === 'Text').map((n) => n.props.children);
    expect(texts).toEqual(['Categories', 'Nov 2026']);
  });

  it('has no Back button on a screen with nowhere to go back to', () => {
    const PageHeader = makePageHeader(THEME);
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(<PageHeader title="Home" />);
    });
    expect(root.root.findAll((n) => n.type === 'Pressable').length).toBe(0);
  });
});

describe('13.1.0 shared headers', () => {
  const press = (root: ReturnType<typeof create>, label: string) => root.root.find((n) => n.type === 'Pressable' && n.props.accessibilityLabel === label).props.onPress();
  const texts = (root: ReturnType<typeof create>) => root.root.findAll((n) => n.type === 'Text').map((n) => n.props.children);

  it('draws at most two buttons at the right end', () => {
    const PageHeader = makePageHeader(THEME);
    const add = vi.fn();
    const buttons = ['Add Category', 'More', 'Third'].map((label) => ({ icon: 'plus' as const, label, onPress: label === 'Add Category' ? add : vi.fn() }));
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(<PageHeader title="Categories" onBack={vi.fn()} buttons={buttons} />);
    });
    const labels = root.root.findAll((n) => n.type === 'Pressable').map((n) => n.props.accessibilityLabel);
    expect(labels).toEqual(['Back', 'Add Category', 'More']);
    press(root, 'Add Category');
    expect(add).toHaveBeenCalled();
  });

  it('shows the subtitle and the filters, and reports the chosen filter', () => {
    const PageHeader = makePageHeader(THEME);
    const onSelect = vi.fn();
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(<PageHeader title="Completed" subtitle="24 Reminders This Month" filters={{ options: ['All', 'This Week'], selected: 'All', onSelect }} />);
    });
    expect(texts(root)).toEqual(['Completed', '24 Reminders This Month', 'All', 'This Week']);
    const tabs = root.root.findAll((n) => n.type === 'Pressable' && n.props.accessibilityRole === 'tab');
    expect(tabs.map((t) => t.props.accessibilityState.selected)).toEqual([true, false]);
    tabs[1].props.onPress();
    expect(onSelect).toHaveBeenCalledWith('This Week');
  });

  it('draws a sheet with Close in place of Back and the confirm button', () => {
    const PageHeader = makePageHeader(THEME);
    const onClose = vi.fn();
    const onSave = vi.fn();
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(<PageHeader title="Add Reminder" onBack={vi.fn()} onClose={onClose} confirm={{ label: 'Save', onPress: onSave }} />);
    });
    const labels = root.root.findAll((n) => n.type === 'Pressable').map((n) => n.props.accessibilityLabel);
    expect(labels).toEqual(['Close', 'Save']);
    press(root, 'Close');
    press(root, 'Save');
    expect(onClose).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });

  it('greets with Hi and the nickname, else the app name, and opens Profile from the photo', () => {
    expect(homeGreeting(' Yuva ', 'Sample App')).toBe('Hi Yuva');
    expect(homeGreeting('', 'Sample App')).toBe('Sample App');
    expect(homeInitial(null, 'Sample App')).toBe('S');
    const HomeHeader = makeHomeHeader(THEME);
    const open = vi.fn();
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(<HomeHeader name="Yuva" fallbackName="Sample App" onOpenProfile={open} button={{ icon: 'search', label: 'Search', onPress: vi.fn() }} />);
    });
    expect(texts(root)).toEqual(['Hi Yuva', 'Y']);
    expect(root.root.findAll((n) => n.type === 'Pressable').map((n) => n.props.accessibilityLabel)).toEqual(['Search', 'Profile']);
    press(root, 'Profile');
    expect(open).toHaveBeenCalled();
  });
});

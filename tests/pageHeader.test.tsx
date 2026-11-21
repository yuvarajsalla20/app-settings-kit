import { Text } from 'react-native';
import { create } from 'react-test-renderer';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { makePageHeader } from '../src/parts/PageHeader';
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

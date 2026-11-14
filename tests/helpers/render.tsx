import { AccountProvider } from 'app-account-kit';
import type { ReactElement } from 'react';
import TestRenderer, { act, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { THEME } from './theme';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const nodeMock = () => ({ focus: () => {}, scrollTo: () => {}, scrollToEnd: () => {} });

/** Renders (inside app-account-kit's provider when `provider` is true) and returns helpers to find what the person sees. */
export const mount = (ui: ReactElement, provider = true) => {
  let root!: ReactTestRenderer;
  const wrap = (el: ReactElement) => (provider ? <AccountProvider theme={THEME}>{el}</AccountProvider> : el);
  act(() => {
    root = TestRenderer.create(wrap(ui), { createNodeMock: nodeMock });
  });
  const texts = () => root.root.findAll((n) => n.type === 'Text').map((n) => [n.props.children].flat().join(''));
  return {
    root,
    /** Every visible text, in order. */
    texts,
    has: (text: string) => texts().includes(text),
    /** The pressable that holds this visible text. */
    byText: (text: string): ReactTestInstance => {
      let node: ReactTestInstance | null = root.root.findAll((n) => typeof n.type === 'string' && [n.props.children].flat().join('') === text)[0] ?? null;
      while (node && !node.props.onPress) node = node.parent;
      if (!node) throw new Error(`nothing pressable shows "${text}"`);
      return node;
    },
    byLabel: (label: string): ReactTestInstance => root.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.type === 'string')[0]!,
  };
};

/** Presses and waits for what it started. */
export const press = (button: ReactTestInstance) => act(async () => void button.props.onPress());
/** Lets started promises settle. */
export const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
export { act };

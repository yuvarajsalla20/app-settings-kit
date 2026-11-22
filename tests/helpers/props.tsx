import { Text } from 'react-native';
import { vi } from 'vitest';
import type { AppSettingsProps } from '../../src/AppSettings';
import type { ExportFormat } from '../../src/types';
import { THEME } from './theme';

export const CSV: ExportFormat = { id: 'csv', label: 'CSV File', icon: 'file-text', tint: 'mint', onExport: async () => {} };

/** 8.0.0: everything an app must give AppSettings, filled in. */
export const fullProps = (over: Partial<AppSettingsProps> = {}): AppSettingsProps => ({
  theme: THEME,
  onBack: vi.fn(),
  profile: { name: 'Yuva', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  photo: { pick: async () => null, onChange: async () => {}, cameraSupported: false },
  about: { appName: 'My App', logo: { uri: 'https://x.y/logo.png', width: 1024 }, privacyUrl: 'https://x.y/p', featuresUrl: 'https://x.y/features', supportEmail: 'h@x.com', appStoreId: '6830296391' },
  appPackage: { dependencies: {}, kitVersions: {} },
  actions: { confirmsWithPassword: true, onSignOut: async () => {}, onDeleteAccount: async () => {} },
  preferences: <Text>Currency</Text>,
  appearance: { value: 'system', onChange: () => {} },
  dataExport: { formats: [CSV] },
  plan: { id: 'vip', content: <Text>VIP page</Text>, features: ['Shared Ledger'], freeFeatures: ['Unlimited Expenses'] },
  ...over,
});

import { Text } from 'react-native';
import { vi } from 'vitest';
import type { AppSettingsProps } from '../../src/AppSettings';
import type { ExportFormat } from '../../src/types';
import { THEME } from './theme';

export const CSV: ExportFormat = { id: 'csv', label: 'CSV File', icon: 'file-text', tint: 'mint', onExport: async () => {} };

/** 6.0.0: everything an app must give AppSettings, filled in. */
export const fullProps = (over: Partial<AppSettingsProps> = {}): AppSettingsProps => ({
  theme: THEME,
  onBack: vi.fn(),
  profile: { name: 'Yuva', fallbackName: 'App', email: 'a@b.com', photo: '' },
  nickname: { max: 20, onSave: async () => {} },
  photo: { pick: async () => null, onChange: async () => {}, cameraSupported: false },
  about: { appName: 'My App', logo: { uri: 'https://x.y/logo.png', width: 1024 }, privacyUrl: 'https://x.y/p', featuresUrl: 'https://x.y/features', supportEmail: 'h@x.com', appStoreId: '6830296391' },
  build: { version: '1.2.0', buildNumber: '3', stamp: 'Nov 21, 2026 | 10:00 AM CT' },
  kitSources: { dependencies: {}, kits: [] },
  actions: { confirmsWithPassword: true, onSignOut: async () => {}, onDeleteAccount: async () => {} },
  preferences: <Text>Currency</Text>,
  dataExport: { formats: [CSV] },
  plan: { id: 'vip', name: 'VIP', content: <Text>VIP page</Text> },
  ...over,
});

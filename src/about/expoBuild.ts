import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { VersionParts } from './version';

/** Expo Go's own app id: there the phone reports Expo Go's build number, not the app's. */
const EXPO_GO_IDS = ['host.exp.Exponent', 'host.exp.exponent'];

/**
 * 8.0.0: About > Version read straight from the app, so no app writes it: the version from app.json, the store build number
 * from the phone (none in Expo Go, on the web or in a local run), and the build time that `app-settings-kit/build-stamp`
 * put in app.config.js (`extra.buildStamp`).
 */
export function expoBuild(): VersionParts {
  const config = Constants.expoConfig;
  const inExpoGo = EXPO_GO_IDS.includes(Application.applicationId ?? '');
  const stamp = (config?.extra as { buildStamp?: unknown } | undefined)?.buildStamp;
  return {
    version: config?.version ?? '',
    buildNumber: inExpoGo ? null : (Application.nativeBuildVersion ?? null),
    stamp: typeof stamp === 'string' ? stamp : null,
  };
}

/**
 * 9.1.0: the app's Google Play id, read from the app itself so no app has to pass it: the Android package from app.json
 * (`expo.android.package`), or the installed app's own id on an Android phone. Undefined in Expo Go and when there is none.
 */
export function expoPlayPackage(): string | undefined {
  const fromConfig = (Constants.expoConfig as { android?: { package?: unknown } } | null | undefined)?.android?.package;
  if (typeof fromConfig === 'string' && fromConfig.trim()) return fromConfig.trim();
  const id = Application.applicationId ?? '';
  return id && !EXPO_GO_IDS.includes(id) && Platform.OS === 'android' ? id : undefined;
}

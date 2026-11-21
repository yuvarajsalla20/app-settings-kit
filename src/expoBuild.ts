import * as Application from 'expo-application';
import Constants from 'expo-constants';
import type { VersionParts } from './logic/version';

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

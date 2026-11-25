import { setPlanMode, supportMailUrl, type AboutProps, type PlanMode } from 'app-account-kit';
import { Platform, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { appStorePage, playStorePage, type AboutConfig, type AppSettingsProps } from './appSettingsTypes';
import { expoBuild, expoPlayPackage } from './expoBuild';
import { useDevWarning } from './logic/devWarning';
import { kitList, kitsFromPackage, type AppPackage, type KitSource } from './logic/kits';
import { createOneAtATime } from './logic/oneAtATime';
import { supportDevice, type SupportTransport } from './logic/support';
import { useSupportForm } from './logic/useSupportForm';
import { versionLines } from './logic/version';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { ContactSupportPage } from './pages/ContactSupportPage';
import { exportMenu } from './pages/DataExportPage';
import { FreePlanPage } from './pages/FreePlanPage';
import { PlanCompare, featureParts } from './pages/PlanCompare';
import { pickScreenshot } from './parts/pickScreenshot';
import type { SettingsStrings } from './strings';
import type { DataExportConfig, PlanConfig, PlanFeature } from './types';

/** 12.0.0: a plan feature line that names Data Export. */
const EXPORT_WORD = /data export/i;

type Theme = AppSettingsProps['theme'];
type Components = AppSettingsProps['components'];
type OnError = ((where: string, error: unknown) => void) | undefined;

/** 6.0.0: only the page id and the tile color (the app's palette) come from the app; the name and icon are the kit's. 13.0.0: neither row takes a value or pill. */
export const kitRow = (row: { id?: string; tint?: string }) => ({
  ...(row.id ? { id: row.id } : {}),
  ...(row.tint ? { tint: row.tint } : {}),
});

/**
 * The About page's props. 5.0.0: the approved About in every app: the title "About" with the logo under it, then every row.
 * 8.0.0: Version from the app itself and Kits from its package.json, the same in every app.
 */
export function useAbout(aboutIn: AboutConfig, appPackage: AppPackage | undefined, kitSources: { dependencies: Readonly<Record<string, string>>; kits: readonly KitSource[] } | undefined): AboutProps {
  return useMemo<AboutProps>(() => {
    const { appStoreId, playPackage: ownPlayPackage, shareMessage, ...restAbout } = aboutIn as AboutConfig & { version?: unknown; supportPage?: ReactNode };
    delete (restAbout as { version?: unknown }).version;
    delete (restAbout as { supportPage?: unknown }).supportPage;
    const build = expoBuild();
    const version = { number: build.version, ...versionLines(build) };
    const kits = appPackage ? kitsFromPackage(appPackage) : kitSources ? kitList(kitSources.dependencies, kitSources.kits) : undefined;
    // 9.1.0: the Google Play id comes from app.json, so Share and Rate work on Android in every app without app code.
    const playPackage = expoPlayPackage() ?? ownPlayPackage;
    // 8.0.0: Share sends the Google Play page on Android when the app has one, the App Store page everywhere else.
    const shareUrl = Platform.OS === 'android' && playPackage ? playStorePage(playPackage) : appStoreId ? appStorePage(appStoreId) : undefined;
    return {
      ...restAbout,
      showHeader: 'logo',
      version,
      kits,
      rate: { appStoreId, playPackage },
      share: { url: shareUrl, message: shareMessage },
    };
  }, [aboutIn, appPackage, kitSources]);
}

/**
 * 18.0.0: with nothing on sale (plan mode 'free', the default; app-subscriptions-kit sets it from config/app) the plan row
 * reads Plan · Free with no page. 18.1.0: an app without app-subscriptions-kit reads the owner's switch here; the answer is
 * shared with every kit.
 */
export function usePlanModeSource(source: (() => Promise<PlanMode>) | undefined): void {
  useEffect(() => {
    if (!source) return;
    let live = true;
    source()
      .then((m) => live && setPlanMode(m))
      .catch(() => live && setPlanMode('free'));
    return () => {
      live = false;
    };
  }, [source]);
}

/**
 * 3.3.0: Data Export's pull-down menu, one line per format, one file at a time. 12.0.0: Data Export is Premium in every app:
 * every format is locked unless the account pays for Premium, and a format's own `locked` is not used. 19.0.0: while the plan
 * mode is 'free', nothing unlocks it.
 */
export function useExportMenu(dataExport: DataExportConfig, onError: OnError, words: SettingsStrings, open: boolean) {
  const report = useRef({ onError: dataExport?.onError ?? onError, onProblem: dataExport?.onProblem, text: words.exportFailed });
  useEffect(() => {
    report.current = { onError: dataExport?.onError ?? onError, onProblem: dataExport?.onProblem, text: words.exportFailed };
  });
  const runner = useRef<ReturnType<typeof createOneAtATime> | null>(null);
  runner.current ??= createOneAtATime((error) => {
    report.current.onError?.('data-export', error);
    report.current.onProblem?.(report.current.text);
  });
  const formats = useMemo(() => dataExport.formats.map((f) => ({ ...f, locked: !open })), [dataExport.formats, open]);
  const ownLocks = dataExport.formats.some((f) => 'locked' in f);
  useDevWarning(ownLocks && 'dataExport.formats[].locked is not used. Data Export is Premium in every app: the kit locks every format unless plan.subscribed is true.');
  // The menu has no page to draw on, so renderProblem cannot show there: say so in development instead of dropping it quietly.
  useDevWarning(!!(dataExport.renderProblem && !dataExport.onProblem) && 'dataExport.renderProblem is not shown (Data Export is a menu, with no page). Pass dataExport.onProblem to show the sentence your own way.');
  return exportMenu({ ...dataExport, formats, menu: { head: words.exportHead } }, (job) => runner.current?.run(job));
}

/**
 * The Subscription row and page. 22.0.0: free mode shows the Free plan card and every free feature. 7.0.0: with a plan but
 * nothing on sale yet, the kit's Coming Soon page and the comparison. 14.0.0 Page rule: with a plan on sale the page holds
 * plan facts only (the app's `plan.content`); the comparison is on the Plans screen.
 */
export function usePlanSection({ plan, dataExport, selling, theme, components, words, appName, tint }: { plan: PlanConfig; dataExport: DataExportConfig; selling: boolean; theme: Theme; components: Components; words: SettingsStrings; appName: string; tint: string }) {
  // 12.0.0: Data Export is Premium in every app, so the comparison always lists it under Premium. An app that names it in
  // its own `features` keeps its line; otherwise the kit adds "Data Export" with the formats (e.g., "CSV File or PDF File").
  const exportFormatWords = dataExport.formats.map((f) => f.label).join(' or ');
  const premiumFeatures = useMemo<readonly PlanFeature[]>(() => {
    const own = plan.features ?? [];
    if (own.some((f) => EXPORT_WORD.test(featureParts(f).label))) return own;
    return [...own, { label: words.dataExport, icon: 'download', ...(exportFormatWords ? { detail: exportFormatWords } : {}) }];
  }, [plan.features, words.dataExport, exportFormatWords]);
  useDevWarning((plan.freeFeatures ?? []).some((f) => EXPORT_WORD.test(featureParts(f).label)) && 'plan.freeFeatures names Data Export, which is Premium in every app. Remove it from the free list.');
  const comingSoon = plan.content === undefined || plan.content === null;
  // 10.0.0 / 22.0.0: the Subscription page lists what is free (and, on Coming Soon, what the plan adds), so both lists are needed.
  const missingLists = !selling ? (plan.freeFeatures?.length ? '' : 'plan.freeFeatures') : comingSoon ? [!plan.features?.length && 'plan.features', !plan.freeFeatures?.length && 'plan.freeFeatures'].filter(Boolean).join(' and ') : '';
  useDevWarning(missingLists && `${missingLists} is empty. The Subscription page lists what is free (and, on Coming Soon, what the plan adds), so pass both lists.`);
  const Txt = components?.Text as never;
  const row = kitRow({ id: plan.id, tint });
  if (!selling) return { row, content: <FreePlanPage theme={theme} freeFeatures={plan.freeFeatures ?? []} Text={Txt} strings={words} /> };
  if (!comingSoon) return { row, content: plan.content };
  return {
    row,
    content: (
      <View style={{ gap: 16 }}>
        <ComingSoonPage appName={appName} planName={words.plan} tint={tint} theme={theme} Text={Txt} strings={words} />
        <PlanCompare theme={theme} gold={tint} planName={words.plan} features={premiumFeatures} freeFeatures={plan.freeFeatures ?? []} subscribed={!!plan.subscribed} Text={Txt} strings={words} />
      </View>
    ),
  };
}

/**
 * 15.0.0: About › Contact Support is the kit's in-app form, with the details it adds from the app and the phone. 16.0.0: only
 * while the owner's switch is on; otherwise it opens the Mail app, as before. The form also offers Mail.
 */
export function useSupportPage({ support, about, appName, profile, subscribed, theme, components, words, onError }: { support: SupportTransport | undefined; about: AboutProps; appName: string; profile: AppSettingsProps['profile']; subscribed: boolean; theme: Theme; components: Components; words: SettingsStrings; onError: OnError }): ReactNode | undefined {
  const formOn = useSupportForm(support);
  if (!support || !formOn) return undefined;
  const build = expoBuild();
  const constants = (Platform as { constants?: { Model?: string } }).constants;
  const phone = supportDevice(Platform.OS, Platform.Version, constants?.Model, (Platform as { isPad?: boolean }).isPad);
  const mailUrl = supportMailUrl({ email: about.supportEmail, appName, versionNumber: build.version, device: `${Platform.OS} ${Platform.Version}` });
  return (
    <ContactSupportPage
      theme={theme}
      strings={words.support}
      appName={appName}
      inbox={about.supportEmail}
      sender={{ name: profile?.name || undefined, email: profile?.email || undefined }}
      details={{ appName, version: build.version, ...(build.buildNumber ? { build: build.buildNumber } : {}), ...phone, plan: subscribed ? words.plan : words.support.free }}
      transport={support}
      mailUrl={mailUrl}
      pickScreenshot={pickScreenshot}
      onError={onError}
      Text={(components?.Text ?? Text) as never}
      {...(components?.TextInput ? { TextInput: components.TextInput as never } : {})}
    />
  );
}

/** One kit in About > Kits, the same shape as app-account-kit's `KitInfo`. */
export interface KitEntry {
  name: string;
  version: string;
  build?: string;
}

/** A kit the app uses: its display name, its npm name (to find the pin in package.json) and the version the installed kit reports. */
export interface KitSource {
  name: string;
  pkg: string;
  version: string;
}

/** The short commit a dependency is pinned to (the commit after "#" or "/tar.gz/" in the pin), or undefined for a plain version range. */
export const pinnedBuild = (spec: string | undefined): string | undefined => /(?:#|\/tar\.gz\/)([0-9a-f]{7,40})$/.exec(spec ?? '')?.[1]?.slice(0, 7);

/**
 * The Kits list for About, like "Account Kit | v7.7.0 | Build 8613ded".
 * `dependencies` is the app's own package.json `dependencies`; each kit's build is read from its pin there, so nothing is typed twice.
 */
export const kitList = (dependencies: Readonly<Record<string, string>>, kits: readonly KitSource[]): KitEntry[] =>
  kits.map(({ name, pkg, version }) => {
    const build = pinnedBuild(dependencies[pkg]);
    return build ? { name, version, build } : { name, version };
  });

/** 8.0.0: the order kits are listed in About > Kits in every app; any other kit follows, A to Z. */
export const KIT_ORDER: readonly string[] = ['app-core-kit', 'app-auth-kit', 'app-account-kit', 'app-settings-kit', 'app-export-kit', 'app-payments-kit', 'app-subscriptions-kit'];

/** "app-core-kit" -> "Core Kit". */
export const kitDisplayName = (pkg: string): string =>
  pkg
    .replace(/^app-/, '')
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

/** The parts of the app's package.json the Kits list reads. */
export interface AppPackage {
  dependencies: Readonly<Record<string, string>>;
  /** The release tag of each kit, such as "v7.30.0" (the pin check reads the same list). */
  kitVersions?: Readonly<Record<string, string>>;
}

/**
 * 8.0.0: About > Kits straight from the app's package.json: every `app-...-kit` dependency, named by the kit ("Core Kit"),
 * its version from `kitVersions` and its build from the pin. The app lists nothing by hand.
 */
export const kitsFromPackage = ({ dependencies, kitVersions = {} }: AppPackage): KitEntry[] => {
  const rank = (pkg: string) => {
    const i = KIT_ORDER.indexOf(pkg);
    return i === -1 ? KIT_ORDER.length : i;
  };
  const kits = Object.keys(dependencies)
    .filter((pkg) => /^app-[a-z0-9-]+-kit$/.test(pkg))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((pkg) => ({ name: kitDisplayName(pkg), pkg, version: (kitVersions[pkg] ?? '').replace(/^v/, '') }));
  return kitList(dependencies, kits);
};

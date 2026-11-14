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

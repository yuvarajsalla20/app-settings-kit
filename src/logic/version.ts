/** What About > Version shows: one entry per line, and the same on one line for support emails. */
export interface VersionInfo {
  /** Like ["v4.18.0 | Build 12", "Nov 14, 2026 | 10:45 AM CT"]. */
  lines: readonly string[];
  /** The lines joined with " | ". */
  label: string;
}

export interface VersionParts {
  /** The app's version, like "4.18.0" (no "v"). */
  version: string;
  /** The store build number (EAS counts it up). Empty or missing on the web and in a local run: then no "Build" part. */
  buildNumber?: string | null;
  /** When the build was made, from build-stamp.js. Missing: `fallbackStamp`. */
  stamp?: string | null;
  /** Shown when there is no stamp. Default "dev build". */
  fallbackStamp?: string;
  /** The word before the build number. Default "Build". */
  buildWord?: string;
}

const SEPARATOR = ' | ';

/** The Version row: "v4.18.0 | Build 12" then the build time. */
export function versionLines({ version, buildNumber, stamp, fallbackStamp = 'dev build', buildWord = 'Build' }: VersionParts): VersionInfo {
  const lines = [`v${version}${buildNumber ? `${SEPARATOR}${buildWord} ${buildNumber}` : ''}`, stamp || fallbackStamp] as const;
  return { lines, label: lines.join(SEPARATOR) };
}

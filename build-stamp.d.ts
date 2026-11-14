export interface BuildStampOptions {
  /** An IANA time zone. Default "America/Chicago". */
  timeZone?: string;
  /** Rename a short zone name, such as { CST: 'CT', CDT: 'CT' } (the default for Central time). */
  zoneNames?: Record<string, string>;
  /** Default "en-US". */
  locale?: string;
}
/** "Nov 10, 2026 | 2:45 PM CT": the moment of this build. */
export function buildStamp(now?: Date, options?: BuildStampOptions): string;
export const DEFAULT_TIME_ZONE: string;

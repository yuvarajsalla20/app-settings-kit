// The moment of a build, like "Nov 10, 2026 | 2:45 PM CT". Plain Node (CommonJS) so app.config.js can require it at build time:
//   const { buildStamp } = require('app-settings-kit/build-stamp');
//   extra: { buildStamp: buildStamp() }
// The app reads it back with expo-constants and passes it to versionLines().

/** Default time zone: US Central, written as "CT" (CST and CDT both read "CT"). */
const DEFAULT_TIME_ZONE = 'America/Chicago';
const DEFAULT_ZONE_NAMES = { CST: 'CT', CDT: 'CT' };

/**
 * @param {Date} [now] the moment to write (default: now)
 * @param {{ timeZone?: string, zoneNames?: Record<string, string>, locale?: string }} [options]
 * @returns {string}
 */
const buildStamp = (now = new Date(), options = {}) => {
  const timeZone = options.timeZone || DEFAULT_TIME_ZONE;
  const zoneNames = options.zoneNames || (timeZone === DEFAULT_TIME_ZONE ? DEFAULT_ZONE_NAMES : {});
  const locale = options.locale || 'en-US';
  const part = (opts) => new Intl.DateTimeFormat(locale, { timeZone, ...opts }).format(now);
  const zone = part({ timeZoneName: 'short' }).split(' ').pop();
  return `${part({ month: 'short', day: 'numeric', year: 'numeric' })} | ${part({ hour: 'numeric', minute: '2-digit' })} ${zoneNames[zone] || zone}`;
};

module.exports = { buildStamp, DEFAULT_TIME_ZONE };

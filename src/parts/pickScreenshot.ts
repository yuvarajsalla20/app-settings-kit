import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { SUPPORT_LIMITS, type SupportScreenshot } from '../logic/support';

/** JPEG qualities tried in turn until the screenshot fits `SUPPORT_LIMITS.screenshotChars`. */
const QUALITIES: readonly number[] = [0.7, 0.5, 0.35, 0.2];

/**
 * 15.0.0: lets the person choose one screenshot from their photos (no permission is needed for the system picker), then
 * reduces it on the phone so its longest side is at most 1280 px and it fits one message. Returns null when cancelled, and
 * throws when the picture cannot be made small enough.
 */
export const pickScreenshot = async (): Promise<SupportScreenshot | null> => {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  const longest = Math.max(asset.width, asset.height);
  const scale = longest > SUPPORT_LIMITS.screenshotSide ? SUPPORT_LIMITS.screenshotSide / longest : 1;
  const width = Math.round(asset.width * scale);
  const height = Math.round(asset.height * scale);
  const image = await ImageManipulator.manipulate(asset.uri).resize({ width, height }).renderAsync();
  for (const compress of QUALITIES) {
    const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress, base64: true });
    if (saved.base64 && saved.base64.length <= SUPPORT_LIMITS.screenshotChars) return { base64: saved.base64, width, height };
  }
  throw new Error('The screenshot is too large to send.');
};

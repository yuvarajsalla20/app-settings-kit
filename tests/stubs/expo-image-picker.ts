// Contact Support's screenshot picker: tests give the page their own `pickScreenshot`, so this is never asked to open.
export const launchImageLibraryAsync = async () => ({ canceled: true, assets: [] });

export const SITE_URL = "https://nexatools.cloud";
export const SITE_NAME = "ToolHub AI";
export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
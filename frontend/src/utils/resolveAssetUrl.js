const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiOrigin = rawBaseUrl.replace(/\/api\/?$/, "");

export const resolveAssetUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${apiOrigin}${url}`;
  return `${apiOrigin}/${url}`;
};

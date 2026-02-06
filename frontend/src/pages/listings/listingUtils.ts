export const LISTING_ENDPOINTS = {
  flats: "/api/listings/flats",
  houses: "/api/listings/houses",
  plots: "/api/listings/plots",
} as const;

export function formatPrice(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("pl-PL").format(Math.round(n)) + " zł";
}

export function parsePhotos(photos: unknown): string[] {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos.filter(Boolean).map(String);

  if (typeof photos === "string") {
    return photos
      .split(/[,\n;]/g)
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function pickPrice(listing: any) {
  return (
    listing?.price_offer ??
    listing?.price ??
    listing?.cena ??
    listing?.predicted_price ??
    null
  );
}

export function pickTitle(listing: any, fallback: string) {
  return listing?.title?.trim() || fallback;
}

export function pickLocation(listing: any) {
  const city = listing?.city;
  const district = listing?.district;
  const province = listing?.province ?? listing?.region;

  if (city && district) return `${city}, ${district}`;
  if (city && province) return `${city}, ${province}`;
  if (city) return city;
  return province || "";
}

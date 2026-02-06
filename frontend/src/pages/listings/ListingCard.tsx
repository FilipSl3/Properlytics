import { Link } from "react-router-dom";
import { formatPrice, parsePhotos, pickPrice, pickTitle, pickLocation } from "./listingUtils";

type Props = {
  listing: any;
  to: string;
  subtitleLines?: string[];
};

export default function ListingCard({ listing, to, subtitleLines = [] }: Props) {
  const photos = parsePhotos(listing.photos_url || listing.photos || listing.photosUrls);
  const photo = photos[0];

  const price = pickPrice(listing);
  const title = pickTitle(listing, "Ogłoszenie");
  const location = pickLocation(listing);

  return (
    <Link
      to={to}
      className="block rounded-2xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <div className="aspect-[16/9] bg-gray-100">
        {photo ? (
          <img src={photo} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Brak zdjęcia
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">{title}</div>
            <div className="text-sm text-gray-500 truncate">{location}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-semibold text-gray-900">
              {price != null ? formatPrice(price) : "Cena: brak"}
            </div>
          </div>
        </div>

        {subtitleLines.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {subtitleLines.filter(Boolean).slice(0, 6).map((t, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

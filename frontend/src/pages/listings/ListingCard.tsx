import { Link } from "react-router-dom";
import { formatPrice, parsePhotos, pickPrice, pickTitle, pickLocation } from "./listingUtils";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";

type Props = {
  listing: any;
  to: string;
  subtitleLines?: string[];
  onRefresh?: () => void;
};

export default function ListingCard({ listing, to, subtitleLines = [], onRefresh }: Props) {
  const { isAuthenticated, token } = useAuth();
  const photos = parsePhotos(listing.photos_url || listing.photos || listing.photosUrls);
  const photo = photos[0];

  const price = pickPrice(listing);
  const title = pickTitle(listing, "Ogłoszenie");
  const location = pickLocation(listing);

  const getTypeFromListing = (l: any): "flat" | "house" | "plot" => {
    if (l.floor !== undefined || l.totalFloors !== undefined) return "flat";
    if (l.plot_area !== undefined || l.floors !== undefined) return "house";
    return "plot";
  };

  const listingType = getTypeFromListing(listing);

  const handleAction = async (action: "verify" | "deactivate" | "delete") => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (action === "verify") {
        await api.patch(`/admin/listings/${listingType}/${listing.id}/verify`, {}, { headers });
      } else if (action === "deactivate") {
        await api.patch(`/admin/listings/${listingType}/${listing.id}/deactivate`, {}, { headers });
      } else if (action === "delete") {
        await api.delete(`/admin/listings/${listingType}/${listing.id}`, { headers });
      }
      onRefresh?.();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Błąd akcji");
    }
  };

  return (
    <div className="relative group rounded-2xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <Link to={to}>
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
              {!listing.is_verified && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  Oczekujące weryfikacji
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {isAuthenticated && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.preventDefault(); handleAction("verify"); }}
            className={`p-1.5 rounded-lg shadow-sm ${
              listing.is_verified
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
            title={listing.is_verified ? "Odznacz weryfikację" : "Zweryfikuj"}
          >
            ✓
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm("Czy na pewno usunąć to ogłoszenie?")) handleAction("delete");
            }}
            className="p-1.5 rounded-lg shadow-sm bg-red-500 text-white"
            title="Usuń"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

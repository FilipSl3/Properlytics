import { useEffect, useState } from "react";
import api from "../../api";
import ListingCard from "./ListingCard";
import { LISTING_ENDPOINTS } from "./listingUtils";

export default function FlatListings() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadListings = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get(LISTING_ENDPOINTS.flats);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setErr("Nie udało się pobrać ogłoszeń mieszkań.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  if (loading) return <div className="text-gray-600">Ładowanie...</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!items.length) return <div className="text-gray-600">Brak ogłoszeń mieszkań.</div>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((l) => {
        const area = l.area ? `${l.area} m²` : null;
        const rooms = l.rooms ? `${l.rooms} pok.` : null;
        const floor = l.floor !== undefined && l.floor !== null ? `piętro ${l.floor}` : null;

        return (
          <ListingCard
            key={l.id}
            listing={l}
            to={`/ogloszenia/mieszkania/${l.id}`}
            subtitleLines={[area, rooms, floor].filter(Boolean) as string[]}
            onRefresh={loadListings}
          />
        );
      })}
    </div>
  );
}

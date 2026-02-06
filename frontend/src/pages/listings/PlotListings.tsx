import { useEffect, useState } from "react";
import api from "../../api";
import ListingCard from "./ListingCard";
import { LISTING_ENDPOINTS } from "./listingUtils";

export default function PlotListings() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get(LISTING_ENDPOINTS.plots);
        if (!alive) return;
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!alive) return;
        setErr("Nie udało się pobrać ogłoszeń działek.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="text-gray-600">Ładowanie...</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!items.length) return <div className="text-gray-600">Brak ogłoszeń działek.</div>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((l) => {
        const area = l.area ? `${l.area} m²` : null;
        const purpose = l.purpose ?? l.plotType ?? l.type ?? null;

        return (
          <ListingCard
            key={l.id}
            listing={l}
            to={`/ogloszenia/dzialki/${l.id}`}
            subtitleLines={[area, purpose].filter(Boolean) as string[]}
          />
        );
      })}
    </div>
  );
}

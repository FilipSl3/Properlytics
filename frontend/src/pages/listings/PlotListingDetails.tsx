import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api";
import {
  LISTING_ENDPOINTS,
  formatPrice,
  parsePhotos,
  pickPrice,
  pickLocation,
  pickTitle,
} from "./listingUtils";

type ParamRow = { label: string; value: string };

function Param({ label, value }: ParamRow) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export default function PlotListingDetails() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get(`${LISTING_ENDPOINTS.plots}/${id}`);
        if (!alive) return;
        setItem(res.data);
      } catch {
        if (!alive) return;
        setErr("Nie udało się pobrać ogłoszenia działki.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      alive = false;
    };
  }, [id]);

  const title = useMemo(() => pickTitle(item, "Działka"), [item]);
  const location = useMemo(() => pickLocation(item), [item]);
  const price = useMemo(() => pickPrice(item), [item]);
  const photos = useMemo(
    () => parsePhotos(item?.photos_url || item?.photos || item?.photosUrls),
    [item]
  );

  const params: ParamRow[] = useMemo(() => {
    if (!item) return [];
    const rows: ParamRow[] = [];

    if (item.area != null) rows.push({ label: "Powierzchnia", value: `${item.area} m²` });

    const purpose = item.purpose ?? item.plotType ?? item.type;
    if (purpose) rows.push({ label: "Przeznaczenie", value: String(purpose) });

    if (item.utilities) rows.push({ label: "Media", value: String(item.utilities) });
    if (item.road_access) rows.push({ label: "Dojazd", value: String(item.road_access) });

    const zoning = item.zoning ?? item.plan;
    if (zoning) rows.push({ label: "Plan / MPZP", value: String(zoning) });

    return rows;
  }, [item]);

  if (loading) return <div className="text-gray-600">Ładowanie...</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!item) return null;

  return (
    <div className="space-y-4">
      <Link to="/ogloszenia/dzialki" className="text-sm text-gray-600 hover:text-gray-900">
        Wróć do listy działek
      </Link>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="aspect-[16/9] bg-gray-100">
          {photos[0] ? (
            <img src={photos[0]} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Brak zdjęcia
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <div className="text-gray-600 mt-1">{location}</div>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold">
                {price != null ? formatPrice(price) : "Cena: brak"}
              </div>
            </div>
          </div>

          {item.description && (
            <p className="text-gray-700 mt-4 whitespace-pre-line">{String(item.description)}</p>
          )}

          {params.length > 0 && (
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {params.map((p) => (
                <Param key={p.label} label={p.label} value={p.value} />
              ))}
            </div>
          )}

          {item.phone_number && (
            <div className="mt-5">
              <div className="text-sm text-gray-600">Telefon</div>
              <div className="font-semibold text-gray-900">{String(item.phone_number)}</div>
            </div>
          )}
        </div>
      </div>

      {photos.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {photos.slice(1).map((p, idx) => (
            <img
              key={idx}
              src={p}
              alt=""
              className="rounded-xl border object-cover aspect-square"
            />
          ))}
        </div>
      )}
    </div>
  );
}

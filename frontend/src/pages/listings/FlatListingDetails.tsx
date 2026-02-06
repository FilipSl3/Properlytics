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

export default function FlatListingDetails() {
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
        const res = await api.get(`${LISTING_ENDPOINTS.flats}/${id}`);
        if (!alive) return;
        setItem(res.data);
      } catch {
        if (!alive) return;
        setErr("Nie udało się pobrać ogłoszenia mieszkania.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      alive = false;
    };
  }, [id]);

  const title = useMemo(() => pickTitle(item, "Mieszkanie"), [item]);
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
    if (item.rooms != null) rows.push({ label: "Liczba pokoi", value: String(item.rooms) });
    if (item.floor != null) rows.push({ label: "Piętro", value: String(item.floor) });

    const totalFloors = item.totalFloors ?? item.floors_in_building;
    if (totalFloors != null) rows.push({ label: "Pięter w budynku", value: String(totalFloors) });

    const year = item.year ?? item.year_built;
    if (year != null) rows.push({ label: "Rok budowy", value: String(year) });

    if (item.market) rows.push({ label: "Rynek", value: String(item.market) });
    if (item.heating) rows.push({ label: "Ogrzewanie", value: String(item.heating) });

    const buildType = item.buildType ?? item.building_type;
    if (buildType) rows.push({ label: "Typ budynku", value: String(buildType) });

    const material = item.material ?? item.building_material;
    if (material) rows.push({ label: "Materiał", value: String(material) });

    const finishing = item.constructionStatus ?? item.finishing;
    if (finishing) rows.push({ label: "Wykończenie", value: String(finishing) });

    const lift = item.hasLift ?? item.elevator;
    if (lift != null) rows.push({ label: "Winda", value: Number(lift) === 1 ? "Tak" : "Nie" });

    const outdoor = item.hasOutdoor ?? item["balcony/garden"];
    if (outdoor != null)
      rows.push({ label: "Balkon/Taras/Ogród", value: Number(outdoor) === 1 ? "Tak" : "Nie" });

    const parking = item.hasParking ?? item.parking;
    if (parking != null) rows.push({ label: "Parking", value: Number(parking) === 1 ? "Tak" : "Nie" });

    return rows;
  }, [item]);

  if (loading) return <div className="text-gray-600">Ładowanie...</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!item) return null;

  return (
    <div className="space-y-4">
      <Link to="/ogloszenia/mieszkania" className="text-sm text-gray-600 hover:text-gray-900">
        Wróć do listy mieszkań
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

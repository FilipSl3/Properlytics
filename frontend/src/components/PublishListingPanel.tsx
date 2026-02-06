import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

type Kind = "flats" | "houses" | "plots";

type Props = {
  kind: Kind;
  endpoint: string;
  features: Record<string, any>;
  suggestedMin?: number;
  suggestedMax?: number;
  defaultTitle?: string;
};

function detailsPath(kind: Kind, id: string | number) {
  if (kind === "flats") return `/ogloszenia/mieszkania/${id}`;
  if (kind === "houses") return `/ogloszenia/domy/${id}`;
  return `/ogloszenia/dzialki/${id}`;
}

function parsePhotosInput(text: string) {
  return text
    .split(/[,\n;]/g)
    .map(s => s.trim())
    .filter(Boolean)
    .join(",");
}

export default function PublishListingPanel({
  kind,
  endpoint,
  features,
  suggestedMin,
  suggestedMax,
  defaultTitle,
}: Props) {
  const navigate = useNavigate();

  const suggested = useMemo(() => {
    if (typeof suggestedMin !== "number" || typeof suggestedMax !== "number") return null;
    const mid = (suggestedMin + suggestedMax) / 2;
    return Math.round(mid);
  }, [suggestedMin, suggestedMax]);

  const [title, setTitle] = useState(defaultTitle || "");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [photosText, setPhotosText] = useState("");
  const [priceOffer, setPriceOffer] = useState<string>("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset gdy zmieni się wycena/cechy
    setErr("");
    setLoading(false);

    setTitle(defaultTitle || "");
    setDescription("");
    setPhone("");
    setPhotosText("");
    setPriceOffer(suggested != null ? String(suggested) : "");
  }, [defaultTitle, suggested, kind]);

  const validate = () => {
    if (!title.trim()) return "Dodaj tytuł ogłoszenia.";
    const p = Number(priceOffer);
    if (!priceOffer || !Number.isFinite(p) || p <= 0) return "Podaj poprawną cenę ofertową.";
    return "";
  };

  const handlePublish = async () => {
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);
    setErr("");

    const payload = {
      ...features,
      title: title.trim(),
      description: description.trim(),
      phone_number: phone.trim() || null,
      photos_url: parsePhotosInput(photosText),
      price_offer: Number(priceOffer),
    };

    try {
      const res = await api.post(endpoint, payload);

      const data = res.data;
      const id =
        data?.id ??
        data?.listing?.id ??
        data?.data?.id;

      if (!id) {
        setErr("Nie udało się zapisać ogłoszenia.");
        return;
      }

      navigate(detailsPath(kind, id));
    } catch (e: any) {
      if (e?.response?.data?.detail) {
        setErr(String(e.response.data.detail));
      } else {
        setErr("Nie udało się wystawić ogłoszenia. Sprawdź backend i endpoint.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="p-6 border-b">
        <h3 className="text-xl font-bold text-gray-900">📣 Wystaw ogłoszenie</h3>
        <p className="text-gray-600 mt-1 text-sm">
          Masz już wycenę. Uzupełnij opis i możesz wystawić ogłoszenie.
        </p>
      </div>

      <div className="p-6 space-y-4">
        {suggestedMin != null && suggestedMax != null && (
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="text-sm text-gray-600">Sugerowana cena (środek przedziału)</div>
            <div className="text-lg font-bold text-gray-900">
              {suggested?.toLocaleString("pl-PL")} zł
            </div>
            <button
              type="button"
              onClick={() => suggested != null && setPriceOffer(String(suggested))}
              className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Ustaw sugerowaną cenę
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tytuł</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="np. Mieszkanie 50 m², 2 pokoje, Warszawa"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cena ofertowa (zł)</label>
            <input
              type="number"
              value={priceOffer}
              onChange={(e) => setPriceOffer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="np. 550000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (opcjonalnie)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="np. 600 700 800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opis (opcjonalnie)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            placeholder="Krótki opis mieszkania, standard, okolica, komunikacja..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zdjęcia URL (opcjonalnie)</label>
          <textarea
            value={photosText}
            onChange={(e) => setPhotosText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            placeholder={"Wklej linki do zdjęć, po jednym w linii albo rozdzielone przecinkami"}
          />
          <div className="text-xs text-gray-500 mt-1">
            Możesz wkleić kilka linków, np. po jednym w linii.
          </div>
        </div>

        {err && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
            ⚠️ {err}
          </div>
        )}

        <button
          type="button"
          onClick={handlePublish}
          disabled={loading}
          className={`w-full text-white font-bold py-4 rounded-xl shadow-lg text-lg transition
            ${loading ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Wystawiam ogłoszenie..." : "Wystaw ogłoszenie"}
        </button>
      </div>
    </div>
  );
}

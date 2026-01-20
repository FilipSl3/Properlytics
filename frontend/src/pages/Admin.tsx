import { useState } from "react";

export default function Admin() {
  const [loading, setLoading] = useState(false);

  const retrain = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:8000/admin/retrain", {
        method: "POST",
      });
      alert("Modele zostały ponownie wytrenowane");
    } catch {
      alert("Błąd podczas uczenia modeli");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-center">
        <button
          onClick={retrain}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Uczenie w toku..." : "Uruchom ponowne uczenie modeli"}
        </button>
      </div>
    </div>
  );
}

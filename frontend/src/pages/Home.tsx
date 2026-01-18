import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-16">

      <div className="text-center max-w-3xl space-y-6 mt-10">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold tracking-wide mb-4">
          ✨ Nowa generacja wyceny nieruchomości
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Poznaj realną wartość <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Swojej Nieruchomości
          </span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Wykorzystujemy zaawansowane algorytmy sztucznej inteligencji i analizę tysięcy ofert,
          aby dostarczyć Ci precyzyjną wycenę w kilka sekund.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">

        <Link to="/mieszkanie" className="group relative bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            🏢
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Mieszkanie</h3>
          <p className="text-gray-500 mb-8">
            Wycena lokali mieszkalnych w blokach, apartamentowcach i kamienicach.
          </p>
          <span className="mt-auto text-blue-600 font-bold group-hover:underline flex items-center gap-2">
            Zacznij wycenę <span>→</span>
          </span>
        </Link>

        <Link to="/dom" className="group relative bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
            🏡
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Dom</h3>
          <p className="text-gray-500 mb-8">
            Analiza wartości domów wolnostojących, bliźniaków oraz szeregówek.
          </p>
          <span className="mt-auto text-green-600 font-bold group-hover:underline flex items-center gap-2">
            Zacznij wycenę <span>→</span>
          </span>
        </Link>

        <Link to="/dzialka" className="group relative bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-green-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
            🌱
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Działka</h3>
          <p className="text-gray-500 mb-8">
            Szacowanie ceny gruntów budowlanych, rolnych, leśnych i inwestycyjnych.
          </p>
          <span className="mt-auto text-orange-600 font-bold group-hover:underline flex items-center gap-2">
            Zacznij wycenę <span>→</span>
          </span>
        </Link>

      </div>

      <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-12 max-w-7xl mx-auto mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
              ⚡
            </div>
            <h4 className="text-lg font-bold text-gray-900">Natychmiastowy Wynik</h4>
            <p className="text-sm text-gray-500">
              Nie czekaj na rzeczoznawcę. Otrzymaj szacunkową wycenę w mniej niż 30 sekund.
            </p>
          </div>

          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
              🧠
            </div>
            <h4 className="text-lg font-bold text-gray-900">Sztuczna Inteligencja</h4>
            <p className="text-sm text-gray-500">
              Model uczenia maszynowego trenowany na tysiącach aktualnych ofert z rynku.
            </p>
          </div>

          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
              🛡️
            </div>
            <h4 className="text-lg font-bold text-gray-900">Pełna Prywatność</h4>
            <p className="text-sm text-gray-500">
              Twoje dane są bezpieczne. Nie wymagamy rejestracji ani podawania adresu email.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
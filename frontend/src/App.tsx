import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FlatForm from './pages/FlatForm';
import HouseForm from './pages/HouseForm';
import PlotForm from './pages/PlotForm';
import FeatureImportanceChart from './components/FeatureImportanceChart';
import Admin from "./pages/Admin";

import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
        <Navbar />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mieszkanie" element={<FlatForm />} />
            <Route path="/dom" element={<HouseForm />} />
            <Route path="/dzialka" element={<PlotForm />} />
	    <Route path="/admin" element={<Admin />} />



            {/* 403 - Brak dostępu */}
            <Route
              path="/403"
              element={
                <ErrorPage
                  code="403"
                  title="Dostęp zabroniony"
                  message="Nie masz uprawnień do przeglądania tej strony. Skontaktuj się z administratorem, jeśli uważasz, że to błąd."
                />
              }
            />

            {/* 500 - Błąd serwera (Internal Server Error) */}
            <Route
              path="/500"
              element={
                <ErrorPage
                  code="500"
                  title="Błąd serwera"
                  message="Coś poszło nie tak po naszej stronie. Nasz zespół techniczny już o tym wie. Spróbuj ponownie za chwilę."
                />
              }
            />

            {/* 503 - Serwer niedostępny (Service Unavailable) */}
            <Route
              path="/503"
              element={
                <ErrorPage
                  code="503"
                  title="Serwer niedostępny"
                  message="Serwer jest tymczasowo niedostępny (np. trwa przerwa techniczna). Prosimy spróbować ponownie później."
                />
              }
            />

            {/* 404 - Nie znaleziono (Catch-all na końcu) */}
            <Route
              path="*"
              element={
                <ErrorPage
                  code="404"
                  title="Strona nie istnieje"
                  message="Wygląda na to, że zabłądziłeś. Strona, której szukasz, została usunięta lub nigdy nie istniała."
                />
              }
            />

          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Properlytics Valuator. Projekt inżynierski.
          </div>
        </footer>

      </div>
    </Router>
  );
}

export default App;
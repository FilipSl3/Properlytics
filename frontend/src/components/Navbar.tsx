import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isExact = (path: string) => location.pathname === path;
  const isSection = (prefix: string) => location.pathname === prefix || location.pathname.startsWith(prefix + "/");

  const linkClass = "px-6 py-3 rounded-xl text-lg transition duration-200 flex items-center gap-3";

  const linkStyle = (active: boolean) =>
    active
      ? "text-blue-600 bg-blue-50 font-bold shadow-sm"
      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 font-semibold";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <Link to="/" className="flex items-center gap-4 group">
            <img
              src="Logo_Properlytics.png"
              alt="Logo Properlytics"
              className="h-16 w-auto transition transform group-hover:scale-105 duration-300 drop-shadow-sm"
            />
            <span className="text-3xl font-bold text-gray-800 tracking-tight flex flex-col leading-none">
              <span>Pro<span className="text-blue-600">perlytics</span></span>
            </span>
          </Link>

          <div className="hidden md:flex space-x-4">
            <Link to="/mieszkanie" className={`${linkClass} ${linkStyle(isExact('/mieszkanie'))}`}>
              <span className="text-2xl">🏢</span> Mieszkanie
            </Link>

            <Link to="/dom" className={`${linkClass} ${linkStyle(isExact('/dom'))}`}>
              <span className="text-2xl">🏡</span> Dom
            </Link>

            <Link to="/dzialka" className={`${linkClass} ${linkStyle(isExact('/dzialka'))}`}>
              <span className="text-2xl">🌱</span> Działka
            </Link>

            <Link to="/ogloszenia/mieszkania" className={`${linkClass} ${linkStyle(isSection('/ogloszenia'))}`}>
              <span className="text-2xl">📣</span> Ogłoszenia
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin"
              className={`${linkClass} ${linkStyle(isExact('/admin'))}`}
            >
              <span className="text-2xl">⚙️</span> Admin
            </Link>
            <Link
              to="/"
              className="text-base font-medium text-gray-400 hover:text-gray-800 transition px-4 py-2 hover:bg-gray-100 rounded-lg"
            >
              Powrót do startu
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

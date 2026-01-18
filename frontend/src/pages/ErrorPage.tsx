import { Link } from 'react-router-dom';

interface ErrorPageProps {
  code?: string | number;
  title: string;
  message: string;
  showHomeButton?: boolean;
}

export default function ErrorPage({
  code = "Error",
  title,
  message,
  showHomeButton = true
}: ErrorPageProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full transform hover:scale-[1.01] transition-transform duration-300">

        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 mb-4 select-none">
          {code}
        </h1>

        <div className="text-6xl mb-6">
            {code == 403 ? '🚫' : code == 500 ? '🔥' : code == 503 ? '🔌' : '🤔'}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {title}
        </h2>

        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          {message}
        </p>

        {showHomeButton && (
          <Link
            to="/"
            className="inline-flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-emerald-200"
          >
            ← Wróć na stronę główną
          </Link>
        )}
      </div>
    </div>
  );
}
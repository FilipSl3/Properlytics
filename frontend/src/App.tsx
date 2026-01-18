import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FlatForm from './pages/FlatForm';
import HouseForm from './pages/HouseForm';
import PlotForm from './pages/PlotForm';

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
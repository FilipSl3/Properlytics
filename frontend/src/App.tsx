import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import FlatForm from './pages/FlatForm';
import HouseForm from './pages/HouseForm';
import PlotForm from './pages/PlotForm';
import './App.css';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '1rem' }}>
        <Link to="/">Start</Link>
        <Link to="/mieszkanie">Mieszkanie</Link>
        <Link to="/dom">Dom</Link>
        <Link to="/dzialka">Działka</Link>
      </nav>

      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mieszkanie" element={<FlatForm />} />
          <Route path="/dom" element={<HouseForm />} />
          <Route path="/dzialka" element={<PlotForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
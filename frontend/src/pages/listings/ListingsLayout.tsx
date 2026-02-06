import { NavLink, Outlet } from "react-router-dom";

function Tab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-4 py-2 rounded-full text-sm font-medium transition",
          isActive ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        ].join(" ")
      }
      end
    >
      {children}
    </NavLink>
  );
}

export default function ListingsLayout() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ogłoszenia</h1>
        </div>

        <div className="flex gap-2">
          <Tab to="/ogloszenia/mieszkania">Mieszkania</Tab>
          <Tab to="/ogloszenia/domy">Domy</Tab>
          <Tab to="/ogloszenia/dzialki">Działki</Tab>
        </div>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}

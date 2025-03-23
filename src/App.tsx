// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CategoryList from "./components/CategoryList";
import ItemList from "./components/ItemList";
import WeaponList from "./components/WeaponList";
import CollectionList from "./components/CollectionList";
import RarityList from "./components/RarityList";
import TypeList from "./components/TypeList";
import { useState } from "react";

const queryClient = new QueryClient();

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Состояние для мобильной боковой панели

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          {/* Хедер */}
          <header className="header">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <button
                className="md:hidden text-white focus:outline-none"
                onClick={toggleSidebar}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </header>

          {/* Основной контент с боковой панелью и главным контентом */}
          <div className="flex flex-1">
            {/* Боковая навигация */}
            <nav
              className={`nav-sidebar ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
            >
              <ul>
                <li className="mb-2">
                  <Link to="/items" className="nav-link">Items</Link>
                </li>
                <li className="mb-2">
                  <Link to="/weapons" className="nav-link">Weapons</Link>
                </li>
                <li className="mb-2">
                  <Link to="/categories" className="nav-link">Categories</Link>
                </li>
                <li className="mb-2">
                  <Link to="/collections" className="nav-link">Collections</Link>
                </li>
                <li className="mb-2">
                  <Link to="/rarities" className="nav-link">Rarities</Link>
                </li>
                <li className="mb-2">
                  <Link to="/types" className="nav-link">Types</Link>
                </li>
              </ul>
            </nav>

            {/* Основной контент */}
            <main className="main-content">
              <Routes>
                <Route path="/categories" element={<CategoryList />} />
                <Route path="/items" element={<ItemList />} />
                <Route path="/weapons" element={<WeaponList />} />
                <Route path="/collections" element={<CollectionList />} />
                <Route path="/rarities" element={<RarityList />} />
                <Route path="/types" element={<TypeList />} />
                <Route path="/" element={<div className="container">Welcome to Admin Panel</div>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
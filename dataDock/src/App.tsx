import { Routes, Route, Link, Navigate } from "react-router-dom";

import NewEntryPage from "./pages/NewEntryPage";
import SearchPage from "./pages/SearchPage";
// import ProtectedRoute from "./routes/ProtectedRoute"; // commented for Vercel deployment as its causing build error
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 px-6 py-4 text-white shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">DataDock</h1>

          <nav className="flex gap-4">
            <Link
              to="/"
              className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500"
            >
              Search
            </Link>

            <Link
              to="/new"
              className="rounded bg-green-600 px-4 py-2 hover:bg-green-500"
            >
              New Entry
            </Link>
          </nav>
        </div>
      </header>

      {/* Pages */}
      <main className="p-4">
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Search */}

          <Route
  path="/search"
  element={<SearchPage />}
/>

          {/* Protected New Entry */}
          <Route
            path="/new"
            element={
              
                <NewEntryPage />
              
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;

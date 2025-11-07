import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has a token
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // View for logged-out users
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access your dashboard
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/login" className="btn-primary">
                Sign In
              </Link>
              <Link to="/register" className="btn-secondary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View for logged-in users
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-xl font-bold text-primary">
                Crudibase
              </Link>
              <div className="flex gap-6">
                <Link
                  to="/search"
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                >
                  Search
                </Link>
                <Link
                  to="/collections"
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                >
                  Collections
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              You are now logged in and can access protected content.
            </p>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Getting Started
              </h3>
              <p className="text-gray-600">
                This is a protected page that only authenticated users can see.
                From here, you can access your Wikibase knowledge graphs and
                explore your data.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

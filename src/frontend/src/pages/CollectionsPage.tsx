import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Collection {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view collections');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/collections', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCollections(response.data.collections);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to load collections');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
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
                  className="text-sm text-gray-900 hover:text-gray-900 font-semibold border-b-2 border-primary"
                >
                  Collections
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Collections</h1>
          <p className="mt-2 text-gray-600">
            Organize and manage your Wikibase entities
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-900">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && collections.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-20 h-20 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No collections yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by searching for entities and adding them to a collection
            </p>
            <Link
              to="/search"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Search
            </Link>
          </div>
        )}

        {/* Collections Grid */}
        {!loading && !error && collections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer block"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {collection.description}
                  </p>
                )}
                <div className="text-xs text-gray-500">
                  Created {new Date(collection.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

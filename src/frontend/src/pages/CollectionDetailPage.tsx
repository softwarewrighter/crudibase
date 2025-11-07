import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CollectionItem {
  id: number;
  entity_id: string;
  entity_label: string;
  entity_description?: string;
  created_at: string;
}

interface Collection {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollectionAndItems();
  }, [id]);

  const fetchCollectionAndItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view collections');
        setLoading(false);
        return;
      }

      // Fetch collection details and items in parallel
      const [collectionResponse, itemsResponse] = await Promise.all([
        axios.get(`/api/collections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/collections/${id}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCollection(collectionResponse.data.collection);
      setItems(itemsResponse.data.items);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (err.response?.status === 404) {
          setError('Collection not found');
        } else {
          setError('Failed to load collection');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (entityId: string, entityLabel: string) => {
    if (!window.confirm(`Remove "${entityLabel}" from this collection?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/collections/${id}/items/${entityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh items
      setItems(items.filter((item) => item.entity_id !== entityId));
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;

    if (
      !window.confirm(
        `Delete collection "${collection.name}"? This will remove all ${items.length} items.`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/collections/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate('/collections');
    } catch (err) {
      alert('Failed to delete collection');
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
        {/* Back Button */}
        <div className="mb-4">
          <Link
            to="/collections"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Collections
          </Link>
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

        {/* Collection Header */}
        {!loading && !error && collection && (
          <>
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="mt-2 text-gray-600">{collection.description}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  {items.length} {items.length === 1 ? 'item' : 'items'} •
                  Created {new Date(collection.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handleDeleteCollection}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Collection
              </button>
            </div>

            {/* Empty State */}
            {items.length === 0 && (
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No items yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Add entities from the search page to build your collection
                </p>
                <Link
                  to="/search"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Search
                </Link>
              </div>
            )}

            {/* Items List */}
            {items.length > 0 && (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.entity_label}
                          </h3>
                          <span className="text-xs text-gray-500 font-mono">
                            {item.entity_id}
                          </span>
                        </div>
                        {item.entity_description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {item.entity_description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveItem(item.entity_id, item.entity_label)
                        }
                        className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

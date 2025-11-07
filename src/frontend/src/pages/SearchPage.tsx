import { useState, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';
import { Entity } from '../components/EntityCard';
import axios from 'axios';

interface Collection {
  id: number;
  name: string;
  description?: string;
}

export function SearchPage() {
  const [results, setResults] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [addingToCollection, setAddingToCollection] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/collections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollections(response.data.collections);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    setError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please log in to search');
        setLoading(false);
        return;
      }

      // Use relative URL to leverage Vite's proxy
      const response = await axios.get('/api/wikibase/search', {
        params: { q: searchQuery },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResults(response.data.results);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError(
            err.response?.data?.error?.message ||
              'An error occurred while searching'
          );
        }
      } else {
        setError('An unexpected error occurred');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEntityClick = (entity: Entity) => {
    // Navigate to entity details page (to be implemented)
    console.log('Entity clicked:', entity);
    // TODO: Navigate to /entity/:id
  };

  const handleAddToCollection = (entity: Entity) => {
    setSelectedEntity(entity);
    setShowAddModal(true);
  };

  const addToExistingCollection = async (collectionId: number) => {
    if (!selectedEntity) return;

    setAddingToCollection(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/collections/${collectionId}/items`,
        {
          entity_id: selectedEntity.id,
          entity_label: selectedEntity.label,
          entity_description: selectedEntity.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Added "${selectedEntity.label}" to collection!`);
      setShowAddModal(false);
      setSelectedEntity(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        alert('This entity is already in the collection');
      } else {
        alert('Failed to add to collection');
      }
    } finally {
      setAddingToCollection(false);
    }
  };

  const createCollectionAndAdd = async () => {
    if (!selectedEntity || !newCollectionName.trim()) return;

    setAddingToCollection(true);
    try {
      const token = localStorage.getItem('token');

      // Create collection
      const createResponse = await axios.post(
        '/api/collections',
        { name: newCollectionName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newCollection = createResponse.data.collection;

      // Add entity to new collection
      await axios.post(
        `/api/collections/${newCollection.id}/items`,
        {
          entity_id: selectedEntity.id,
          entity_label: selectedEntity.label,
          entity_description: selectedEntity.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(
        `Created "${newCollectionName}" and added "${selectedEntity.label}"!`
      );
      setShowAddModal(false);
      setSelectedEntity(null);
      setNewCollectionName('');
      fetchCollections(); // Refresh collections list
    } catch (err) {
      alert('Failed to create collection');
    } finally {
      setAddingToCollection(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="/dashboard" className="text-xl font-bold text-primary">
                Crudibase
              </a>
              <div className="flex gap-6">
                <a
                  href="/search"
                  className="text-sm text-gray-900 hover:text-gray-900 font-semibold border-b-2 border-primary"
                >
                  Search
                </a>
                <a
                  href="/collections"
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                >
                  Collections
                </a>
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
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Instructions (shown when no search yet) */}
        {!query && !loading && results.length === 0 && (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Search Wikibase
            </h2>
            <p className="text-gray-600 mb-6">
              Search for entities, people, places, and concepts
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleSearch('Albert Einstein')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Albert Einstein
              </button>
              <button
                onClick={() => handleSearch('DNA')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                DNA
              </button>
              <button
                onClick={() => handleSearch('Tokyo')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Tokyo
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        <SearchResults
          results={results}
          loading={loading}
          error={error || undefined}
          query={query}
          onEntityClick={handleEntityClick}
          onAddToCollection={handleAddToCollection}
        />
      </main>

      {/* Add to Collection Modal */}
      {showAddModal && selectedEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Add to Collection
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Adding: <strong>{selectedEntity.label}</strong>
              </p>

              {/* Existing Collections */}
              {collections.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Add to existing collection:
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {collections.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => addToExistingCollection(collection.id)}
                        disabled={addingToCollection}
                        className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="font-medium text-gray-900">
                          {collection.name}
                        </div>
                        {collection.description && (
                          <div className="text-sm text-gray-600">
                            {collection.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Collection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Or create a new collection:
                </h4>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection name"
                  disabled={addingToCollection}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCollectionName.trim()) {
                      createCollectionAndAdd();
                    }
                  }}
                />
                <button
                  onClick={createCollectionAndAdd}
                  disabled={addingToCollection || !newCollectionName.trim()}
                  className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCollection ? 'Creating...' : 'Create and Add'}
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedEntity(null);
                  setNewCollectionName('');
                }}
                disabled={addingToCollection}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { EntityCard, Entity } from './EntityCard';

export interface SearchResultsProps {
  results: Entity[];
  loading?: boolean;
  error?: string;
  query?: string;
  onEntityClick?: (entity: Entity) => void;
  onAddToCollection?: (entity: Entity) => void;
}

export function SearchResults({
  results,
  loading = false,
  error,
  query,
  onEntityClick,
  onAddToCollection,
}: SearchResultsProps) {
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900">Search Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No results
  if (results.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No results found
        </h3>
        <p className="text-gray-600">Try searching with different keywords</p>
      </div>
    );
  }

  // Results
  return (
    <div className="py-6">
      {query && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{results.length}</span> results for
            "{query}"
          </p>
        </div>
      )}

      <div className="space-y-3">
        {results.map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            onClick={onEntityClick}
            onAddToCollection={onAddToCollection}
          />
        ))}
      </div>
    </div>
  );
}

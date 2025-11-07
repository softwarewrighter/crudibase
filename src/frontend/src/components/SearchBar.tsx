import { useState, useEffect, FormEvent } from 'react';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  debounce?: boolean;
  debounceMs?: number;
  placeholder?: string;
  suggestions?: string[];
}

export function SearchBar({
  onSearch,
  loading = false,
  debounce = false,
  debounceMs = 300,
  placeholder = 'Search Wikibase entities...',
  suggestions = [],
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!debounce || query.trim() === '') {
      return;
    }

    const timer = setTimeout(() => {
      onSearch(query.trim());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounce, debounceMs, onSearch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (query.trim() === '') {
      return;
    }

    onSearch(query.trim());
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-24 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                aria-label="Clear"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={loading || query.trim() === ''}
              className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-label={loading ? 'Searching' : 'Search'}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && query.trim() !== '' && (
          <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

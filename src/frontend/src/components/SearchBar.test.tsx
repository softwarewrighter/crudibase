import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByPlaceholderText(/search wikibase/i)).toBeInTheDocument();
  });

  it('should call onSearch when form is submitted', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText(/search wikibase/i);
    await user.type(input, 'Einstein');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSearch).toHaveBeenCalledWith('Einstein');
  });

  it('should call onSearch when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText(/search wikibase/i);
    await user.type(input, 'Einstein{Enter}');

    expect(handleSearch).toHaveBeenCalledWith('Einstein');
  });

  it('should not call onSearch with empty query', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchBar onSearch={handleSearch} />);

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('should debounce search input', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(
      <SearchBar onSearch={handleSearch} debounce={true} debounceMs={300} />
    );

    const input = screen.getByPlaceholderText(/search wikibase/i);

    // Type multiple characters quickly
    await user.type(input, 'Ein');

    // Should not call immediately
    expect(handleSearch).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(
      () => {
        expect(handleSearch).toHaveBeenCalledWith('Ein');
      },
      { timeout: 500 }
    );
  });

  it('should show loading state when loading prop is true', () => {
    render(<SearchBar onSearch={vi.fn()} loading={true} />);

    expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled();
  });

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();

    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText(
      /search wikibase/i
    ) as HTMLInputElement;

    // Type something
    await user.type(input, 'Einstein');
    expect(input.value).toBe('Einstein');

    // Clear
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(input.value).toBe('');
  });

  it('should display search suggestions if provided', () => {
    const suggestions = ['Einstein', 'Newton', 'Galileo'];

    render(<SearchBar onSearch={vi.fn()} suggestions={suggestions} />);

    // Type to show suggestions
    const input = screen.getByPlaceholderText(/search wikibase/i);
    input.focus();

    // Check suggestions are displayed
    suggestions.forEach((suggestion) => {
      expect(screen.getByText(suggestion)).toBeInTheDocument();
    });
  });
});

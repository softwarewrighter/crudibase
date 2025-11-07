import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchResults } from './SearchResults';

describe('SearchResults', () => {
  const mockResults = [
    {
      id: 'Q937',
      label: 'Albert Einstein',
      description: 'German-born theoretical physicist',
    },
    {
      id: 'Q7186',
      label: 'Isaac Newton',
      description: 'English mathematician and physicist',
    },
  ];

  it('should render all results', () => {
    render(<SearchResults results={mockResults} />);

    expect(screen.getByText('Albert Einstein')).toBeInTheDocument();
    expect(screen.getByText('Isaac Newton')).toBeInTheDocument();
  });

  it('should render result count', () => {
    render(<SearchResults results={mockResults} />);

    expect(screen.getByText(/2 results/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<SearchResults results={[]} loading={true} />);

    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it('should show no results message when empty', () => {
    render(<SearchResults results={[]} loading={false} />);

    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  it('should show error message when provided', () => {
    render(<SearchResults results={[]} error="API Error" />);

    expect(screen.getByText(/api error/i)).toBeInTheDocument();
  });

  it('should call onEntityClick when entity card is clicked', async () => {
    const handleClick = vi.fn();

    render(<SearchResults results={mockResults} onEntityClick={handleClick} />);

    const firstCard = screen.getByText('Albert Einstein');
    firstCard.click();

    expect(handleClick).toHaveBeenCalledWith(mockResults[0]);
  });

  it('should show query that was searched', () => {
    render(<SearchResults results={mockResults} query="Einstein" />);

    expect(screen.getByText(/results for "einstein"/i)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntityCard } from './EntityCard';

describe('EntityCard', () => {
  const mockEntity = {
    id: 'Q937',
    label: 'Albert Einstein',
    description: 'German-born theoretical physicist',
    aliases: ['Einstein', 'A. Einstein'],
  };

  it('should render entity label and description', () => {
    render(<EntityCard entity={mockEntity} />);

    expect(screen.getByText('Albert Einstein')).toBeInTheDocument();
    expect(
      screen.getByText('German-born theoretical physicist')
    ).toBeInTheDocument();
  });

  it('should render entity ID', () => {
    render(<EntityCard entity={mockEntity} />);

    expect(screen.getByText('Q937')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<EntityCard entity={mockEntity} onClick={handleClick} />);

    await user.click(screen.getByText('Albert Einstein'));

    expect(handleClick).toHaveBeenCalledWith(mockEntity);
  });

  it('should render without description if not provided', () => {
    const entityWithoutDesc = {
      id: 'Q123',
      label: 'Test Entity',
    };

    render(<EntityCard entity={entityWithoutDesc} />);

    expect(screen.getByText('Test Entity')).toBeInTheDocument();
    expect(screen.getByText('Q123')).toBeInTheDocument();
    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
  });

  it('should show add to collection button when provided', () => {
    const handleAdd = vi.fn();

    render(<EntityCard entity={mockEntity} onAddToCollection={handleAdd} />);

    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('should call onAddToCollection when add button is clicked', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();

    render(<EntityCard entity={mockEntity} onAddToCollection={handleAdd} />);

    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(handleAdd).toHaveBeenCalledWith(mockEntity);
  });
});

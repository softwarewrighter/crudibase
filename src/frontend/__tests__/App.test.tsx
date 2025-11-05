import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('should render welcome message', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to Crudibase/i)).toBeInTheDocument();
  });

  it('should render sign in and get started buttons', () => {
    render(<App />);
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
  });
});

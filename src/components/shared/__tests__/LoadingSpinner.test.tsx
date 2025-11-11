import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingOverlay } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.lucide-loader-2');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('should render with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.lucide-loader-2');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('should render with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.lucide-loader-2');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('should display message when provided', () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });
});

describe('LoadingOverlay', () => {
  it('should render overlay with spinner', () => {
    const { container } = render(<LoadingOverlay />);
    expect(container.querySelector('.fixed')).toBeInTheDocument();
    expect(container.querySelector('.lucide-loader-2')).toBeInTheDocument();
  });

  it('should display message in overlay', () => {
    render(<LoadingOverlay message="Processing..." />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});

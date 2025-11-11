import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

const NormalComponent = () => <div>Normal render</div>;

// Suppress console.error for cleaner test output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal render')).toBeInTheDocument();
  });

  it('should render error UI when child throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Algo deu errado/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const CustomFallback = () => <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });
});

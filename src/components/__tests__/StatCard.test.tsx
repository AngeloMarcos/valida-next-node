import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('should render title and value', () => {
    render(
      <StatCard
        title="Total Users"
        value={100}
        icon={Users}
        description="Active users"
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Active users')).toBeInTheDocument();
  });

  it('should render with positive trend', () => {
    render(
      <StatCard
        title="Revenue"
        value={5000}
        icon={Users}
        description="Monthly revenue"
        trend={{ value: 12, isPositive: true }}
      />
    );

    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('should render with negative trend', () => {
    render(
      <StatCard
        title="Revenue"
        value={5000}
        icon={Users}
        description="Monthly revenue"
        trend={{ value: 5, isPositive: false }}
      />
    );

    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('should render without trend', () => {
    const { container } = render(
      <StatCard
        title="Revenue"
        value={5000}
        icon={Users}
        description="Monthly revenue"
      />
    );

    expect(container.textContent).not.toMatch(/\+\d+%/);
    expect(container.textContent).not.toMatch(/-\d+%/);
  });
});

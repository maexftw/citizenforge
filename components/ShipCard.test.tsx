
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShipCard } from './ShipCard';
import { Ship } from '../types';

const mockShip: Ship = {
  id: '1',
  name: 'Aegis Avenger Titan',
  manufacturer: 'Aegis Dynamics',
  image: 'https://example.com/titan.jpg',
  focus: 'Light Freight',
  description: 'A reliable light freighter.'
};

describe('ShipCard', () => {
  const mockOnSelect = vi.fn();

  it('renders ship details correctly', () => {
    render(
      <ShipCard
        ship={mockShip}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Aegis Avenger Titan')).toBeInTheDocument();
    expect(screen.getByText('AEGIS')).toBeInTheDocument(); // Manufacturer is split and uppercase
    expect(screen.getByText('Light Freight')).toBeInTheDocument();
  });

  it('renders ship image when provided', () => {
    render(
      <ShipCard
        ship={mockShip}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const img = screen.getByAltText('Aegis Avenger Titan');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockShip.image);
  });

  it('renders placeholder when image fails to load', () => {
    render(
      <ShipCard
        ship={mockShip}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const img = screen.getByAltText('Aegis Avenger Titan');
    fireEvent.error(img);

    expect(screen.getByText(/LIGHT FREIGHT AIRFRAME/i)).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(
      <ShipCard
        ship={mockShip}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByText('Aegis Avenger Titan'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockShip);
  });

  it('displays selection state correctly', () => {
    const { rerender } = render(
      <ShipCard
        ship={mockShip}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    // Not selected
    expect(screen.queryByRole('img', { hidden: true })).not.toContainHTML('path'); // Looking for the checkmark SVG

    rerender(
      <ShipCard
        ship={mockShip}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    // Selected state should show the checkmark icon
    // The checkmark is in an absolute positioned div
    const checkmark = document.querySelector('svg path[d="M5 13l4 4L19 7"]');
    expect(checkmark).toBeInTheDocument();
  });
});

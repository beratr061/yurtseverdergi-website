import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonCard, SkeletonGrid } from '@/components/SkeletonCard';

describe('SkeletonCard', () => {
  it('should render skeleton card with animate-pulse', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild;
    expect(card).toHaveClass('animate-pulse');
  });

  it('should render image skeleton', () => {
    const { container } = render(<SkeletonCard />);
    const imageSkeleton = container.querySelector('.h-56');
    expect(imageSkeleton).toBeInTheDocument();
  });

  it('should render content skeleton elements', () => {
    const { container } = render(<SkeletonCard />);
    const skeletonElements = container.querySelectorAll('.bg-neutral-200');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});

describe('SkeletonGrid', () => {
  it('should render default 6 skeleton cards', () => {
    const { container } = render(<SkeletonGrid />);
    const cards = container.querySelectorAll('.animate-pulse');
    expect(cards).toHaveLength(6);
  });

  it('should render specified number of skeleton cards', () => {
    const { container } = render(<SkeletonGrid count={3} />);
    const cards = container.querySelectorAll('.animate-pulse');
    expect(cards).toHaveLength(3);
  });

  it('should render grid layout', () => {
    const { container } = render(<SkeletonGrid />);
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });
});

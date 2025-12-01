import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LockedAvatar } from '@/components/LockedAvatar';

describe('LockedAvatar', () => {
  it('should render with default medium size', () => {
    const { container } = render(<LockedAvatar />);
    const avatar = container.firstChild;
    expect(avatar).toHaveClass('w-16', 'h-16');
  });

  it('should render with small size', () => {
    const { container } = render(<LockedAvatar size="sm" />);
    const avatar = container.firstChild;
    expect(avatar).toHaveClass('w-10', 'h-10');
  });

  it('should render with large size', () => {
    const { container } = render(<LockedAvatar size="lg" />);
    const avatar = container.firstChild;
    expect(avatar).toHaveClass('w-32', 'h-32');
  });

  it('should have rounded-full class', () => {
    const { container } = render(<LockedAvatar />);
    const avatar = container.firstChild;
    expect(avatar).toHaveClass('rounded-full');
  });

  it('should have animate-pulse on lock icon container', () => {
    const { container } = render(<LockedAvatar />);
    const pulseElement = container.querySelector('.animate-pulse');
    expect(pulseElement).toBeInTheDocument();
  });

  it('should render lock icon', () => {
    const { container } = render(<LockedAvatar />);
    const lockIcon = container.querySelector('svg');
    expect(lockIcon).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeToggle } from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset document state
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    vi.mocked(localStorage.setItem).mockClear();
  });

  it('should render toggle button', async () => {
    render(<ThemeToggle />);
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('should have proper aria-label for light mode', async () => {
    render(<ThemeToggle />);
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Karanlık moda geç');
    });
  });

  it('should have proper aria-label for dark mode', async () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Aydınlık moda geç');
    });
  });

  it('should toggle to dark mode when clicked in light mode', async () => {
    render(<ThemeToggle />);
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should toggle to light mode when clicked in dark mode', async () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('should render placeholder before mount', () => {
    const { container } = render(<ThemeToggle />);
    // Initial render shows placeholder
    expect(container.querySelector('.h-5.w-5')).toBeInTheDocument();
  });
});

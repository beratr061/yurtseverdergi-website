import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '@/components/Breadcrumb';

describe('Breadcrumb', () => {
  it('should render home link', () => {
    render(<Breadcrumb items={[]} />);
    const homeLink = screen.getByRole('link');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render breadcrumb items', () => {
    const items = [
      { label: 'Şiir', href: '/siir' },
      { label: 'Test Yazı' },
    ];
    render(<Breadcrumb items={items} />);
    
    expect(screen.getByText('Şiir')).toBeInTheDocument();
    expect(screen.getByText('Test Yazı')).toBeInTheDocument();
  });

  it('should render links for items with href except last item', () => {
    const items = [
      { label: 'Kategori', href: '/kategori' },
      { label: 'Alt Kategori', href: '/alt-kategori' },
      { label: 'Son Öğe' },
    ];
    render(<Breadcrumb items={items} />);
    
    const links = screen.getAllByRole('link');
    // Home + Kategori + Alt Kategori (Son Öğe is not a link)
    expect(links).toHaveLength(3);
  });

  it('should apply font-medium to last item', () => {
    const items = [
      { label: 'Kategori', href: '/kategori' },
      { label: 'Son Öğe' },
    ];
    render(<Breadcrumb items={items} />);
    
    const lastItem = screen.getByText('Son Öğe');
    expect(lastItem).toHaveClass('font-medium');
  });

  it('should have proper aria-label for navigation', () => {
    render(<Breadcrumb items={[{ label: 'Test' }]} />);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('should render screen reader text for home', () => {
    render(<Breadcrumb items={[]} />);
    expect(screen.getByText('Ana Sayfa')).toHaveClass('sr-only');
  });
});

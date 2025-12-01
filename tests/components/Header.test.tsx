import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/Header';

describe('Header', () => {
  it('should render logo', () => {
    render(<Header />);
    expect(screen.getByText('YurtSever')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Header />);
    
    expect(screen.getByText('Şiir')).toBeInTheDocument();
    expect(screen.getByText('Yazarlar')).toBeInTheDocument();
    expect(screen.getByText('Poetika')).toBeInTheDocument();
    expect(screen.getByText('Söyleşi')).toBeInTheDocument();
    expect(screen.getByText('Eleştiri')).toBeInTheDocument();
    expect(screen.getByText('Hakkımızda')).toBeInTheDocument();
  });

  it('should render search link', () => {
    render(<Header />);
    expect(screen.getByLabelText('Ara')).toBeInTheDocument();
  });

  it('should render contact button', () => {
    render(<Header />);
    expect(screen.getByText('Bize Yazın')).toBeInTheDocument();
  });

  it('should have correct href for navigation links', () => {
    render(<Header />);
    
    const siirLink = screen.getByRole('link', { name: 'Şiir' });
    expect(siirLink).toHaveAttribute('href', '/siir');
    
    const yazarlarLink = screen.getByRole('link', { name: 'Yazarlar' });
    expect(yazarlarLink).toHaveAttribute('href', '/yazarlar');
  });

  it('should toggle mobile menu on button click', () => {
    render(<Header />);
    
    const menuButton = screen.getByLabelText('Menüyü aç');
    fireEvent.click(menuButton);
    
    // Mobile menu should be visible - check for duplicate links
    const siirLinks = screen.getAllByText('Şiir');
    expect(siirLinks.length).toBeGreaterThan(1);
  });

  it('should close mobile menu when link is clicked', () => {
    render(<Header />);
    
    // Open menu
    const menuButton = screen.getByLabelText('Menüyü aç');
    fireEvent.click(menuButton);
    
    // Click a link in mobile menu
    const mobileLinks = screen.getAllByText('Şiir');
    fireEvent.click(mobileLinks[1]); // Click mobile version
    
    // Menu should close - only desktop link should remain
    const siirLinks = screen.getAllByText('Şiir');
    expect(siirLinks).toHaveLength(1);
  });

  it('should render home link on logo', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /YurtSever/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });
});

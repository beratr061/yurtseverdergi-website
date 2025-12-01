import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('should render brand name', () => {
    render(<Footer />);
    expect(screen.getByText('YurtSever')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Footer />);
    
    expect(screen.getByText('Şiir')).toBeInTheDocument();
    expect(screen.getByText('Yazarlar')).toBeInTheDocument();
    expect(screen.getByText('Poetika')).toBeInTheDocument();
    expect(screen.getByText('Söyleşi')).toBeInTheDocument();
    expect(screen.getByText('Eleştiri')).toBeInTheDocument();
    expect(screen.getByText('Hakkımızda')).toBeInTheDocument();
    expect(screen.getByText('İletişim')).toBeInTheDocument();
  });

  it('should render newsletter section', () => {
    render(<Footer />);
    
    expect(screen.getByText('E-Bülten')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('E-posta adresiniz')).toBeInTheDocument();
    expect(screen.getByText('Abone Ol')).toBeInTheDocument();
  });

  it('should render social media links', () => {
    render(<Footer />);
    
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('X')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Youtube')).toBeInTheDocument();
  });

  it('should render current year in copyright', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} YurtSever Dergi. Tüm hakları saklıdır.`)).toBeInTheDocument();
  });

  it('should render contact link', () => {
    render(<Footer />);
    expect(screen.getByText('Bize Yazın')).toBeInTheDocument();
  });

  it('should have correct href for navigation links', () => {
    render(<Footer />);
    
    const siirLink = screen.getByRole('link', { name: 'Şiir' });
    expect(siirLink).toHaveAttribute('href', '/siir');
    
    const yazarlarLink = screen.getByRole('link', { name: 'Yazarlar' });
    expect(yazarlarLink).toHaveAttribute('href', '/yazarlar');
  });
});

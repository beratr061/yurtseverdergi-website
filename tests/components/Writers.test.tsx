import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Writers } from '@/components/Writers';

describe('Writers', () => {
  const mockWriters = [
    {
      id: '1',
      slug: 'yazar-1',
      name: 'Yazar Bir',
      role: 'Şair',
      bio: 'Test bio 1',
      image: 'https://example.com/image1.jpg',
    },
    {
      id: '2',
      slug: 'yazar-2',
      name: 'Yazar İki',
      role: 'Eleştirmen',
      bio: 'Test bio 2',
      image: 'https://example.com/image2.jpg',
    },
  ];

  it('should render section title', () => {
    render(<Writers writers={mockWriters} />);
    expect(screen.getByText('Yazarlarımız')).toBeInTheDocument();
  });

  it('should render section description', () => {
    render(<Writers writers={mockWriters} />);
    expect(screen.getByText('Türk edebiyatının değerli kalemleri')).toBeInTheDocument();
  });

  it('should render all writers', () => {
    render(<Writers writers={mockWriters} />);
    
    expect(screen.getByText('Yazar Bir')).toBeInTheDocument();
    expect(screen.getByText('Yazar İki')).toBeInTheDocument();
  });

  it('should render writer roles', () => {
    render(<Writers writers={mockWriters} />);
    
    expect(screen.getByText('Şair')).toBeInTheDocument();
    expect(screen.getByText('Eleştirmen')).toBeInTheDocument();
  });

  it('should render writer bios', () => {
    render(<Writers writers={mockWriters} />);
    
    expect(screen.getByText('Test bio 1')).toBeInTheDocument();
    expect(screen.getByText('Test bio 2')).toBeInTheDocument();
  });

  it('should render links to writer profiles', () => {
    render(<Writers writers={mockWriters} />);
    
    const links = screen.getAllByRole('link');
    const writerLinks = links.filter(link => link.getAttribute('href')?.startsWith('/yazar/'));
    
    expect(writerLinks).toHaveLength(2);
    expect(writerLinks[0]).toHaveAttribute('href', '/yazar/yazar-1');
    expect(writerLinks[1]).toHaveAttribute('href', '/yazar/yazar-2');
  });

  it('should render "Tümünü Gör" link', () => {
    render(<Writers writers={mockWriters} />);
    expect(screen.getByText('Tümünü Gör')).toBeInTheDocument();
  });

  it('should render empty state when no writers', () => {
    render(<Writers writers={[]} />);
    expect(screen.getByText('Henüz yazar bulunmuyor.')).toBeInTheDocument();
  });
});

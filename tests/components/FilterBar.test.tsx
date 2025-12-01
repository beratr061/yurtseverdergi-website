import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '@/components/FilterBar';

describe('FilterBar', () => {
  const defaultProps = {
    categories: ['Şiir', 'Eleştiri', 'Söyleşi'],
    authors: ['Yazar 1', 'Yazar 2', 'Yazar 3'],
    onFilterChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all category options', () => {
    render(<FilterBar {...defaultProps} />);
    
    expect(screen.getByText('Tüm Kategoriler')).toBeInTheDocument();
    expect(screen.getByText('Şiir')).toBeInTheDocument();
    expect(screen.getByText('Eleştiri')).toBeInTheDocument();
    expect(screen.getByText('Söyleşi')).toBeInTheDocument();
  });

  it('should render all author options', () => {
    render(<FilterBar {...defaultProps} />);
    
    expect(screen.getByText('Tüm Yazarlar')).toBeInTheDocument();
    expect(screen.getByText('Yazar 1')).toBeInTheDocument();
    expect(screen.getByText('Yazar 2')).toBeInTheDocument();
    expect(screen.getByText('Yazar 3')).toBeInTheDocument();
  });

  it('should render sort options', () => {
    render(<FilterBar {...defaultProps} />);
    
    expect(screen.getByText('En Yeni')).toBeInTheDocument();
    expect(screen.getByText('En Eski')).toBeInTheDocument();
    expect(screen.getByText('Popüler')).toBeInTheDocument();
  });

  it('should call onFilterChange when category changes', () => {
    render(<FilterBar {...defaultProps} />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Şiir' } });
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
      category: 'Şiir',
      author: '',
      sortBy: 'newest',
    });
  });

  it('should call onFilterChange when author changes', () => {
    render(<FilterBar {...defaultProps} />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'Yazar 1' } });
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
      category: '',
      author: 'Yazar 1',
      sortBy: 'newest',
    });
  });

  it('should call onFilterChange when sort changes', () => {
    render(<FilterBar {...defaultProps} />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[2], { target: { value: 'popular' } });
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
      category: '',
      author: '',
      sortBy: 'popular',
    });
  });

  it('should show clear button when filters are active', () => {
    render(<FilterBar {...defaultProps} />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Şiir' } });
    
    expect(screen.getByText('Temizle')).toBeInTheDocument();
  });

  it('should clear all filters when clear button is clicked', () => {
    render(<FilterBar {...defaultProps} />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Şiir' } });
    
    fireEvent.click(screen.getByText('Temizle'));
    
    expect(defaultProps.onFilterChange).toHaveBeenLastCalledWith({
      category: '',
      author: '',
      sortBy: 'newest',
    });
  });

  it('should render mobile filter toggle button', () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByText('Filtrele')).toBeInTheDocument();
  });
});

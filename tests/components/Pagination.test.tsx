import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '@/components/Pagination';

describe('Pagination', () => {
  it('should not render if totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render if totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render all pages when totalPages <= 5', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should call onPageChange when clicking a page number', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange when clicking next button', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);
    
    fireEvent.click(screen.getByLabelText('Sonraki sayfa'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange when clicking previous button', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);
    
    fireEvent.click(screen.getByLabelText('Önceki sayfa'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Önceki sayfa')).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Sonraki sayfa')).toBeDisabled();
  });

  it('should show ellipsis for many pages (beginning)', () => {
    render(<Pagination currentPage={2} totalPages={10} onPageChange={() => {}} />);
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should show ellipsis for many pages (end)', () => {
    render(<Pagination currentPage={9} totalPages={10} onPageChange={() => {}} />);
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should show two ellipsis for middle pages', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />);
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis).toHaveLength(2);
  });

  it('should highlight current page', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('bg-primary-600');
  });
});

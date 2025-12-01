import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar', () => {
  it('should render with default placeholder', () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.getByPlaceholderText('Yazı, yazar veya kategori ara...')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<SearchBar onSearch={() => {}} placeholder="Ara..." />);
    expect(screen.getByPlaceholderText('Ara...')).toBeInTheDocument();
  });

  it('should update input value on change', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={() => {}} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    expect(input).toHaveValue('test');
  });

  it('should call onSearch on form submit', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'şiir{enter}');
    
    expect(onSearch).toHaveBeenCalledWith('şiir');
  });

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={() => {}} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should not show clear button when input is empty', () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should clear input and call onSearch with empty string on clear', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    const clearButton = screen.getByRole('button');
    await user.click(clearButton);
    
    expect(input).toHaveValue('');
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('should apply focus ring on focus', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={() => {}} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    
    const wrapper = input.parentElement;
    expect(wrapper).toHaveClass('ring-2');
  });
});

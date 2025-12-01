import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SocialShare } from '@/components/SocialShare';

describe('SocialShare', () => {
  const defaultProps = {
    url: 'https://example.com/article',
    title: 'Test Article',
    description: 'Test description',
  };

  beforeEach(() => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should render share title', () => {
    render(<SocialShare {...defaultProps} />);
    expect(screen.getByText('Paylaş')).toBeInTheDocument();
  });

  it('should render all social share buttons', () => {
    render(<SocialShare {...defaultProps} />);
    
    expect(screen.getByLabelText("Facebook'ta paylaş")).toBeInTheDocument();
    expect(screen.getByLabelText("X'te paylaş")).toBeInTheDocument();
    expect(screen.getByLabelText("WhatsApp'ta paylaş")).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram'da paylaş")).toBeInTheDocument();
    expect(screen.getByLabelText('Linki kopyala')).toBeInTheDocument();
    expect(screen.getByLabelText('E-posta ile paylaş')).toBeInTheDocument();
  });

  it('should open Facebook share window on click', () => {
    render(<SocialShare {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText("Facebook'ta paylaş"));
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('should open Twitter share window on click', () => {
    render(<SocialShare {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText("X'te paylaş"));
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('should open WhatsApp share window on click', () => {
    render(<SocialShare {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText("WhatsApp'ta paylaş"));
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('should copy URL to clipboard on copy button click', async () => {
    render(<SocialShare {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText('Linki kopyala'));
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.url);
  });

  it('should show copied message after copying', async () => {
    render(<SocialShare {...defaultProps} />);
    
    fireEvent.click(screen.getByLabelText('Linki kopyala'));
    
    await waitFor(() => {
      expect(screen.getByText('Kopyalandı!')).toBeInTheDocument();
    });
  });

  it('should encode URL and title in share links', () => {
    const props = {
      url: 'https://example.com/article?id=1&test=true',
      title: 'Test & Article',
    };
    render(<SocialShare {...props} />);
    
    fireEvent.click(screen.getByLabelText("Facebook'ta paylaş"));
    
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(props.url)),
      '_blank',
      'width=600,height=400'
    );
  });
});

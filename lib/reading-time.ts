/**
 * Calculate reading time for an article
 * @param content - HTML content of the article
 * @returns Reading time in Turkish format (e.g., "5 dakika")
 */
export function calculateReadingTime(content: string): string {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');

    // Count words (Turkish text)
    const words = text.trim().split(/\s+/).length;

    // Average reading speed: 200 words per minute for Turkish
    const wordsPerMinute = 200;
    const minutes = Math.ceil(words / wordsPerMinute);

    if (minutes < 1) {
        return '1 dakika';
    }

    return `${minutes} dakika`;
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(headers: Headers): string {
    // Try different headers in order of preference
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    const cfConnectingIp = headers.get('cf-connecting-ip');
    if (cfConnectingIp) {
        return cfConnectingIp;
    }

    // Fallback
    return 'unknown';
}

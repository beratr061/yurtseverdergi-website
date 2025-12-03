// Validation constants
export const MAX_HEADLINE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 1000;

// URL validation regex (HTTP/HTTPS)
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

// Email validation regex - RFC 5322 compliant basic pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) {
    return false;
  }
  return EMAIL_REGEX.test(trimmed);
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
}

// Validate URL format
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === '') return true; // Empty URLs are allowed (optional fields)
  return URL_REGEX.test(url.trim());
}

// Validate date is in the future
export function isFutureDate(date: Date | string | null | undefined): boolean {
  if (!date) return true; // Null dates are allowed (optional field)
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return false; // Invalid date
  return dateObj.getTime() > Date.now();
}

// Validate text length
export function isValidTextLength(text: string | null | undefined, maxLength: number): boolean {
  if (!text) return true; // Null/empty text is allowed (optional fields)
  return text.length <= maxLength;
}

// Validate invitation settings
export function validateInvitationSettings(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate headline length
  if (body.invitationHeadline !== undefined) {
    if (!isValidTextLength(body.invitationHeadline as string, MAX_HEADLINE_LENGTH)) {
      errors.push({
        field: 'invitationHeadline',
        message: `Başlık en fazla ${MAX_HEADLINE_LENGTH} karakter olabilir`,
      });
    }
  }

  // Validate description length
  if (body.invitationDescription !== undefined) {
    if (!isValidTextLength(body.invitationDescription as string, MAX_DESCRIPTION_LENGTH)) {
      errors.push({
        field: 'invitationDescription',
        message: `Açıklama en fazla ${MAX_DESCRIPTION_LENGTH} karakter olabilir`,
      });
    }
  }

  // Validate launch date (must be future)
  if (body.invitationLaunchDate !== undefined && body.invitationLaunchDate !== null) {
    if (!isFutureDate(body.invitationLaunchDate as string | Date)) {
      errors.push({
        field: 'invitationLaunchDate',
        message: 'Lansman tarihi gelecekte bir tarih olmalıdır',
      });
    }
  }

  // Validate Twitter URL
  if (body.invitationTwitterUrl !== undefined) {
    if (!isValidUrl(body.invitationTwitterUrl as string)) {
      errors.push({
        field: 'invitationTwitterUrl',
        message: 'Geçerli bir Twitter URL\'i girin (http:// veya https:// ile başlamalı)',
      });
    }
  }

  // Validate Instagram URL
  if (body.invitationInstagramUrl !== undefined) {
    if (!isValidUrl(body.invitationInstagramUrl as string)) {
      errors.push({
        field: 'invitationInstagramUrl',
        message: 'Geçerli bir Instagram URL\'i girin (http:// veya https:// ile başlamalı)',
      });
    }
  }

  // Validate Facebook URL
  if (body.invitationFacebookUrl !== undefined) {
    if (!isValidUrl(body.invitationFacebookUrl as string)) {
      errors.push({
        field: 'invitationFacebookUrl',
        message: 'Geçerli bir Facebook URL\'i girin (http:// veya https:// ile başlamalı)',
      });
    }
  }

  return errors;
}

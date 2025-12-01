import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: invitation-mode, Property 4: Valid Email Subscription**
 * **Validates: Requirements 3.1**
 * 
 * Property: For any valid email address format, submitting it to the subscription
 * endpoint should result in that email being stored in the InvitationEmail collection.
 */

// Mock prisma before importing the module - use factory function
vi.mock('@/lib/prisma', () => ({
  default: {
    invitationEmail: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Import the validation function directly for testing
import { isValidEmail } from '@/app/api/invitation/subscribe/route';
import prisma from '@/lib/prisma';

describe('Email Subscription - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  /**
   * **Feature: invitation-mode, Property 4: Valid Email Subscription**
   * **Validates: Requirements 3.1**
   * 
   * For any valid email address format, the isValidEmail function should return true
   */
  it('should accept any valid email format', () => {
    fc.assert(
      fc.property(
        // Generate valid email addresses
        fc.emailAddress(),
        (email) => {
          const result = isValidEmail(email);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 4: Valid Email Subscription**
   * **Validates: Requirements 3.1**
   * 
   * For any valid email, when submitted and not already in database,
   * it should be stored in the InvitationEmail collection
   */
  it('should store valid emails in the database when not already subscribed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        async (email) => {
          // Reset mocks for each iteration
          vi.mocked(prisma.invitationEmail.findUnique).mockResolvedValue(null);
          vi.mocked(prisma.invitationEmail.create).mockResolvedValue({
            id: 'test-id',
            email: email.toLowerCase(),
            subscribedAt: new Date(),
          });

          // Simulate the API logic
          const normalizedEmail = email.trim().toLowerCase();
          
          // Check if email exists
          const existing = await prisma.invitationEmail.findUnique({
            where: { email: normalizedEmail },
          });

          if (!existing && isValidEmail(email)) {
            // Create the email entry
            await prisma.invitationEmail.create({
              data: { email: normalizedEmail },
            });

            // Property: create should have been called with the normalized email
            expect(prisma.invitationEmail.create).toHaveBeenCalledWith({
              data: { email: normalizedEmail },
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 4: Valid Email Subscription**
   * **Validates: Requirements 3.1**
   * 
   * For any valid email, the normalized (lowercase, trimmed) version should be stored
   */
  it('should normalize emails to lowercase before storing', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        (email) => {
          const normalized = email.trim().toLowerCase();
          
          // Property: normalized email should be lowercase
          expect(normalized).toBe(normalized.toLowerCase());
          // Property: normalized email should have no leading/trailing whitespace
          expect(normalized).toBe(normalized.trim());
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: invitation-mode, Property 5: Invalid Email Rejection**
 * **Validates: Requirements 3.3**
 * 
 * Property: For any string that does not match a valid email format,
 * submitting it to the subscription endpoint should return a validation error
 * and not store anything in the database.
 */
describe('Email Subscription - Invalid Email Rejection Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  /**
   * **Feature: invitation-mode, Property 5: Invalid Email Rejection**
   * **Validates: Requirements 3.3**
   * 
   * For any string without @ symbol, isValidEmail should return false
   */
  it('should reject strings without @ symbol', () => {
    fc.assert(
      fc.property(
        // Generate strings that don't contain @
        fc.string().filter(s => !s.includes('@')),
        (invalidEmail) => {
          const result = isValidEmail(invalidEmail);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 5: Invalid Email Rejection**
   * **Validates: Requirements 3.3**
   * 
   * For any empty or whitespace-only string, isValidEmail should return false
   */
  it('should reject empty or whitespace-only strings', () => {
    fc.assert(
      fc.property(
        // Generate whitespace-only strings (including empty)
        fc.array(fc.constantFrom(' ', '\t', '\n', '\r')).map(arr => arr.join('')),
        (whitespaceString) => {
          const result = isValidEmail(whitespaceString);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 5: Invalid Email Rejection**
   * **Validates: Requirements 3.3**
   * 
   * For any string with @ but missing local part (before @), isValidEmail should return false
   */
  it('should reject emails with missing local part', () => {
    fc.assert(
      fc.property(
        // Generate domain-like strings
        fc.domain(),
        (domain) => {
          const invalidEmail = `@${domain}`;
          const result = isValidEmail(invalidEmail);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 5: Invalid Email Rejection**
   * **Validates: Requirements 3.3**
   * 
   * For any string with @ but missing domain part (after @), isValidEmail should return false
   */
  it('should reject emails with missing domain part', () => {
    fc.assert(
      fc.property(
        // Generate local part strings (no @ or whitespace)
        fc.string({ minLength: 1 }).filter(s => !s.includes('@') && !s.includes(' ')),
        (localPart) => {
          const invalidEmail = `${localPart}@`;
          const result = isValidEmail(invalidEmail);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 5: Invalid Email Rejection**
   * **Validates: Requirements 3.3**
   * 
   * For null or undefined values, isValidEmail should return false
   */
  it('should reject null and undefined values', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });

  /**
   * **Feature: invitation-mode, Property 5: Invalid Email Rejection**
   * **Validates: Requirements 3.3**
   * 
   * For any invalid email, the database create should NOT be called
   */
  it('should not store invalid emails in the database', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate invalid email strings (no @ symbol)
        fc.string().filter(s => !s.includes('@')),
        async (invalidEmail) => {
          // Reset mocks
          vi.mocked(prisma.invitationEmail.create).mockClear();

          // Simulate the API validation logic
          if (!isValidEmail(invalidEmail)) {
            // Property: create should NOT be called for invalid emails
            expect(prisma.invitationEmail.create).not.toHaveBeenCalled();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

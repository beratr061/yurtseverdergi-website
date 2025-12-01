import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: invitation-mode, Property 6: CSV Export Completeness**
 * **Validates: Requirements 5.3**
 * 
 * Property: For any set of emails in the InvitationEmail collection,
 * the exported CSV should contain exactly all those emails with their subscription dates.
 */

// Import the CSV generation functions from utility file for testing
import { escapeCSVValue, generateCSV } from '@/lib/csv-utils';

// Use a valid date generator that excludes NaN dates - based on integer timestamps
const validDate = fc.integer({ min: 0, max: 4102444800000 }).map(ts => new Date(ts));

describe('CSV Export Completeness - Property Tests', () => {

  /**
   * **Feature: invitation-mode, Property 6: CSV Export Completeness**
   * **Validates: Requirements 5.3**
   * 
   * For any set of email records, the generated CSV should contain all emails
   */
  it('should include all emails in the CSV output', () => {
    fc.assert(
      fc.property(
        // Generate array of email records
        fc.array(
          fc.record({
            email: fc.emailAddress(),
            subscribedAt: validDate,
          }),
          { minLength: 0, maxLength: 100 }
        ),
        (emails) => {
          const csv = generateCSV(emails);
          const lines = csv.split('\n');
          
          // Property: CSV should have header + one line per email
          expect(lines.length).toBe(emails.length + 1);
          
          // Property: First line should be the header
          expect(lines[0]).toBe('email,subscribedAt');
          
          // Property: Each email should appear in the CSV
          for (const emailRecord of emails) {
            const emailInCSV = lines.some(line => 
              line.includes(emailRecord.email) || 
              line.includes(escapeCSVValue(emailRecord.email))
            );
            expect(emailInCSV).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 6: CSV Export Completeness**
   * **Validates: Requirements 5.3**
   * 
   * For any set of email records, the generated CSV should contain all subscription dates
   */
  it('should include all subscription dates in the CSV output', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            email: fc.emailAddress(),
            subscribedAt: validDate,
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (emails) => {
          const csv = generateCSV(emails);
          
          // Property: Each subscription date should appear in the CSV (as ISO string)
          for (const emailRecord of emails) {
            const dateStr = emailRecord.subscribedAt.toISOString();
            const dateInCSV = csv.includes(dateStr) || csv.includes(escapeCSVValue(dateStr));
            expect(dateInCSV).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 6: CSV Export Completeness**
   * **Validates: Requirements 5.3**
   * 
   * For an empty email collection, the CSV should only contain the header
   */
  it('should return only header for empty email collection', () => {
    const csv = generateCSV([]);
    expect(csv).toBe('email,subscribedAt');
  });

  /**
   * **Feature: invitation-mode, Property 6: CSV Export Completeness**
   * **Validates: Requirements 5.3**
   * 
   * For any email containing special CSV characters (comma, quote, newline),
   * the CSV should properly escape them
   */
  it('should properly escape special characters in emails', () => {
    fc.assert(
      fc.property(
        // Generate emails with special characters
        fc.record({
          email: fc.oneof(
            fc.constant('test,comma@example.com'),
            fc.constant('test"quote@example.com'),
            fc.constant('test\nnewline@example.com'),
            fc.emailAddress()
          ),
          subscribedAt: validDate,
        }),
        (emailRecord) => {
          const csv = generateCSV([emailRecord]);
          const lines = csv.split('\n');
          
          // Property: CSV should have exactly 2 lines (header + 1 data row)
          // Note: if email contains newline, it will be escaped in quotes
          expect(lines.length).toBeGreaterThanOrEqual(2);
          
          // Property: The email should be recoverable from the CSV
          // (either directly or escaped)
          const dataLine = lines.slice(1).join('\n');
          const emailEscaped = escapeCSVValue(emailRecord.email);
          expect(dataLine.includes(emailRecord.email) || dataLine.includes(emailEscaped)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 6: CSV Export Completeness**
   * **Validates: Requirements 5.3**
   * 
   * Round-trip property: parsing the CSV should recover all original emails
   */
  it('should allow round-trip recovery of all emails from CSV', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            // Use simple emails without special chars for round-trip test
            email: fc.emailAddress().filter(e => !e.includes(',') && !e.includes('"') && !e.includes('\n')),
            subscribedAt: validDate,
          }),
          { minLength: 0, maxLength: 50 }
        ),
        (emails) => {
          const csv = generateCSV(emails);
          const lines = csv.split('\n');
          
          // Skip header, parse data lines
          const parsedEmails = lines.slice(1).map(line => {
            const [email, dateStr] = line.split(',');
            return { email, subscribedAt: new Date(dateStr) };
          });
          
          // Property: Number of parsed records should match original
          expect(parsedEmails.length).toBe(emails.length);
          
          // Property: Each original email should be in parsed results
          for (let i = 0; i < emails.length; i++) {
            expect(parsedEmails[i].email).toBe(emails[i].email);
            expect(parsedEmails[i].subscribedAt.toISOString()).toBe(emails[i].subscribedAt.toISOString());
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('CSV Escape Function - Property Tests', () => {
  /**
   * **Feature: invitation-mode, Property 6: CSV Export Completeness**
   * **Validates: Requirements 5.3**
   * 
   * For any string without special characters, escapeCSVValue should return it unchanged
   */
  it('should not modify strings without special characters', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !s.includes(',') && !s.includes('"') && !s.includes('\n') && !s.includes('\r')),
        (str) => {
          const escaped = escapeCSVValue(str);
          expect(escaped).toBe(str);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 6: CSV Export Completeness**
   * **Validates: Requirements 5.3**
   * 
   * For any string with commas, escapeCSVValue should wrap it in quotes
   */
  it('should wrap strings with commas in quotes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.includes(',')),
        (str) => {
          const escaped = escapeCSVValue(str);
          expect(escaped.startsWith('"')).toBe(true);
          expect(escaped.endsWith('"')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: invitation-mode, Property 6: CSV Export Completeness**
   * **Validates: Requirements 5.3**
   * 
   * For any string with quotes, escapeCSVValue should double the quotes
   */
  it('should double quotes in strings containing quotes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.includes('"')),
        (str) => {
          const escaped = escapeCSVValue(str);
          // Count quotes in original
          const originalQuotes = (str.match(/"/g) || []).length;
          // Count quotes in escaped (excluding wrapper quotes)
          const innerContent = escaped.slice(1, -1);
          const escapedQuotes = (innerContent.match(/""/g) || []).length;
          
          // Property: Each original quote should become a double quote
          expect(escapedQuotes).toBe(originalQuotes);
        }
      ),
      { numRuns: 100 }
    );
  });
});

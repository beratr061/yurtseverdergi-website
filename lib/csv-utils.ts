/**
 * CSV Utility Functions for Email Export
 * 
 * These functions are extracted to allow for property-based testing
 * without Next.js dependencies.
 */

/**
 * Escapes a value for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Escapes quotes by doubling them
 */
export function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generates CSV content from email data
 */
export function generateCSV(emails: Array<{ email: string; subscribedAt: Date }>): string {
  const header = 'email,subscribedAt';
  const rows = emails.map(e => {
    const email = escapeCSVValue(e.email);
    const date = escapeCSVValue(e.subscribedAt.toISOString());
    return `${email},${date}`;
  });
  return [header, ...rows].join('\n');
}

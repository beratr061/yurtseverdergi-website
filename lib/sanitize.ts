// Input sanitization utilities
// XSS ve injection saldırılarına karşı koruma

/**
 * HTML özel karakterlerini escape eder
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * SQL injection için tehlikeli karakterleri temizler
 * Not: Prisma ORM zaten parameterized queries kullanıyor,
 * bu ekstra bir güvenlik katmanı
 */
export function sanitizeSqlInput(str: string): string {
  // Tehlikeli SQL karakterlerini kaldır veya escape et
  return str
    .replace(/'/g, "''")           // Single quote escape
    .replace(/;/g, '')             // Semicolon kaldır
    .replace(/--/g, '')            // SQL comment kaldır
    .replace(/\/\*/g, '')          // Block comment başlangıcı
    .replace(/\*\//g, '')          // Block comment sonu
    .replace(/xp_/gi, '')          // SQL Server extended procedures
    .replace(/UNION/gi, '')        // UNION attacks
    .replace(/SELECT/gi, '')       // SELECT injection
    .replace(/INSERT/gi, '')       // INSERT injection
    .replace(/UPDATE/gi, '')       // UPDATE injection
    .replace(/DELETE/gi, '')       // DELETE injection
    .replace(/DROP/gi, '')         // DROP injection
    .replace(/EXEC/gi, '');        // EXEC injection
}

/**
 * NoSQL injection için tehlikeli karakterleri temizler
 * MongoDB için özel
 */
export function sanitizeNoSqlInput(str: string): string {
  // MongoDB operatörlerini kaldır
  return str
    .replace(/\$/g, '')            // $ operatörlerini kaldır
    .replace(/\{/g, '')            // Object injection
    .replace(/\}/g, '')
    .replace(/\[/g, '')            // Array injection
    .replace(/\]/g, '');
}

/**
 * Email adresini sanitize eder
 */
export function sanitizeEmail(email: string): string {
  // Trim ve lowercase
  let sanitized = email.trim().toLowerCase();
  
  // Sadece geçerli email karakterlerine izin ver
  sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, '');
  
  // XSS karakterlerini kaldır
  sanitized = sanitized
    .replace(/</g, '')
    .replace(/>/g, '')
    .replace(/"/g, '')
    .replace(/'/g, '');
  
  return sanitized;
}

/**
 * Genel metin girişini sanitize eder
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\\/g, '&#x5C;');
}

/**
 * Login için input sanitization
 */
export function sanitizeLoginInput(input: { email: string; password: string }) {
  return {
    email: sanitizeEmail(input.email),
    // Password'u sanitize etmiyoruz çünkü özel karakterler gerekebilir
    // Sadece uzunluk kontrolü yapıyoruz
    password: input.password.slice(0, 128), // Max 128 karakter
  };
}

/**
 * Script injection kontrolü
 */
export function containsScriptInjection(str: string): boolean {
  const patterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,  // onclick=, onerror=, etc.
    /data:/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
  ];

  return patterns.some((pattern) => pattern.test(str));
}

/**
 * Tehlikeli input kontrolü
 */
export function isDangerousInput(str: string): boolean {
  if (containsScriptInjection(str)) return true;
  
  // SQL injection patterns
  const sqlPatterns = [
    /'\s*OR\s+'1'\s*=\s*'1/gi,
    /'\s*OR\s+1\s*=\s*1/gi,
    /UNION\s+SELECT/gi,
    /;\s*DROP\s+TABLE/gi,
    /;\s*DELETE\s+FROM/gi,
  ];

  return sqlPatterns.some((pattern) => pattern.test(str));
}

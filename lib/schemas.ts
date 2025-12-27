import { z } from 'zod';

// Common schemas
export const emailSchema = z.string().email('Geçerli bir e-posta adresi girin');

export const passwordSchema = z
  .string()
  .min(6, 'Şifre en az 6 karakter olmalı')
  .max(128, 'Şifre en fazla 128 karakter olabilir');

export const slugSchema = z
  .string()
  .min(1, 'Slug boş olamaz')
  .max(200, 'Slug en fazla 200 karakter olabilir')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Geçersiz slug formatı');

export const urlSchema = z
  .string()
  .url('Geçerli bir URL girin')
  .or(z.literal(''))
  .optional();

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100),
  email: emailSchema,
  password: passwordSchema,
});

// Article schemas
export const articleCreateSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli').max(200, 'Başlık en fazla 200 karakter'),
  slug: slugSchema,
  excerpt: z.string().min(1, 'Özet gerekli').max(500, 'Özet en fazla 500 karakter'),
  content: z.string().min(1, 'İçerik gerekli'),
  categoryId: z.string().uuid('Geçersiz kategori'),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED']).optional(),
  authorRevealDate: z.string().datetime().optional().nullable(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Kategori adı gerekli').max(100),
  slug: slugSchema,
  description: z.string().max(500).optional(),
});

// User schemas
export const userCreateSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['ADMIN', 'WRITER', 'POET']).optional(),
  slug: slugSchema.optional(),
  bio: z.string().max(500).optional(),
  fullBio: z.string().max(5000).optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  role: z.enum(['ADMIN', 'WRITER', 'POET']).optional(),
  slug: slugSchema.optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  fullBio: z.string().max(5000).optional().nullable(),
  education: z.string().max(500).optional().nullable(),
  awards: z.array(z.string()).optional(),
  image: z.string().optional().nullable(),
});

// Settings schemas
export const settingsSchema = z.object({
  siteTitle: z.string().min(1).max(100).optional(),
  siteDescription: z.string().max(500).optional(),
  contactEmail: emailSchema.optional(),
  articlesPerPage: z.number().int().min(1).max(100).optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().max(500).optional().nullable(),
  invitationMode: z.boolean().optional(),
  invitationHeadline: z.string().max(200).optional().nullable(),
  invitationDescription: z.string().max(1000).optional().nullable(),
  invitationLaunchDate: z.string().datetime().optional().nullable(),
  invitationBackgroundImage: z.string().optional().nullable(),
  invitationTwitterUrl: urlSchema,
  invitationInstagramUrl: urlSchema,
  invitationFacebookUrl: urlSchema,
});

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100),
  email: emailSchema,
  subject: z.string().min(1, 'Konu gerekli').max(200),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalı').max(5000),
});

// Invitation email schema
export const invitationEmailSchema = z.object({
  email: emailSchema,
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Search schema
export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  category: z.string().optional(),
  author: z.string().optional(),
  ...paginationSchema.shape,
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ArticleCreateInput = z.infer<typeof articleCreateSchema>;
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileUpdateSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional()
    .or(z.literal('')),
});

// Product validation schemas
export const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  price: z.number()
    .min(0, 'Price must be non-negative')
    .max(1000000, 'Price must be less than 1,000,000'),
  stock: z.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock must be non-negative'),
  category_id: z.number()
    .int('Category ID must be a whole number')
    .positive('Category ID must be positive'),
  image_url: z.string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
  is_bestseller: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

// Category validation schemas
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters'),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  image_url: z.string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
});

// Checkout validation schemas
export const checkoutSchema = z.object({
  payment_method: z.string()
    .min(1, 'Payment method is required'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters'),
  phone_number: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
});

// Search and filter validation schemas
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must be less than 100 characters'),
});

export const filterSchema = z.object({
  category_id: z.number().int().positive().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  in_stock: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_bestseller: z.boolean().optional(),
  sort_by: z.enum(['name', 'price', 'created_at', 'updated_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).optional(),
  size: z.number().int().min(1).max(100).optional(),
});

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  size: z.number().int().min(1).max(100).default(12),
  total: z.number().int().min(0).optional(),
  pages: z.number().int().min(0).optional(),
});

// File upload validation schemas
export const imageUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
});

// Admin user update validation schema
export const adminUserUpdateSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(200, 'Address must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'user']).optional(),
  is_active: z.boolean().optional(),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type FilterFormData = z.infer<typeof filterSchema>;
export type PaginationFormData = z.infer<typeof paginationSchema>;
export type ImageUploadFormData = z.infer<typeof imageUploadSchema>;
export type AdminUserUpdateFormData = z.infer<typeof adminUserUpdateSchema>;

// Validation helper functions
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

export function getFieldError(errors: z.ZodError, fieldName: string): string | undefined {
  const fieldError = errors.errors.find(error => 
    error.path.includes(fieldName)
  );
  return fieldError?.message;
}

export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  errors.errors.forEach(error => {
    const fieldName = error.path.join('.');
    formattedErrors[fieldName] = error.message;
  });
  
  return formattedErrors;
} 
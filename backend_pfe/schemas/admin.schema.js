import { z } from 'zod';

const adminUserStatusSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    const v = value.trim().toUpperCase();
    if (v === 'BANNED' || v === 'SUSPENDED') return 'INACTIVE';
    return v;
  },
  z.enum(['ACTIVE', 'INACTIVE'])
);

const adminUserStatusFilterSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return 'ALL';
    const v = value.trim().toUpperCase();
    if (v === 'ALL') return 'ALL';
    if (v === 'BANNED' || v === 'SUSPENDED') return 'INACTIVE';
    return v || 'ALL';
  },
  z
    .enum(['ALL', 'ACTIVE', 'INACTIVE'])
    .transform((value) => value || 'ALL')
);

export const adminUsersQuerySchema = z.object({
  status: adminUserStatusFilterSchema.optional().default('ALL'),
  plan: z
    .string()
    .trim()
    .max(100, 'plan filter is too long')
    .optional()
    .default('ALL')
    .transform((value) => value || 'ALL'),
  search: z
    .string()
    .trim()
    .max(100, 'search is too long')
    .optional()
    .default(''),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(8),
});

export const adminUserIdParamSchema = z.object({
  userId: z.string().uuid('invalid user id'),
});

export const updateAdminUserStatusSchema = z.object({
  status: adminUserStatusSchema,
});

import { z } from 'zod';

const requiredText = (label: string, max = 120) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);
const optionalText = (max: number) => z.string().trim().max(max).optional().default('');

// Only explicitly allowed fields are stored with an order; card data stays separate.
export const checkoutDetailsSchema = z.object({
  contact: z.object({
    fullName: requiredText('Full name'),
    email: z.string().trim().max(254).email('Enter a valid email address.'),
    phone: optionalText(40),
  }),
  shipping: z.object({
    addressLine1: requiredText('Street address', 200),
    addressLine2: optionalText(200),
    city: requiredText('City'),
    region: optionalText(120),
    postalCode: optionalText(32),
    country: requiredText('Country', 80),
  }),
});
export type CheckoutDetails = z.infer<typeof checkoutDetailsSchema>;

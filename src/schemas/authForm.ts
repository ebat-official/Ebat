import { z } from "zod";

export const authFormSchema = z.object({
  name: z.string().min(2, "Name must contain at least 2 character(s)").max(25).optional(),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least one special character (!@#$%^&*)",
    }),
});

export type authFormSchemaType = z.infer<typeof authFormSchema>;

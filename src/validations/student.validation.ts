import { z } from "zod";

export const studentSignupSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters long")
    .max(50, "Full name too long"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  dob: z
    .string()
.refine((date) => {
      const parsed = new Date(date);

      if (isNaN(parsed.getTime())) return false;

      const today = new Date();
       if (parsed > today) return false;
       
      let age = today.getFullYear() - parsed.getFullYear();

      const monthDiff = today.getMonth() - parsed.getMonth();
      const dayDiff = today.getDate() - parsed.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      return age >= 4 && age <= 18;
    }, "Student age must be between 4 and 18 years"),

  gender: z.enum(["Male", "Female"], {
    message: "Gender must be either Male or Female",
  }),
});

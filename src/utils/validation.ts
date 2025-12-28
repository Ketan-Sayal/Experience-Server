import z from "zod";

const UserSignupSchema = z.object({
    username: z.string().min(1).max(220),
    email: z.email(),
    password: z.string().min(4).max(220)
});

const UserSigninSchema = z.object({
    email: z.email(),
    password: z.string().min(4).max(220)
});

const ExperienceSchema = z.object({
    title:z.string(),
    description: z.string(),
    place:z.string(),
    price:z.number()
});

export {UserSignupSchema, UserSigninSchema, ExperienceSchema};
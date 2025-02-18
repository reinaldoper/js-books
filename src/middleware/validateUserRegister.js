
import { z } from 'zod';


const validateUsername = (req, res, next) => {
    const usernameSchema = z.string()
        .trim()
        .toLowerCase()
        .min(1, { message: 'Username must be between 1 and 20 characters long.' })
        .max(20, { message: 'Username must be between 1 and 20 characters long.' })
        .regex(/^[a-z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' });

    const result = usernameSchema.safeParse(req.body.username);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
    }
    next();
};


const validateEmail = (req, res, next) => {
    const emailSchema = z.string()
        .email({ message: 'Invalid email format.' });

    const result = emailSchema.safeParse(req.body.email);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
    }
    next();
};

const validatePassword = (req, res, next) => {
    const passwordSchema = z.string()
        .min(8, { message: 'Password must be at least 8 characters long.' })
        .regex(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });

    const result = passwordSchema.safeParse(req.body.password);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
    }
    next();
};

export { validateUsername, validateEmail, validatePassword };

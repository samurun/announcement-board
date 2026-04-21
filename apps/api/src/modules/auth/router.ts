import { Router } from "express"
import type {
  NextFunction,
  Request,
  Response,
  Router as RouterType,
} from "express"
import { ZodError } from "zod"
import { requireAuth } from "./middleware.js"
import { loginSchema, registerSchema } from "./schema.js"
import {
  AppError,
  getUserById,
  loginUser,
  registerUser,
} from "./service.js"

export const authRoutes: RouterType = Router()

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterInput' }
 *     responses:
 *       201:
 *         description: User created; returns user and JWT
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
authRoutes.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body)
    const result = await registerUser(input)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       200:
 *         description: Login successful; returns user and JWT
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
authRoutes.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body)
    const result = await loginUser(input)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MeResponse' }
 *       401:
 *         description: Missing, invalid, or expired token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
authRoutes.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await getUserById(req.user!.id)
    if (!user) throw new AppError(404, "User not found")
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

authRoutes.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: err.flatten().fieldErrors,
      })
      return
    }
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ message: err.message })
      return
    }
    console.error("Unexpected auth error:", err)
    res.status(500).json({ message: "Internal server error" })
  }
)

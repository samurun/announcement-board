import { db } from "@workspace/db"
import { AppError } from "../../lib/errors.js"
import { hashPassword, signToken, verifyPassword } from "./crypto.js"
import type { LoginInput, RegisterInput } from "./schema.js"

type DbUser = {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export type PublicUser = Omit<DbUser, "passwordHash">

const toPublicUser = ({ passwordHash: _, ...user }: DbUser): PublicUser => user

export async function registerUser(input: RegisterInput) {
  const existing = await db.user.findUnique({ where: { email: input.email } })
  if (existing) throw new AppError(409, "Email already in use")

  const passwordHash = await hashPassword(input.password)
  const user = await db.user.create({
    data: { email: input.email, name: input.name, passwordHash },
  })
  const token = await signToken({ sub: user.id, email: user.email })
  return { user: toPublicUser(user), token }
}

export async function loginUser(input: LoginInput) {
  const user = await db.user.findUnique({ where: { email: input.email } })
  if (!user) throw new AppError(401, "Invalid email or password")

  const ok = await verifyPassword(input.password, user.passwordHash)
  if (!ok) throw new AppError(401, "Invalid email or password")

  const token = await signToken({ sub: user.id, email: user.email })
  return { user: toPublicUser(user), token }
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const user = await db.user.findUnique({ where: { id } })
  return user ? toPublicUser(user) : null
}

import argon2 from "argon2"
import { SignJWT, jwtVerify } from "jose"
import { env } from "../../env.js"
import { jwtPayloadSchema, type JwtPayload } from "./schema.js"

const secret = new TextEncoder().encode(env.JWT_SECRET)
const ALG = "HS256"

export const hashPassword = (plain: string) =>
  argon2.hash(plain, { type: argon2.argon2id })

export const verifyPassword = (plain: string, hash: string) =>
  argon2.verify(hash, plain)

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_EXPIRES_IN}s`)
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret, { algorithms: [ALG] })
  return jwtPayloadSchema.parse(payload)
}

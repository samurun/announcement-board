import { PrismaClient } from "@prisma/client"

// ป้องกันการสร้าง instance ซ้ำซ้อนในตอน Dev (HMR)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

// Export ทุกอย่างจาก Prisma Client เผื่อใช้เรียกพวก Types
export * from "@prisma/client"

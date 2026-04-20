import { db } from "@workspace/db"

export async function disconnectDb() {
  await db.$disconnect()
}

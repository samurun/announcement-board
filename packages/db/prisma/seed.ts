import bcrypt from "bcryptjs"
import { db } from "../index.ts"

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10)

  const alice = await db.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice",
      passwordHash,
    },
  })

  const bob = await db.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob",
      passwordHash,
    },
  })

  await db.announcement.deleteMany({})

  await db.announcement.createMany({
    data: [
      {
        title: "Welcome to the Announcement Board",
        body: "This is a pinned announcement. Important info stays on top.",
        author: alice.name,
        authorId: alice.id,
        pinned: true,
      },
      {
        title: "Office closed next Monday",
        body: "Reminder: the office will be closed on public holiday.",
        author: bob.name,
        authorId: bob.id,
        pinned: false,
      },
      {
        title: "New coffee machine arrived",
        body: "Come grab a cup in the pantry!",
        author: alice.name,
        authorId: alice.id,
        pinned: false,
      },
    ],
  })

  console.log("Seed complete: 2 users, 3 announcements")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

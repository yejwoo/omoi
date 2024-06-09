import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

const createDummyUsers = async () => {
  const userCount = 10;
  for (let i = 0; i < userCount; i++) {
    await db.user.create({
      data: {
        username: `dummyuser${i}`,
        password: `password${i}`,
        email: `dummyuser${i}@example.com`,
        profile: `https://dummyimage.com/100x100/000/fff&text=User${i}`, // 더미 프로필 이미지 URL
      },
    });
  }
  console.log(`${userCount} dummy users created.`);
};

createDummyUsers()
  .catch(e => console.error(e))
  .finally(async () => {
    await db.$disconnect();
  });

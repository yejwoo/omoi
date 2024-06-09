import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const getRandomHexColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const dummyImages = Array.from({ length: 5 }, (_, index) => {
  const color = getRandomHexColor();
  return `https://dummyimage.com/600x400/${color}/fff&text=Image${index + 1}`;
});

const createDummyPosts = async () => {
  const postCount = 2000;
  const users = await db.user.findMany();
  
  for (let i = 0; i < postCount; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomImage = dummyImages[Math.floor(Math.random() * dummyImages.length)];
    
    const postData = {
      content: `This is dummy post ${i}`,
      region: `Region ${Math.floor(Math.random() * 10)}`,
      date: new Date(),
      tags1: `Tag1-${i}`,
      tags2: `Tag2-${i}`,
      userId: randomUser.id,
      postStatus: 'public',
    };

    const post = await db.post.create({
      data: {
        ...postData,
        images: {
          create: {
            url: randomImage,
          },
        },
      },
      include: {
        images: true,
      },
    });

    // 진행 상황 표시
    const progress = ((i + 1) / postCount) * 100;
    console.clear();
    console.log(`Creating dummy posts: ${progress.toFixed(2)}% complete`);
  }
  console.log(`${postCount} dummy posts created.`);
};

createDummyPosts()
  .catch(e => console.error(e))
  .finally(async () => {
    await db.$disconnect();
  });

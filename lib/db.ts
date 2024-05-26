import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트를 반환하는 함수
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      }
    }
  });
};

// 글로벌 객체에 prismaGlobal을 추가
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// 클라이언트가 이미 존재하면 사용, 아니면 인스턴스 생성 후 사용
const db = globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

// 개발 환경에서만 글로벌 객체에 prisma 속성을 추가
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;

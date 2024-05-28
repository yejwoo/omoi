export default interface IPost {
  id: number;
  content: string;
  images: { url: string }[];
  user: { username: string };
  comments: { content: string }[];
  tags1: string;
  tags2: string;
  createdAt: string;
}

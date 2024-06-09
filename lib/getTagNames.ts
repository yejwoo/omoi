import { tags1, tags2 } from "@/app/data/tags";

export const getTagName = (value: string) => {
  const tag = tags1.find((tag) => tag.value === value);
  return tag ? tag.name : value;
};

export const getTagNames = (values: string) => {
  return values.split(",").map((value) => {
    const tag = tags2.find((tag) => tag.value === value);
    return tag ? tag.name : value;
  });
};

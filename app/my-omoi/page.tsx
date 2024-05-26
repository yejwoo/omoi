"use client";

import { getSession } from "@/lib/session";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import IPost from "@/app/interface/IPost";
import { tags1, tags2 } from "@/app/data/tags";

const Home = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setModalOpen] = useState<Boolean>(false);

  const getTag1Name = (value: string) => {
    const tag = tags1.find((tag) => tag.value === value);
    return tag ? tag.name : value;
  };

  const getTag2Names = (values: string) => {
    return values.split(",").map((value) => {
      const tag = tags2.find((tag) => tag.value === value);
      return tag ? tag.name : value;
    });
  };

  // 모달 바깥 클릭시 안 보이기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalRef]);

  useEffect(() => {
    const fetchSession = async () => {
      const emailSession = await getSession();
      if (emailSession && emailSession.id) {
        setUserId(emailSession.id || 0);
        setUserName(emailSession.username || "");
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // userId가 있을 때만 fetchPosts 실행
        if (userId) {
          const response = await fetch(`/api/posts?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            setPosts(data.posts);
          } else {
            console.error("Failed to fetch My Posts.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch My Posts.", error);
      }
    };
    fetchPosts();
  }, [userId]);

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-5">
      <div className="max-w-lg mx-auto">
        {/* 상단 유저 프로필 */}
        <div className="flex items-center space-x-4 p-4 bg-white shadow w-full max-w-2xl">
          <div className="w-12 h-12 rounded-full bg-gray-300"></div>
          <div>
            <h1 className="text-xl font-bold">{userName}</h1>
            {/* <p className="text-gray-600">Bio goes here...</p> */}
          </div>
        </div>

        {/* 3x3 그리드 피드 */}
        <div className="grid grid-cols-3 gap-2 py-4 w-full max-w-2xl">
          {posts.map((post, index) => (
            <div
              key={index}
              className="relative w-full cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="w-full" style={{ paddingBottom: "100%" }}></div>
              <div className="absolute top-0 left-0 w-full h-full bg-white">
                {post.images[0] && (
                  <Image
                    src={post.images[0].url}
                    alt={`Post image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 모달 */}
        {selectedPost && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]"
            ref={modalRef}
          >
            <div className="bg-white p-4 rounded-lg max-w-xl w-full relative mx-4">
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <Image
                  src="/icons/close.svg"
                  width={32}
                  height={32}
                  alt="close"
                />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                <h2 className="text-xl font-bold">
                  {selectedPost.user.username}
                </h2>
              </div>
              <Image
                src={selectedPost.images[0].url}
                alt="Post image"
                width={600}
                height={600}
                className="my-4"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA87SURBVHgB7d0Lc9Tk34Dhxb/nAwIC8v0/HAKDBUXFs+/86uxLxU26bYPam+ua6TBTYDcbtHee5MmTGycnJ3/sAIBr7Z0dAHDtCToABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAS8uwOI++mnn3bffPPN6a/vvPPO7qOPPtp9/vnnu//97387qDBCB9Im4k+ePDn9dfz++++777///vR7v/322w4qBB1IOzk5Ofj9X3/9dff111/voELQgayJ9nwt+eWXX3ZQIejAW2tOv0OFoANZ77777ukkuCUffPDBDioEHUi7c+fOwe9P6Jd+D64jQQfS5ha1u3fvno7W92Zkfu/evb98D647/zUDeRP1+dpfM187DQ/XlaADbw0hp8x/3QAQIOgAECDoABDgGjpvtT/++ON0Pe+za3rPAzv+K7OfZ/tmpbP9ZK6rbNvrr/X+++/vbty4sfs3zHbM9pxd2OW/tN/hOvJ/D2+Vich33323e/ny5emyn2srhU3w3nvvvf+fIb2Fed9D7zkhO7vIyf7pYIe2cSZ2zXZ98sknp1/nefHixen77h9Ocuh953Xe5CIr8977bfj5559X/+xsx+z72ab5nFc1+3DpPT/++ON/7aAGtnbj5OTkjx3EzQh8HsRxKGrHmPDND/955OZVfPXVVwfXFp+I3b9//8LbOds191gfCt+81jxRbG0t89e34Ysvvtj0kaLzVLNvv/326G04tE23b9++UtjnwGi24ZDZ51aLo8I1dPJmhPrw4cNLx3xMkCYKE+Q39cjNfYAvsp2zXY8ePToN51nzGvP9i4R0/s7sp9lfV7X/LPOks8vGfL9N8zmeP3++A9YJOmkTlC1jsA/om3hK19OnTy8dv/mc+wOB2bZ5rcs+eGT215wev6zLHJicZw4yHj9+fHrJBDhM0MmayL0+ct3ChHKCtWXUj7m2fJ75vFeN+dnXukw8L3qa/yJm/8xrizocZlIcSXN6/JiYz7XZ+To7u3qiOF9rUdpH/cGDB5tec37dTICb19/PUF+zP3uwxWvN55t9eJE5A/O6x8R8tmOuW88+309Im787wT5vouL8mZljMPMGgL8SdHJmlDgToZZMUD777LPdp59+uroU6Iya56Bg6cBgwjNxmYlVW5vYzZPAzk7Y2l/Hv+hZh5kxfuvWrb+91nmn1n/44YcLBf3Zs2erMT+0HYecN5FutnlOwc+/IfCKoJMzo8QlE8pjn7I14ZmvGcEvXYffR/+Y28eONa814Xv9YGMf+fn+sRPX1l5rRrlrlyUmqPN1zL6ag6i1A42J72zHsds8twnOti0dcEzw54DMLWfwimvopEwAlkZ2F4n5WefFaO5r38ps26EAn3Xz5s2jPsOMiPcHAEvOe69j5wmsnRG5SMz3ZpvmgGNpNL+/JAC8IuikrJ1CPjaEh0yUlhaXmeu6W83onoid90Sw+f1jzgjMPeXn2V9+WHLM5La10fns79nvl7V2QDKXBIBXBJ2UpbDsV0O7irVR5lVu89rbn94/xnkr181nPfbgZRbMWXLMbPkff/xx8fcm5ld5ZOl8hqUDjjnY2PLWOLjuBJ2MtR/uV13hbUxclkK6RdAvcsBxXvgvslTtfK6l6B4zQl/67PO6W8wtWJu8uHYwAW8bQSdj6Yf7/japLSwFaj+B7Couuo1rI/APP/xwdxFXGUUvXWffap/v164/xAgdXhF0MpZ+uG+5Vvfaa10lLhOtrZ40Nq/1T83+nlPySwcyW878Xzrj8CZW7IPrStDJWLreu8UTu/bWwnuV1dm23sZ/ylpQt1xwZ22fv4lV6eA6EnQyluKy9TO2l0L1ph7a8l+2dhCz5X5fO+C56jK3UCHosBFB/3dY2x3+JOgAECDoZPyT144PeZMPaXnbrY3CLf8KfxJ0MpaCvvVM6KXXexuDPsvLLtlystraqf0tJxTCdSboZCzF5arPGT9rrpMvxWUtblVrBzFb3iO+tsaAETr8SdDJWArqjKi3mji1tjLZ2xj0tdv4tlzF7Z9YYwCuO0EnYymoM6Le6oloS2vFz3u/rSPFpf0+Qd/iQGrOiiwF/SJL3EKdoJMxo7Wl6+hbBH2iYqT4d7PW+iFbPeJ07dGsRujwiqCTsvTksJmg9eLFi91VnJycLP7eUtTeBjMpbe1A6ir35689mnVivvWiQXCdCTopa48Cff78+aVnvM9Ic2nW9tselon50n6fUfrTp08vdep9Yv7kyZPF399yrXgoEHRSJq5rp2EnEEsjvkMmRM+ePVs97bvFo1mvu3lm+dIofe4yePTo0YVG6nPgNf9WSwdRWz2aFUqcryLnzp07u8ePHx+8vWy+N6fOJ+oToXnM6KHJbBOS+TNzynjtHuiJiuu4fwb25s2bp2dBDpn9+fDhw9P9Nft97XGos9/PO+iaf2PgrwSdnInLrVu3Vq95n53gdnaG+ozIj32C1z5i/GlC/fLly9X7z/exfv0Z57PfZ58fszb87HMHUfB3gk7SjATnFO/aqfK9yyw8MzG/d++eSVmvuXv37ump8vPmKky4L7PwzPy7usQBh7mGTtaM5N7ED38xXzYj7/v377+R5VjnDIBT7bBM0EmbqM+ocav4zkImX375pZivmKg/ePBgs4Opeb3bt2+fXkYBlvmpRN5EeK657ie5XeahIfP3J1Cu3R5vDqbmdra55e8idxbsTchnVD73+P/bT9KD6+DGycnJNotcwzUx125nWdL5da7lvv7AlRl9zyS5OW08E+bmuu1WQVm6bjzvd9G14P+J15qHr2xxNmIOoua6+rzPzFmYfX72wGr2736i3LzfHIStLVhz0fdeumVuq/eA/wJBB4AAh6YAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQIOgAECDoABAg6AAQ8H8w7icMwifvOAAAAABJRU5ErkJggg=="
                style={{ objectFit: "cover" }}
              />
              <p>{selectedPost.content}</p>
              {(selectedPost.tags1 || selectedPost.tags2) && (
                <div className="flex gap-1 mt-3">
                  {selectedPost.tags1 && (
                    <span
                      key={`tag1-${selectedPost.id}`}
                      className="py-1 px-2 rounded-full text-sm font-semibold cursor-pointer text-gray-500 bg-gray-100"
                    >
                      {getTag1Name(selectedPost.tags1)}
                    </span>
                  )}
                  {selectedPost.tags2 &&
                    getTag2Names(selectedPost.tags2).map(
                      (tag: string, index: number) => (
                        <span
                          key={`tag2-${selectedPost.id}-${index}`}
                          className="py-1 px-2 rounded-full text-sm font-semibold cursor-pointer text-gray-500 bg-gray-100"
                        >
                          {tag}
                        </span>
                      )
                    )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

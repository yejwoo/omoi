// components/SkeletonPost.tsx
const SkeletonPost = () => {
    return (
      <div className="mb-8 p-5 h-[633px]">
        <header className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full skeleton"></div>
          <div className="flex-1 space-y-2">
            <div className="w-24 h-4 skeleton"></div>
          </div>
        </header>
        <div className="mt-3 space-y-2">
          <div className="w-full h-[384px] skeleton"></div>
          <div className="w-3/4 h-4 skeleton"></div>
          <div className="w-1/2 h-4 skeleton"></div>
        </div>
        <div className="border-t border-gray-200 mt-3 p-3 flex items-center space-x-3">
          <div className="w-full h-10 skeleton"></div>
          <div className="w-20 h-10 skeleton"></div>
        </div>
      </div>
    );
  };
  
  export default SkeletonPost;
  
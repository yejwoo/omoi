import Image from "next/image";
import logo from "../../public/logo/logo_title.svg";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-5">
      <main className="max-w-lg mx-auto bg-white rounded-xl shadow-lg">
        <header className="p-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            </div>
            <span className="font-bold">username</span>
          </div>
        </header>

        <div className="w-full h-96 bg-gray-300">

        </div>
        <div className="p-5">
          <button className="text-gray-500 hover:text-gray-700">
            <span className="text-xl">♥️</span>
          </button>

          <p className="mt-2 text-sm text-gray-700">
            <span className="font-bold">username </span>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit...
          </p>

          <p className="text-xs text-gray-500 mt-2">View all comments</p>
        </div>

        <form className="border-t border-gray-200 p-3 flex items-center">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 border-none focus:ring-0"
          />
          <button type="submit" className="text-blue-500 font-semibold">
            Post
          </button>
        </form>
      </main>
    </div>
  );
}

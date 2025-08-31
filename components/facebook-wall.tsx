'use client'
import { useState } from "react";
import { PostComposer } from "@/components/post-composer";
import { PostsFeed } from "@/components/posts-feed";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function FacebookWall({ user }: { user: any }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex gap-6 max-w-6xl mx-auto">
      {/* Profile Section */}
      <div className="w-64 flex-shrink-0">
        <div >
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-54 h-72 mb-3 rounded-md overflow-hidden border border-gray-300">
              <AvatarImage src="/profile-johnniel.jpg" alt="Johnniel Mar" className="object-cover w-full h-full rounded-md" />
              <AvatarFallback className="bg-gray-300 text-gray-700 text-xl font-semibold w-full h-full rounded-md flex items-center justify-center">JM</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Johnniel Mar</h2>
            {/* <p className="text-sm text-gray-600 mb-4">Wall</p> */}
          </div>
        </div>
        {/* Information Section */}
        <div className="bg-white rounded border border-gray-300 p-4">
          <h3 className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Networks</p>
              <p className="text-gray-600">Stanford Alum</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Current City</p>
              <p className="text-gray-600">Bohol, Philippines</p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1">
        {/* Post Composer */}
        <div className="bg-white rounded border border-gray-300 p-4 mb-4">
          <PostComposer user={user} onPostCreated={handlePostCreated} />
        </div>
        {/* Posts Feed */}
        <div>
          <PostsFeed refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}

export default FacebookWall;

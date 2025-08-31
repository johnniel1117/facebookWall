"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

interface Post {
  id: string
  content: string
  author_name: string
  author_id: string
  created_at: string
  image_url?: string
}

interface PostsFeedProps {
  refreshTrigger: number
}

export function PostsFeed({ refreshTrigger }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    const supabase = createClient()
    setError(null)

    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setPosts(data || [])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load posts")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [refreshTrigger])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          const newPost = payload.new as Post
          setPosts((currentPosts) => [newPost, ...currentPosts])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          const deletedPost = payload.old as Post
          setPosts((currentPosts) => currentPosts.filter((post) => post.id !== deletedPost.id))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          const updatedPost = payload.new as Post
          setPosts((currentPosts) => currentPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-300 rounded p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-300 rounded p-4 text-center">
        <p className="text-red-500">Error loading posts: {error}</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded p-8 text-center">
        <p className="text-gray-500">No posts yet. Be the first to share something!</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {posts.map((post, index) => (
        <div key={post.id}>
          <div className="bg-white border-l border-r border-gray-300 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {/* Post Header */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#3b5998] text-base">{post.author_name}</h3>
                  <span className="text-gray-500 text-sm">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true }).replace("about ", "")}
                  </span>
                </div>

                {/* Post Content */}
                <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap break-words mb-2">
                  {post.content}
                </div>

                {post.image_url && (
                  <div className="mb-3">
                    <img
                      src={post.image_url || "/placeholder.svg"}
                      alt="Post image"
                      className="max-w-full max-h-96 h-auto rounded border border-gray-200 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {index < posts.length - 1 && <div className="border-b border-gray-300"></div>}
        </div>
      ))}
    </div>
  )
}

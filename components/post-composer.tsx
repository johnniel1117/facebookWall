"use client"

import type React from "react"
import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon } from "lucide-react"

interface PostComposerProps {
  user: any
  onPostCreated: () => void
}

export function PostComposer({ user, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxLength = 280
  const remainingChars = maxLength - content.length

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      if (file.size > MAX_IMAGE_SIZE) {
        setError("Image size should be less than 5MB.")
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Resize image before upload
  async function resizeImage(file: File, maxWidth = 600, maxHeight = 800): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas not supported"))
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error("Image resize failed"))
          },
          file.type,
          0.85 // quality
        )
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || content.length > maxLength) return

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Ensure user is authenticated for RLS
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        setError("You must be logged in to post.")
        setIsLoading(false)
        return
      }

      let imageUrl = null

      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop()
        const fileName = `${authUser.id}-${Date.now()}.${fileExt}`
        const filePath = fileName

        // Resize image before upload
        let uploadBlob: Blob = selectedImage
        try {
          uploadBlob = await resizeImage(selectedImage)
        } catch (resizeErr) {
          setError("Image resize failed.")
          setIsLoading(false)
          return
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, uploadBlob, {
            cacheControl: "3600",
            upsert: false,
            contentType: selectedImage.type,
          })

        if (uploadError) {
          setError("Image upload failed: " + uploadError.message)
          setIsLoading(false)
          return
        }

        // Get public URL
        const { data: publicUrlData, error: publicUrlError } = supabase.storage.from("post-images").getPublicUrl(filePath)
        if (publicUrlError) {
          setError("Failed to get image URL: " + publicUrlError.message)
          setIsLoading(false)
          return
        }
        imageUrl = publicUrlData.publicUrl
      }

      // Get user profile for display name
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", authUser.id).single()

      // Insert post with correct author_id for RLS
      const { error: insertError } = await supabase.from("posts").insert({
        content: content.trim(),
        author_id: authUser.id,
        author_name: profile?.display_name || authUser.email?.split("@")[0] || "Anonymous",
        image_url: imageUrl,
      })

      if (insertError) throw insertError

      setContent("")
      removeImage()
      onPostCreated()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-blue-300 rounded p-4 bg-blue-50/30">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none border-none bg-transparent focus:ring-0 focus:border-none text-base placeholder-gray-500 p-0"
            maxLength={maxLength}
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-3 relative flex">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="w-40 h-52 object-cover rounded border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <ImageIcon className="w-4 h-4" />
              Add Photo
            </button>

            <span
              className={`text-sm ${
                remainingChars < 20 ? "text-red-500" : remainingChars < 50 ? "text-yellow-600" : "text-gray-500"
              }`}
            >
              {remainingChars} characters remaining
            </span>
          </div>

          <Button
            type="submit"
            disabled={!content.trim() || content.length > maxLength || isLoading}
            className="bg-[#1877f2] hover:bg-[#166fe5] px-6 rounded"
          >
            {isLoading ? "Sharing..." : "Share"}
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </div>
  )
}

-- Fix RLS policies to ensure proper access for authenticated users

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Recreate posts insert policy with better error handling
CREATE POLICY "Users can insert their own posts" ON posts 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = author_id
  );

-- Recreate profiles insert policy with better error handling  
CREATE POLICY "Users can insert their own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = id
  );

-- Ensure storage policies are correct
DROP POLICY IF EXISTS "Users can upload post images" ON storage.objects;
CREATE POLICY "Users can upload post images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND 
    auth.uid() IS NOT NULL AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

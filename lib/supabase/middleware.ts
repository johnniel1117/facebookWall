import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Enhanced error logging for missing env vars
    console.error('Missing Supabase environment variables:', {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey
    })
    // Optionally, return a 500 response for missing env vars
    return new NextResponse(
      JSON.stringify({ error: "Supabase environment variables are missing." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => 
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      },
    )

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // Enhanced error logging for Supabase auth
    if (error) {
      console.error('Supabase auth error:', error)
      // Optionally, return a 401 response
      // return new NextResponse(JSON.stringify({ error: error.message }), { status: 401 })
    }

    if (
      request.nextUrl.pathname !== "/" &&
      !user &&
      !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/auth")
    ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error: any) {
    // Enhanced error logging for unexpected errors
    console.error('Middleware error:', {
      message: error?.message,
      stack: error?.stack,
      error
    })
    // Optionally, return a 500 response with error details (for debugging, remove in prod)
    return new NextResponse(
      JSON.stringify({ error: "Middleware error", details: error?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
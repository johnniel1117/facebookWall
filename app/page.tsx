import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "@/app/auth/sign-out/page";
import FacebookWall from "@/components/facebook-wall";

// Server Component: HomePage
export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", data.user.id).single();

  const displayName = profile?.display_name || data.user.email?.split("@")[0] || "User";

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-[#3b5998] text-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              <h1 className="text-xl font-bold lowercase">facebook</h1>
              <div className="flex items-center gap-3">
                <span className="text-sm">{displayName}</span>
                <form action={signOut}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 px-3 text-sm">
                    Logout
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6">
          <FacebookWall user={data.user} />
        </main>
      </div>
    </>
  );
}
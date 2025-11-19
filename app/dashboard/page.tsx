import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile from database
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get user's assessment history
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })

  return <DashboardClient user={data.user} profile={profile} assessments={assessments || []} />
}

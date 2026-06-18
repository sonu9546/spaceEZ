import { generateSEO } from "@/lib/seo"
import DashboardClient from "./DashboardClient"

export const metadata = generateSEO({
  title: "Home",
  description: "Learn how SpaceEZ simplifies venue booking and management.",
  path: "/home",
  keywords: ["SpaceEZ", "Home", "Venue Booking"],
});


// SERVER COMPONENT
export default function DashboardPage() {
  return <DashboardClient />
}

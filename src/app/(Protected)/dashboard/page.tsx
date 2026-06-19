import { generateSEO } from "@/lib/seo"
import DashboardClient from "./DashboardClient"

export const metadata = generateSEO({
  title: "CityParkON Dashboard",
  description: "Manage and monitor your park facilities and amenities in real time.",
  path: "/dashboard",
  keywords: ["CityParkON", "Dashboard", "Park Management"],
});

export default function CityParkDashboardPage() {
  return <DashboardClient />
}

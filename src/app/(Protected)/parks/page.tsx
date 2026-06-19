import { generateSEO } from "@/lib/seo"
import ParksClient from "./ParksClient"

export const metadata = generateSEO({
  title: "Parks Directory - CityParkON",
  description: "View and manage all registered parks and active amenity facilities.",
  path: "/parks",
  keywords: ["CityParkON", "Parks List", "Directory"],
});

export default function ParksPage() {
  return <ParksClient />
}

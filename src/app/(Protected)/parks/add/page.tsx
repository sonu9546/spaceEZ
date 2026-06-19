import { generateSEO } from "@/lib/seo"
import AddParkClient from "./AddParkClient"
// Client component wrapper for add park wizard

export const metadata = generateSEO({
  title: "Add New Park - CityParkON",
  description: "Define park information, schedule, sports fields, and amenities.",
  path: "/parks/add",
  keywords: ["CityParkON", "Add Park", "Wizard"],
});

export default function AddParkPage() {
  return <AddParkClient />
}

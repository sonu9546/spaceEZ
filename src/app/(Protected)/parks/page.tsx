import { generateSEO } from "@/lib/seo"
import ParksClient from "./ParksClient"
import { Suspense } from "react"

export const metadata = generateSEO({
  title: "Parks Directory - CityParkON",
  description: "View and manage all registered parks and active amenity facilities.",
  path: "/parks",
  keywords: ["CityParkON", "Parks List", "Directory"],
});

export default function ParksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-semibold text-[#545f73]">Loading directory...</div>}>
      <ParksClient />
    </Suspense>
  )
}

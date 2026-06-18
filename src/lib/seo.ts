import { Metadata } from "next"

const baseUrl = "https://spaceez.com"

export function generateSEO({
  title,
  description,
  path = "",
  image = "/og-image.png",
  keywords = [],
}: {
  title: string
  description: string
  path?: string
  image?: string
  keywords?: string[]
}): Metadata {

  const url = `${baseUrl}${path}`

  return {
    title: `${title} | SpaceEZ`,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | SpaceEZ`,
      description,
      url,
      siteName: "SpaceEZ",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SpaceEZ`,
      description,
      images: [image],
    },
  }
}

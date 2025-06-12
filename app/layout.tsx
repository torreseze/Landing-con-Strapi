import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins"
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://duxsoftware.com"),
  title: {
    default: "DUX Software - Desarrollo de Software a Medida",
    template: "%s | DUX Software"
  },
  description: "Empresa líder en desarrollo de software personalizado. Creamos aplicaciones web, móviles y sistemas empresariales que impulsan el crecimiento de tu negocio.",
  keywords: ["desarrollo software", "aplicaciones web", "software empresarial", "desarrollo móvil", "Next.js", "React"],
  authors: [{ name: "DUX Software" }],
  creator: "DUX Software",
  publisher: "DUX Software",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "DUX Software",
    title: "DUX Software - Desarrollo de Software a Medida",
    description: "Empresa líder en desarrollo de software personalizado. Creamos aplicaciones web, móviles y sistemas empresariales que impulsan el crecimiento de tu negocio."
  },
  twitter: {
    card: "summary_large_image",
    title: "DUX Software - Desarrollo de Software a Medida",
    description: "Empresa líder en desarrollo de software personalizado. Creamos aplicaciones web, móviles y sistemas empresariales que impulsan el crecimiento de tu negocio."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || "https://duxsoftware.com"} />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className={`${poppins.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}

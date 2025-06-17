import { redirect } from "next/navigation"

// Página de inicio que redirija a la landing page principal
export default function HomePage() {
  // Redirigir a la página principal
  redirect('/landing-page')
}

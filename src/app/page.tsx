import { redirect } from 'next/navigation'

// Root URL → redirect straight to the dashboard
export default function RootPage() {
  redirect('/dashboard')
}

import AppShell from '@/components/layout/AppShell'
import WeatherInitializer from '@/components/layout/WeatherInitializer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <WeatherInitializer />
      {children}
    </AppShell>
  )
}

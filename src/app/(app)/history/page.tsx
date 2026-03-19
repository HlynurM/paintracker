// F04 — Headache History

import HeadacheList from '@/features/headache/components/HeadacheList'

export default function HistoryPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">History</h1>
      <HeadacheList />
    </div>
  )
}

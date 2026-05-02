import RebuildingNotice from '@/components/RebuildingNotice'

export const dynamic = 'force-dynamic'

export default function WatchedPage() {
  return (
    <RebuildingNotice
      surface="Watched"
      plan="Reviews are moving to a 1-10 scale with emoji reactions, threads, and per-group spoiler blur (default: blur until you mark it watched)."
    />
  )
}

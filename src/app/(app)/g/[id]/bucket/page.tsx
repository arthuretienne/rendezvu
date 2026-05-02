import RebuildingNotice from '@/components/RebuildingNotice'

export const dynamic = 'force-dynamic'

export default function BucketPage() {
  return (
    <RebuildingNotice
      surface="Bucket"
      plan="TMDB search will populate the new items table (deduped globally), then create list_entries for this group. Per-member watched will hide an entry from the draw pool the moment anyone watches it."
    />
  )
}

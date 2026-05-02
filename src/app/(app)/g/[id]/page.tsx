import RebuildingNotice from '@/components/RebuildingNotice'

export const dynamic = 'force-dynamic'

export default function GroupHomePage() {
  return (
    <RebuildingNotice
      surface="Home"
      plan="The draw screen is being rewired for random / vote / veto modes, per-member watch state, and rules-driven scheduling. Coming next."
    />
  )
}

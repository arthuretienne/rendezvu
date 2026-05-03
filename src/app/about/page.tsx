import Link from 'next/link'
import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'À propos — Rendezvu' }

export default function AboutPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <p className="t-display">
          «&nbsp;Pendant le confinement, on s&apos;envoyait des films sur Telegram et personne ne les regardait.&nbsp;»
        </p>

        <p className="t-lead" style={{ marginTop: 'var(--s-6)' }}>
          Voilà l&apos;origine. Rien de plus. On a essayé tous les outils — Discord, Notion, des Google Sheets — rien ne tenait. Alors on a fait Rendezvu.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-8)' }}>« On ne décide pas à votre place. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          La plupart des apps de cinéma essaient de vous proposer le bon film, au bon moment, basé sur ce qu&apos;elles ont retenu de vous. C&apos;est sûrement très efficace. C&apos;est aussi très triste — vous êtes en train de regarder ce que la machine a calculé que vous regarderiez. Le tirage au sort de Rendezvu fait l&apos;inverse. Il choisit pour vous, mais sans rien savoir de vous, et sans permettre de re-tirer. C&apos;est volontairement brutal. C&apos;est ce que faisait votre vieil oncle au début des années 90, avec un sac et des bouts de papier. On a juste mis ça dans un navigateur.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Privé par défaut. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Pas de feed public. Pas de likes globaux. Pas de follows. Vos avis sont visibles par votre groupe et c&apos;est tout — sauf si vous décidez explicitement de les rendre publics. Personne ne peut tomber par hasard sur votre activité. C&apos;est une revue intime, pas un réseau social.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Gratuit, pas dans le sens où vous croyez. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Rendezvu est gratuit, intégralement, pour toujours. Pas de plan «&nbsp;Pro&nbsp;», pas de fonction premium. On vit grâce aux dons (voir <Link href="/pricing">comment</Link>). Si on n&apos;y arrive plus, on vous le dira franchement avant. Pas de freemium déguisé.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« On n&apos;est pas une plateforme. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Le mot «&nbsp;platform&nbsp;» est banni en interne. Rendezvu est une revue qu&apos;on tient à plusieurs. Une app, oui. Un site, oui. Pas un écosystème, pas un marketplace, pas une infrastructure.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Qui on est. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Arthur et Marina, deux humains, quelque part entre Bruxelles et Marseille. Pour nous écrire, le plus simple est <a href="mailto:hello@rendezvu.app">hello@rendezvu.app</a>.
        </p>

        <p className="t-lead" style={{ textAlign: 'right', marginTop: 'var(--s-7)', fontStyle: 'italic' }}>
          — A. &amp; M.
        </p>
      </article>
    </EditorialFrame>
  )
}

import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'Comment ça marche — Rendezvu' }

export default function HowItWorksPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
          Sept minutes — le temps d&apos;un café.
        </p>
        <h1 className="t-h1" style={{ marginTop: 'var(--s-3)' }}>
          Comment ça marche, en long.
        </h1>
        <p className="t-lead" style={{ marginTop: 'var(--s-5)' }}>
          La version courte tient en cinq lignes sur la page d&apos;accueil. Voici la version longue, pour qui veut savoir ce qu&apos;on fait du tirage au sort, ce qu&apos;on fait de vos données, et pourquoi le chat est si étrange.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Le groupe. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Un groupe Rendezvu, c&apos;est entre 2 (un couple) et 30 personnes (un cinéclub). On en crée un avec un nom et un emoji, on partage le lien d&apos;invitation, c&apos;est tout. Pas de validation, pas de demande à approuver — celui qui a le lien rejoint.
        </p>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Tout ce qui se passe dans un groupe (films ajoutés, messages, avis) reste dans le groupe. Aucune autre personne sur Rendezvu ne le voit, jamais.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« La bucket. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Chacun ajoute des films à la bucket commune en cherchant via TMDB. On ne se met pas d&apos;accord, on accumule. Le film que vous avez ajouté la semaine dernière reste là jusqu&apos;à ce qu&apos;il sorte.
        </p>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Si vous arrivez avec un historique Letterboxd ou IMDb, vous pouvez l&apos;importer en CSV depuis vos paramètres.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Le tirage. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Le moment-clé. On tire vraiment au hasard, avec une seule règle&nbsp;: pas le même film deux fois. Une fois tiré, on n&apos;autorise pas de re-tirer. C&apos;est volontaire — sinon ça redevient une discussion sans fin.
        </p>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Si le verdict ne plaît pas, vous pouvez bien sûr tirer un nouveau film en revenant sur la bucket. Mais ce n&apos;est pas la même action, et c&apos;est ce qui compte.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Le visionnage. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          On ne diffuse pas le film — on n&apos;a pas de droits, on n&apos;en aura jamais. Vous le regardez là où il est disponible (Netflix, MUBI, votre bibliothèque, peu importe). On suggère un lien Justwatch pour vous aider à trouver.
        </p>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Synchrone&nbsp;: on se donne un horaire, on lance à 21h. Asynchrone&nbsp;: chacun à son rythme, on partage le code SPOIL plus tard. Les deux sont possibles dans le même groupe.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« L&apos;après. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Note de 1 à 10 — pas 5, pas 100. Commentaire libre, court ou long, à votre goût. Spoil-tag si nécessaire (les avis tagués spoilers sont floutés tant que le lecteur n&apos;a pas marqué le film comme vu).
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Si on est seul. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Mode solo&nbsp;: oui, on peut. C&apos;est juste moins drôle.
        </p>

        <p className="t-caption" style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 'var(--s-7)' }}>
          Encore des questions ? Voir <a href="/help">l&apos;aide</a> ou écrire à <a href="mailto:hello@rendezvu.app">hello@rendezvu.app</a>.
        </p>
      </article>
    </EditorialFrame>
  )
}

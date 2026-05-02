# Rendezvu

**Design system, wireframes & guide éditorial**
Document de travail · v0.1 · 3 mai 2026

> Note méthodologique : ce document est livré en markdown, sans code, sans images, sans Figma. Le brief était clair là-dessus. Tout ce qui suit est défendu par écrit ; quand un arbitrage reste à faire, je le signale et je propose. À l'équipe de trancher.

---

## 0. Note préliminaire — sur le piège à éviter

Avant d'écrire une ligne de système : Rendezvu n'est pas un SaaS. C'est une revue. Une revue qu'on fait à plusieurs, à distance, avec ses gens. Le produit a une opinion (le tirage au sort est brutal, les profils sont privés, il n'y a pas de feed). Le design doit avoir la même opinion.

Concrètement, pendant tout le doc, je m'interdis :

- les gradients de fond (sauf un seul, justifié plus bas, sur la cover de groupe — et encore)
- les ombres "molles" ambiantes (`box-shadow: 0 8px 32px rgba(0,0,0,.08)`)
- les rayons de 16px appliqués partout par défaut
- les hero plein écran avec un mockup 3D-tilté
- les "Trusted by" et les logos floutés
- le footer 4 colonnes Product/Company/Resources/Legal
- les emojis utilisés comme bullets

Si on s'éloigne de ces règles, c'est par décision documentée, pas par défaut.

---

## 1. Moodboard

Cinq références. Pas d'images : je décris la signature de chacune, ce qu'on en garde, et — surtout — ce qu'on **n'en garde pas**, parce que copier une référence à 100% c'est juste un autre clone.

### 1.1 — Letterboxd

**Signature :** la densité éditoriale assumée. Le orange `#FF8000` qui ne sert que pour les étoiles, jamais pour des CTA. Les listes manuscrites ("My favourite films of 2024"), avec une voix d'auteur. La page d'un film : poster à gauche, métadonnées resserrées, et puis du texte, beaucoup de texte, des reviews écrites par des humains qui aiment écrire. Aucune fioriture. Le fond est sombre mais pas noir — un vert-bleu très sourd.

**Ce qu'on prend :** la densité, l'idée que le texte écrit par les utilisateurs *est* le contenu, l'accent unique qui ne sert qu'à une chose précise.

**Ce qu'on laisse :** le côté "social network ouvert" (likes globaux, follows publics). Rendezvu est intime par défaut. Et leur typo (Graphik) est bien mais générique.

### 1.2 — Are.na

**Signature :** la sobriété radicale poussée jusqu'à l'inconfort. Une seule colonne. Une serif (leur custom, mais on pense à *Söhne Mono* + *GT America* pour les cousins). Aucune ombre, aucun radius — les blocs sont des blocs. Le fond est un blanc cassé tirant sur le crème. Quand on arrive sur le site, il ne se passe *rien* visuellement, et c'est ça la posture. La hiérarchie est tenue uniquement par le poids de la typo et l'espacement.

**Ce qu'on prend :** l'idée qu'on peut faire confiance à la typographie pour faire le travail. Que l'absence d'effet est elle-même un effet.

**Ce qu'on laisse :** le côté austère anti-grand-public. Rendezvu doit rester chaleureux — c'est une app pour regarder des films avec sa grand-mère ou sa copine à Berlin, pas un outil de chercheurs.

### 1.3 — The Criterion Channel

**Signature :** le rapport texte/image. Quand un film est mis en avant, il y a le poster (ou un still), un titre, un nom de réalisateur, une année — et un paragraphe écrit par quelqu'un qui a vu le film et a quelque chose à en dire. L'aplomb éditorial : on n'a pas peur d'avoir une opinion. La grille respire mais ne se gonfle pas.

**Ce qu'on prend :** le ton ("ce film parce que…"), le couple poster + paragraphe court, le fait qu'on annonce les choses (pas "Discover X" mais "This week, three films by Chantal Akerman").

**Ce qu'on laisse :** le côté institutionnel un peu pompeux. Rendezvu, c'est entre potes, pas la Cinémathèque.

### 1.4 — Buttondown (page About) + Plain (la page produit) + Pika

**Signature :** des SaaS qui ont compris qu'on peut être moderne sans être Linear. Pages longues, lisibles, avec des paragraphes de vrai texte, pas du marketing-AI. Buttondown va jusqu'à publier ses revenus en clair. Plain a une seule typo, beaucoup d'espace, et un ton un peu humain (ils signent leurs pages). Pika a une page tarifs honnête, sans "Most popular" en sticker.

**Ce qu'on prend :** la preuve que long-form + sobre + honnête fonctionne, et que la page /metrics et /pricing peuvent être les meilleures pages du site.

**Ce qu'on laisse :** rien à laisser, à part l'imitation littérale.

### 1.5 — Mubi & A24 (sites + identité de marque)

**Signature :** chaque pixel sent l'éditorial. Mubi a une typo grotesque très lisible, du noir profond, du blanc pur, et une seule règle : *le visuel du film passe avant tout*. A24 publie un magazine, un podcast, un site qui n'a pas peur d'être moche selon les standards SaaS. Ils sentent la marque parce qu'ils ne ressemblent à personne.

**Ce qu'on prend :** la confiance dans la matière (le film, l'écrit) plus que dans l'enrobage. L'idée que la marque, c'est ce qu'on dit + comment, pas un logo.

**Ce qu'on laisse :** le budget. On reproduit l'attitude, pas la production.

### Synthèse — le ton qu'on cherche

Une **revue indépendante de cinéma qui aurait fait son site elle-même**, en se gardant de tomber dans le côté "blog 2007 nostalgique". Du papier journal sur un écran de 2026. La densité de Letterboxd, la confiance d'Are.na, le ton de Criterion, l'honnêteté de Buttondown, l'aplomb de Mubi.

---

## 2. Design system

### 2.1 Palette

**Ma recommandation : on garde le parti-pris sombre, mais on rejette le couple "cinema-dark + or copper".** Le `#C9A255` or sonne luxe-hôtel, pas revue indé. C'est précisément le genre de couleur qu'on s'auto-attribue quand on cherche à "faire premium".

**Proposition retenue (5 tokens, pas un de plus) :**

| Token | Hex | Rôle |
|---|---|---|
| `ink` | `#0E0E0C` | Fond principal. Pas du noir pur — légèrement chaud, presque encre. |
| `paper` | `#F2EEE5` | Fond clair (pages éditoriales : /about, /press, /credits). Crème, pas blanc. |
| `surface` | `#19181 5` | Surface élevée (cards, panneaux, modal). +8% de luminance par rapport à `ink`. |
| `text` | `#E8E4D9` | Texte principal sur fond sombre. Pas du blanc pur — assorti à `paper`. |
| `accent` | `#E64B1B` | **Rouge tomate vif**, unique accent. Sert pour : étoile pleine, lien actif au hover, bouton primaire, point rouge "live" dans un chat. |

**Pourquoi rouge `#E64B1B` plutôt que l'or :**
1. Il évoque le rideau de cinéma, le fauteuil de salle, le néon "open" d'une salle de quartier.
2. Il est visuellement *brutal*, et le tirage au sort est volontairement brutal — la couleur rejoue le parti-pris produit.
3. Il est lisible sur `ink` (contraste AA pour du texte normal, AAA pour du texte large) et sur `paper`.
4. Il ne ressemble à aucune palette SaaS courante.

**Si l'équipe défend l'or :** je l'accepte si on **monte la chroma** (`#D9A41A` plutôt que `#C9A255`) pour gagner en présence et perdre le côté boutique-hôtel. Mais ma préférence reste le rouge.

**Variantes/teintes :**
On ne définit **pas** de scale 50–950 par couleur. On a 5 tokens, point. Pour les besoins ponctuels (border discrète, état hover), on utilise `color-mix()` à la volée :
- `border-faint` = `color-mix(in oklab, text 12%, transparent)`
- `text-muted` = `color-mix(in oklab, text 60%, transparent)`
- `accent-press` = `color-mix(in oklab, accent 80%, ink)`

**Mode clair :** disponible sur les pages éditoriales par défaut (/about, /how-it-works, /press, /brand, /credits, /careers). L'app reste sombre. C'est intentionnel : la lecture longue se fait sur `paper`, le visionnage et la discovery sur `ink`.

### 2.2 Typographie

**Deux fontes. Pas trois. Pas une mono "pour les métadonnées" — les métadonnées s'écrivent dans la sans avec un poids différent.**

**Choisis :**

- **Serif éditoriale : GT Sectra Fine** *(payant — alternative gratuite : Newsreader, Google Fonts)*. Pour les titres long-form, les noms de films, les citations. Les empattements sont fins, presque des incisions. Ce n'est pas une serif "warm" comme Cooper ou Caslon — c'est une serif coupante, qui colle à l'idée de revue critique.

  → **Recommandation budget zéro : Newsreader** (Production Type, OFL, Google Fonts). Très proche d'esprit, lisible à toutes les tailles, italique magnifique.

- **Sans : Söhne Buch** *(payant — alternative gratuite : Inter Tight, mais voir plus bas)*. Pour le corps, l'UI, les boutons.

  → **Recommandation budget zéro : *Geist Sans***. Non. Trop Vercel, trop reconnu. À la place : **Inter Tight** (Google Fonts) — plus serré qu'Inter, moins de "tech". Si l'équipe veut s'écarter d'Inter (ce qui se défend) : **Public Sans** (USWDS, OFL) ou **Manrope**. Mon vote : Inter Tight, pour sa neutralité et son support multilingue (FR/EN, et plus tard).

**Règle ferme : pas de fonte mono.** Les codes, slugs, dates de release, ratios de poster s'écrivent en Inter Tight 12/14px en `feature-settings: "tnum"` (chiffres tabulaires). On gagne une fonte, et l'aspect "carnet" se fait par les italiques de Newsreader, pas par le mono.

**Échelle (6 niveaux + 1 lead) :**

| Niveau | Fonte | Taille (desktop) | Line-height | Letter-spacing | Usage |
|---|---|---|---|---|---|
| `display` | Newsreader 400 | 72 / 88px | 0.95 | -0.02em | H1 landing, page /about première phrase |
| `h1` | Newsreader 400 | 48 / 56px | 1.02 | -0.015em | Titre de page |
| `h2` | Newsreader 400 italic | 32 / 40px | 1.1 | -0.01em | Section ; italique pour signaler "voix d'auteur" |
| `h3` | Inter Tight 600 | 18 / 22px | 1.3 | 0 | Sous-section, label de bloc |
| `lead` | Newsreader 400 | 22 / 32px | 1.45 | -0.005em | Paragraphe d'intro / chapeau |
| `body` | Inter Tight 400 | 16 / 26px | 1.55 | 0 | Corps de texte |
| `caption` | Inter Tight 500 | 13 / 18px | 1.4 | 0.02em | Métadonnées, dates, footnotes |

Mobile : on diminue display à 48px, h1 à 36px, h2 à 26px ; le reste tient.

**Usage des italiques :** réservés à deux choses, et seulement deux : **les titres d'œuvres** (films, livres, séries) et **les inserts éditoriaux** (h2 quand on commente, jamais quand on liste). Ne pas utiliser pour de l'emphase générique.

### 2.3 Spacing & grille

**Système 4px.** Pas 8px : on a besoin de la finesse pour les listes denses (bucket, watched). 8 valeurs nommées — pas plus.

| Token | Valeur | Usage |
|---|---|---|
| `s-1` | 4px | Espacement entre une icône et son label |
| `s-2` | 8px | Padding intra-control |
| `s-3` | 12px | Gap dans un groupe d'éléments connexes |
| `s-4` | 16px | Padding standard, gap de liste |
| `s-5` | 24px | Gap entre groupes |
| `s-6` | 40px | Padding section mobile, gap entre cards |
| `s-7` | 64px | Padding section desktop |
| `s-8` | 120px | Marge verticale entre grandes sections éditoriales |

**Grille :**
- Mobile : 1 colonne, gouttière 24px, marges latérales 20px.
- Tablette : 6 colonnes, gouttière 24px.
- Desktop : 12 colonnes, max-width 1280px, gouttière 32px.
- **Pages éditoriales (/about, /how-it-works, /press) : largeur de mesure fixée à 64ch (~580px), centrée.** C'est non-négociable. Le texte long se lit dans une mesure de 60–75 caractères. Un h1 peut dépasser, un paragraphe non.

### 2.4 Composants atomiques

#### Bouton

**Trois variants. Pas un de plus.**

1. **`primary`** — fond `accent`, texte `ink`, pas de border. Hauteur 40px, padding horizontal 20px, radius 4px. Poids Inter Tight 600. Hover : `accent-press` (8% plus sombre). Disabled : opacity 0.4.
2. **`secondary`** — fond transparent, border 1px `border-faint`, texte `text`. Mêmes dimensions. Hover : fond `surface`.
3. **`ghost`** — fond transparent, pas de border, texte `text-muted`. Padding 8px horizontal seulement. Pour les actions secondaires dans une toolbar (ex : "Annuler" à côté d'un primary).

Le radius de 4px est un choix : on a besoin d'un peu de souplesse (pure square est trop brutal pour un produit chaleureux), mais 16px nous mettrait sur le territoire SaaS générique.

**Pas de `destructive` variant.** Quand on supprime un groupe, on ouvre une confirmation modale avec un bouton primary rouge — c'est le seul moment où primary fait office de destructive. Ça force à ne pas multiplier les actions destructives partout dans l'UI.

#### Input

Hauteur 40px. Border 1px bottom uniquement, `border-faint`. Pas de border autour. Au focus : la border-bottom passe en `accent`, 2px. Padding horizontal 0 (le label flotte au-dessus, en `caption`). C'est un choix : l'input "boîte" tendance Tailwind est devenu illisible parce que tout le monde l'a copié.

États : default, focus, error (border-bottom `accent`, message `caption` en dessous), disabled (opacity 0.4).

#### Card

Trois usages distincts → trois traitements distincts. Mais pas de "Card" générique :

- **Poster card** (un film dans une bucket) : juste l'image, ratio 2:3, pas de border, pas d'ombre. Au hover : un overlay `ink` 70% apparaît avec le titre + l'année en bas, en lead italic. C'est tout.
- **Editorial card** (un article, un changelog entry) : titre h3, lead 2–3 lignes, méta caption en bas, séparateur `border-faint` dessous (pas autour). Pas de fond. La "carte" n'est pas une boîte, c'est une zone typographique.
- **Group card** (sur /groups) : avatar carré 64px, nom h3, derniers membres actifs en caption, dernière activité en caption. Border-bottom `border-faint`. Pas d'ombre.

**Aucune des trois n'a d'ombre.** Si on a besoin de hiérarchiser, on utilise `surface` comme fond.

#### Avatar

Carré (pas rond). 32px / 48px / 64px. Radius 2px. Si pas d'image : fond `surface`, initiale Newsreader 400 italic, couleur dérivée du hash du username (5 hues fixes choisies parmi la palette élargie via `color-mix`).

Le carré est un pari : tout le monde fait des avatars ronds depuis 2015. Le carré dit "objet", "polaroid", "carte" — donc cinéma. À tester.

#### Badge

Un seul style. Caption 11px uppercase (`letter-spacing: 0.08em`), padding 4px 8px, border 1px `border-faint`. Pas de fond. Variants : neutre (default), `accent` (border + texte en accent — pour le badge "patron"), `dimmed` (opacity 0.6).

#### Divider

Trait 1px `border-faint`. Pour les sections éditoriales : ligne pleine sur la colonne de mesure (pas pleine largeur). Pour l'UI : pleine largeur du parent.

#### Link

Texte `accent`, sans soulignement. Au hover : `text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px`. Pas d'animation. Les liens dans le corps de texte (long-form) gardent la couleur du texte avec un soulignement permanent ; ils basculent à `accent` au hover. Cette nuance distingue un lien "navigation" d'un lien "référence".

### 2.5 Iconographie

**Set : Lucide, mais avec inventaire.** On documente la liste exacte des icônes utilisées (objectif < 20 sur tout le site), et on s'y tient. Si une nouvelle icône est nécessaire, ça passe par revue.

**Règle d'usage :** une icône n'apparaît jamais sans texte, sauf dans trois cas :
1. Bouton "fermer" (× en haut d'un modal).
2. Bouton "menu" mobile (les trois traits).
3. Étoile de notation.

**Pas d'icône pour les "features" sur une landing.** Le texte fait le boulot.

Stroke 1.5px (Lucide default est 2 — trop épais pour notre palette). Taille : 16px ou 20px, jamais entre les deux.

### 2.6 Imagerie

**Posters TMDB :**
- Ratio 2:3, jamais cropped, jamais en cover qui déforme.
- Aucun traitement par défaut (pas de filtre, pas de duotone, pas de tilt). Le poster du film est conçu par quelqu'un, on le respecte.
- Hover (sur les listes denses uniquement) : overlay `ink` 70%, titre + année qui apparaissent. Transition 160ms.
- Loading : fond `surface`, pas de skeleton animé. Le clignotement gris à grain est un anti-pattern à ce stade.

**Avatars :** voir 2.4. Carrés 2px radius.

**Pas d'autre imagerie.** Pas de stock photo, pas de hero image. Si une page a besoin d'un visuel et qu'on n'a pas de poster qui tienne, on n'a pas d'image — on travaille la typographie.

**Cas particulier : covers de groupe (perk patron).** L'utilisateur peut soit choisir un still de film de la bucket du groupe (TMDB backdrop), soit téléverser. Aucune génération AI.

**Suggestion d'illustration commissionnable** (si l'équipe veut, à terme, illustrer /about) : deux pistes à étudier — **Sophy Hollington** (gravures sur bois, contrastes durs, lié à la critique éditoriale) ou **Brecht Vandenbroucke** (BD, couleurs pleines, humour pince-sans-rire, parfait pour /404 et /500). Pas d'AI. À budgéter, à commissionner, à signer.

### 2.7 Mouvement

**Une règle. Une seule.**

- **Durée : 160ms.**
- **Easing : `cubic-bezier(0.2, 0, 0, 1)`** (out-expo modéré).
- **À quoi ça s'applique :** les seules choses qui s'animent sont (a) les états de hover sur posters, liens, boutons, (b) l'apparition d'un modal (opacity + translateY 8px), (c) la rotation de la roulette du tirage au sort (cas spécial : voir plus bas).

**Pas de scroll-triggered animations. Pas de parallax. Pas de framer-motion.** Si on veut faire ressentir quelque chose, on l'écrit.

**Cas spécial — le tirage au sort :** c'est le moment dramatique de l'app, donc on s'autorise une animation plus longue. 2.4s, easing `cubic-bezier(0.05, 0.7, 0.1, 1)`. Visuellement : les posters défilent verticalement comme un rolodex, ralentissent, s'arrêtent. Pas de "ding", pas de confetti. Quand ça s'arrête, le titre s'écrit en display Newsreader. C'est tout.

---

## 3. Sitemap commenté

J'accepte le sitemap proposé en grande partie, avec quelques arbitrages :

**Pages que je garde telles quelles** (app + public confondues) :
- `/`, `/auth`, `/about`, `/how-it-works`, `/pricing`, `/changelog`, `/metrics`, `/help` (qui absorbe /faq), `/contact`, `/privacy`, `/terms`, `/credits`, `/404`, `/500`
- App : `/groups`, `/friends`, `/settings`, `/settings/import`, `/g/[id]`, `/g/[id]/bucket`, `/g/[id]/chat`, `/g/[id]/watched`, `/u/[username]`, `/invite/[token]`

**Pages que je fusionne ou retire :**

- **`/help` absorbe `/faq`.** Une seule page d'aide. Le couple help+faq sur les SaaS est presque toujours redondant.
- **`/press` et `/brand` : à fusionner en `/press`** au début. Tant qu'on n'a pas 5 articles de presse, une page "Brand" séparée est prétentieuse. Ressources presse + brand assets cohabitent. On scindera quand le besoin se fera sentir.
- **`/careers` : je propose de la retirer pour le moment.** Le brief autorisait "no jobs right now, but here's how we'd hire" — c'est sympa mais c'est aussi exactement le genre de page qui crie "petit projet qui se prend pour un grand". Si on tient à dire quelque chose : un paragraphe en bas de `/about`, "On n'embauche pas. Si un jour, voilà comment ça se passerait." Ça suffit.
- **`/security` + `/.well-known/security.txt`** : on garde, mais `/security` est très court (1 page, voir wireframe).
- **`/cookies` : à fusionner dans `/privacy`** comme une section ancrée. Une page entière sur les cookies pour un produit qui n'a pas de tracking tiers, c'est de la cargo-cult juridique.
- **`/roadmap` : à challenger.** Une roadmap publique pour un produit donations-only, ça crée une dette implicite ("vous aviez promis…"). Je propose de **fusionner roadmap dans changelog** : un changelog qui a en tête une section "Soon" datée vaguement. Moins de pression, autant de transparence.

**Pages que je garde malgré tout :**

- **`/metrics`** : c'est *la* page signature, on ne la touche pas.
- **`/pricing`** : oui, même gratuit. C'est le sujet, comme dit le brief.

**Sitemap final :**

```
Public
├── /                  Landing
├── /auth              Sign in / sign up
├── /about             Manifeste + équipe
├── /how-it-works      Long-form éditorial
├── /pricing           "Donations expliquées"
├── /changelog         Log + section "Soon" (= roadmap)
├── /metrics           Transparence chiffres
├── /press             Kit presse + brand assets
├── /help              Aide + FAQ fusionnée
├── /contact           Formulaire + emails directs
├── /security          + /.well-known/security.txt
├── /privacy           Inclut section cookies
├── /terms
├── /credits           TMDB, fonts, OSS
├── /404, /500

App (auth)
├── /groups
├── /friends
├── /settings (+ /settings/import)
├── /g/[id]            Home + draw
├── /g/[id]/bucket
├── /g/[id]/chat
├── /g/[id]/watched
├── /u/[username]
└── /invite/[token]
```

Une ligne de moins que prévu, et chacune justifie sa présence.

---

## 4. Wireframes

> Convention : pour chaque page j'écris (a) **intention** : ce qu'on veut faire ressentir, (b) **structure** : sections du haut vers le bas, (c) **hiérarchie** : ce qui est gros / petit, (d) **densité** : claire / dense / éditoriale, (e) **copie réelle** quand le texte est central. Pas de lorem.

---

### 4.1 Pages publiques

#### `/` — Landing

**Intention :** que le visiteur sente qu'il est arrivé sur une revue, pas sur une app. Qu'il se demande "qui sont ces gens ?" plutôt que "à quoi ça sert ?". Que la phrase d'accroche fonctionne lue à voix haute.

**Densité :** modérée. Une seule colonne sur la mesure éditoriale (64ch) sauf pour la grille de posters.

**Structure :**

1. **Header.** À gauche : `Rendezvu` en Newsreader 400, 22px. À droite, en Inter Tight caption : `À propos · Comment ça marche · Changelog · Se connecter`. Pas de bouton CTA dans le header. Pas de logo : le mot suffit. Border-bottom faint.

2. **Hero — typographique uniquement, pas d'image.** Hauteur ~70vh sur desktop, 50vh sur mobile.
   - **Display** (Newsreader, 88px desktop) :
     > « On regarde des films ensemble.
     > Même quand on est loin. »
   - **Lead** (Newsreader 22px, en dessous, max 64ch) :
     > Rendezvu est un rendez-vous cinéma pour amis, familles et couples à distance. Une bucket list partagée, un tirage au sort un peu brutal, et après le film : ce qu'on en a pensé. Pas d'algorithme, pas de feed, pas de pub — jamais.
   - Sous le lead, sur une ligne : `[Créer un groupe →]` (primary) + à droite, en caption : `Gratuit. Pas de carte bancaire. On vit grâce aux dons.`

3. **"Voici comment ça marche, en cinq lignes."** (h2 italic Newsreader)
   Liste numérotée, Inter Tight body, items courts :
   1. On crée un groupe — avec sa sœur, ses colocs, son ex-coloc devenu copain à Lisbonne.
   2. Chacun ajoute des films à la bucket. On ne se met pas d'accord, on accumule.
   3. Le soir J, on tire au sort. La machine tranche. On accepte.
   4. On regarde. Synchronisé si on veut, à son rythme sinon.
   5. Après, on note. On commente. On garde une trace.

   Sous la liste : un lien `Lire le manifeste →` qui pointe vers /about.

4. **"Cette semaine chez nous."** (h2 italic) — section éditoriale.
   Trois groupes anonymes (avec accord) qui partagent leur dernier visionnage. Chaque entrée :
   - Poster du film (small, 96×144px à gauche)
   - À droite : titre du film en h3, "vu par *Les Chevaliers du Vendredi*" en caption italic, puis 1–2 lignes du commentaire le mieux noté ("On a tous pleuré, sauf P. qui dormait — *L. *"). Date.

   *Note produit :* ça suppose un opt-in groupe par groupe. À discuter avec le PM.

5. **"On ne fait pas..."** (h2 italic) — section "anti-features", deux colonnes serrées :
   | À gauche | À droite |
   |---|---|
   | On ne vend pas vos données. | On ne vous suit pas hors du site. |
   | On ne met pas de pub. | On ne fait pas de feed public. |
   | On ne gamifie pas. | On ne gate aucune fonction. |
   Caption en bas : `Si on change un jour, on l'écrit ici en premier.`

6. **Pied — pas de footer 4 colonnes.** Trois lignes seulement, alignées à gauche, séparées par `·` :
   - Ligne 1 : `À propos · Comment ça marche · Aide · Contact`
   - Ligne 2 : `Pricing · Changelog · Metrics · Press`
   - Ligne 3 : `Privacy · Terms · Security · Credits`
   - En dessous, en caption muted : `Rendezvu, fait à [ville], 2026. Données films : TMDB.`

**Ce qu'on n'a PAS :**
- Pas de "Trusted by".
- Pas de "Discover X" / "The future of Y".
- Pas de screenshot 3D-tilté.
- Pas de "Get started — it's free!" répété 3 fois.

---

#### `/auth`

**Intention :** entrée rapide, pas un funnel marketing. Aucune fioriture.

**Structure :**

- En haut : `Rendezvu` 22px Newsreader, centré.
- Au milieu de la page (vertical center) :
  - h2 italic : *« Bonsoir. »*
  - Sous-titre body : `Connectez-vous pour rejoindre votre groupe — ou créez-en un.`
  - Bouton primary pleine largeur : `Continuer avec Google`
  - Petit séparateur "ou" en caption.
  - Champ email.
  - Bouton secondary : `Recevoir un lien de connexion`
  - Caption en dessous : `Le lien expire après 15 minutes. Pas de mot de passe à retenir — on n'aime pas ça non plus.`
- En bas, caption muted : `En continuant, vous acceptez nos Conditions et notre Politique de confidentialité.` (les deux mots sont des liens)

**Densité :** très claire. Largeur du bloc : 360px. Centré. Le reste de la page est `ink`, sans rien.

---

#### `/about`

**Intention :** que le visiteur, après lecture, sache *pourquoi* on a fait ça. Que le texte ressemble à un éditorial signé — pas à une page "Our Story" copiée d'un template.

**Densité :** éditoriale. Mode `paper` (fond crème).

**Structure :**

1. Header habituel.
2. **Display** (Newsreader 88px, max 18 mots) :
   > *« Pendant le confinement, on s'envoyait des films sur Telegram et personne ne les regardait. »*
3. **Lead** :
   > Voilà l'origine. Rien de plus. On a essayé tous les outils — Discord, Notion, des Google Sheets — rien ne tenait. Alors on a fait Rendezvu.
4. **Le manifeste** (4–5 paragraphes, body, mesure 64ch). Titres h2 italic.
   - *« On ne décide pas à votre place. »* — sur le tirage au sort comme parti-pris. Le texte explique pourquoi un randomizer brutal vaut mieux qu'un feed personnalisé. ~150 mots.
   - *« Privé par défaut. »* — sur l'absence de feed public, de likes, de follows. ~120 mots.
   - *« Gratuit, pas dans le sens où vous croyez. »* — sur le modèle dons-only, l'engagement à ne pas gater de feature. Renvoi vers /pricing. ~120 mots.
   - *« On n'est pas une plateforme. »* — sur le mot "platform" qu'on bannit en interne. ~80 mots.
   - *« Qui on est. »* — paragraphe court : prénoms, ville, contact direct (deux email perso). 60 mots max.
5. **Signature.** En bas du long-form, en italique Newsreader 18px, aligné à droite : *« — A. & M., quelque part entre Bruxelles et Marseille. »*
6. **Footer minimal.**

---

#### `/how-it-works`

**Intention :** que le lecteur comprenne le produit en lisant un long article, pas en regardant 4 cards. Que ce soit *agréable à lire*.

**Densité :** éditoriale. Mode `paper`. Une seule colonne (64ch). 5–7 minutes de lecture annoncées en caption ("Sept minutes — le temps d'un café.").

**Structure :**

1. Header.
2. **h1** : *« Comment ça marche, en long. »*
3. Lead :
   > La version courte tient en cinq lignes sur la page d'accueil. Voici la version longue, pour qui veut savoir ce qu'on fait du tirage au sort, ce qu'on fait de vos données, et pourquoi le chat est si étrange.
4. Sections (h2 italic chacune) :
   - *« Le groupe. »* — Comment on en crée un, qui on invite, ce qu'on partage. 2–3 paragraphes. Mention que les groupes peuvent être de 2 (couples) à 30 (cinéclub) personnes max.
   - *« La bucket. »* — Comment chacun ajoute, comment on importe depuis Letterboxd / IMDb, pourquoi on ne demande pas de "se mettre d'accord". 2–3 paragraphes.
   - *« Le tirage. »* — Le moment-clé. On explique l'algo en une phrase honnête : `On tire vraiment au hasard, avec une seule règle : pas le même film deux fois.` On explique pourquoi on n'autorise pas de re-tirer.
   - *« Le visionnage. »* — Synchrone (lien partagé, on lance à 21h), asynchrone (chacun à son rythme, on partage le code SPOIL plus tard). Pas de player intégré — on n'a pas de droits, on n'en aura jamais. On suggère où voir le film (Justwatch link).
   - *« L'après. »* — Notation 5 étoiles (pas 10, pas 100). Commentaires libres, longs si on veut. Spoil-tag.
   - *« Si on est seul. »* — Mode solo : oui, on peut. C'est juste moins drôle.
5. À la fin, caption italic : *« Encore des questions ? Voir l'aide ou écrire à [email].* »

---

#### `/pricing`

**Intention :** assumer le sujet. Ne pas s'excuser d'être gratuit, ne pas mendier de manière passive-aggressive, ne pas pousser le don.

**Densité :** éditoriale. Mode `paper`.

**Structure :**

1. Header.
2. **h1** : *« On ne vend rien. On accepte des dons. Voilà comment. »*
3. Lead :
   > Pas de plan gratuit, pas de plan payant, pas de plan "Pro" en sticker doré. Rendezvu fonctionne grâce aux dons. Si vous aimez, vous donnez. Si vous donnez, on vous remercie. Si vous ne donnez pas, vous avez exactement les mêmes fonctionnalités. C'est tout l'argument.
4. Section *« Combien ça coûte de faire tourner ça. »*
   - Petit tableau, en caption Inter Tight, chiffres tabulaires :
     ```
     Hébergement Vercel ........ 28 €/mois
     Supabase .................. 25 €/mois
     Domaine + email ............ 4 €/mois
     ─────────────────────────────────────
     Total ..................... ~57 €/mois
     ```
   - Phrase : *« Pour l'instant, ça suffit. Quand ça grandira, on mettra à jour ce tableau. »*
5. Section *« Si vous donnez. »* (h2 italic)
   - Trois lignes, sans toggle, sans "Most popular" :
     ```
     5 € / une fois         Ponctuel. Merci.
     3 € / mois             Régulier. Encore plus merci.
     30 € / une fois        Patron annuel. Reçoit un badge cosmétique,
                            une cover de groupe custom, un accès anticipé
                            aux fonctions en chantier.
     ```
   - Sous la liste : `[Faire un don →]` (primary, vers Stripe).
6. Section *« Ce qu'on ne fera jamais. »*
   - Trois engagements en h3, chacun avec une ligne d'explication :
     1. **Pas de pub.** Pas même "non intrusive".
     2. **Pas de paywall.** Toutes les fonctions, pour tout le monde.
     3. **Pas de revente de données.** On les a, on les garde, on s'en sert pour faire marcher le produit. Stop.
7. Section *« Si on doit changer un jour. »*
   - Paragraphe court : *« On l'écrira ici en grand, et un mois avant. Pas dans une mise à jour des CGU enterrée. »*
8. Footer.

---

#### `/changelog` (avec section "Soon" intégrée = roadmap)

**Intention :** un journal de bord, pas un Beamer. Qu'on ait envie de scroller un peu.

**Densité :** dense, mais aérée. Mode `ink` (l'app est sombre, le journal de l'app aussi).

**Structure :**

1. Header.
2. **h1** : *« Ce qui change. »*
3. Lead court : *« Les modifications du produit, dans l'ordre inverse. Honnête sur les ratés.* »
4. **Section "Bientôt" en haut** (h2 italic *« Bientôt »*).
   - Trois entrées max. Pour chacune : titre h3, paragraphe lead 2 lignes, étiquette caption *« Avant l'été »* / *« Cette année, peut-être »* / *« Pas avant 2027 »*.
   - Exemple :
     > **Import depuis Letterboxd**
     > On gère IMDb depuis février. Letterboxd, c'est plus tendu côté API — on cherche un moyen propre.
     > *Avant l'été.*
5. **Divider** plein largeur de la mesure.
6. **Section "Sorti"** (h2 italic *« Sorti »*).
   - Liste verticale d'entrées datées. Pour chaque : date en caption (`12 avril 2026`), titre en h3, paragraphe body en dessous, parfois screenshot statique (pas obligatoire — *si* utile). Tags caption en bas (`Bucket · iOS · Performance`).
   - Exemple d'entrée écrite dans le ton :
     > **12 avril 2026**
     > **Le tirage retient maintenant les films récemment exclus.**
     > Avant, si trois personnes tiraient au sort le même soir, le même film pouvait sortir trois fois. C'est corrigé. On garde une fenêtre de 24h.
     > *Tirage · Bug*
7. Footer.

---

#### `/metrics`

**Intention :** *la* page signature. Que ce soit notre carte de visite éditoriale, plus que la landing.

**Densité :** dense, presque comme un dashboard. Mais pas un dashboard SaaS — un tableau.

**Structure :**

1. Header.
2. **h1** : *« On vous dit tout. »* + lead court : *« Mis à jour le 1er de chaque mois. Avril 2026.* »
3. **Bloc "Personnes"** (h2 italic).
   - Quatre chiffres, en display (Newsreader 88px), alignés en grille 2×2 :
     - `2 314` — utilisateurs mensuels actifs
     - `186` — groupes actifs cette semaine
     - `47` — pays
     - `8.4` — films vus en moyenne par groupe / mois
   - Chaque chiffre a une caption en dessous décrivant *exactement* ce qu'il mesure.
4. **Bloc "Argent"** (h2 italic).
   - Tableau Inter Tight chiffres tabulaires, mode `paper` (à toi équipe : couleur de fond locale OK ou on tient ink ?). Trois colonnes : mois, dons, dépenses, solde.
   - 12 lignes (12 derniers mois).
   - En dessous : phrase courte. *« Quand le solde devient négatif, on sort de notre poche. Quand il dépasse 1 000 €, on l'écrira ici aussi. »*
5. **Bloc "Code"** (h2 italic).
   - Petits stats sur l'open-source : commits ce mois, contributors, issues ouvertes/fermées. Lien vers le repo (si applicable).
6. **Bloc "Promesses tenues"** (h2 italic).
   - Liste à puces :
     - Pas de pub : ✓ depuis toujours.
     - Pas de paywall : ✓ depuis toujours.
     - Pas de revente de données : ✓ depuis toujours.
     - Latence p95 sous 800ms : ✓ ce mois (789ms).
     - Réponse au support en moins de 48h : ✗ ce mois (moyenne 71h — on s'excuse).
   - Cocher ✗ honnêtement. C'est important.
7. Footer.

---

#### `/press` (fusionné avec /brand)

**Intention :** efficacité pour journalistes, dignité pour la marque. Pas un kit gonflé.

**Densité :** claire, listes.

**Structure :**

1. Header.
2. **h1** : *« Press. »* + lead :
   > Voici tout ce dont vous avez besoin si vous voulez écrire sur Rendezvu. Si vous ne trouvez pas, écrivez-nous.
3. Section *« En une phrase. »*
   > Rendezvu est un rendez-vous cinéma à distance pour 2 à 30 personnes — bucket partagée, tirage au sort, notes communes. Gratuit, financé par les dons.
4. Section *« En un paragraphe. »* (le paragraphe demandé au point 5 — voir section 6 du présent doc).
5. Section *« Logos & wordmarks. »*
   - Liste : `Wordmark — light.svg`, `Wordmark — dark.svg`. C'est tout. Pas de "logo round", "logo square", "icon", etc. Le wordmark suffit.
6. Section *« Couleurs. »*
   - Cinq pastilles avec hex sous chacune.
7. Section *« Captures d'écran. »*
   - Trois captures, prises sur des comptes de test (jamais réels). Légendes.
8. Section *« Articles déjà parus. »*
   - Liste verticale : `2025-11-04 · Le Monde · "L'app cinéma qui n'algorithme rien" → lien`. (Si on n'en a pas, on ne crée pas la section. Pas de fake.)
9. Section *« Contacts. »*
   - Deux emails : `press@rendezvu.app` et un email perso pour les fondateurs. Pas de formulaire — un journaliste veut copier-coller.
10. Footer.

---

#### `/help`

**Intention :** trouver une réponse en moins de 30 secondes.

**Densité :** dense.

**Structure :**

1. Header.
2. **h1** : *« Aide. »* + lead court.
3. Champ de recherche (input, pleine mesure).
4. **Sections** par domaine, chacune une h2 italic, suivie d'une liste de questions liens (questions formulées comme on les pose vraiment, body) :
   - *« Mon groupe. »* — *« Comment j'invite quelqu'un qui n'a pas de compte ?* », *« Combien on peut être max ? »*, *« Je veux quitter sans supprimer le groupe. »*, etc.
   - *« La bucket. »* — *« Comment importer depuis Letterboxd ? »*, *« Le film n'existe pas dans la base, je fais quoi ? »*
   - *« Le tirage. »* — *« On peut re-tirer ? »* (réponse courte, frontale : non), etc.
   - *« Compte & confidentialité. »*
   - *« Dons. »*
5. Footer avec : *« Pas trouvé ? Écrivez-nous, on répond toujours.* »

Chaque question, cliquée, déplie sa réponse en place (accordion typographique, pas une boîte). Ou ouvre une page dédiée si la réponse est longue. À arbitrer.

---

#### `/contact`

**Intention :** une vraie page, pas un mailto.

**Densité :** très claire.

**Structure :**

1. Header.
2. **h1** : *« On vous écoute. »* + lead :
   > Vraiment. On lit tout. On répond à tout — souvent dans la journée, parfois sous 48h, jamais au-delà d'une semaine.
3. Trois entrées, listées :
   - **Bug, problème, question** → email direct + bouton secondary "Ouvrir un formulaire" qui révèle un formulaire (sujet, message, email).
   - **Presse** → email presse + lien vers /press.
   - **Don, partenariat, autre** → email direct.
4. Section *« Sur quoi on ne répond pas. »*
   - Pitchs commerciaux, propositions de growth-hacks, demandes de réintégrer une "feature freemium". On le dit franchement, en deux lignes, avec humour.
5. Footer.

---

#### `/security`

**Intention :** rassurer un sysadmin en 2 minutes.

**Structure :**

1. Header.
2. **h1** : *« Sécurité. »* + lead court.
3. Liste à puces, body :
   - Hébergement Vercel + Supabase, EU.
   - Auth via Supabase (Google OAuth + magic link).
   - Pas de mot de passe stocké.
   - HTTPS partout.
   - Backups quotidiens chiffrés.
   - Pas de tracking tiers.
4. Section *« Signaler une faille. »*
   - Email dédié, clé PGP, lien vers `/.well-known/security.txt`.
   - Politique courte : *« Pas de bug bounty cash, mais on vous remerciera publiquement (si vous le souhaitez) et on enverra un t-shirt. »*
5. Footer.

---

#### `/privacy`

**Intention :** se lit, ne se survole pas. Vraie écriture.

**Densité :** éditoriale. Mode `paper`.

**Structure :**

1. Header.
2. **h1** : *« Confidentialité. »* + lead :
   > Cette page est écrite par nous, pas par TermsFeed. Si une phrase n'est pas claire, écrivez-nous, on la réécrit.
3. Sections h2 italic :
   - *« Ce qu'on collecte. »* — liste exhaustive : email, username, films ajoutés, notes, commentaires. C'est tout.
   - *« Ce qu'on ne collecte pas. »* — pas d'IP retenue plus que les logs, pas d'analytics tiers, pas de fingerprint.
   - *« Avec qui on partage. »* — Supabase (hébergement), Stripe (dons). Personne d'autre.
   - *« Cookies. »* — un seul, de session. Détaillé.
   - *« Vos droits. »* — export complet en un clic depuis /settings, suppression idem.
   - *« Quand on change. »* — on prévient par email, pas en silence.
4. Footer + date de dernière mise à jour.

---

#### `/terms`

**Intention :** des CGU lisibles. Body, paragraphes courts, pas de tout-majuscules.

**Sections** (h2 italic) :
- *« Ce que vous acceptez en utilisant Rendezvu. »*
- *« Ce qu'on s'engage à faire. »*
- *« Ce qu'on s'engage à ne pas faire. »* (renvoi vers /pricing)
- *« Si on doit fermer. »* — engagement : 90 jours de préavis, export complet, pas d'OPA hostile.
- *« Loi applicable. »*

---

#### `/credits`

**Intention :** dire merci. Vraiment.

**Densité :** éditoriale.

**Structure :**

1. Header.
2. **h1** : *« Avec l'aide de... »*
3. Sections :
   - *« TMDB. »* — paragraphe avec le wording d'attribution exact requis (texte légal officiel) + logo officiel TMDB. Obligation contractuelle, traitée avec dignité.
   - *« Polices. »* — `Newsreader (Production Type, OFL) · Inter Tight (Rasmus Andersson, OFL)`.
   - *« Open source. »* — liste des libs principales, lien repo. Pas de logo dump : juste les noms.
   - *« Personnes. »* — testeurs/-euses de la première heure, par prénom + initiale, avec leur permission.
4. Footer.

---

#### `/404` et `/500`

**Intention :** ne pas tomber dans le "Oops!" ni dans le "Looks like you're lost".

**`/404` :**
- Display Newsreader : *« Cette page n'a jamais été tournée. »*
- Lead : *« Vous cherchiez peut-être : [Accueil] · [Aide] · [Contact]. »*
- Pas d'illustration de robot triste. Si on commissionne, c'est ici (Vandenbroucke).

**`/500` :**
- Display Newsreader : *« On s'est emmêlé les bobines. »*
- Lead : *« Erreur de notre côté. On regarde. Si ça persiste, dites-le-nous. »*
- Bouton secondary : "Recharger". Lien : "Écrire au support".

---

### 4.2 Pages app — audit + recommandations

> Je n'ai pas accès au code mais je peux questionner les choix par défaut auxquels Rendezvu a probablement abouti. Pour chaque page : **ce qui marche probablement déjà**, **ce qui mérite d'être questionné**, **wireframe minimal recommandé**.

#### `/groups`

**Hypothèse de l'existant :** liste de groupes en cards, avec compteur de membres.

**Question :** est-ce qu'on n'a pas mis trop d'air ? Un utilisateur avec 6 groupes scrolle 2 écrans pour les voir tous.

**Wireframe recommandé :**
- Header app : `Rendezvu` à gauche, navigation : `Groupes · Amis · Profil ·` et à droite avatar utilisateur.
- h1 *« Vos groupes. »* + bouton primary `+ Nouveau groupe` aligné à droite.
- Liste verticale, **pas de cards** — des **lignes éditoriales**. Chaque ligne :
  - Avatar carré 48px à gauche.
  - Au milieu : nom du groupe (h3), en dessous en caption : `4 membres · dernière activité il y a 2 jours · 12 films en bucket`.
  - À droite : badge si "votre tour de tirer" + flèche.
  - Border-bottom faint.
- Sous la liste, en caption muted : *« Pour rejoindre un groupe, demandez-leur le lien. »*

**Densité :** dense (ligne ~64px de hauteur). 8 groupes tiennent dans le premier écran.

#### `/friends`

**Question d'audit :** est-ce qu'une page "Friends" est même nécessaire ? Si Rendezvu est intime par défaut, "ami" est un concept dilué — un membre de groupe, c'est un ami fonctionnel. Je propose de **renommer la page `/people`** et de la définir comme *« Toutes les personnes avec qui vous avez regardé un film. »* C'est un index passif, pas une liste sociale.

**Wireframe :**
- h1 *« Vos compagnons de cinéma. »* + lead caption : *« Toutes les personnes avec qui vous avez vu au moins un film. »*
- Liste : avatar carré 32px, nom, caption *« vu ensemble : 12 films · dans 2 groupes »*.
- Pas de bouton "Add friend", pas de demande d'amitié. On n'est pas sur Facebook.

#### `/settings` (+ `/settings/import`)

**Audit :** probablement déjà bien, mais souvent les /settings deviennent un dump.

**Wireframe :**
- Layout deux colonnes desktop (sidebar étroite à gauche), une seule colonne mobile.
- Sidebar : `Profil · Compte · Confidentialité · Imports · Notifications · Données · Patron · Quitter`.
- Chaque section : un h2, des champs minimaux. Inputs ligne basse comme spécifié dans le DS.
- Section **Imports** = `/settings/import` :
  - Quatre options : `IMDb (CSV)`, `Letterboxd (CSV)`, `Trakt (API)`, `Manuel`.
  - Pour chacune : 2 lignes d'instructions claires, bouton *Choisir un fichier*.
  - Après import : aperçu des films détectés, possibilité de retirer ceux qu'on ne veut pas, puis "Ajouter à : [groupe au choix]".
- Section **Données** : *Exporter tout (JSON)*, *Supprimer mon compte (irréversible)*. Le second ouvre une modal en deux étapes.
- Section **Patron** : statut, prochaine échéance, lien Stripe pour gérer.

#### `/g/[id]` — Home + draw

**C'est la page la plus importante de l'app.** Elle a deux modes : repos (vue d'ensemble du groupe) et tirage (le moment dramatique).

**Audit possible de l'existant :** trop de tabs en haut, le tirage caché derrière un bouton secondaire, manque de drama au moment du tirage.

**Wireframe — mode repos :**
- Header app + cover de groupe (image custom si patron, sinon `surface` uni). Hauteur ~200px desktop.
- En overlay sur la cover, en bas à gauche : nom du groupe en display, sous-titre caption *« 4 membres · 12 films en bucket · 6 vus »*.
- **Tabs sous la cover** (pas en pill mais en texte underlined, façon Letterboxd) :
  `Accueil · Bucket · Chat · Vus`
- Sous les tabs, deux blocs :
  - **Bloc gauche, 2/3** : *« Le prochain rendez-vous. »* (h2 italic). Bouton primary énorme, hauteur 80px : `Tirer un film maintenant`. En dessous, caption : *« 12 films possibles. Une fois tiré, on ne revient pas en arrière. »*
  - **Bloc droit, 1/3** : *« Activité récente. »* — micro-feed des 5 dernières actions du groupe (X a ajouté Y, Z a noté W). Pas de likes.

**Wireframe — mode tirage :**
- Le bouton *Tirer un film maintenant* déclenche un **takeover plein écran** (modal full-screen), fond `ink`.
- Au centre : **rolodex vertical** des posters (2:3) qui défilent. Animation 2.4s.
- Le rolodex s'arrête. Le poster s'agrandit légèrement. Le titre s'écrit en display Newsreader (animation typewriter sobre, ~600ms).
- Sous le titre : année, durée, réalisateur en caption.
- Trois actions en dessous :
  - `[Acceptez le verdict.]` (primary)
  - `[Voir la fiche]` (secondary, ouvre détail TMDB en modal)
  - `[Retour à la bucket]` (ghost, ferme le modal — à utiliser uniquement en cas d'urgence ; on prévient en caption : *« Cela ne retire pas le film de la bucket. »*)

**Note copy/voix :** "Acceptez le verdict" est plus brutal que "Choisir ce film" — c'est volontaire. Le tirage est un parti-pris.

#### `/g/[id]/bucket`

**Audit :** souvent dans ce genre d'app, la liste devient soit grille de posters massifs, soit table. Les deux sont insatisfaisants.

**Wireframe :**
- Toggle `Grille · Liste` en haut à droite (caption, underlined active).
- **Mode grille (default) :**
  - Posters 2:3, 6 colonnes desktop, 2 colonnes mobile.
  - Hover : overlay titre + année + ajouté par X.
  - Pas de "1234 films" en gros — c'est un compteur de bibliothécaire, pas notre rôle.
- **Mode liste :**
  - Lignes denses (44px), poster mini (28×42), titre + année + ajouté par + date d'ajout en caption.
- Filtre minimal en haut : `Tous · Ajoutés par moi · Disponibles sur Netflix/MUBI/etc.` (si on intègre Justwatch, ce qui est à confirmer côté produit).
- Bouton primary flottant en bas à droite mobile : `+ Ajouter`. Sur desktop, intégré dans le header de section.
- Modal d'ajout : champ recherche TMDB, résultats en liste, pas de fioriture.

#### `/g/[id]/chat`

**Audit & question :** un chat dans une app cinéma, ça peut vite ressembler à un Slack triste. Comment garder le ton de la maison ?

**Wireframe :**
- Layout très épuré, façon iMessage minimal :
  - Pas de bulles colorées style Discord. Juste un avatar carré 32px à gauche, nom en caption, message en body. Séparé par 24px verticalement entre messages d'auteurs différents (8px entre messages d'un même auteur).
  - L'auteur courant : aligné à droite, sans avatar, fond `surface` light.
  - Pas de réactions emoji. **Une seule réaction possible : ★** (étoile, accent). Pour signaler "ça m'a marqué". C'est tout. Pas de 👍, pas de ❤️, pas de skin tones.
  - Pas de fil/threads. Si une discussion devient longue, c'est qu'il y a quelque chose à écrire dans /watched.
- Champ de saisie en bas, ligne basse, pas de boîte. Caption à droite : `Entrée pour envoyer · Maj+Entrée pour aller à la ligne`.
- Mention spéciale : on peut citer un film de la bucket par `@`, qui injecte une mini-card cliquable.

**Densité :** modérée. Pas de "online status", pas de "is typing".

#### `/g/[id]/watched`

**Intention :** la mémoire du groupe. La page la plus chaleureuse de l'app.

**Wireframe :**
- h1 *« Ce qu'on a vu ensemble. »* + lead caption *« 6 films, depuis octobre. »*
- Liste verticale, par ordre antichronologique, **mode éditorial** (pas grille) :
  - Pour chaque film :
    - Poster à gauche (96×144).
    - À droite, Newsreader h2 italic : titre du film *« Vertigo (Hitchcock, 1958) »*.
    - En dessous, caption : `Vu le 12 mars · Note du groupe : ★★★★☆ (4.2)`.
    - En dessous, body : un paragraphe par membre, en blocs verticaux. *« P. — Toujours aussi malade.* », *« L. — Le rouge me hante depuis. »*. Si pas de commentaire, on n'en met pas.
    - Divider faint avant le film suivant.
- En haut, toggle `Liste · Grille` pour ceux qui veulent juste voir les posters.

#### `/u/[username]` — profil public

**Audit :** un profil public est ambigu pour une app intime par défaut. Quelle info est publique ?

**Recommandation :** profil public extrêmement minimal. Username, avatar, citation libre 140 caractères, et — c'est tout. Pas de liste de films, pas de "watched", pas de groupes. Si l'utilisateur veut partager publiquement, il y a un opt-in séparé "Partager mes notes publiques".

**Wireframe :**
- Avatar carré 96px centré.
- Username en h1, en dessous citation libre en lead italic Newsreader.
- En dessous, caption muted : *« Profil sur Rendezvu. Demandez-lui un lien si vous voulez voir un film ensemble. »*
- Si opt-in public activé : en dessous, h2 italic *« Quelques films récemment notés. »* + grille petite des derniers, sans note.

#### `/invite/[token]`

**Wireframe :**
- Page très courte, fond `ink`, centré.
- Avatar carré 64px de l'inviteur.
- Display Newsreader : *« A. vous invite à rejoindre les Chevaliers du Vendredi. »*
- Lead : *« 4 personnes, 12 films en bucket, dernier vu : Vertigo. »*
- Bouton primary : `Rejoindre le groupe`. Bouton ghost : `Plus tard`.
- Caption en bas : *« Si vous n'avez pas encore de compte, on en crée un en deux clics.* »

---

## 5. Voix & ton

### 5.1 Cinq règles

1. **On dit "film", pas "movie", pas "long-métrage", pas "œuvre cinématographique".** Sauf citation directe.
2. **On signe les choses.** Une page éditoriale ("about", "manifeste") finit par une initiale. Un changelog ne signe pas (c'est l'app qui parle), un message d'erreur ne signe pas, mais une page d'opinion oui.
3. **On parle au "on", pas au "nous" ni au "we royal".** "We" en anglais, "on" en français. Jamais "Rendezvu vous propose…" (corporate troisième personne).
4. **On dit ce qu'on ne fait pas, autant que ce qu'on fait.** Les non-features sont des features. *« On ne vend pas vos données »* est une feature.
5. **On reste précis. On évite les superlatifs.** Pas de "incroyable", "magique", "génial", "révolutionnaire". Si quelque chose mérite un superlatif, le lecteur le dira lui-même.

### 5.2 Lexique

**À garder (en interne et dehors) :**
- film, rendez-vous, bucket, tirage, groupe, vu, noté, commenté, à distance, ensemble, manifeste, journal, revue, on, nos, vraiment, dans la mesure du possible, honnêtement.

**À bannir :**
- platform, plateforme, expérience (au sens UX — *« vivez une expérience cinéma »*, non), seamless, fluide, immersive, magique, transformer, révolutionner, révolutionnaire, leverage, élever, débloquer, unlock, empower, customer, consumer, growth, monétiser, churn, retention, AI-powered, propulsé par l'IA, intelligent, smart (sauf au sens propre), curated (à utiliser avec extrême précaution), engager, engagement, conversion, funnel.

**Cas particulier "user" / "utilisateur" :** on dit *« les gens »* ou *« les personnes »* en interface produit. *« utilisateur »* en CGU et page sécurité, OK.

### 5.3 Trois exemples réécrits dans le ton

#### Email transactionnel — confirmation d'invitation

Sujet : *« A. vous invite chez les Chevaliers du Vendredi. »*

> Bonjour,
>
> A. (Adèle Marchand, sur Rendezvu sous le nom **adele.m**) vous a invité·e à rejoindre son groupe de rendez-vous cinéma : **Les Chevaliers du Vendredi**.
>
> Quatre personnes, douze films dans la bucket, dernier vu il y a deux semaines (*Vertigo*). Voici le lien :
>
> → Rejoindre le groupe
>
> Si vous n'avez pas de compte, on vous en fait un au passage. Le lien expire dans sept jours.
>
> À bientôt,
> *L'équipe Rendezvu*

**Ce qu'on a évité :** "Hi there!", "exciting news", des CTAs en boutons gigantesques, le "P.S. Don't share this link with anyone".

#### Message d'erreur — formulaire de contact qui rate

> On n'a pas reçu votre message. C'est de notre côté. Réessayez dans une minute, ou écrivez directement à [hello@rendezvu.app](mailto:hello@rendezvu.app) — on est joignables comme ça aussi.

**Ce qu'on a évité :** *« Oops! Something went wrong. »*, le robot triste, le code d'erreur 500 affiché brut.

#### Toast de succès — film ajouté à la bucket

> Ajouté.

C'est tout. Une seule micro-confirmation, en caption, en bas à gauche, qui disparaît au bout de 1.6s. Pas de *« Great! Vertigo has been successfully added to your bucket! »*. Le travail est fait, on ne félicite pas l'utilisateur d'avoir cliqué.

---

## 6. Paragraphe d'ouverture pour `/brand`

> Rendezvu, c'est un rendez-vous cinéma à distance. Pas une plateforme, pas un réseau social, pas un outil productivity pour cinéphiles. C'est une revue qu'on tient à plusieurs : on accumule des films dans une bucket commune, on tire au sort sans discuter, on regarde — chacun chez soi, parfois en même temps, parfois pas — et après, on en parle. La marque s'écrit comme un éditorial : sobre, dense, avec une opinion. Le rouge n'est pas là pour faire signal d'achat, c'est le rouge des fauteuils et du néon "open" d'une salle de quartier. La serif n'est pas là pour faire luxe, elle est là parce qu'on écrit. On ne vend rien. On accepte des dons. On ne décide pas à votre place — la machine tire au sort, vous regardez. Si quelqu'un voit Rendezvu deux secondes, on veut qu'il pense *« tiens, des gens qui aiment vraiment le cinéma »* — pas *« encore une app »*. Tout le reste de ce manuel découle de cette phrase.

---

## Annexes — arbitrages laissés à l'équipe

Trois choix que je signale parce qu'ils méritent une décision collective avant de figer :

1. **Couleur d'accent** : rouge `#E64B1B` (ma reco) vs or `#D9A41A` (parti-pris existant amélioré). Trade-off : le rouge donne plus de personnalité et casse mieux avec les SaaS, mais l'or a une histoire dans le cinéma (statuettes, dorures, projecteur). Si l'équipe a un attachement, on garde l'or amélioré.
2. **Avatar carré vs rond.** Pari assumé. Si en testing les utilisateurs confondent avec autre chose (poster, badge), on retombe sur rond.
3. **Mode clair sur les pages éditoriales (`paper`) vs sombre partout.** Je propose le bichromisme (clair pour la lecture longue, sombre pour l'app) mais c'est un vrai changement de doctrine. Alternative : garder sombre partout, et compenser la lisibilité par une mesure resserrée + un line-height généreux.

Document à itérer. Toutes les sections sont défendables ; aucune n'est figée. — *Brief reçu le 3 mai, première version livrée le même jour.*

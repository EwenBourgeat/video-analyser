# ANALYSE.md — Rétro-ingénierie du motion design

**Source** : `https://www.tiktok.com/@lemosthiagoo/video/7654958930552032544`
**Titre** : « Réponse à @ashafar326 » — publicité produit **Scalead.ai**
**Analysé le** : 2026-09-05

---

## 0. Géométrie et format — *mesuré, pas supposé*

| Propriété | Valeur |
|---|---|
| Fichier TikTok | 720 × 1280, 30 fps CFR, 2029 frames, 67,633 s, HEVC |
| **Bande de contenu réelle** | **y = 437 → 842, soit 720 × 405** |
| **Ratio du motion design** | **720 / 405 = 1,7778 → 16:9 exact** |
| Master d'origine (déduit) | **1920 × 1080 @ 30 fps** |
| Habillage TikTok | bandes noires haut/bas + sticker « Réponds au commentaire de ashafar326 » incrusté à y = 218→369 |

> **Conséquence pour la reproduction** : le master à recréer est **16:9 (1920×1080)**, *pas* 9:16.
> Le 9:16 se fabrique après coup en centrant le 16:9 sur un canvas 1080×1920 noir.
> Mesure : ligne 437 à 57 % d'intensité, 438→841 pleines, 842 à 56 % → bord continu à y ≈ 437,4, hauteur 405,1.

Toutes les coordonnées ci-dessous sont exprimées dans l'espace master **1920 × 1080**.

---

## 1. Palette — *échantillonnée sur les pixels source*

### Bleus de marque
| Rôle | Hex mesuré | Usage |
|---|---|---|
| `blue-600` **primaire** | **`#1878EC`** | points radar, chips agenda, mail surligné Gmail, entonnoir |
| `blue-500` | **`#2E86F1`** / `#2882ED` | logo Scalead, bouton CTA (départ dégradé) |
| `blue-450` | **`#4694F2`** / `#4F9DF9` | anneau horloge (bas), texte bleu, entonnoir milieu |
| `blue-400` | **`#4195F8`** | dossier (haut du dégradé) |
| `blue-300` | **`#83B8F8`** / `#79B6FF` | anneau horloge (haut), dossier (bas du dégradé) |
| `blue-250` | **`#93C4FF`** | entonnoir clair, halos |
| `blue-150` | **`#C0DDFF`** | halos logo, arcs de la carte finale |
| `blue-050` | **`#DDECFD`** / `#E8F4FD` | fonds « white-blue » |

### Neutres
| Rôle | Hex mesuré |
|---|---|
| **Fond sombre principal** | **`#11171C`** |
| Fond sombre variante bleutée | `#12181F` |
| Halo bleu bas de scène sombre | `#123357` → `#183858` (radial, centré bas) |
| **Blanc** | **`#FFFFFF`** (pur, pas de cassé) |
| Blanc cassé cartes/faces | `#FAFAFA` |
| Texte noir | `#010101` |
| Texte gris secondaire | `#CAD0D5` (labels sur sombre) |
| Barre de titre navigateur | `#2C3238` env. |

### Typographie
Une seule famille sur toute la vidéo : une **grotesque géométrique très proche de Poppins / Product Sans / Gilroy**, avec un `a` à double étage, un `t` à sommet coupé et un `g` simple.
Substitut le plus proche disponible librement : **Poppins** (Google Fonts), sinon **Inter** en repli.

| Usage | Graisse | Taille master |
|---|---|---|
| Phrase cinétique principale | 600 (SemiBold) | 62–72 px |
| Titre d'étape (« Mise en place ») | 600 | 54 px |
| Numéro fantôme (1…5) | 700 | 190 px, `#FFFFFF` @ 6 % |
| Nom sur carte de visite | 700 | 26 px |
| Rôle sur carte | 400 | 17 px, gris |
| Gros chiffres (110/206, 10 500) | 700 | 150–190 px |
| Libellé bouton | 500 | 24 px |

---

## 2. Grammaire d'animation — *courbes mesurées par tracking*

> ### ⚠️ Correction majeure apportée en cours de travail
>
> Les premières mesures verticales de ce document étaient **fausses**.
> `ffmpeg` avec `crop=720:405` produit en réalité **404 lignes** (arrondi à une hauteur
> paire imposé par le `yuv420p`). Les décodages par lots qui supposaient 405 lignes
> étaient donc décalés d'**une ligne par frame**, soit une dérive verticale cumulative.
>
> Conséquences, toutes corrigées ci-dessous :
> - Les mesures **horizontales** (rayon du radar, largeurs, panoramique du parcours,
>   étendue des textes) n'étaient **pas affectées** — elles restent valides.
> - Les mesures **verticales** l'étaient toutes. En particulier, le « panoramique
>   vertical de 2,78 px/frame » attribué à la scène du parcours **n'existe pas** :
>   c'était exactement l'artefact du décalage (1 ligne × 2,667 = 2,67 px/frame).
> - Les positions verticales de l'horloge, de la fenêtre navigateur et du dossier
>   ont toutes été reprises avec un décodage aligné (`tools/measure3.py`).

Trois courbes ont été extraites numériquement du fichier source (script `tools/track.py`) :

### A — Dézoom de la fenêtre navigateur (scène 3)
Largeur de la carte blanche : **1744 px → 1216 px** entre **t = 3,700 s et t = 4,767 s** (1,067 s), puis **immobile** jusqu'au cut à 5,767 s.

| t normalisé | 0,125 | 0,250 | 0,375 | 0,500 | 0,625 | 0,750 | 0,875 | 1,0 |
|---|---|---|---|---|---|---|---|---|
| progression | 0,303 | 0,505 | 0,667 | 0,788 | 0,869 | 0,929 | 0,949 | 0,990 |

→ **easeOutCubic** (entre Quad et Cubic). Équivalent : `cubic-bezier(0.16, 0.84, 0.32, 1)`.
**Point clé** : le mouvement se **stabilise** — ce n'est pas un zoom continu jusqu'au cut.

### B — Dézoom du radar (scène 1)
Rayon extérieur : **947 px → 448 px** entre t = 0,067 et 0,767 s (0,70 s) → **easeOutQuint** (rms 0,166).
Puis **lente reprise** 445 → 507 px de t = 0,87 à 1,83 s (quasi linéaire) : la scène « respire » avant la transition.

### C — Travelling horizontal (scène 5, parcours) — *corrigé*
La corrélation de phase donnait « 651 px/s linéaire, rms 0,041 ». **Ce fit était trompeur** :
il était dominé par la section de croisière. Le suivi image par image du centroïde des
glyphes bleus révèle un **profil de vitesse trapézoïdal** :

| f | 244 | 260 | 280 | 302 | 320 | 344 | 356 | 364 |
|---|---|---|---|---|---|---|---|---|
| px/frame | 10 | 17 | 27 | **29,5** | 26,5 | 16 | 11 | 5 |

→ accélération f236-270, croisière ~28,5 px/frame f270-320, décélération f320-372.
Déplacement cumulé total : **2610 px**. Table complète dans `repro/src/scenes/Journey.tsx`.

Aucun panoramique vertical pendant la croisière : chaque tuile garde un `y` constant
jusqu'à f=340, après quoi toute la scène plonge hors cadre.

### Règles générales déduites
- **Travellings caméra → trapézoïdaux** (accélération / plateau / décélération), pas linéaires.
- **Entrées d'éléments → easeOut** (Cubic à Quint), 0,45–0,7 s.
- **Dézooms de scène → easeOutCubic/Quint** ~0,7–1,1 s puis palier.
- **Texte cinétique** : révélation mot par mot / lettre par lettre ; le mot le plus récent arrive **plus grand et plus clair**, puis se cale (scale ≈ 1,55 → 1, opacité 0 → 1, ~0,22 s par unité). La ligne se **recentre** en continu quand elle s'allonge (mesuré scène 27 : `x0` fixe puis glissement vers la gauche à partir de t = 60,53 s).
- **Cuts** : francs, sans transition, sauf 3 exceptions notées ci-dessous.

---

## 3. Découpage chronologique — 28 beats

> `f` = numéro de frame source (30 fps). Les frontières marquées **(cut)** ont été détectées
> automatiquement (pic de différence inter-frame > 90) ; les autres sont des transitions continues.

| # | t (s) | f | Scène | Fond |
|---|---|---|---|---|
| 1 | 0,000 – 1,867 | 0–56 | Radar / sonar | blanc |
| 2 | 1,867 – 3,600 | 56–108 | Horloge + « tu n'avais pas le temps de prospecter ? » | blanc |
| 3 | 3,633 – 5,767 | 109–173 | Fenêtre navigateur + overlay pause | sombre |
| 4 | 6,033 – 7,833 | 181–235 | « Parce que ça ne sert à rien de pleurer sur le passé » | sombre |
| 5 | 7,833 – 12,467 | 235–374 | Parcours 5 étapes (travelling) | sombre |
| 6 | 12,467 – 15,867 | 374–476 | Grille de cartes de visite | sombre |
| 7 | **15,867** (cut) – 18,167 | 476–545 | Dossier bleu + « elles n'en envoient aucun » | sombre |
| 8 | **18,167** (cut) – 21,33 | 545–640 | Révélation logo Scalead.ai | blanc |
| 9 | 21,33 – 23,17 | 640–695 | Liste de domaines + spinners → checks | blanc |
| 10 | 23,17 – 24,33 | 695–730 | Enveloppes qui défilent | blanc |
| 11 | 24,33 – 25,77 | 730–773 | Agenda + bouton « Rejoindre » + curseur | blanc |
| 12 | 25,77 – 25,83 | 773–775 | **Iris wipe** (cercle sombre en expansion) | → sombre |
| 13 | 25,83 – 27,6 | 775–828 | 3 cartes stats (162 / 52 / 110) + flash | sombre |
| 14 | 27,6 – **28,233** (cut) | 828–847 | Dashboard « Bienvenue Laura ! » | clair |
| 15 | 28,233 – **31,233** (cut) | 847–937 | Dashboard en perspective 3D → Gmail | mixte |
| 16 | 31,233 – 33,967 | 937–1019 | Boîte Gmail + mail Scalead surligné | clair |
| 17 | 33,967 – 35,17 | 1019–1055 | Mail ouvert (carte bleue, Thierry Dubois) | mixte |
| 18 | 35,17 – **38,400** (cut) | 1055–1152 | Séquences + 4 compteurs KPI | sombre |
| 19 | 38,400 – 43,5 | 1152–1305 | Entonnoir + avatars | blanc |
| 20 | 43,5 – **46,567** (cut) | 1305–1397 | Visio (fenêtre navigateur, ✓ / ✗) | blanc |
| 21 | 46,567 – 48,03 | 1397–1441 | Fiche contact Lucas Maycock (perspective) | sombre |
| 22 | 48,03 – **50,967** (cut) | 1441–1529 | Bulles de chat + curseur | sombre |
| 23 | 50,967 – 52,5 | 1529–1575 | Agenda saturé de créneaux bleus | blanc |
| 24 | 52,5 – 55,4 | 1575–1662 | Graphe 110 → 206 + chips avatars + mois | sombre |
| 25 | 55,4 – 56,6 | 1662–1698 | « 90 clients accompagnés » + logos | sombre |
| 26 | 56,6 – **58,600** (cut) | 1698–1758 | « 10 500 leads qualifiés générés » | sombre |
| 27 | 58,600 – **59,667** (cut) | 1758–1790 | « Avec une garantie sur les résultats. » | sombre |
| 28a | 59,667 – 64,0 | 1790–1920 | CTA cinétique « Réserve un appel… éligible à notre programme. » | blanc |
| 28b | 64,0 – 67,633 | 1920–2029 | Carte finale logo + bouton « Recevoir des RDV qualifiés » | blanc |

---

## 4. Détail par scène

### Beat 1 — Radar (0,000 → 1,867)
- Fond `#FFFFFF` plein cadre.
- 3 anneaux concentriques translucides bleu très pâle (`#E8F4FD` @ ~25 %), bord légèrement plus dense, + un cercle intérieur.
- Réticule : 2 diagonales + 1 verticale, trait 1 px `#C8D8F8`.
- **Balayage sonar** : secteur angulaire dégradé (bleu gris translucide → transparent), rotation **≈ 0,77 tour/s** (≈ 1,3 s/tour), sens horaire.
- **10 points** bleus `#1878EC`, ø 26 px, anneau blanc 6 px + halo doux, répartis sur les anneaux à des rayons/angles fixes.
- **Mouvement** : dézoom `easeOutQuint` 0,067 → 0,767 s (rayon 947 → 448 px), puis léger re-zoom linéaire jusqu'à 1,83 s (448 → 507 px).
- Les points **disparaissent progressivement** (fade + scale ↓) entre t ≈ 0,55 et t ≈ 1,30 ; à 1,33 s il n'en reste aucun.
- Transition vers le beat 2 : **fondu/morph rapide** sur ~0,35 s (pic de diff à f=56, décroissance jusqu'à f=66) — pas un cut.

### Beat 2 — Horloge + typo cinétique (1,867 → 3,600)
- Fond `#FFFFFF`.
- **Horloge** (valeurs corrigées, décodage aligné) : centre **x = 963**, **y = 933**, **rayon 568 px**
  (soit, en fraction de la page 16:9 : cx 0,5016 · cy 0,864 · r 0,2958). Elle déborde largement
  en bas du cadre. Dans la fenêtre navigateur elle se stabilise à cx 0,467 · cy 0,782 · r 0,332.
  - Anneau épais ~48 px, **dégradé vertical `#83B8F8` (haut) → `#4694F2` (bas)**.
  - Cadran `#FAFAFA`.
  - 12 index rectangulaires noirs (`#111`), les 4 cardinaux plus longs.
  - Aiguilles heures/minutes noires, épaisses, bouts carrés ; **trotteuse fine bleu clair** `#5FA8F5`.
  - **Les aiguilles tournent vite et accélèrent** (le temps qui file) — plusieurs tours sur 1,7 s.
- **Texte** : `tu n'avais pas le temps` en **`#307FED`**, `de prospecter ?` en **`#010101`**, une ligne, centrée, y ≈ 225, ~62 px, poids 600.
  - Révélation **lettre par lettre décélérante** : ~10 car. sur les 0,17 s initiales puis ralentissement (3 car./0,17 s en fin). ≈ 34 caractères en 1,0 s.
  - Chaque lettre : opacité 0→1, scale 1,5→1, sur ~0,2 s ; les dernières restent visiblement plus claires/plus grandes.
- L'horloge **descend légèrement** et grossit pendant la scène.

### Beat 3 — Fenêtre navigateur (3,633 → 5,767)
- Le plan blanc précédent devient le **contenu d'une fenêtre macOS**, sur fond `#11171C` avec **halo radial bleu** `#123357` centré bas.
- Chrome : barre de titre `#2C3238`, hauteur ≈ 62 px, coins arrondis 18 px haut ; 3 pastilles ø 20 px `#FF5F57` / `#FEBC2E` / `#28C840`, à x ≈ 392/440/488 (au départ).
- **Dézoom mesuré** (corrigé) : la page passe de **x 27..1891 / y 29..1075** à
  **x 349..1568 / y 224..907** (largeur 1864 → 1219) entre f=109 et f=151, en **easeOutCubic**,
  puis **immobile**. À partir de f=157 la fenêtre glisse vers le bas en **easeInCubic**
  (déltas mesurés depuis 227 : +16 à f160, +53 à f163, +117 à f166, +232 à f169, +498 à f172).
- À t ≈ 5,40 s : **overlay pause** — disque gris `#8A8A8A` @ 55 %, ø ≈ 300 px, 2 barres blanches arrondies, apparition en scale-up + fade (~0,25 s).
- Cut franc à **5,767**.

### Beat 4 — « Parce que ça ne sert à rien de pleurer sur le passé » (6,033 → 7,833)
- Fond `#11171C` + halo radial bleu bas `#122238`.
- Ligne unique centrée, y ≈ 545, ~64 px, poids 600, blanc `#FFFFFF`, **`passé` en `#3B8CF5`**.
- **Défilement horizontal** : les mots arrivent par la droite, très grands, se réduisent en se calant ; la ligne translate vers la gauche en continu pour rester centrée sur le mot courant.
- Fin de phrase figée de t ≈ 7,30 à 7,80 (palier de 0,50 s mesuré — `diff < 0,6`).

### Beat 5 — Parcours 5 étapes (7,833 → 12,467)
- Fond `#11171C` + halo bleu bas.
- **Travelling linéaire droite→gauche, 651 px/s** (mesuré, rms 0,041).
- **Chemin** : courbe sinusoïdale blanche, trait ~5 px, `#FFFFFF`, qui se **dessine** en avance sur la caméra.
- **5 nœuds** : tuile blanche arrondie 96×96 px, rayon 26 px, **halo blanc diffus** (glow ~40 px), glyphe bleu `#2E86F1` centré :
  1. bulle de chat — « Mise en place »
  2. loupe — « Trouver des prospects »
  3. enveloppe — « Rédaction des messages »
  4. drapeau — « Suivi des réponses »
  5. téléphone — « Relancer »
- **Numéro fantôme** derrière chaque nœud : chiffre 1–5, ~190 px, poids 700, `#FFFFFF` @ ~6 %.
- Label : blanc, 54 px, poids 600, révélé **mot par mot** (fade + léger slide), alterné au-dessus/en dessous du nœud selon la position sur la courbe.
- L'**horloge du beat 2** rentre par la gauche à t ≈ 7,9 puis sort ; elle **revient par la droite** à t ≈ 11,3 (raccord visuel).

### Beat 6 — Cartes de visite (12,467 → 15,867)
- Cartes blanches `#FFFFFF`, ~470 × 240 px, rayon 22 px, ombre portée douce.
  - Avatar circulaire ø 84 px, centré haut.
  - Nom : 26 px, poids 700, noir.
  - Rôle : 17 px, gris `#6B7280`.
  - Séparateur fin, puis ligne `email • +33 …` en 14 px gris, avec **puce bleue** `#1878EC`.
- Noms relevés : Lucas Martin (Chef de projet), Lucas Maycock (CEO, Clickland), Jules Lefevre (Chef de projet), Robin Tessier (CEO, YASKA WEB), Laurent (CEO, Deco and pro), Romain Iamurey (Fondeur, RLM Agency), Camille Mercier (Spécialiste SEO).
- **Mouvement** (corrigé) : **aucun dézoom** — la carte fait 640 × 392 px à l'écran d'un bout
  à l'autre. Ce qui se passe est un **panoramique vertical** : « Lucas Martin » est à y=160 px
  à f=390 et à y=973 px à f=430, soit un défilement du contenu vers le bas d'environ 20 px/frame,
  pendant que les autres cartes arrivent en cascade décalée. Rotations Z de −7° à +15°.
- Cut franc à **15,867**.

### Beat 7 — Dossier bleu (15,867 → 18,167)
- Fond `#11171C`, vignette légère.
- **Dossier** : forme à onglet, **dégradé vertical `#4195F8` → `#79B6FF`**, largeur ~1250 px, coins arrondis 26 px, monte depuis le bas puis se stabilise en descendant légèrement.
- Texte au-dessus : `elles n'en envoient` blanc + **`aucun`** en `#4694F2`, ~64 px, poids 600, révélé lettre par lettre.
- **Particules** : petits avions en papier noir/blanc (~5 unités) qui s'échappent du dossier en arcs.

### Beat 8 — Logo Scalead.ai (18,167 → 21,33)
- Fond blanc `#FFFFFF`.
- Le glyphe (hexagone isométrique « S » stylisé, `#2E86F1`) **arrive minuscule et pivote** (~-40°) en grossissant : scale 0,05 → 1, rotation → 0, `easeOutQuint`, ~0,9 s.
- **Halos concentriques** `#DDECFD` / `#C0DDFF` qui pulsent en expansion derrière.
- Wordmark `Scalead` (noir 700) + `.ai` (gris 500), 62 px, révélé lettre par lettre après le glyphe, sous celui-ci.
- Puis le lockup **glisse à droite** et le wordmark disparaît pour le beat 9.

### Beat 9 — Domaines (21,33 → 23,17)
- 3 pilules blanches `#FFFFFF`, ombre douce, ~430 × 62 px, rayon 16 px, empilées à gauche (x ≈ 90…520, y ≈ 330 / 445 / 560).
- Texte 26 px poids 500 noir : `votre-entreprise.net` / `.com` / `.org`.
- À droite de chaque pilule : **spinner circulaire bleu** (arc de 270°, rotation continue) qui **se transforme en pastille de validation** `#1878EC` avec ✓ blanc — en **stagger** (.net → .com → .org), chacun ~0,25 s, scale 0,6 → 1,15 → 1 (léger overshoot).
- Le logo reste à droite, entouré d'un **cadre arrondi bleu qui se dessine** (path draw).

### Beat 10 — Enveloppes (23,17 → 24,33)
- 3–4 enveloppes blanc bleuté `#EAF2FD` avec rabat en V, ~330 × 200 px, rayon 14 px, ombres douces.
- Elles **traversent** de bas-droite vers haut-droite, en parallaxe (3 vitesses), pendant que le logo tient à gauche.

### Beat 11 — Agenda + clic (24,33 → 25,77)
- Lignes d'agenda : pilules `#F2F6FB`, ~1100 × 110 px, rayon 18 px, légèrement inclinées (−2°) et en perspective.
- `11:15` … `15:30` en 46 px poids 700 noir ; `Réunion avec Hugo Moreau / Raphaël Garcia / Jean Dumont / Théo Dubois / Lucas Bernard` en 40 px poids 500.
- Défilement vertical + **zoom avant** continu.
- **Bouton « Rejoindre »** : pilule, **dégradé `#2E86F1` → `#5CA6FF`**, ~200 × 66 px, texte blanc 26 px.
- **Curseur** flèche noire `#2D2D2D` avec liseré blanc 4 px et ombre ; il descend vers le bouton, puis :
  - t ≈ 25,4 : **ripple** — 2 cercles bleus concentriques en expansion + fade, et le bouton fait `scale 1 → 0,94 → 1`.
- Puis « **Simple, non ?** » (`Simple,` bleu `#3B8CF5`, `non ?` noir) apparaît au centre avec une **pastille ✓ bleue** qui pop entre les deux mots.

### Beat 12 — Iris wipe (25,77 → 25,83)
- Disque `#11171C` centré qui **s'étend** de ø 0 à plein cadre en ~4 frames (0,13 s), easeIn.

### Beat 13-18 — Séquence produit (25,83 → 38,40)
Ces beats montrent l'**interface réelle du produit** (dashboard Scalead, Gmail, éditeur de séquences).
- **13** — 3 cartes blanches (`Nombre Total De Prospects 162`, `Non Qualifié 52`, `Nouveaux Prospects 110`), icône carrée bleu clair `#4FAEF5` rayon 12 px ; elles arrivent en décalé depuis la droite puis s'alignent ; **flash blanc** plein cadre à t ≈ 27,2.
- **14/15** — dézoom sur le dashboard complet « Bienvenue Laura ! », puis **rotation 3D** (rotateY ≈ −25°, rotateX ≈ 8°, perspective ~1400 px) avec flou de mouvement, transition vers Gmail.
- **16** — boîte Gmail en perspective qui **se remet à plat**, puis un mail `Scalead — 🚀 Multipliez vos revenus par 10 AUJOURD'HUI !!!` **s'insère** en haut de liste, surligné `#E8F0FE` avec liseré bleu.
- **17** — mail ouvert : carte bleue `#1878EC`, texte blanc **révélé ligne par ligne** ; puis carte blanche de réponse (`Client — 34willy34@gmail.com`).
- **18** — deux fenêtres de séquences empilées (perspective) + **4 cartes KPI** à droite avec **compteurs animés** :
  `Prospects Contactés 4777 → 5097`, `Réponses Reçues 7 → 29`, `Leads Intéressés 2082 → 3215`, `Leads Qualifiés 6 → 25`.
  Les compteurs montent en ~2 s, `easeOutQuart`. Une **vague bleue** monte en bas à droite.

### Beat 19 — Entonnoir (38,40 → 43,5)
- Fond blanc.
- **9 avatars** ronds ø 130 px, anneau bleu `#1878EC` 8 px + anneau blanc, disposés en cercle ; ils **tournent lentement** puis sont **aspirés**.
- Un **entonnoir** apparaît : deux courbes de Bézier symétriques, remplissage `#93C4FF` (extérieur) et `#4F9DF9` (intérieur), qui se rétrécit vers la droite.
- **Travelling avant** continu jusqu'à ne laisser qu'un seul avatar dans le goulot.
- **Flash blanc** à t ≈ 43,4.

### Beat 20 — Visio (43,5 → 46,567)
- Fenêtre navigateur (même chrome qu'au beat 3, barre `#2C3238`), contenu `#F4F9FF`, **bord bleu clair 10 px**.
- 2 avatars ø 260 px, anneau `#1878EC` 10 px.
- Badge **✓ blanc sur `#1878EC`** qui pop sur l'avatar droit (t ≈ 45,3), puis badge **✗** sur l'avatar gauche (t ≈ 46,0) + curseur + ripple concentrique orange/bleu.

### Beat 21 — Fiche contact (46,567 → 48,03)
- Fond `#11171C` + halo bas.
- Carte blanche ~880 × 480 px, rayon 26 px, arrivant en **perspective** (rotateY ≈ 18°, rotateX ≈ −6°) qui se **remet à plat** en ~0,8 s `easeOutCubic`.
- Contenu : avatar ø 66 px, `Lucas Maycock` 32 px/700, `CEO • Clicknland` 20 px gris ; puis lignes label/valeur :
  `Nombre d'employés 4`, `Entreprise Clicknland`, `Poste Fondateur`, `Chiffre d'affaires 2.5M €`, `Numéro de téléphone +33 601020304` (label et valeur en bleu `#3B8CF5` sur la dernière ligne).

### Beat 22 — Bulles de chat (48,03 → 50,967)
- Bulle bleue `#1878EC`, texte blanc 30 px : « Je suis disponible le mercredi à 13h00 », queue en bas à gauche.
- Bulle blanche `#FFFFFF`, texte noir : « Parfait, je vous envoie une invitation », queue en bas à droite.
- Entrée : scale 0,85 → 1 + fade, `easeOutBack` léger, décalées de ~0,4 s.
- Puis **curseur main** + ripple sur la première bulle, et une **barre grise translucide** glisse derrière (transition vers le beat 23).

### Beat 23 — Agenda saturé (50,967 → 52,5)
- Fond blanc, grille horaire `10:00` → `16:00` (48 px/700 noir).
- **Créneaux** : pilules `#1878EC`, rayon 12 px, texte blanc 30 px (`Réunion avec Sophie Martin`, `Réunion de suivi avec Johnny Bravo`, `Réunion avec Lucas Petit`, `Réunion avec Thibault Garnier`, `Réunion avec John Martin`, `Réunion avec l'équipe juridique`, `Réunion avec Camille Laurent`…), largeurs variables, plus quelques pilules grises `#E9EBEE` en colonne 2.
- **Défilement vertical** + léger dézoom ; les créneaux se **remplissent** en cascade.

### Beat 24 — Graphe de croissance (52,5 → 55,4)
- Fond `#11171C`.
- **Grand nombre** en haut à gauche : compteur `110 → 158 → 206`, ~190 px, poids 700, **dégradé blanc → `#1878EC`** avec **glow bleu** derrière.
- **Courbe** : aire remplie bleue (`#1878EC` → transparent) sous une ligne blanche/bleue, montant de gauche à droite, **path draw** synchronisé avec le compteur.
- **Chips** : pilule blanche rayon 20 px avec avatar ø 30 px + nom (`Lucas Maycock`, `Laurent`, `Nash Laurent`, `Camille Moreau`, `Robin Tessier`), qui **pop** au fil de la courbe.
- **Axe des mois** : pilules bleues `#1878EC` (`Mars`, `Avril`, `Mai`, `Juin`, `Juillet`), texte blanc 28 px, qui défilent vers la gauche.

### Beat 25 — « 90 clients accompagnés » (55,4 → 56,6)
- Texte 78 px poids 700 : `90 clients` en bleu clair lumineux (`#8FC8FF` avec **glow**), `accompagnés` en blanc.
- **Bandeau de logos clients** : ~9 pastilles rondes ø 62 px qui **défilent horizontalement** derrière/sous le texte, saturation réduite.
- Apparition du texte mot par mot avec **flare lumineux** balayant.

### Beat 26 — « 10 500 leads qualifiés générés » (56,6 → 58,60)
- Fond `#11171C`.
- Deux lignes centrées : `10,500 leads qualifiés` / `générés`, ~150 px puis 96 px, poids 700.
- `10,500` en bleu `#5CBAFA`, le reste blanc, avec **fort glow bleu** et un **léger travelling 3D** (le texte arrive légèrement en perspective et se redresse).
- Révélation mot par mot, chaque mot avec un **flash** à l'apparition.

### Beat 27 — « Avec une garantie sur les résultats. » (58,60 → 59,667)
- Même traitement : `Avec une garantie` puis `sur les` blanc + **`résultats.`** en `#5CBAFA` avec glow.
- Palier mesuré de 0,73 s (t = 58,90 → 59,63) avant le cut.

### Beat 28a — CTA cinétique (59,667 → 64,0)
- Fond blanc.
- Phrase : **`Réserve`** en `#3B8CF5`, `un appel avec nous pour voir si ton offre est` en noir, **`éligible`** en `#3B8CF5`, `à notre programme.` en noir.
- ~66 px poids 600, révélation **mot par mot** avec le mot courant plus grand (scale ~1,35 → 1) et légèrement décalé en y ; la ligne **recentre** en continu.
- Mesure : croissance de la boîte de texte ≈ 48 px/frame (espace master), `x0` fixe puis recentrage à partir de t = 60,53 s.

### Beat 28b — Carte finale (64,0 → 67,633)
- Fond blanc avec **deux arcs** (haut et bas) : grands cercles de rayon ~1700 px, trait 1,5 px `#B9D6F7`, remplissage `#F0F6FE` très pâle — ils **entrent** depuis le haut/bas.
- Lockup centré : glyphe 96 px + `Scalead` noir 700 / `.ai` noir, ~92 px total, révélé lettre par lettre.
- Bouton : pilule **dégradé `#2882ED` → `#5CA6FF`**, ~420 × 74 px, rayon 37 px, ombre bleue ; icône téléphone + `Recevoir des RDV qualifiés` blanc 26 px.
- **Curseur** en bas à droite du bouton, immobile.
- Palier final : **2,67 s totalement figé** (t = 64,93 → 67,60, mesuré `diff < 0,6`).

---

## 5. Ce qui est reproductible à l'identique — et ce qui ne l'est pas

| Catégorie | Beats | Reproductibilité |
|---|---|---|
| **Motion design pur** (formes, typo, courbes, chemins) | 1–12, 19, 21–28 | **Élevée** — tout est vectoriel/procédural |
| **Interfaces produit reconstruites** | 13–18, 20, 23 | **Moyenne** — il faut recréer le dashboard Scalead et Gmail écran par écran |
| **Photos réelles** (12 avatars, 9 logos clients) | 6, 19, 20, 24, 25 | **Impossible sans les fichiers d'origine** — substituts requis |
| **Captures d'écran réelles** (Gmail) | 16 | **Impossible à l'identique** — reconstruction approchée |

---

## 6. Fichiers de travail

| Chemin | Contenu |
|---|---|
| `ref/download/video.mp4` | source TikTok (720×1280) |
| `ref/c6/0001…0406.jpg` | 406 frames du contenu 16:9 (720×405) à 6 fps — `t = (n−1)/6` |
| `ref/pass1/` | 135 frames pleine hauteur 9:16 à 2 fps |
| `ref/signal.json` | différence inter-frame + luma moyenne, 2028 valeurs |
| `tools/geom.py` | mesure du letterbox |
| `tools/cuts.py` | détection des coupes et des paliers |
| `tools/palette.py` | palette par scène |
| `tools/colors.py` | échantillonnage ponctuel |
| `tools/track.py` | tracking numérique des courbes d'easing |

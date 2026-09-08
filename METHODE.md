# Méthode — comment la fidélité a été poussée

Ce document explique *comment* on mesure et *pourquoi* certaines erreurs étaient
invisibles à l'œil. Le découpage du motion design est dans `ANALYSE.md`.

---

## 1. Le plancher : 0 % est physiquement impossible

La source est un HEVC compressé. Deux images consécutives d'un **plan strictement
fixe** diffèrent déjà de **4,84/255**. C'est du bruit de compression, pas du
mouvement.

Pour chiffrer le plancher proprement : on prend la médiane temporelle de trois
images voisines (qui approxime l'image « propre ») et on la compare aux images
réelles. Ce que mesure ce chiffre, c'est exactement l'écart qu'obtiendrait une
reproduction **parfaite** :

| Scène | Plancher | Scène | Plancher |
|---|---|---|---|
| 1 radar | 0,88 | 7 dossier | 0,71 |
| 2 horloge | 0,73 | 8 logo | 0,19 |
| 3 navigateur | 0,99 | 9 domaines | 1,48 |
| 4 texte passé | 1,25 | 10 enveloppes | 0,32 |
| 5 parcours | 1,99 | 11 agenda | 2,45 |
| 6 cartes | 3,01 | 11b simple | 0,26 |

**Plancher global : 1,50/255 = 0,59 %.** C'est la cible réelle.

---

## 2. Le bug qui a faussé toute la première analyse

`ffmpeg` avec `crop=720:405` sur du `yuv420p` sort en réalité **404 lignes** :
la hauteur est arrondie à une valeur paire, sans avertissement. Un décodage par
lots qui suppose 405 lignes se décale donc d'**une ligne par image**.

Conséquences, toutes réelles et toutes corrigées :

- le « panoramique vertical de 2,78 px/frame » du parcours **n'existait pas** —
  1 ligne × 2,667 = 2,67 px/frame, c'était exactement l'artefact ;
- la dérive verticale du dossier n'existait pas non plus ;
- les positions verticales de l'horloge et de la fenêtre navigateur étaient
  toutes fausses (jusqu'à 300 px).

Les mesures **horizontales** n'étaient pas touchées. Tout passe désormais par
`tools/lib.py`, qui décode en 404 et met à l'échelle avec `SY = 1080/405`.

---

## 3. Ce que l'œil ne voit pas

Trois erreurs majeures étaient invisibles sur des planches côte à côte et
évidentes en carte d'erreur signée (`tools/heat.py`, rouge = trop clair,
bleu = trop sombre) ou en recherche numérique :

**a. Un décalage de 204 px sur l'agenda.** Les deux images « se ressemblaient ».
`tools/optshift.py` décale numériquement le rendu et cherche le minimum : sans
ambiguïté, contrairement à la corrélation de phase qui s'accroche au mauvais pic
sur les structures répétitives (un mur de cartes identiques) et les grands
aplats (le dossier). Deux corrections appliquées d'après la corrélation de phase
ont d'ailleurs **empiré** le score avant que la recherche directe ne les corrige.

**b. La scène des cartes n'était pas ce que je croyais.** J'avais modélisé des
cartes qui volent vers une grille fixe. En réalité c'est un **mur statique** et
une **caméra qui fouette vers le haut** puis atterrit avec un dépassement :

- déplacement mesuré par recherche exhaustive 1D sur le profil de lignes
  (robuste au flou de mouvement, là où la corrélation de phase décroche) ;
- pic à **124 px/frame** vers f=416, dépassement, stabilisation à f=436 ;
- la position monde de chaque carte se déduit alors de sa frame d'entrée — les
  positions prédites tombent **au pixel près** sur les détections (132 vs 132).

Première tentative fausse : j'avais déduit les positions de la frame de *première
détection*, or une carte n'est détectée qu'une fois déjà engagée de ~365 px.
D'où un décalage systématique de 365 px sur toutes les cartes en chute.

**c. La « dérive » finale du mur est un zoom.** L'écart entre deux cartes passe
de 912 à 995 px entre f=430 et f=474 : c'est un **zoom de 9 % centré sur
(1262, 737)**, pas une translation. Modélisé en translation, l'erreur croissait
de 28 à 59 sur la section tenue.

---

## 4. Extraire plutôt que deviner

Trois choses valent mieux extraites de la source que reconstruites :

**Les fonds.** Dans chaque scène sombre, tout le contenu est plus clair que le
fond : un percentile bas par pixel restitue donc le fond exactement, halo bleu
compris. Sur le plan sombre f174-180, la plaque extraite marque **4,00** contre
**7,14** pour mon dégradé CSS fait à la main (plancher : 3,2).

**Les avatars.** Les photos réelles découpées dans les images source battent tout
portrait synthétique, à n'importe quelle résolution d'affichage.

**Les angles d'aiguilles.** Les aiguilles tournent à plus de 180°/image : leur
mouvement réel est **irrécupérable** à 30 fps (repliement temporel — une limite
d'information, pas d'un défaut de mesure). En revanche, *où pointe chaque
aiguille sur chaque image* se mesure très bien, en projetant des rayons sur le
cadran. On rejoue ces angles : chaque image est juste, sans jamais connaître la
rotation sous-jacente.

---

## 5. Optimisation automatique

Une fois le pipeline de score en place, un rendu de 20 images prend ~3 s (bundle
en cache). Toutes les grandeurs non mesurables directement sont donc regroupées
dans `src/tunables.ts`, injectables par `--props`, et `tools/optimize.py` fait
une descente par coordonnées contre la source.

Enseignement du premier passage : **14 paramètres sur 23 butaient sur la borne
basse** de leur plage. Mes éléments étaient systématiquement trop grands et trop
marqués — un biais que je n'aurais jamais corrigé à l'œil.

Test A/B des polices sur deux scènes : Outfit 12,78 / Poppins 14,26 /
Figtree 13,36. Outfit gagne, et l'écart entre polices n'est que de ~1,5 : le
résidu est **géométrique, pas typographique**.

---

## Outils

| Fichier | Rôle |
|---|---|
| `lib.py` | décodage aligné de la bande 16:9 (le point unique de vérité) |
| `score.py` | écart global et par scène, contre le plancher |
| `heat.py` | cartes d'erreur signées source / rendu / différence |
| `optshift.py` | recherche directe du décalage résiduel par scène |
| `align.py` | idem par corrélation de phase (moins fiable, gardé pour comparaison) |
| `plates.py` | extraction des fonds réels |
| `avatars.py` | découpe des photos réelles |
| `track_cards.py` | suivi individuel des cartes |
| `trace_path.py` | traçage de la courbe du parcours |
| `optimize.py` | descente par coordonnées sur les paramètres |
| `measure2/3.py` | mesures géométriques par scène |

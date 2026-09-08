# L'Intendant — film de conciergerie

Animation de 42 s pour **L'Intendant**, conciergerie de location courte durée à
Toulouse. Version révisée d'après `Prompt.pdf`, `Prompt2.pdf`, `Prompt3.pdf`
puis `prompt4.pdf`.

## Livrables

| Fichier | Format |
|---|---|
| **`repro/out/intendant_16x9.mp4`** | **1920 × 1080 @ 60 fps**, 42 s |
| `repro/out/intendant_9x16.mp4` | 1080 × 1920 @ 60 fps |

```bash
open repro/out/intendant_16x9.mp4
cd repro && npx remotion studio      # composition "Intendant"
```

## prompt4.pdf — quatrième passage

| Demande | Traitement |
|---|---|
| « Un vrai métier » : ça coupe trop vite, on n'a pas le temps de lire | Le beat passe de 146 à **218 images**. La phrase finit de se construire à 616 et **tient 68 images (1,1 s)** avant la coupe |
| Le parcours : le fil et les chiffres | Le tracé n'est plus une spline placée à la main mais une **vraie sinusoïde** ; son dégradé s'éteint aux deux bouts (`userSpaceOnUse`, stops 0/7/50/93/100 %) donc le fil se dissout au lieu d'être tranché par le cadre, et les chiffres fantômes sont écartés de 320 px |
| Tout est trop linéaire | **`src/bezier.ts`** : le solveur cubic-Bézier tel que les navigateurs l'implémentent (Newton-Raphson, bissection en secours). Six courbes nommées — `entrance`, `camera`, `dramatic`, `pop`, `exit`, `smooth` — appliquées à chaque entrée, chaque caméra, chaque sortie. Les smoothstep symétriques donnaient un rythme uniforme ; chaque mouvement a maintenant son caractère |
| Diffusion : la course du logo pas assez fluide | La table de keyframes est remplacée par **un seul mouvement Bézier** de 112 images. Le logo part lentement, traverse avec de la vitesse, s'installe longuement. Sa taille suit exactement la même courbe, donc l'enfoncement dans la page et le déplacement ne font qu'un geste |
| Les réservations doivent arriver **plus tard** | Départ repoussé de 1496 à **1744**, quand le logo a dépassé le milieu. Elles ne pouvaient pas attendre son arrêt complet : les lignes sont parties avant, et retenir les deux laissait 20 images de page vide |
| Agenda : zoom beaucoup trop rapide, on ne comprend pas | **Le beat s'ouvre sur un plan d'ensemble tenu 100 images (1,7 s)** — les six réservations sont lisibles avant que la caméra bouge. Le rapprochement suit ensuite `EASE.camera` et ne va plus qu'à **1,22** au lieu de 2,15 |
| Les lignes doivent ressembler à de vraies réservations | Refaites : photo du voyageur, prénom, plateforme, dates, nombre de nuits, montant versé — la liste que rend un channel manager |
| L'onde de choc au clic | Supprimée. À la place la pilule s'enfonce, **passe au vert** et se réétiquette « ✓ Confirmé » : ce que fait réellement une confirmation |
| Le rond bleu mal placé entre les deux phrases | L'écart passe de ±46 à **±96 px**. À 46 la pastille de 64 px n'avait que 14 px de chaque côté et se lisait comme collée à la virgule ; elle respire maintenant dans 54 px |

Deux corrections trouvées en vérifiant les images du rendu :

- **Le cadrage du zoom.** Verrouiller la pilule au centre laissait le tiers droit
  de l'image vide — les lignes s'arrêtent avant. Le verrou est désormais exprimé
  sur le **bord droit de la ligne**, tenu à 150 px du cadre ; la position de la
  pilule en découle. La caméra converge toujours sur le clic par construction,
  et l'image reste pleine.
- **Le raccord logo → diffusion.** La scène du logo laisse la marque 44 px
  au-dessus du centre ; la diffusion la reprenait à 44 px plus bas. Elle part
  maintenant exactement où l'autre l'a laissée et redescend le long du trajet.

## Prompt3.pdf — troisième passage

| Demande | Traitement |
|---|---|
| Le texte défile encore trop vite | **26 % plus lent** : course allongée de 100 à 128 images et distance réduite |
| Parcours **cropé sur les côtés** | **Cause trouvée** : à l'échelle 0,56 la surface de dessin SVG rétrécissait avec la scène, donc le tracé et les chiffres s'arrêtaient avant les bords. Le SVG est désormais dessiné surdimensionné (`W/VIEW × H/VIEW`) dans les mêmes coordonnées monde : après réduction, il dépasse encore le cadre de tous les côtés |
| Parcours trop rapide | **28 % plus lent** : l'étendue monde et le panoramique sont mis à l'échelle 0,72 ensemble, donc le même beat couvre moins de terrain sans changer la taille des tuiles |
| Avis : ils doivent **tomber les uns sur les autres** comme dans la vidéo TikTok | **Scène source ré-examinée.** Le point que j'avais manqué : ses cartes ne forment pas une grille, elles **se recouvrent** et sont **inclinées** de −18° à +14°, chacune projetant son ombre sur celle du dessous. Le mur est reconstruit en tas : 25 cartes qui se chevauchent, ombre resserrée pour que la superposition se lise, et les dernières du tableau passent devant |
| Transition vers « Nous gérons, vous percevez » trop abrupte — *sois inventif* | **Le bouton devient la pastille.** La pilule que le curseur vient de presser gonfle jusqu'à ce que son bleu occupe tout le cadre — la coupe a lieu cachée à l'intérieur — puis ce bleu se contracte sur la coche de validation qui sépare les deux membres de phrase. Un seul objet change de taille : il n'y a plus de coupe à voir. Le texte est ancré sur ce point précis plutôt que posé en flexbox, un écart de 24 px suffisait à faire apparaître deux coches côte à côte |
| Réservations de bas en haut, un peu plus lentes | **15 % plus lent** |

## Prompt2.pdf — second passage## Prompt2.pdf — second passage

| Demande | Traitement |
|---|---|
| Le texte de l'horloge défile trop vite | Révélation étalée de 112 à 174 frames |
| Phrase « gérer une location… » : trop vite, **trop saccadée**, tout à changer, smooth et linéaire | **Réécrite de zéro.** Le heurt venait de la construction : chaque mot avait sa propre entrée (opacité, échelle, flou, décalage) — onze animations qui se déclenchaient contre une ligne qui glissait déjà. Il n'y a désormais **aucune animation par mot** : la ligne défile à vitesse constante derrière une fenêtre à bords doux. Linéaire par construction, et rien ne peut saccader puisque rien n'est décalé |
| Parcours : point de vue beaucoup plus reculé | Recul porté de 0,78 à **0,56** |
| Avis : exactement la physique de la vidéo TikTok | **La vraie courbe de la source.** Ce mouvement avait déjà été mesuré image par image lors de la rétro-ingénierie du film Scalead — recherche exhaustive 1D sur le profil de lignes pour la phase rapide, template matching pour l'atterrissage. C'est donc sa rampe, son pic à 124 px/frame, son dépassement et son retour, remappés de 30 à 60 fps et mis à l'échelle du mur |
| Photos des gens pas réalistes | Portraits **512 px** (4× la résolution des vignettes précédentes) |
| Le logo tremble tout du long | **Cause trouvée** : le « I » était un `<text>` SVG dans une police jamais chargée. Il retombait sur une police système et se re-rastérisait à chaque frame pendant que la marque changeait d'échelle. Redessiné en tracés — déterministe, plus aucune dépendance à une police |
| Onde bleue autour du logo | Supprimée |
| Onde verte de la scène suivante | Supprimée |
| Le zoom de l'agenda ne converge pas sur le clic | **Le panoramique est maintenant résolu depuis le bouton** au lieu d'être posé en keyframes : les deux valeurs calculées sont exactement celles qui maintiennent la pilule au point de mire pendant que le zoom grandit. La caméra converge sur le clic par construction |
| Zoom trop rapide | 0,84 → **1,45** au lieu de 0,84 → 2,15 |
| Dernière scène : enlever souris, bouton et clic | Supprimés. Restent le lockup, un filet, la ligne d'offre et le numéro, sur des rampes plus longues et décalées |

## Les 18 demandes du Prompt.pdf

| # | Demande | Traitement |
|---|---|---|
| 1 | Boussole : revenir au bleu | Palette entière migrée vers les bleus **mesurés sur le film Scalead** (`#1878EC` en primaire), donc parenté exacte |
| 2 | Aiguilles plus lentes | Rotation ramenée de `0,90·t + 0,26·t²` à `0,52·t + 0,13·t²` |
| 3 | Transition boussole → horloge trop abrupte | Vrai **morphing** : le disque migre vers le centre et le rayon exact du cadran (0,895 H / 0,275 W) en se dissolvant. Ce n'était qu'un fondu croisé |
| 4 | Les mots arrivent violemment | Le coupable était le **scale d'entrée** (1,42 sur les lettres, 1,70 sur les mots). Ramené à 1,06 / 1,08, remplacé par une montée douce et un flou qui se résorbe |
| 5 | Les symboles se superposent aux chiffres | Chaque chiffre fantôme est repositionné **du côté opposé à son libellé** — au-dessus si le texte est en dessous, et inversement. Collision structurellement impossible |
| 6 | Thème orange/marron « type Claude » → bleu | Fait, y compris les couleurs codées en dur que la migration automatique avait manquées (anneau de l'horloge, fond de carte, épingles) |
| 7 | Parcours : plus dézoomé | Plan reculé (porté ensuite à 56 % au second passage) |
| 8 | Avis : vraies photos + vrai design Google | Refait : photo ronde, nom, « il y a N mois », étoiles ambre `#FBBC04`, logo Google quadricolore. **Voir la réserve ci-dessous** |
| 9 | La clé fait « slop IA » | Halo supprimé (c'était lui le coupable), avions en papier supprimés, clé redessinée en proportions fines avec une seule ombre portée |
| 10 · 17 | Mettre le logo fourni | Losange + « I » sérif, revectorisé pour rester net et pouvoir s'inverser sur fond sombre. Présent sur les 4 scènes concernées |
| 11 | Scène Airbnb : autre thème, checks verts | Halo vert, validations `#16A34A`, spinners bleus. C'est la variation de couleur autorisée |
| 12 | Coupure inutile entre diffusion et réservations | Les deux scènes sont **fusionnées** : le logo suit une seule trajectoire continue, les lignes sortent quand il passe, la pluie démarre derrière. Plus aucune coupe |
| 13 | La souris clique à côté du bouton | Le curseur est désormais **projeté depuis la géométrie du bouton** à travers la même transformation caméra. Il tombe dessus par construction, plus par réglage manuel |
| 14 | Thème orange sur toute l'animation | Fait |
| 15 | Retirer complètement la scène des chiffres | Supprimée, timeline recalée |
| 16 | Dernière scène à refaire | Refaite : lockup centré, filet fin, un seul CTA, contact. Les deux arcs et la carte teintée ont sauté |
| 18 | Rendre linéaires toutes les animations brutales | Voir ci-dessous |

## Fluidité (instruction 18)

Le moteur d'interpolation lissé du projet — cubique monotone (PCHIP) puis filtre
gaussien — s'applique à chaque table de mouvement, et les `easeOut` qui
démarraient d'un coup ont été remplacés par `softOut` (vitesse nulle au départ).

Saut d'accélération par image, table par table :

| Mouvement | lissé (moy / max) | linéaire (moy / max) |
|---|---|---|
| Boussole — rayon | 0,27 / 4,55 | 0,25 / 13,33 |
| Parcours — pan X | 0,08 / 0,88 | 0,07 / 3,06 |
| Avis — chute (courbe source) | 1,70 / 12,40 | 1,62 / 35,00 |
| Clé — montée | 0,29 / 6,44 | 0,20 / 9,71 |
| Diffusion — trajet du logo | 0,10 / 0,52 | 0,08 / 6,72 |
| Agenda — zoom | 0,06 / 0,58 | 0,03 / 2,58 |

Maxima **3 à 13× plus bas** qu'en interpolation linéaire.

Trois raccords entre scènes ont aussi été soudés : le logo garde sa position et
sa taille exactes de part et d'autre de la coupe diffusion, le halo passe du
bleu au vert progressivement au lieu de changer d'un coup, et le curseur inutile
de la scène « Nous gérons, vous percevez » a été retiré.

## ⚠️ Réserve sur les photos des avis

Les **textes** des avis sont authentiques (page Google de L'Intendant). Les
**visages** ne le sont pas : ce sont des portraits d'une banque d'images publiée
pour les maquettes (portraits 512 px).

Associer un visage inconnu à « Margaux Reymond — Avis Google » laisse entendre
que cette personne est l'autrice de l'avis, ce qui est faux. Dans une vidéo
publiée pour une entreprise réelle, c'est une petite tromperie.

Deux sorties propres, au choix :

1. les vraies photos des clients concernés, avec leur accord ;
2. les **pastilles à initiales** que Google affiche lui-même pour les comptes
   sans photo — plus authentique, et une ligne à changer dans `Reviews.tsx`.

Dis-moi et je bascule.

## Structure — 12 beats

| # | Beat | Fond |
|---|---|---|
| 1 | Toulouse vue du ciel, les biens gérés | blanc |
| 2 | « combien d'heures passez-vous sur votre location ? » | blanc |
| 3 | La scène se révèle être un écran | sombre |
| 4 | « gérer une location courte durée, c'est un vrai métier » | sombre |
| 5 | Les 5 services, travelling | sombre |
| 6 | La pluie d'avis Google | sombre |
| 7 | La clé — « vous ne gérez plus rien » | sombre |
| 8 | Révélation de la marque | blanc |
| 9-10 | Diffusion 4 plateformes → pluie de réservations (continu) | blanc |
| 11 | L'agenda : plan d'ensemble, puis clic « Confirmer » → vert | blanc |
| 11b | « Nous gérons, vous percevez. » | blanc |
| 12 | Carte finale | blanc |

## Code

```
repro/src/bezier.ts     solveur cubic-Bézier + les six courbes du film
repro/src/intendant/
  theme.ts              palette bleue, typos, frontières de beats
  Video.tsx             timeline
  components/           Brand (logo fourni), Glyphs, Grounds, Type
  scenes/               un fichier par beat
repro/public/people/    portraits des avis
```

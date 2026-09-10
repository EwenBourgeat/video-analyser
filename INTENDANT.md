# L'Intendant — film de conciergerie

Animation de 41,2 s pour **L'Intendant**, conciergerie de location courte durée à
Toulouse. Révisée d'après `Prompt.pdf`, `Prompt2.pdf`, `Prompt3.pdf`, `prompt4.pdf`,
puis une nouvelle lecture image par image de la vidéo de référence.

## Livrables

> **Branche `red-version`** — variante rouge de ce film. Le montage, les timings
> et les animations sont **identiques à `main`** : seule la palette change.
> Les rendus portent un nom distinct pour que la version bleue reste intacte
> sur le disque.

| Fichier | Format |
|---|---|
| **`repro/out/intendant_red_16x9.mp4`** | **1920 × 1080 @ 60 fps**, 41,2 s |
| `repro/out/intendant_red_9x16.mp4` | 1080 × 1920 @ 60 fps |

### La palette rouge

Références client : **`#941101`** (primaire) et **`#400106`** (fond sombre).

`#941101` est en `hsl(7°, 99 %, 29 %)` — nettement plus sombre que le bleu qu'il
remplace, qui était à 51 % de luminosité. Une bascule de teinte à luminosité
constante aurait donc assombri tout le film. L'échelle est reconstruite en teinte
7–16°, avec les luminosités ajustées **par rôle** :

| Clé | Valeur | Rôle |
|---|---|---|
| `blue600` | **#941101** | la référence, telle quelle |
| `blue500` | #AB1D07 | |
| `blue450` | #BE290E | |
| `blue400` | #D13415 | anneau du cadran, dégradés |
| `blue350` | **#EA907B** | accent sur fond sombre |
| `blue300` → `blueWash` | #EEA796 → #FDF5F2 | teintes claires |
| `paperDark` | **#400106** | le fond sombre |

**Le seul point qui a demandé un calcul :** `blue350` porte le texte d'accent sur
fond sombre (« un vrai métier », « plus rien », « AVIS GOOGLE »). La valeur
dérivée naïvement donnait un contraste WCAG de **4,94** contre les **7,18** de
l'ancien accent bleu — le texte aurait été sensiblement moins lisible. La
luminosité a été cherchée pour égaler ce contraste : `#EA907B` donne **7,16**.

Les lueurs du fond sombre deviennent des braises (`rgba(198,58,32)` au cœur), les
ombres portées passent de froides à chaudes, et les gris de l'encre sont
réchauffés.

### Non touché, volontairement

- Le **G de Google** (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`) et les
  **étoiles ambre** (`#FBBC04`) : ce sont les marques de Google.
- Les **pastilles macOS** de la fenêtre du navigateur.
- Le **vert de validation** (`#16A34A`) : couleur sémantique, pas de thème. Sur
  un film rouge ce complémentaire ressort fortement — à arbitrer si l'on préfère
  une coche neutre ou rouge foncé.

### Pourquoi les clés s'appellent encore `blue*`

Elles contiennent des rouges. C'est délibéré : garder les noms fait de cette
branche un **diff de couleurs pur** (8 fichiers, 58 insertions), qui peut suivre
`main` sans conflit sur les quinze fichiers de scènes. Les renommer coûterait une
cinquantaine d'éditions et rendrait tout rebase pénible.

## Livrables de `main` (version bleue)

| Fichier | Format |
|---|---|
| **`repro/out/intendant_16x9.mp4`** | **1920 × 1080 @ 60 fps**, 41,2 s |
| `repro/out/intendant_9x16.mp4` | 1080 × 1920 @ 60 fps |

```bash
open repro/out/intendant_16x9.mp4
cd repro && npx remotion studio      # composition "Intendant"
```

## Neuvième passage — l'aiguille des secondes, et le trou après le 5e service

### L'horloge tournait 45 tours par seconde

Signalée comme « on dirait un bug » — et c'en était un, au sens mécanique.
L'ancienne loi (`clockSeconds = 200t + 240t²`) donnait :

| | Vitesse du trotteur |
|---|---|
| Début du beat | **3,3 tours/seconde** |
| Milieu | 23 tours/s |
| Fin | **45 tours/seconde** |

Aucune aiguille n'est lisible à ces vitesses : ce n'était plus une horloge qui
s'emballe, c'était un artefact. Sur le beat entier le trotteur faisait **125
tours**.

Nouvelle loi : **`clockSeconds = 60t + 23t²`**. Elle démarre à **1 tour/seconde**
— lisible — et monte à 5, soit **15,6 tours sur le beat au lieu de 125**. Huit
fois plus lent. Les rapports d'engrenage 720:60:1 sont inchangés, donc l'aiguille
des minutes balaie toujours 93° et l'horloge reste cohérente avec elle-même.

### Le trou entre le « Reporting mensuel » et les avis

C'est une publicité : le temps mort est là où l'attention se perd. Le fouet
démarre désormais **75 images plus tôt** (f1070 au lieu de f1145) et va plus vite
(**44 px/image** au lieu de 34). La 5e étape n'est plus contemplée en train de
sortir — dès son libellé posé, on repart.

| Repère | Après le libellé du 5e service |
|---|---|
| Le fouet démarre | +0,23 s |
| Cadre vide | +0,87 s |
| Première carte d'avis | +1,07 s (vide de 0,20 s) |
| **Cadre plein d'avis** | **+1,85 s** (contre +3,25 s) |

**43 % de temps mort en moins.** Contrôles : raccord caméra **0,00 px**, 44,00
px/image des deux côtés, accélération **0,0196** au démarrage du fouet (donc pas
d'à-coup), et les 5 stations arrivent toujours à **0,0 px** — le fouet plus
précoce ne les perturbe pas. À 44 px/image une carte de 560 px se déplace de 8 %
de sa largeur par image : toujours pas de stroboscopie.

Film à **2468 images = 41,2 s**.

## Huitième passage — du rythme, et un film qui se déplace au lieu d'additionner des scènes

Demande de principe : « je ne veux pas une addition de scènes, je veux qu'il y ait
le sentiment qu'on se déplace sur un grand fond ».

### Les avis : 10 s → 4 s, caméra jamais nulle

Le maintien de 3,47 s, la construction sur place (volet, contenu, étoiles) et la
rampe d'accélération sont supprimés. Les cartes ne sont plus animées du tout :
ce sont des objets posés dans le monde à `R0 + i × PITCH`, et c'est la caméra
qui les croise. `Reviews.tsx` a perdu la majorité de son code.

**Le coup de fouet.** La caméra ne ralentit plus à la fin du travelling : elle
**accélère**, de 12,3 à 34 px/image, traverse le vide à cette vitesse, puis
décélère jusqu'à 8 sur les avis.

Ce n'est pas un effet de style, c'est de l'arithmétique. Une rangée qui entre par
la droite doit parcourir **une largeur de cadre entière — 1920 px** — avant que
trois cartes soient visibles :

| Vitesse | Temps pour remplir le cadre |
|---|---|
| 8 px/image | **4,00 s** — soit la durée entière du beat |
| 20 px/image | 1,60 s |
| **34 px/image** | **0,94 s** |

À 8 px/image le cadre ne se remplissait qu'à sa dernière image — un défaut que
les mesures de raccord ne pouvaient pas révéler, seule la planche de contrôle
l'a montré. La vitesse ne coûte rien pendant la traversée du vide puisqu'il n'y a
rien à regarder, et 34 px/image ne déplace une carte de 560 px que de **6 % de sa
largeur par image** : ni stroboscopie ni bavure. C'est le *whip pan* que Ikea et
Nike utilisent comme raccord.

Résultat : **cadre plein à +1,10 s** au lieu de +4,00 s, 3350 px de trajet sur le
beat, 5,4 cartes défilent. Une fois posée à 8 px/image, la rangée de douze cartes
boucle en 15,6 s, toujours dans la fourchette 15–25 s.

### « vous ne gérez plus rien » : −0,5 s

150 → 120 images. Décalages des tables comprimés ×0,8 — en ne touchant que le
premier élément de chaque paire `[image, valeur]`.

### Diffusion → agenda : le zoom qui traverse

**Cause de la cassure, mesurée :** le losange se figeait à `x = 518` et y restait
**112 images** avant de disparaître net. Cette immobilité comptait autant que la
coupe dans l'effet « addition de scènes ». Le beat perd 40 images, l'attente
tombe à 72.

Sur les 44 dernières images, une carte « Nouvelle réservation » cesse de monter,
se cale au centre et grandit jusqu'à ce que sa plaque blanche noie le cadre. La
coupe se cache dans ce blanc, et l'agenda en ressort en continuant le mouvement
(zoom 0,80 → 0,62 pendant qu'un voile blanc se dissipe).

**Deux réglages corrigés en visionnant :**

- croissance **quadratique et non cubique** : en cubique la carte restait quasi
  immobile 12 images — précisément l'immobilité à supprimer — et ne couvrait le
  cadre qu'une image avant la coupe ;
- **la porte n'était pas la bonne carte.** J'avais pris `Booking.com`, qui à
  l'instant de la poussée est déjà sortie par le haut (`y = −59`) : la plaque
  semblait gonfler depuis le bord supérieur. En calculant la position des six
  cartes à cet instant, `Expedia` est à **y = 543, le centre du cadre à 3 px
  près**. Et le recentrage a désormais sa propre base de temps, rapide, sinon il
  finissait quand la carte faisait déjà six fois sa taille.

### Navigateur → « un vrai métier »

**La fenêtre du navigateur ne quittait jamais le cadre.** Sa sortie descendait de
780 px là où il en faut 844 : la coupe la **tranchait en pleine sortie**. C'était
ça, l'abruptitude de ce raccord — un objet coupé, pas un problème de rythme.
Course portée à 940 px, elle est dehors à f458, trois images avant la coupe.

### « métier » → les 5 étapes

La sortie du texte était un fondu d'opacité. C'est désormais **l'entrée jouée à
l'envers** : les lettres repartent hors focus dans le halo surexposé d'où elles
étaient venues. Un fondu plat est justement ce qui fait lire une frontière comme
deux scènes empilées.

### Tous les fonds appariés

`Ink glow` valait 0,85 / 1 / 0,9 / 0,5 / 0,55 selon les scènes, donc la
luminosité sautait à plusieurs coupes. Toute la traversée sombre est à 0,9, puis
descend à 0,5 à l'approche des avis, et `KeyRise` passe de 0,55 à 0,5.

### Les quatre raccords, mesurés sur le rendu

| Raccord | Variation à la coupe | Variation max ailleurs |
|---|---|---|
| navigateur → « un vrai métier » | **0,0447** | 14,06 |
| « métier » → les 5 étapes | **0,2089** | 0,44 |
| 5 étapes → avis | **0,0221** | 0,27 |
| réservations → agenda | **0,0000** | 0,25 |

Dans chaque cas la variation à la coupe est plus faible que la variation
ordinaire de la séquence : les raccords sont indistinguables d'images courantes.
Celui des réservations affiche 0,0000 — images rigoureusement identiques de part
et d'autre.

Défilé des avis mesuré par corrélation : **8,00 px/image de moyenne, minimum
8,00** — il ne retombe jamais à zéro.

### Timeline

Le film passe de 49,6 s à **42,3 s** (2533 images). Décalages : **−374** sur
`KeyRise`, **−404** sur `LogoReveal` et `Diffusion`, **−444** sur `Simple`,
`EndCard` et le disque `MORPH_R`.

## Septième passage — un seul plan continu, et un beat logo allégé

### Le logo : le losange seul

Le beat affichait le losange, puis « L'Intendant », puis
« CONCIERGERIE · TOULOUSE ». C'est exactement ce que porte déjà la carte finale,
donc l'information était dite deux fois — et c'est ce texte qui fixait la durée :
2,33 s, le temps que deux lignes arrivent et se lisent. Sans rien à lire, le beat
devient une ponctuation : **1,20 s**, le losange arrive, tient une respiration,
part vers la droite.

**Contrainte préservée :** la diffusion reprend la marque à `x = W × 0,72 = 1382`
et `size = 300`. La dernière image du beat la pose à 1382 — écart mesuré
**0,4 px**, sous-pixel. Un écart ici rouvrirait la coupe que ce passage n'a plus.

### La coupure avant les avis a disparu

`Journey` freinait à f1034, plongeait vers le haut et le film coupait sur
`Reviews`. Désormais la caméra **continue vers la droite**, les 5 étapes sortent
par la gauche, le cadre se vide, et les avis se construisent là.

| Changement sur `Journey` | Pourquoi |
|---|---|
| Freinage repoussé de f1034 à **f1145** | la caméra dépasse largement l'étape 05 avant de ralentir |
| **`PAN_Y` supprimé** | plus de plongeon : la caméra ne fait que translater |
| Fil **borné à `PATH_END = 5040`** | c'était le verrou : le fil était dessiné jusqu'à `camX + 1150`, une colonne fixe **du cadre**, donc il restait à l'écran à toute position de caméra et le cadre ne pouvait jamais se vider |
| `glow` ramené de 0,9 à **0,5** pendant l'approche | `Reviews` utilise 0,5 ; sans ça la luminosité du fond aurait sauté à la coupe |

**Ce qui rend la coupe invisible.** Les deux scènes restent séparées, mais la
coupe technique tombe **dans le vide** : à f1199, `Journey` n'a plus rien à
l'écran et `Reviews` n'a encore rien dessiné. Deux cadres vides identiques de
part et d'autre. C'est valide parce que les dégradés d'`Ink` sont fixés au cadre
et non au monde : un cadre vide a le même aspect à n'importe quelle position de
caméra.

Le freinage est passé en **smoothstep** (`u − u³ + u⁴/2`) : la rampe de vitesse
linéaire qui était en place faisait sauter l'accélération de 0 à −0,23 dès la
première image. Même distance parcourue, donc aucun repère déplacé.

### Mesuré sur le rendu

| | Mesure |
|---|---|
| Variation de luminance **à la coupe** (f1199) | **0,0176** — plus faible que la variation ordinaire de la séquence (0,0225) |
| Images 1199 → 1203 | **strictement identiques** (23,098) |
| Arrivée des 5 stations | **0,0 px d'écart** — le freinage tardif ne les perturbe pas |
| Accélération au freinage | **−0,004** aux deux extrémités (avant : −0,11) |
| Vide réel | **0,92 s** (0,80 demandé — voir ci-dessous) |

La coupe est statistiquement indistinguable d'une image ordinaire, et
introuvable à l'œil sur la planche de contrôle.

### Un écart assumé

Le vide fait **0,92 s au lieu de 0,80** : mon estimation de la largeur du libellé
de l'étape 05 était conservatrice de 6 images. Le resserrer imposerait de
redécaler tout le film de 7 images pour gagner 0,12 s — du sur-ajustement, pas
fait.

### Décalage de la timeline

**+135 images** jusqu'à `logo.from`, puis **+67** à partir de `diffusion` (le beat
logo perdant 68 images). Film à **2977 images = 49,6 s**.

Rappel pour la maintenance : les tables de `KeyRise` sont des paires
`[image, valeur]` (`[1288, 910]` = image 1288, hauteur 910 px) — seul le premier
élément se décale.

## Sixième passage — la scène des avis, refaite sans aucune chute

Demande : plus aucune notion de chute ; trois avis sur la largeur, apparition
moderne et rythmée ; puis un défilé droite → gauche donnant l'impression d'une
panoplie d'avis, avec le temps de les lire au début.

Le beat passe de **3,5 s à 10 s** (1064 → 1664) — trois avis ne se lisent pas en
3,5 s. Tout ce qui suit est décalé de +330 images. À noter pour la maintenance :
les tables de `KeyRise` mélangent frames et valeurs (`[1288, 910]` = frame 1288,
hauteur 910 px), donc un décalage numérique global aurait corrompu les positions.

### Ce que dit la pratique du métier, et ce que j'en ai gardé

| Principe | Application |
|---|---|
| **15–25 s par cycle** pour un défilé de cartes ; plus vite paraît anxiogène, plus lent paraît cassé | 12 cartes × 624 px = 7488 px à 7 px/image → **cycle de 17,8 s** |
| Les cartes demandent un **rythme plus lent et une séparation visuelle nette** | 560 × 302 px, 64 px d'écart, ombre portée qui monte avec la carte |
| **Décalage entre couches** (3 images à 30 fps) | cartes espacées de 8 images ; dans chacune, les 5 étoiles éclosent 3 images d'écart |
| Masque dégradé sur les bords | **écarté — voir plus bas** |

Le démarrage du défilé suit une rampe de vitesse en *smoothstep*, donc
l'accélération elle-même part de zéro et y revient. Intégrée, elle vaut
`u³ − u⁴/2` : position, vitesse et accélération sont continues au passage
maintien → dérive.

**Mesuré sur le rendu**, pas seulement calculé : corrélation horizontale image
par image sur la bande des cartes.

| | Mesure | Cible |
|---|---|---|
| Maintien | **0,00 px/image** | 0 |
| Croisière | **6,91 px/image** | 7,0 |
| Montée | 0 → 0,6 → 2,0 → 3,6 → 5,0 → 6,0 → 6,8 → 7,0 | profil smoothstep |

### Cinq défauts trouvés en visionnant le rendu

| Défaut | Cause | Correction |
|---|---|---|
| Liseré de 32 px de la 4ᵉ carte visible à droite pendant tout le maintien | écart de 44 px : la carte se posait à x = 1888 | écart porté à **64 px**, elle démarre à 1928, hors cadre |
| Cartes à moitié vides | hauteur fixe de 356 px pour une citation d'une ligne | **302 px** |
| Bande grise sur les cartes aux deux bords | **le masque dégradé est un conseil de marquee *web*.** Baisser l'alpha d'une carte blanche sur fond quasi noir la fait passer par le gris : ce n'est pas un défaut de courbe, c'est ce à quoi ressemble du blanc sur noir à 50 % d'alpha | **masque supprimé.** Sur une page, le bord du conteneur est une ligne arbitraire qu'il faut cacher ; dans un film, le bord *est* le cadre, et sortir du champ est du langage cinéma ordinaire |
| Cartes grises à l'arrivée, puis noms tranchés en deux | même cause pour le gris ; le volet qui l'a remplacé coupait le texte en plein milieu | **plaque et contenu séparés** : le volet découvre la plaque blanche, le texte apparaît ensuite par-dessus le blanc — donc jamais de gris, jamais de glyphe coupé |
| 0,43 s de rectangle blanc vide, trois à la fois | le volet durait 38 images avant que le texte n'arrive | volet ramené à **26 images**, texte démarrant à 12 : fenêtre blanche de **0,2 s** |

### Chronologie

Entête 0,07 s → cartes posées à 1,53 s → **3,47 s d'immobilité pour lire** →
dérive jusqu'à 10 s. Les trois avis de tête sont les plus courts du lot, choisis
pour tenir dans ce temps de lecture ; les plus longs passent ensuite dans le
défilé, où ils n'ont plus à être lus intégralement.

## Cinquième passage — nouvelle lecture image par image de la source

Les 20 premières secondes de la vidéo TikTok ont été redécodées à la frame
(600 frames à 30 fps, bandeau 16:9 aligné) et mesurées. Ce qui en est sorti :

| Mesure | Valeur trouvée | Ce que ça a changé |
|---|---|---|
| Vitesse du balayage | **375 °/s** dans le sens horaire, un tour en 0,96 s | La boussole tournait à 151 °/s |
| Extinction des points | **chaque point s'éteint quand la tête du balayage le croise** — un seul tour, aucun survivant | Les points s'effaçaient sur une minuterie décalée sans rapport avec le balayage : ça se lisait comme un fondu, pas comme un scan |
| Nombre de points | 11 visibles au pic dans un plan bien plus serré | Porté de 12 à **24** |
| Forme du balayage | secteur à **traîne angulaire** (vif en tête, éteint ~104° en arrière) | Reconstruit en éventail de 14 tranches — SVG n'a pas de dégradé conique |
| Raccord boussole → horloge | **match cut** : le cercle pâle est remplacé en une image par le cadran bleu, même taille, même centre | Confirme la construction déjà en place |
| Recul horloge → navigateur | rayon 665 → 430 px en **40 images**, ajusté à **`cubic-bezier(0.276, 1, 0.776, 0.97)`**, RMS 0,006 sur 16 points | Remplace une courbe générique sur 96 images — c'est ce qui rendait ce raccord sec |
| Révélation du texte | un mot toutes les **3 images**, chacun arrivant à **~3,1×** sa taille et se réduisant en 3,5 images, la ligne entière rééchelonnée à largeur constante | Le défilé à vitesse constante est remplacé par ce mécanisme |
| Courbe sinusoïdale | l'icône apparaît **9 images avant** que le tracé l'atteigne (le libellé suit 2 images après, le chiffre fantôme précède de 4) | L'icône et le tracé arrivaient ensemble |
| Point de vue de la sinusoïde | tuile ~190 px, entraxe ~1020 px, amplitude 200 px, panoramique **24,5 px/image** | Ma version était **2,7× trop reculée** (tuile 116 px, entraxe 370 px) |

Le panoramique est vérifié par calcul : sur les cinq stations, l'écart entre la
position du tracé et celle de la tuile à l'image d'arrivée est de **0,0 px**, et
la vitesse est continue au raccord entre la rampe et la croisière.

### La révélation du texte — quatrième construction, sans aucun mouvement

Demande : « type l'animation *exposition* sur After Effects ». Vérification
faite, **aucun préréglage de texte After Effects ne porte ce nom** — ils vivent
dans *Animate In*, *Animate Out*, *Blurs*, *Curves and Spins*. Dans l'interface
française, **« Exposition » est l'effet Exposure**, une correction colorimétrique.
Ce que ça désigne en pratique, c'est la révélation Exposure + Glow : le texte
est poussé bien au-delà du blanc, surexposé et diffusé, puis l'exposition
redescend et les lettres se résolvent depuis la lumière.

C'est ce qui est implémenté. Plus rien ne translate, ne change d'échelle ni de
place. Une lettre commence en halo surexposé hors focus et vient au net sur
place :

| Propriété | Trajet |
|---|---|
| flou | 18 px → 0 |
| halo | 46 px vif → éteint |
| opacité | 0 → 1, menée 1,5× plus vite pour qu'aucune lettre ne soit une tache grise |

Les trois sont pilotées par **une seule valeur de progression sur une seule
courbe**. C'est le point : la toute première version empilait quatre propriétés
par mot sur quatre décalages différents contre une ligne qui glissait — ça
saccadait. Ce ne sont pas les propriétés le problème, ce sont les temporalités
indépendantes.

| | Courbe | Rôle |
|---|---|---|
| `READING` | `cubic-bezier(0.35, 0.12, 0.3, 0.9)` | vitesse de la vague le long de la phrase |
| `SETTLE` | `cubic-bezier(0.45, 0, 0.22, 1)` | comment une lettre sort de la lumière |

**Deux réglages ont dû être corrigés à la mesure.** `SETTLE` valait d'abord
`(0.12, 0.58, 0.18, 1)` : elle atteignait les trois quarts en un huitième de sa
fenêtre — un claquement, pas un fondu. Et `READING` était trop marquée : elle
culminait à **3,3× sa propre moyenne**, et c'est ce pic qui comprimait le milieu
de la phrase. Aplatie à 2,0×, une lettre met désormais **8 à 16 images** à se
résoudre où qu'elle soit dans la ligne.

La vague est large de **20 lettres**, soit un tiers de la phrase : le halo se lit
comme une seule bande de lumière qui balaie la ligne, et non comme soixante
scintillements. Phrase complète à 2,3 s, tenue 1,6 s de plus.

Historique du beat, parce que chaque version a échoué autrement : onze entrées
par mot sur quatre propriétés désynchronisées — saccadé ; défilé à vitesse
constante — fluide mais mécanique ; le mécanisme de la source, mot arrivant à
3,1× sa taille — fidèle mais brutal ; lettres qui montent de 16 px — encore trop
sec ; puis ceci, où rien ne bouge.

### Deux écarts assumés, et pourquoi

**1. La phrase ne défile pas hors champ.** Dans la source, la ligne reste sur un
seul rang : une fois pleine, les premiers mots sortent par la gauche — à l'image
214 « Parce que ça ne sert » a disparu, il ne reste que la fin, à 77 px de haut.
C'est ce qui lui permet de garder une grosse typo. Mais ça veut aussi dire que la
phrase entière n'est jamais lisible d'un coup. Vu le nombre de fois où ce projet
est revenu sur « on n'a pas le temps de lire », la ligne est ici écrite sur
**deux rangs fixes** : rien ne sort du cadre, la taille mesurée de 77 px est
conservée, et comme la coupure est écrite à la main plutôt que calculée, aucun
mot ne saute de ligne pendant la révélation.

**2. Les angles exacts des aiguilles n'ont pas pu être relevés.** Trois méthodes
ont été tentées — histogramme angulaire pondéré par le rayon, suivi par
continuité entre images, levée d'ambiguïté par la portée de chaque rayon — et
les trois ont échoué, pour des raisons identifiables : le cadran est coupé par le
cadre, les aiguilles sont filées par le mouvement, et un segment vu par un
détecteur symétrique a deux extrémités indiscernables. Ce qui est établi
visuellement, en revanche : trois aiguilles, rotation continue et rapide, aucun
à-coup de tic-tac. L'horloge est donc pilotée par **une seule grandeur** — le
temps horloge écoulé — dont les trois angles découlent aux vrais rapports
(720 : 60 : 1). C'est cette cohérence qui fait « vraie horloge » ; auparavant le
trotteur tournait à 2,1× l'aiguille des minutes au lieu de 60×, ce qui est
précisément ce qui sonnait faux.

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
| 6 | Trois avis Google, puis le défilé | sombre |
| 7 | La clé — « vous ne gérez plus rien » | sombre |
| 8 | Le losange, seul, qui part vers la droite | blanc |
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

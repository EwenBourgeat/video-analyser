# Reproduction du motion design Scalead.ai — beats 1 à 12

Reproduction des **25,87 premières secondes** (776 frames @ 30 fps) du motion design
de `tiktok.com/@lemosthiagoo/video/7654958930552032544`.

## Livrables

| Fichier | Format | Contenu |
|---|---|---|
| **`repro/out/final_60fps_16x9.mp4`** | **1920 × 1080 @ 60 fps**, 25,87 s | le master, à regarder en priorité |
| `repro/out/final_60fps_9x16.mp4` | 1080 × 1920 @ 60 fps | recadré comme sur TikTok (bandes noires) |
| `repro/out/final_16x9.mp4` | 1920 × 1080 @ 30 fps | variante fidèle à la cadence source |
| `ANALYSE.md` | — | rétro-ingénierie : géométrie, palette, courbes, découpage |
| `METHODE.md` | — | comment tout a été mesuré |

## Le point le plus important

**Le motion design d'origine est en 16:9, pas en 9:16.** Il est encodé à 720 × 405 et
centré dans le canvas TikTok 720 × 1280, avec des bandes noires et le sticker de
commentaire incrusté. Le master à recréer est donc du 1920 × 1080.

## Fluidité (60 fps)

Le passage à 60 fps ne consiste pas à doubler les images : les scènes sont
écrites en frames *source*, la composition leur passe une frame fractionnaire,
et l'interpolation produit de vrais inter-images.

Deux causes d'à-coups ont été supprimées :

1. **L'interpolation linéaire des tables mesurées.** Elle fait sauter la vitesse
   à chaque keyframe — 26,5 px/frame² sur le fouetté des cartes. Remplacée par
   une interpolation cubique monotone (PCHIP) suivie d'un filtre gaussien qui
   retire le bruit de tracking (±1-2 px) devenu visible à 60 fps.
2. **Les `easeOut` qui démarrent d'un coup.** Une courbe ease-out a sa vitesse
   *maximale* à t=0 : tout élément partant du repos claque. Mesuré à 65 px/s par
   image sur la sortie des pilules de domaines. Remplacées par `softOut`
   (vitesse nulle au départ, décélération conservée).

Saut de vitesse image par image, mesuré par corrélation de phase sur le rendu :

| | à-coup moyen | à-coup max |
|---|---|---|
| Avant (30 fps, interpolation linéaire) | 2,6 | 123,2 |
| **Après (60 fps, interpolation lissée)** | **0,7** | **27,6** |
| Source TikTok (référence) | 1,5 | 71,1 |

Le rendu est donc **3,7× plus fluide qu'avant, et plus fluide que la source**.
Exemple concret sur le dézoom du radar — saut d'accélération moyen 8,00 → 3,69,
profil de vitesse `0,-4,-6,-12,-20,-24,-28,-28,-24,-20` au lieu de
`0,-20,-68,-64,-56`.

## Fidélité obtenue

Écart absolu moyen de luminance contre la source. La colonne **plancher** est le
score qu'obtiendrait une reproduction *parfaite* : c'est le bruit de compression
HEVC de la source (deux images consécutives d'un plan fixe diffèrent de 4,84/255).

| Scène | Écart | Plancher | | Scène | Écart | Plancher |
|---|---|---|---|---|---|---|
| 1 Radar | 8,25 | 0,88 | | 7 Dossier | 13,12 | 0,71 |
| 2 Horloge | 9,66 | 0,73 | | 8 Logo | 9,34 | 0,19 |
| 3 Navigateur | 14,94 | 0,99 | | 9 Domaines | 12,38 | 1,48 |
| 4 Texte passé | 9,57 | 1,25 | | 10 Enveloppes | 10,75 | 0,32 |
| 5 Parcours | 16,80 | 1,99 | | 11 Agenda | 15,29 | 2,45 |
| 6 Cartes | 32,20 | 3,01 | | 11b Simple | 5,71 | 0,26 |

**Global : 6,00 %** en 30 fps, **6,28 %** en 60 fps — pour un plancher de 0,59 %.
Trajet depuis le départ : 8,70 % → 6,00 %.

L'écart de 0,28 point du 60 fps vient entièrement des aiguilles de l'horloge.
Elles tournent à plus de 180°/image dans la source : leur mouvement réel est
irrécupérable à 30 fps (repliement temporel). Rejouer les angles mesurés est
exact mais stroboscope à 60 fps ; une rotation lisse est fluide mais s'écarte de
la source. Fidélité et fluidité sont ici **réellement incompatibles**, et cette
version tranche pour la fluidité.

Ce qui reste ailleurs n'est **pas** du placement : recaler chaque image
individuellement ne récupère que 3 à 10 % de l'erreur. C'est du structurel —
contours vectoriels, dégradés, halos, tracés de glyphes.

## Structure

```
ANALYSE.md              document de référence (Phase 1)
METHODE.md              comment tout a été mesuré
tools/                  scripts de mesure (letterbox, coupes, palette, tracking, comparaison)
  lib.py                décodage aligné du bandeau 16:9 — source de vérité
repro/                  projet Remotion
  src/theme.ts          tokens mesurés (couleurs, frontières de scènes)
  src/ease.ts           courbes + lecture de tables de keyframes mesurées
  src/bezier.ts         solveur cubic-Bézier + les courbes nommées du film
  src/scenes/           une scène par beat (Scalead)
  src/intendant/        le second film, un fichier par beat
  src/components/       typo cinétique, icônes, logo, curseur, avatars
```

### Ce qui n'est pas versionné

Quatre choses sont absentes du dépôt et se régénèrent :

| Absent | Pourquoi | Comment le retrouver |
|---|---|---|
| `repro/out/*.mp4` | 57 Mo régénérables ; les garder alourdirait l'historique à chaque re-rendu | `npx remotion render` (voir ci-dessous) |
| `ref/` | vidéo TikTok source et ses frames — **contenu tiers**, à ne pas redistribuer | `yt-dlp` sur l'URL, puis `tools/` |
| `repro/public/plates|avatars/` | pixels prélevés directement dans cette source | `tools/plates.py`, `tools/avatars.py` |
| `cmp/`, `heat*/` | planches de diagnostic, purement dérivées | `tools/compare.py`, `tools/heat.py` |

## Rejouer

```bash
cd repro && npx remotion studio        # aperçu interactif
npx remotion render src/index.ts Scalead out/final_16x9.mp4
```

Comparer un rendu à la source :

```bash
.venv/bin/python tools/compare.py repro/out/final_16x9.mp4 cmp/x 30 155 300 430 680
```

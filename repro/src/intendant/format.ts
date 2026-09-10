import {useVideoConfig} from 'remotion';

/**
 * The film exists in two frames.
 *
 * 16:9 (1920×1080) is the master, and it is also the world's unit system: the
 * travelling's camera positions, the review row's world x, the station spacing —
 * all of those numbers were measured against a 1920-wide viewport.
 *
 * 4:5 (1080×1350) is what Meta actually serves in the Facebook and Instagram
 * feed, and it is a re-layout rather than a crop. The pixel scale is IDENTICAL:
 * a 30 px quote is 30 px in both, a 190 px service tile is 190 px in both.
 * Nothing shrinks. The frame is simply 840 px narrower and 270 px taller, so
 * copy takes more lines, wide rows are rebuilt, and the reviews pass one card at
 * a time instead of three.
 *
 * Keeping the scale at 1:1 is the whole point: a scaled-down 16:9 would put the
 * body copy at 40 px in a 1080-wide frame, which is under the size a phone feed
 * needs. Re-laying out costs work; scaling costs legibility.
 */

/** The feed frame. */
export const PW = 1080;
export const PH = 1350;

/**
 * The viewport currently being rendered. Scenes use this — never the master W/H
 * from theme — for anything that depends on the edges of the picture: centring,
 * culling, how much of the world is on screen.
 */
export const useStage = () => {
  const {width, height} = useVideoConfig();
  return {w: width, h: height, tall: height > width};
};

/**
 * The clock's geometry, in one place because two scenes must agree on it: the
 * compass disc of beat 1 morphs onto exactly this circle, and beat 2 draws the
 * dial there. Deriving both from one function is what keeps that match cut
 * invisible — an earlier version had the two computed separately and any change
 * to one silently broke the other.
 *
 * In 4:5 the dial does NOT scale with the frame. A radius tied to the width
 * would drop it from 528 px to 297, shrinking the whole beat; instead it is
 * held at 460 (920 across, 80 px of margin either side) and sits higher, so the
 * taller frame shows more of the face rather than less of a smaller one.
 */
export const clockGeom = (w: number, h: number, tall: boolean) => ({
  cx: w / 2,
  r: tall ? 460 : 0.275 * 1920,
  cy: tall ? 0.75 * h : 0.895 * h,
});

/**
 * Where the travelling's thread front sits on screen.
 *
 * 60 % of the way across in 16:9 (1150), but 82 % in 4:5 (886). A station is
 * legible from the moment it arrives at this column until it leaves the left
 * edge, so in a frame 840 px narrower the same fraction would cut its readable
 * life from 2.2 s to 1.1 s. Bringing the column closer to the right edge buys
 * that time back; it is affordable because in 4:5 the label sits UNDER the tile
 * rather than beside it, so nothing extends past the arrival column.
 *
 * 82 % is the ceiling: the label is 380 wide and centred on the tile, so at 85 %
 * its right edge would already be 28 px outside the frame when the station
 * arrives. Measured, a label is fully legible for 1.36 s at 82 % against 1.64 s
 * in 16:9 — the closest the narrow frame allows without cutting it on arrival.
 */
export const frontOf = (w: number, tall: boolean) =>
  Math.round(w * (tall ? 0.82 : 0.599));

/**
 * The camera offset that makes the stations arrive exactly on time.
 *
 * The travelling is timed so the thread reaches station i at a known frame, and
 * the thread is drawn at `camX + FRONT`. Station 01 stands at world x = 700, so
 * at the first arrival the camera must be at `700 - FRONT`. Deriving it keeps
 * the arrivals exact in both frames — the 16:9 value was the hand-tuned -450,
 * which is exactly 700 - 1150.
 */
export const X0 = 700;
export const cruiseBase = (w: number, tall: boolean) => X0 - frontOf(w, tall);

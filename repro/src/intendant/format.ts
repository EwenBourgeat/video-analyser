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

/*
 * `frontOf`, `X0` and `cruiseBase` used to live here.
 *
 * They existed to solve one problem: the travelling drew a thread up to a fixed
 * column of the frame, and a station had to be at world x = 700 when the thread
 * reached it, so the camera offset had to be derived from that column — and the
 * column itself had to differ between the two frames (60 % in 16:9, 82 % in 4:5)
 * to give a station a comparable readable life in each.
 *
 * The services beat no longer works that way. A step is a full-frame panel and
 * the panel pitch IS the frame width, so there is no arrival column to hit and
 * no offset to solve: the camera rests at i * w and the panel fills the picture,
 * in either format, with nothing to tune. Deleting them is what that change is
 * worth — the numbers were correct, but they were answers to a question the film
 * stopped asking.
 */

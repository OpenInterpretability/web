/**
 * The one place that decides how many papers the site says it has.
 *
 * Every page reads these values instead of hard-coding a number, so a count
 * can only be wrong in one file. They are derived, never typed:
 *
 *   sitePapers         papers we authored and host on the site (lib/papers-content.ts)
 *   sitePapersWithDoi  of those, the ones whose entry declares a permanent DOI
 *   arcBeats           beats of the WANDERING agent-safety arc (lib/arc.ts)
 *   readingListPapers  external papers in the curated reading list (lib/papers.ts)
 *
 * The last two are different things from the first and must keep their own
 * labels on the page; they are here only so no page computes its own total.
 */
import { paperCount, papersWithDoi, papersWithoutDoi } from './papers-content';
import { arc } from './arc';
import { paperCount as readingListCount } from './papers';

export const sitePapers = paperCount;
export const sitePapersWithDoi = papersWithDoi;
export const sitePapersWithoutDoi = papersWithoutDoi;
export const arcBeats = arc.length;
export const readingListPapers = readingListCount;

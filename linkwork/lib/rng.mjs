/**
 * CIT-01 // deterministic entropy source.
 * The organ must be reproducible: the same seed and the same epoch
 * must always grow the same web. No Math.random anywhere in the organ.
 */

/** FNV-1a 32-bit string hash → uint32. */
export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, seedable PRNG. Returns float in [0,1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A scoped, deterministic random handle. */
export function rng(seed) {
  const next = mulberry32(typeof seed === 'string' ? hashString(seed) : seed >>> 0);
  const api = {
    next,
    /** float in [min, max) */
    float(min = 0, max = 1) {
      return min + next() * (max - min);
    },
    /** integer in [min, max] inclusive */
    int(min, max) {
      return Math.floor(min + next() * (max - min + 1));
    },
    /** pick one element */
    pick(arr) {
      return arr[Math.floor(next() * arr.length)];
    },
    /** pick n distinct elements (or as many as exist) */
    sample(arr, n) {
      return api.shuffle([...arr]).slice(0, Math.max(0, Math.min(n, arr.length)));
    },
    /** Fisher–Yates copy */
    shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    /** true with probability p */
    chance(p) {
      return next() < p;
    },
    /** pick via weighted classes: [[value, weight], ...] */
    weighted(pairs) {
      const total = pairs.reduce((s, [, w]) => s + w, 0);
      let r = next() * total;
      for (const [v, w] of pairs) {
        r -= w;
        if (r < 0) return v;
      }
      return pairs[pairs.length - 1][0];
    },
  };
  return api;
}

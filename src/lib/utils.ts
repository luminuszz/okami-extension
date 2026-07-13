import { type ClassValue, clsx } from "clsx";
import Levenshtein from "fast-levenshtein";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isRunningAsExtension(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined";
}

const MAX_DISTANCE_RATIO = 0.3;
const MIN_NAME_LENGTH = 3;

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * Finds the work whose name best matches a browser tab title, or null when
 * nothing matches confidently. Returning null matters: the caller pre-fills the
 * "mark as read" form with the result, so a bogus match means one click marks
 * the wrong work as read.
 */
export function search(listObj: string[], nameRef: string): string | null {
  const reference = normalizeName(nameRef);

  if (!reference) return null;

  const candidates = listObj
    .map((name) => ({ name, parsedName: normalizeName(name) }))
    .filter(({ parsedName }) => parsedName.length >= MIN_NAME_LENGTH);

  // A tab title normally embeds the work name ("One Piece - Chapter 1104 | Site"),
  // so containment is the strongest signal. Longest hit wins (most specific).
  const contained = candidates
    .filter(({ parsedName }) => reference.includes(parsedName))
    .sort((a, b) => b.parsedName.length - a.parsedName.length)[0];

  if (contained) return contained.name;

  let closest: { name: string; distance: number; length: number } | null = null;

  for (const { name, parsedName } of candidates) {
    // compare like with like: both sides normalized
    const distance = Levenshtein.get(reference, parsedName);

    if (!closest || distance < closest.distance) {
      closest = { name, distance, length: parsedName.length };
    }
  }

  if (!closest) return null;

  return closest.distance / closest.length <= MAX_DISTANCE_RATIO
    ? closest.name
    : null;
}

export function hasExceededMaxFractionDigits(
  num: number,
  maxFractionDigits: number,
): boolean {
  const fractionPart = num.toString().split(".")[1];

  return !!fractionPart && fractionPart.length > maxFractionDigits;
}

export function normalizeSearchFilter(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function getSearchScore(value: string, search: string): number {
  const normalizedValue = normalizeSearchFilter(value);
  const normalizedFilterSearch = normalizeSearchFilter(search);

  let count = 0;

  const normalizedSeachSplited = normalizedFilterSearch.split(/\s+/);

  for (const w of normalizedSeachSplited) {
    if (normalizedValue.includes(w)) count++;
  }

  return count / normalizedSeachSplited.length;
}

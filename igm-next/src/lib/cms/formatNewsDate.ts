import type { SupportedLocale } from "@/i18n/locales";

const MONTHS_SHORT_FR = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
] as const;

const MONTHS_SHORT_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MONTHS_LONG_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

const MONTHS_LONG_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function parseIsoDate(iso: string): Date | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

/** Format stable serveur / client (évite les écarts ICU Node vs navigateur). */
export function formatNewsDate(iso: string, locale: SupportedLocale): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;

  const day = date.getUTCDate();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  if (locale === "en") {
    return `${day} ${MONTHS_SHORT_EN[month]} ${year}`;
  }

  return `${day} ${MONTHS_SHORT_FR[month]} ${year}`;
}

/** Date longue pour le hero (ex. « 2 juin 2026 » / « June 2, 2026 »). */
export function formatNewsDateLong(iso: string, locale: SupportedLocale): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;

  const day = date.getUTCDate();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();

  if (locale === "en") {
    return `${MONTHS_LONG_EN[month]} ${day}, ${year}`;
  }

  return `${day} ${MONTHS_LONG_FR[month]} ${year}`;
}

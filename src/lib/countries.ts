"use client";

import isoCountries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

export type CountryOption = { code: string; name: string };

const PIN: Record<string, number> = { US: 0, AU: 1, CA: 2 };

let registered = false;
function ensureIsoCountriesRegistered() {
  if (registered) return;
  isoCountries.registerLocale(enLocale);
  registered = true;
}

export function getCountryOptions(): CountryOption[] {
  // Prefer native Intl list if available (small bundle). Fallback to i18n-iso-countries.
  try {
    const sv = (Intl as unknown as { supportedValuesOf?: (t: string) => string[] }).supportedValuesOf;
    const codes = sv?.("region") ?? [];
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    const opts = codes
      .map((code) => ({ code, name: dn.of(code) ?? code }))
      .filter((c) => typeof c.name === "string" && c.name.trim().length > 0 && c.code.length === 2);
    if (opts.length >= 200) {
      return opts.sort((a, b) => {
        const ap = PIN[a.code] ?? 999;
        const bp = PIN[b.code] ?? 999;
        if (ap !== bp) return ap - bp;
        return a.name.localeCompare(b.name);
      });
    }
  } catch {
    // fall through
  }

  ensureIsoCountriesRegistered();
  const names = isoCountries.getNames("en", { select: "official" }) as Record<string, string>;
  const opts = Object.entries(names)
    .map(([code, name]) => ({ code, name }))
    .filter((c) => c.code.length === 2 && typeof c.name === "string" && c.name.trim().length > 0);

  return opts.sort((a, b) => {
    const ap = PIN[a.code] ?? 999;
    const bp = PIN[b.code] ?? 999;
    if (ap !== bp) return ap - bp;
    return a.name.localeCompare(b.name);
  });
}

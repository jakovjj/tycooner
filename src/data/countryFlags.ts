export const countryFlags: Record<string, string> = {
  GB: '🇬🇧',
  FR: '🇫🇷',
  DE: '🇩🇪',
  IT: '🇮🇹',
  ES: '🇪🇸',
  PL: '🇵🇱',
  PT: '🇵🇹',
  NL: '🇳🇱',
  BE: '🇧🇪',
  CH: '🇨🇭',
  AT: '🇦🇹',
  CZ: '🇨🇿',
  SE: '🇸🇪',
  NO: '🇳🇴',
  FI: '🇫🇮',
  DK: '🇩🇰',
  GR: '🇬🇷',
  RO: '🇷🇴',
  HU: '🇭🇺',
  SK: '🇸🇰',
  BG: '🇧🇬',
  HR: '🇭🇷',
  SI: '🇸🇮',
  LT: '🇱🇹',
  LV: '🇱🇻',
  EE: '🇪🇪',
  IE: '🇮🇪',
  RS: '🇷🇸',
  BA: '🇧🇦',
  AL: '🇦🇱',
  MK: '🇲🇰',
  ME: '🇲🇪',
  LU: '🇱🇺',
  XK: '🇽🇰',
  BY: '🇧🇾',
  UA: '🇺🇦',
  MD: '🇲🇩',
  RU: '🇷🇺'
};

export const getCountryFlag = (code: string): string => countryFlags[code] ?? '🏳️';

export const formatCountryDisplay = (code: string, name?: string): string => {
  const trimmedName = name?.trim();
  return `${getCountryFlag(code)} ${trimmedName && trimmedName.length > 0 ? trimmedName : code}`;
};

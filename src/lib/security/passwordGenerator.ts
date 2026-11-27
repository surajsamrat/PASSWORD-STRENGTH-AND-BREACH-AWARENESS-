export interface PasswordGenOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export interface PassphraseGenOptions {
  wordCount: number;
  separator: "-" | "_" | "." | " ";
  capitalize: boolean;
  includeNumber: boolean;
}

export class InvalidGeneratorConfigError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "InvalidGeneratorConfigError";
    this.code = code;
  }
}

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 64;
export const MIN_PASSPHRASE_WORDS = 3;
export const MAX_PASSPHRASE_WORDS = 10;
export const MAX_BATCH_COUNT = 50;

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?/~";
export const AMBIGUOUS_CHARS = new Set(["0", "O", "o", "1", "l", "I", "|"]);

// Curated memorable EFF-inspired diceware word list for client-side CSPRNG passphrases
const WORD_LIST = [
  "anchor", "apricot", "archway", "arctic", "atlas", "aurora", "autumn", "avalanche",
  "bamboo", "beacon", "bedrock", "bison", "blossom", "boulder", "breeze", "bridge",
  "cactus", "canyon", "cascade", "cedar", "cipher", "citadel", "cloud", "cobalt",
  "compass", "copper", "coral", "cosmos", "crater", "crimson", "crystal", "cypress",
  "dagger", "dawn", "delta", "desert", "diamond", "dolphin", "drift", "dune",
  "eclipse", "emerald", "ember", "enigma", "equinox", "falcon", "feather", "ferry",
  "fjord", "flint", "forest", "fortress", "fossil", "frost", "galaxy", "garnet",
  "geyser", "glacier", "granite", "gravity", "harbor", "harvest", "haven", "hazel",
  "helium", "heron", "horizon", "hurricane", "iceberg", "indigo", "island", "ivory",
  "jade", "jasper", "jigsaw", "juniper", "kayak", "kestrel", "keystone", "lagoon",
  "lantern", "laurel", "legend", "leopard", "lichen", "lighthouse", "lotus", "lunar",
  "magnet", "mango", "mantle", "maple", "marble", "meadow", "mercury", "meteor",
  "mirage", "monolith", "monsoon", "mosaic", "nebula", "nectar", "neutron", "nomad",
  "oak", "oasis", "obsidian", "octave", "olive", "onyx", "opal", "orbit",
  "orchid", "osprey", "otter", "oxygen", "paladin", "panther", "paradox", "pebble",
  "pelican", "pendulum", "pepper", "phantom", "phoenix", "pinnacle", "pioneer", "planet",
  "plasma", "plateau", "plum", "polar", "prism", "pulsar", "pyramid", "python",
  "quantum", "quartz", "quiver", "radar", "radiant", "raindrop", "raptor", "raven",
  "reactor", "redwood", "reef", "relic", "ripple", "river", "rocket", "saffron",
  "sapphire", "saturn", "scarlet", "scepter", "scooter", "seabird", "sequoia", "shadow",
  "shield", "sierra", "signal", "silver", "solstice", "sonar", "spark", "spectrum",
  "sphinx", "spiral", "spruce", "starlight", "stealth", "stellar", "summit", "sundial",
  "sunrise", "talon", "tangerine", "tempest", "terra", "thistle", "thunder", "timber",
  "titanium", "topaz", "tornado", "torrent", "tracker", "trident", "tundra", "turbine",
  "typhoon", "umbra", "unicorn", "utopia", "valley", "vanguard", "vector", "velvet",
  "vertex", "vortex", "voyager", "walnut", "warden", "waterfall", "whisper", "wildfire",
  "willow", "winter", "wolf", "zenith", "zephyr", "zircon", "zodiac", "amber",
];

function getCryptoApi(): Crypto {
  const cryptoObj = globalThis.crypto;
  if (!cryptoObj || typeof cryptoObj.getRandomValues !== "function") {
    throw new InvalidGeneratorConfigError(
      "CRYPTO_UNAVAILABLE",
      "Web Crypto API (crypto.getRandomValues) is required and unavailable."
    );
  }
  return cryptoObj;
}

/**
 * Unbiased cryptographically secure random integer in [0, max) using rejection sampling.
 */
export function secureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new InvalidGeneratorConfigError("INVALID_RANGE", "max must be a positive integer");
  }
  const cryptoObj = getCryptoApi();
  const array = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  let value: number;
  do {
    cryptoObj.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

function filterAmbiguous(chars: string, exclude: boolean): string {
  if (!exclude) return chars;
  return chars
    .split("")
    .filter((c) => !AMBIGUOUS_CHARS.has(c))
    .join("");
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function validatePasswordGenOptions(opts: PasswordGenOptions): void {
  if (
    !Number.isInteger(opts.length) ||
    opts.length < MIN_PASSWORD_LENGTH ||
    opts.length > MAX_PASSWORD_LENGTH
  ) {
    throw new InvalidGeneratorConfigError(
      "INVALID_LENGTH",
      `Password length must be an integer between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH}.`
    );
  }
  if (!opts.uppercase && !opts.lowercase && !opts.numbers && !opts.symbols) {
    throw new InvalidGeneratorConfigError(
      "NO_CHARSETS_ENABLED",
      "At least one character set (uppercase, lowercase, numbers, or symbols) must be enabled."
    );
  }
}

export function validatePassphraseGenOptions(opts: PassphraseGenOptions): void {
  if (
    !Number.isInteger(opts.wordCount) ||
    opts.wordCount < MIN_PASSPHRASE_WORDS ||
    opts.wordCount > MAX_PASSPHRASE_WORDS
  ) {
    throw new InvalidGeneratorConfigError(
      "INVALID_WORD_COUNT",
      `Passphrase word count must be an integer between ${MIN_PASSPHRASE_WORDS} and ${MAX_PASSPHRASE_WORDS}.`
    );
  }
  if (!["-", "_", ".", " "].includes(opts.separator)) {
    throw new InvalidGeneratorConfigError(
      "INVALID_SEPARATOR",
      "Passphrase separator must be one of '-', '_', '.', or ' '."
    );
  }
}

export function generateCryptoPassword(opts: PasswordGenOptions): string {
  validatePasswordGenOptions(opts);

  const pools: string[] = [];
  if (opts.uppercase) pools.push(filterAmbiguous(UPPER, opts.excludeAmbiguous));
  if (opts.lowercase) pools.push(filterAmbiguous(LOWER, opts.excludeAmbiguous));
  if (opts.numbers) pools.push(filterAmbiguous(NUMBERS, opts.excludeAmbiguous));
  if (opts.symbols) pools.push(filterAmbiguous(SYMBOLS, opts.excludeAmbiguous));

  const activePools = pools.filter((p) => p.length > 0);
  if (activePools.length === 0) {
    throw new InvalidGeneratorConfigError(
      "EMPTY_CHARACTER_POOL",
      "No usable characters remain after applying options."
    );
  }

  const combinedPool = activePools.join("");
  const chars: string[] = [];

  // Guarantee at least one character from each selected character class
  for (const pool of activePools) {
    chars.push(pool[secureRandomInt(pool.length)]);
  }

  while (chars.length < opts.length) {
    chars.push(combinedPool[secureRandomInt(combinedPool.length)]);
  }

  return shuffleArray(chars).join("");
}

export function generatePassphrase(opts: PassphraseGenOptions): string {
  validatePassphraseGenOptions(opts);

  const words: string[] = [];
  for (let i = 0; i < opts.wordCount; i++) {
    let word = WORD_LIST[secureRandomInt(WORD_LIST.length)];
    if (opts.capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  if (opts.includeNumber) {
    const num = secureRandomInt(90) + 10;
    const idx = secureRandomInt(words.length);
    words[idx] = `${words[idx]}${num}`;
  }

  return words.join(opts.separator);
}

export function generateMultiplePasswords(
  opts: PasswordGenOptions,
  count: number
): string[] {
  if (!Number.isInteger(count) || count < 1 || count > MAX_BATCH_COUNT) {
    throw new InvalidGeneratorConfigError(
      "INVALID_BATCH_COUNT",
      `Batch count must be an integer between 1 and ${MAX_BATCH_COUNT}.`
    );
  }
  return Array.from({ length: count }, () => generateCryptoPassword(opts));
}

export function generateMultiplePassphrases(
  opts: PassphraseGenOptions,
  count: number
): string[] {
  if (!Number.isInteger(count) || count < 1 || count > MAX_BATCH_COUNT) {
    throw new InvalidGeneratorConfigError(
      "INVALID_BATCH_COUNT",
      `Batch count must be an integer between 1 and ${MAX_BATCH_COUNT}.`
    );
  }
  return Array.from({ length: count }, () => generatePassphrase(opts));
}

// One Word for the Boss — make.fun entry
// Writes exactly one word describing the boss to /output/entry.txt.
// No dependencies, no network, deterministic output.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The word: a boss who turns every five-minute question into a meeting.
// Single word, no spaces, no caption, no explanation — it lands on its own.
const WORD = "Meetingizer";

// Competition gate, kept in named constants so the limits are visible
// and a future edit cannot silently change one of them.
const MAX_CHARACTERS = 30;
const MIN_CHARACTERS = 1;

// The gate, mirrored here so a bad word can never be written:
// UTF-8 text of 1 to 30 characters, not only white space, one word,
// no control characters, no leading or trailing whitespace.
function validateEntryWord(word: string): void {
  if (typeof word !== "string") {
    throw new Error("entry must be a string");
  }
  if (word.length < MIN_CHARACTERS) {
    throw new Error("entry must not be empty");
  }
  if (word.length > MAX_CHARACTERS) {
    throw new Error(`entry is ${word.length} characters, over the ${MAX_CHARACTERS} limit`);
  }
  if (word.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (word !== word.trim()) {
    throw new Error("entry must not start or end with white space");
  }
  if (/\s/.test(word)) {
    throw new Error("entry must be a single word with no spaces");
  }
  // Control characters (including newlines) would silently corrupt the
  // one-word output, so reject them even though the other checks pass.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(word)) {
    throw new Error("entry must not contain control characters");
  }
  // A word, not a number or punctuation: at least one letter is required.
  if (!/[A-Za-z]/.test(word)) {
    throw new Error("entry must contain at least one letter");
  }
}

function resolveOutputPath(): string {
  return process.env.OUTPUT_PATH ?? "/output/entry.txt";
}

function writeEntry(word: string, outPath: string): void {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, word, "utf8");
}

// Read the file back and compare byte for byte: a write that silently
// truncated or re-encoded the word must fail loudly instead of shipping.
function verifyEntry(word: string, outPath: string): void {
  const written = readFileSync(outPath, "utf8");
  if (written !== word) {
    throw new Error(
      `verify failed: ${outPath} contains ${JSON.stringify(written)}, expected ${JSON.stringify(word)}`,
    );
  }
}

function main(): void {
  validateEntryWord(WORD);
  const outPath = resolveOutputPath();
  writeEntry(WORD, outPath);
  verifyEntry(WORD, outPath);
  console.log(`wrote ${WORD.length} characters to ${outPath} (verified)`);
}

main();

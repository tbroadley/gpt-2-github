const leven = require("leven");
const readline = require("readline");

const TEST_LINE = "This is a test line. Type it out and press Enter.";

const LINE_INIT = 0;
const LINE_NOT_STARTED = 1;

const EWMA_COEFFICIENT = 0.2;

let lineStartedAt = LINE_INIT;

let totalDistance = 0;
let totalTime = 0;
let totalCharacters = 0;
let totalWords = 0;
let averageWordsPerMinute = undefined;

function formattedSecondsFromMillis(millis) {
  return `${(millis / 1000).toFixed(1)}s`;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "",
});

rl.on("line", (line) => {
  const expectedLine = TEST_LINE;

  if (lineStartedAt !== LINE_INIT && lineStartedAt !== LINE_NOT_STARTED) {
    const distance = leven(line, expectedLine);
    totalDistance += distance;

    const lineEndedAt = Date.now();
    const timeToTypeLineMillis = lineEndedAt - lineStartedAt;
    totalTime += timeToTypeLineMillis;

    const characters = line.length;
    totalCharacters += characters;

    const words = line.split(/\s+/).length;
    totalWords += words;

    const wordsPerMinute = (words * 1000 * 60) / timeToTypeLineMillis;

    if (averageWordsPerMinute === undefined) {
      averageWordsPerMinute = wordsPerMinute;
    } else {
      averageWordsPerMinute =
        averageWordsPerMinute * (1 - EWMA_COEFFICIENT) +
        wordsPerMinute * EWMA_COEFFICIENT;
    }

    const paddedDistance = `${distance.toString().padStart(2, " ")}d`;
    const paddedTotalDistance = `${totalDistance.toString().padStart(4, " ")}d`;

    const paddedTime = formattedSecondsFromMillis(
      timeToTypeLineMillis
    ).padStart(6, " ");
    const paddedTotalTime = formattedSecondsFromMillis(totalTime).padStart(
      8,
      " "
    );

    const paddedCharacters = `${characters.toString().padStart(4, " ")}c`;
    const paddedTotalCharacters = `${totalCharacters
      .toString()
      .padStart(6, " ")}c`;

    const paddedWords = `${words.toString().padStart(3, " ")}w`;
    const paddedTotalWords = `${totalWords.toString().padStart(5, " ")}w`;

    const paddedWordsPerMinute = `${wordsPerMinute
      .toFixed(1)
      .padStart(6, " ")}wpm`;
    const paddedAverageWordsPerMinute = `${averageWordsPerMinute
      .toFixed(1)
      .padStart(6, " ")}wpm`;

    console.log(
      `${paddedDistance} ${paddedTotalDistance} ${paddedTime} ${paddedTotalTime} ${paddedCharacters} ${paddedTotalCharacters} ${paddedWords} ${paddedTotalWords} ${paddedWordsPerMinute} ${paddedAverageWordsPerMinute}`
    );
    console.log();
  }

  lineStartedAt = LINE_INIT;

  console.log(TEST_LINE);
});

process.stdin.on("keypress", () => {
  if (lineStartedAt === LINE_INIT) {
    lineStartedAt = LINE_NOT_STARTED;
  } else if (lineStartedAt === LINE_NOT_STARTED) {
    lineStartedAt = Date.now();
  }
});

console.log(TEST_LINE);
rl.prompt();

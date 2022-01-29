var $text = document.getElementById("text");
var $result = document.getElementById("result");
var $resultSuccess = document.getElementById("resultSuccess");
var $resultError = document.getElementById("resultError");
var curNum = 1;
var sentences = [];

$text.addEventListener("input", (e) => {
  const value = e.currentTarget.value;
  const lines = value.split("\n");

  /** @type {import(".").Sentense[]} */
  sentences = lines.reduce(
    (acc, cur, i) => {
      if (/(\d\d):(\d\d)/.test(cur)) {
        const prevSentense = acc[acc.length - 2];
        const currSentense = acc[acc.length - 1];

        const minutesStr = cur.replace(/(\d\d):(\d\d)/, "$1");
        const secondsStr = cur.replace(/(\d\d):(\d\d)/, "$2");

        const time = `00:${minutesStr}:${secondsStr},000`;

        if (prevSentense) prevSentense.lastTime = time;
        currSentense.firstTime = time;
      } else {
        const currSentense = acc[acc.length - 1];
        const nextLine = lines[i + 1];

        if (nextLine) {
          acc.push(getSentence(acc.length + 1));
        } else {
          currSentense.lastTime = `99:59:59,000`;
        }
        currSentense.lines.push(cur);
      }

      return acc;
    },
    [getSentence(1)]
  );

  console.info("filtered log lines", lines);
  console.info("filtered log sentences", sentences);

  const result = sentences
    .map((item) => {
      return `${item.curNum}\n${item.firstTime} --> ${
        item.lastTime
      }\n${item.lines.join("\n")}\n`;
    })
    .join("\n");

  console.log("filtered log result", result);

  $result.textContent = result;

  validateSrt(result);
});

$result.addEventListener("input", (e) => validateSrt(e.currentTarget.value));

mock();

function validateSrt(text) {
  // parser
  try {
    $resultSuccess.style.display = "none";
    $resultError.style.display = "none";

    const parser = new srtParser2();
    const srtResult = parser.fromSrt(text);

    console.log("filtered log srtResult", srtResult);

    if (srtResult.length === 0) {
      throw new Error();
    }

    if (srtResult.length !== sentences.length) {
      throw new Error();
    }

    $resultSuccess.style.display = "initial";
  } catch (error) {
    console.log("filtered log error", error);
    $resultError.style.display = "initial";
  }
}
mock();

/**
 * @param {number} curNum
 * @returns {import(".").Sentense}
 */
function getSentence(curNum) {
  return {
    curNum,
    firstTime: "00:00:00,000",
    lastTime: "00:00:00,000",
    lines: [],
  };
}

function isBeforeSetting() {}

function mock() {
  if (location.search === "?example") {
    // Source: https://www.youtube.com/watch?v=hOfRN0KihOU
    $text.value = `00:00
As the year 12.021 slowly comes to an end,
00:04
we present to you the 12.022 human era calendar, Eons edition.
00:12
As always,
00:13
we're adding 10.000 years to the regular calendar to represent the human era
00:16
and include all cultures around the world,
00:19
but this year we're expanding the scope beyond humanity
00:22
to showcase forgotten animals and plants from all across the phanerozoic Eon
00:27
like giant armored fish scythe lizards or giant sloths, on 12 elaborate pages.
00:33
Witness how multicellular life has persisted for over half a billion years,
00:37
surviving asteroid impacts, volcanoes and frozen oceans and of course pandemics.
00:43
In the end, life er... finds a way,
00:46
and we want to celebrate that.
00:49
You can get the very shiny high quality limited edition now, until we set out and
00:54
then never again, to support what we do on this channel, to fill the void
00:59
in your soul, or just to have something beautiful to look at.
01:02
As every year, we also have bundles and special calendar deals
01:06
with some of your favourite products.
01:11
Thank you so much to all of the thousands of birds who get the calendar every year,
01:15
you enable us to create videos and to publish them for free for everyone.
01:19
We wish you a happy year 12.022.
01:24
[Music]
01:32
[Music]`;
  }

  var event = new Event("input", {
    bubbles: true,
    cancelable: true,
  });

  $text.dispatchEvent(event);
}

const chalk = require("chalk");

const COLUMNS = parseInt(process.env.COLUMNS, 10) || 100;

const logger = (subjects, i) => (header, body, chalkFn = chalk.reset) => {
  const subjectsNumberHeaders = `[${i + 1} / ${subjects.length}]`;
  const contents = `${subjectsNumberHeaders} [${header}] ${body}`;

  const charactersLeft = COLUMNS - 2 - contents.length;

  const generatePattern = (n) => new Array(n).fill('=').join('');;
  const padStart = generatePattern(
    Math.max(
      Math.floor(charactersLeft / 2),
      0
    )
  );
  const padEnd = generatePattern(
    Math.max(
      Math.ceil(charactersLeft / 2),
      0
    )
  );

  console.log(chalkFn(`${padStart} ${contents} ${padEnd}`));
}

module.exports = { logger, COLUMNS };

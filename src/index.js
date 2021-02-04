const puppeteer = require('puppeteer');
const path = require('path');
const chalk = require('chalk');

const { goToMainPage } = require('./goToMainPage');
const { crawlSubject } = require('./crawlSubject');
const { crawlComment } = require('./crawlComment');
const { getId } = require('./idMap');
const { logger } = require('./logger');
const { write } = require('./write');
const { skip } = require('./skip');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const updatedAt = Date.now();

  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await goToMainPage(page);
  const subjects = await page.$$eval('table .pyt .cie', ($subjects) => $subjects.map(($s) => $s.value));
  await page.close();

  const subjectsData = {};
  let retries = 0;

  for (let i = 0; i < subjects.length;) {
    const log = logger(subjects, i);
    const subject = subjects[i];

    try {
      if (skip.includes(subject)) {
        log('SKIPPING', subject);

        retries = 0;
        i++;
        continue;
      }

      log('STARTED', subject, chalk.cyan.bold);
      const questions = await crawlSubject(browser, i);

      log('QUESTIONS FETCHED', `${subject} (${questions.length})`, chalk.green);

      const numberOfComments = questions.reduce((acc, curr) => curr.comments !== null ? acc + 1 : acc, 0);
      let commentsFetched = 0;

      log('STARTED COMMENTS', `${subject} (${numberOfComments})`, chalk.magentaBright.bold);
      for (const question of questions) {
        const { comments: commentId } = question;

        if (commentId === null) {
          continue;
        }

        const commentsProgress = `${++commentsFetched} / ${numberOfComments}`

        log('COMMENT STARTED', `${subject}.${commentId} (${commentsProgress})`, chalk.magentaBright);
        const comments = await crawlComment(browser, commentId);
        log('COMMENT FETCHED', `${subject}.${commentId} (${commentsProgress})`, chalk.magentaBright);

        question.comments = comments;
      }

      log('FINISHED COMMENTS', `${subject} (${numberOfComments})`, chalk.green);
      log('FINISHED', subject, chalk.green.bold);

      if (questions.length > 0) {
        const id = getId(subject);

        const data = {
          title: subject,
          id,
          data: questions,
          updatedAt,
        }

        subjectsData[id] = questions;

        await write(
          path.join(__dirname, '..', 'out', `${data.id}.json`),
          JSON.stringify(data, null, 2),
        );
      } else {
        log('SKIPPING EMPTY', subject, chalk.bold);
      }

      retries = 0;
      i++;
    } catch (error) {
      if (retries < 4) {
        log('RETRY', `${subject}`, chalk.yellow.bold);
        console.log(chalk.gray(error.stack));
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries++;
      } else {
        log('ERROR', `Skipping ${subject}`, chalk.red.bold);
        console.error(chalk.red(error.stack));
        i++;
      }
    }
  }

  const indexData = {
    updatedAt,
    pages: subjects
      .filter((subject) => subjectsData[getId(subject)]?.length > 0)
      .map((subject) => ({
        title: subject,
        id: getId(subject)
      }))
  }

  await write(
    path.join(__dirname, '..', 'out', `index.json`),
    JSON.stringify(indexData, null, 2),
  );

  browser.close();
})();

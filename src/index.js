const puppeteer = require('puppeteer');
const path = require('path');

const { crawlComment } = require('./crawlComment');
const { goToMainPage } = require('./goToMainPage');
const { crawlSubject } = require('./crawlSubject');
const { logger } = require('./logger');
const { write } = require('./write');

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  const skip = ['Przedmiotowy (prz)'];

  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await goToMainPage(page);
  const subjects = await page.$$eval('table .pyt .cie', ($subjects) => $subjects.map(($s) => $s.value));
  await page.close();

  const subjectsData = [];

  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const log = logger(subjects, i);

    if (skip.includes(subject)) {
      log('SKIPPING', subject);

      continue;
    }

    log('STARTED', subject);
    const questions = await crawlSubject(browser, subject);

    log('QUESTIONS FETCHED', `${subject} (${questions.length})`);
    // console.log(JSON.stringify(questions, null, 2));

    const numberOfComments = questions.reduce((acc, curr) => curr.comments !== null ? acc + 1 : acc, 0);
    let commentsFetched = 0;

    log('STARTED COMMENTS', `${subject} (${numberOfComments})`);
    for (const question of questions) {
      const { comments: commentId } = question;

      if (commentId === null) {
        continue;
      }

      const commentsProgress = `${++commentsFetched} / ${numberOfComments}`

      log('COMMENT STARTED', `${subject}.${commentId} (${commentsProgress})`);
      const comments = await crawlComment(browser, commentId);
      log('COMMENT FETCHED', `${subject}.${commentId} (${commentsProgress})`);
      // console.log(JSON.stringify(comments, null, 2));

      question.comments = comments;
    }

    log('FINISHED COMMENTS', `${subject} (${numberOfComments})`);
    log('FINISHED', subject);

    subjectsData.push(questions);

    const fileName = subject
      .replace(/ /g, '_')
      .replace(/\//g, '_');

    await write(
      path.join(__dirname, '..', 'out', `${fileName}.json`),
      JSON.stringify(questions, null, 2),
    );
  }

  // console.log(JSON.stringify(subjectsData, null, 2));

  browser.close();
})();

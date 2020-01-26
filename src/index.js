const puppeteer = require('puppeteer');

const { goToMainPage } = require('./goToMainPage');
const { crawlAllSubjectData } = require('./crawlAllSubjectData');
const { logger } = require('./logger');

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await goToMainPage(page);
  const subjects = await page.$$eval('table .pyt .cie', ($subjects) => $subjects.map(($s) => $s.value));
  await page.close();

  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const log = logger(subject, i);

    await crawlAllSubjectData(browser, subject, log);
  }

  browser.close();
})();

const { getDataFromSubject } = require('./getDataFromSubject');
const { goToSubject } = require('./goToSubject');
const { goToMainPage } = require('./goToMainPage');

const crawlSubject = async (browser, subject) => {
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  await goToMainPage(page);

  await goToSubject(page, subject);

  const data = await getDataFromSubject(page);

  await page.close();

  return data;
}

module.exports = { crawlSubject };

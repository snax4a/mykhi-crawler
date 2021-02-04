const { getDataFromSubject } = require('./getDataFromSubject');
const { goToSubject } = require('./goToSubject');
const { goToMainPage } = require('./goToMainPage');

const crawlSubject = async (browser, i) => {
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  await goToMainPage(page);

  await goToSubject(page, i);

  const data = await getDataFromSubject(page);

  await page.close();

  return data;
}

module.exports = { crawlSubject };

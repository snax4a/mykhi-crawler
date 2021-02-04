const goToSubject = async (page, i) => {
  const $subjectRows = await page.$$(`.pyt`);
  const $subjectRow = $subjectRows[i];
  const $subjectBtn = await $subjectRow.$('input[type="submit"]');
  await new Promise(resolve => setTimeout(resolve, 100));
  await $subjectBtn.click();
  await page.waitForNavigation();

  const $sendButton = await page.$("input[type=\"submit\"]");
  await $sendButton.evaluate(searchForm => searchForm.click());

  await page.waitForNavigation();

  const $showAllQuestionsButton = await page.$("input[value='POKAŻ WSZYSTKIE PYTANIA']");
  await $showAllQuestionsButton.click();

  await page.waitForNavigation();
};

module.exports = { goToSubject };

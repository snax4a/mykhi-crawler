const goToSubject = async (page, subject) => {
  const $subjectBtn = await page.$(`input[value='${subject}']`);
  await $subjectBtn.click();

  await page.waitForNavigation();

  const $sendButton = await page.$("input[type=\"submit\"]");
  await $sendButton.evaluate(searchForm => searchForm.click());

  await page.waitForNavigation();

  const $showAllQuestionsButton = await page.$("input[value='POKAŻ WSZYSTKIE PYTANIA']");
  await $showAllQuestionsButton.click();
};

module.exports = { goToSubject };

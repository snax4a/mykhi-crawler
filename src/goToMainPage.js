const goToMainPage = async (page) => {
  await page.goto('https://pja.mykhi.org/generatory2.0');
}

module.exports = { goToMainPage };

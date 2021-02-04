const { createPage } = require('./createPage');

const crawlComment = async (browser, comment) => {
  const context = await browser.createIncognitoBrowserContext();
  const page = await createPage(context);

  await page.goto(`https://pja.mykhi.org/generatory2.0/?comment=${comment}`);

  const $table = await page.$('table');
  const comments = await $table.$$eval('tr', ($trs) => {
    let headersCount = 0;
    let data = [];

    for (const $tr of $trs) {
      if ($tr.classList.contains('nag')) {
        headersCount++;
        continue;
      }

      if (headersCount <= 1) {
        continue;
      }

      if ($tr.querySelector('input') !== null) {
        break;
      }

      const $tds = $tr.querySelectorAll('td');

      data.push(
        {
          author: $tds[0].textContent,
          comment: $tds[1].textContent,
          date: $tds[2].textContent,
        }
      );
    }

    return data;
  });

  await page.close();

  return comments;
}

module.exports = { crawlComment };

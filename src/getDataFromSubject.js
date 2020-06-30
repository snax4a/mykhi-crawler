const getDataFromSubject = async (page) => {
  await page.waitForSelector('table');

  const $table = await page.$('table > tbody');
  const data = await $table.$$eval(':scope > tr.pyt, :scope > tr.odp', ($rows, ...rest) => {
    const cleanupField = ($questionElement) => {
      const $commentImg = $questionElement
        .querySelector('img[src="question.png"]')

      if ($commentImg) {
        $commentImg.remove()
      }

      Array.from($questionElement.querySelectorAll('[style]'))
        .forEach($el => $el.removeAttribute('style'))

      Array.from($questionElement.querySelectorAll('img[src]'))
        .forEach($el => {
          const src = $el.getAttribute('src');

          if (src && src.startsWith('grafika/')) {
            $el.setAttribute('src', `https://pja.mykhi.org/generatory2.0/${src}`);
          }
        });

      return $questionElement.innerHTML.replace(/ - \(\d+\)/, '').trim();
    }

    return $rows.reduce((acc, $row) => {
      if ($row.classList.contains('pyt')) {
        const $commentImg = $row
          .querySelectorAll('td')[1]
          .querySelector('img[src="question.png"]')

        const commentIdGroup = $commentImg
          ? $commentImg
            .getAttribute('onclick')
            .match(/\?comment=(\d+)/)
          : null;

        const commentId = (commentIdGroup && commentIdGroup[1])
          ? parseInt(commentIdGroup[1], 10)
          : null

        const numberOfCommentsGroup = $row
          .querySelectorAll('td')[1].textContent
          .trim()
          .match(/\((\d+)\)$/);

        const numberOfComments = numberOfCommentsGroup && parseInt(numberOfCommentsGroup[1], 10);

        return [
          ...acc,
          {
            question: cleanupField($row.querySelectorAll('td')[1]),
            id: commentId,
            comments: numberOfComments > 1
              ? commentId
              : null,
            answers: [],
          }
        ];
      } else {
        const rest = acc.slice(0, -1);
        const last = acc[acc.length - 1];

        return [
          ...rest,
          {
            ...last,
            answers: [
              ...last.answers,
              {
                answer: cleanupField($row.querySelectorAll('td')[1]),
                correct: $row.querySelectorAll('td')[2].textContent === "+"
              }
            ]
          }
        ];
      }
    }, [])
  });

  return data;
}

module.exports = { getDataFromSubject };

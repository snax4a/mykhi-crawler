const getDataFromSubject = async (page) => {
  await page.waitForSelector('table');

  const $table = await page.$('table');
  const data = await $table.$$eval('tr.pyt, tr.odp', ($rows) => {
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
            question: $row.querySelectorAll('td')[1].innerHTML,
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
                answer: $row.querySelectorAll('td')[1].innerHTML,
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

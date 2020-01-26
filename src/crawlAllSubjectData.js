const path = require('path');

const { crawlComment } = require('./crawlComment');
const { crawlSubject } = require('./crawlSubject');
const { write } = require('./write');

const skip = ['Przedmiotowy (prz)']

const crawlAllSubjectData = async (browser, subject, log) => {
  if (skip.includes(subject)) {
    log('SKIPPING', subject);

    return;
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
      return;
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

  const fileName = subject
    .replace(/ /g, '_')
    .replace(/\//g, '_');

  await write(
    path.join(__dirname, '..', 'out', `${fileName}.json`),
    JSON.stringify(questions, null, 2),
  );
}

module.exports = { crawlAllSubjectData };

const puppeteer = require('puppeteer');
const path = require('path');

const { goToMainPage } = require('./goToMainPage');
const { crawlSubject } = require('./crawlSubject');
const { crawlComment } = require('./crawlComment');
const { getId } = require('./idMap');
const { logger } = require('./logger');
const { write } = require('./write');

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  const skip = [
    'Administrowanie bazami danych (ABD)',
    'Algorytmy i Struktury Danych - edux (ASD)',
    'Aplikacje Baz Danych (APBD)',
    'Automaty i Gramatyki (AUG)',
    'Bezpieczeństwo Systemów Informatycznych (ANG) - 2012 (BSI)',
    'Bezpieczeństwo Systemów Informatycznych (BSI)',
    'Bezpieczeństwo Systemów Informatycznych 2018 (BSI_ANG)',
    'BYT_P (BYT)',
    'Edukacja dla bezpieczeństwa (EDB)',
    'Fizyka k1 (FIZK1)',
    'Fizyka k2 (FIZK2)',
    'Fizyka Kolos1 (angielska) (FIZ)',
    'Grafika Komputerowa (GRK)',
    'Hurtownie danych i aplikacje OLAP (HUR)',
    'Legal foundations of business (PPB)',
    'Matematyka Dyskretna - edux - 2012 ZIMA (MAD2012A)',
    'Matematyka Dyskretna 2020 (MAD)',

    'Modelowanie i Analiza Systemów informacyjnych (MAS)',

    'Narzędzia Sztucznej Inteligencji (NAI)',
    'Prawne Podstawy Działalności Gospodarczej (PPB)',
    'RBD egz 2016 zaoczne (RBDz)',
    'Rachunkowość Podmiotow Gospodarczych (RPG)',
    'Relacyjne Bazy Danych (RBD)',
    'SYSTEM DOSKONALENIA KOMPETENCJI PROGRAMISTYCZNYCH (SDKP)',
    'Sieci Komputerowe - ang - egzamin  (SKJ)',
    'Sieci Komputerowe 1 (SKO1/SKJ)',
    'Sieci Komputerowe 2 - edu - 2011 ZIMA (SKO2)',
    'Systemy Baz Danych (SBD)',
    'Systemy Baz Danych zima 2015 (SBD2015)',
    'Systemy operacyjne (SOP)',
    'Technika i Architektura Komputerów (TAK)',
    'Technika i Architekture Komputerów (TAK) [ENG] (TAKE)',
    'Technologie Internetu (TIN)',
    'Technologie Internetu - 2017 (TIN)',
    'Technologie i Platformy Chmury  Obliczeniowej (TPC)',
    'Wstęp do systemów informacyjnych (WSI)',
    'ZBD - pytania od studentów (ZBD)',
    'Zarządzanie projektem informatycznym (ZPR) (ZPR)',
  ];

  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await goToMainPage(page);
  const subjects = await page.$$eval('table .pyt .cie', ($subjects) => $subjects.map(($s) => $s.value));
  await page.close();

  const subjectsData = [];

  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const log = logger(subjects, i);

    if (skip.includes(subject)) {
      log('SKIPPING', subject);

      continue;
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
        continue;
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

    subjectsData.push(questions);

    // const fileName = subject
    //   .replace(/ /g, '_')
    //   .replace(/\//g, '_');

    const data = {
      title: subject,
      id: getId(subject),
      data: questions
    }

    await write(
      path.join(__dirname, '..', 'out', `${data.id}.json`),
      JSON.stringify(data, null, 2),
    );
  }

  const indexData = {
    pages: subjects.map((subject) => ({
      title: subject,
      id: getId(subject)
    }))
  }

  await write(
    path.join(__dirname, '..', 'out', `index.json`),
    JSON.stringify(indexData, null, 2),
  );

  browser.close();
})();

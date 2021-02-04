const createPage = async (context) => {
  const page = await context.newPage();
  await page.setRequestInterception(true);

  page.on('request', (req) => {
    if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
      req.abort();
      return;
    }

    req.continue();
  });

  return page;
}

module.exports = { createPage };

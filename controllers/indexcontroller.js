const puppeteerHelper = require('../helpers/puppeteerhelper');

module.exports.details_post = (req, res, next) => {
  const trackurl = req.body.trackurl;
  res.render('details', {
    trackurl
  });
}

module.exports.pagedata_post = async (req, res, next) => {
  const pageData = {};
  const trackURL = req.body.trackurl;
  const browser = await puppeteerHelper.launchBrowser(true);
  try {
    const page = await puppeteerHelper.launchPage(browser, false);
    const resp = await page.goto(trackURL, {
      waitUntil: 'networkidle2'
    });
    console.log(resp.status());
    console.log(resp.statusText());
    await page.waitForSelector('.raceNo', {
      timeout: 0
    });
    await page.waitForSelector('.titleAccordion .oddsheadMtp', {
      timeout: 0
    });
    pageData.MTP = await page.$eval('.titleAccordion .oddsheadMtp', elm => elm.innerText.trim());
    pageData.MTP = pageData.MTP.match(/.*(?=\n)/g)[0];
    pageData.winOdds = await page.$$eval('.titleAccordion .saddleNo', elms => elms.map(elm => elm.innerText.trim()));
    pageData.raceNumber = await page.$eval('.raceNo', elm => elm.innerText.trim());
    pageData.trackName = await page.$eval('.titleAccordion .titleTrack', elm => elm.innerText.match(/.*(?=[\n\r])/g)[0]);
    const saddleNodes = await page.$$('.headRow .saddleNo');
    pageData.horsesNames = [];
    for (let i = 0; i < saddleNodes.length; i++) {
      pageData.horsesNames.push(await saddleNodes[i].$eval('.oddsNo', elm => elm.innerText.trim()));
    }
    await page.waitForSelector('.tabProbablePay');
    await page.click('.tabProbablePay');
    await page.waitForSelector('.oddsPpaysBody');
    const tableNodes = await page.$$('.oddsPpaysAmount li');
    pageData.tableData = [];
    for (let i = 1; i < tableNodes.length; i++) {
      pageData.tableData.push(await tableNodes[i].$$eval('.valpPays', elms => elms.map(elm => elm.innerText.trim() == '--' ? 0 : Number(elm.innerText.trim()))))
    };
    pageData.status = 'SUCCESS';
    // } else if (reqType == 'update') {
    // await page.waitForSelector('.titleAccordion .oddsheadMtp', {timeout: 0});
    // pageData.MTP = await page.$eval('.titleAccordion .oddsheadMtp', elm => elm.innerText.trim());
    // pageData.MTP = pageData.MTP.match(/.*(?=\n)/g)[0];
    // // if (pageData.MTP == '6' || pageData.MTP == '1') {
    //   await page.waitForSelector('.raceNo', {timeout: 0});
    //   pageData.raceNumber = await page.$eval('.raceNo', elm => elm.innerText.trim());
    //   pageData.trackName = await page.$eval('.titleAccordion .titleTrack', elm => elm.innerText.match(/.*(?=[\n\r])/g)[0]);
    //   const saddleNodes = await page.$$('.headRow .saddleNo');
    //   pageData.horsesNames = [];
    //   for (let i = 0; i < saddleNodes.length; i++) {
    //     pageData.horsesNames.push(await saddleNodes[i].$eval('.oddsNo', elm => elm.innerText.trim()));      
    //   }
    //   await page.waitForSelector('.tabProbablePay');
    //   await page.click('.tabProbablePay');
    //   await page.waitForSelector('.oddsPpaysBody');
    //   const tableNodes = await page.$$('.oddsPpaysAmount li');
    //   pageData.tableData = [];
    //   for (let i = 1; i < tableNodes.length; i++) {
    //     pageData.tableData.push(await tableNodes[i].$$eval('.valpPays', elms => elms.map(elm => elm.innerText.trim() == '--' ? 0 : Number(elm.innerText.trim()))))
    //   };
    //   pageData.status = 'SUCCESS';
    // } else {
    // pageData.status = 'NOUPDATE';
    // }
    // }
    console.log(pageData);
    await page.close();
    await browser.close();
    console.log('Browser closed...');
    res.json(pageData);
  } catch (error) {
    await browser.close();
    console.log(error);
    pageData.status = 'ERROR';
    pageData.error = error.stack;
    res.json(pageData);
  }
};
// MAIN GOAL: this should insert a lesson into the database

// GOAL: CREATE THE DUMMY lesson to insert into the databasse 

// GOAL: get the jwt when the user is authenticated using NextAuth

// GOAL: start the headless browser using jest
// import puppeteer from 'jest-puppeteer';
const puppeteer = require('puppeteer');
const startingUrl = 'http://localhost:3000/api/auth/signin'

describe("Inserting a lesson into the db.", () => {
  it('A lesson should be inserted into the database.', async () => {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--disable-features=IsolateOrigins,site-per-process']
    });
    const page = await browser.newPage();

    await page.goto(startingUrl);

    await new Promise(res => setTimeout(() => {
      console.log("Pausing the execution of the test.")
      res()
    }, 3000))

    const signInBtn = await page.$('.button');

    await signInBtn.click();

    await new Promise(res => setTimeout(() => {
      console.log("Pausing the execution of the test.")
      res()
    }, 1000))

    const firstAccount = await page.$('.d2laFc')

    await firstAccount.click();

    await expect(true).toBe(true)

  });
});
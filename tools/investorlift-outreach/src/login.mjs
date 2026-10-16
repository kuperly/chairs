import { openBrowser, ask, settings } from './common.mjs';

const ctx = await openBrowser();
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto(settings().startUrl);
await ask('Log in to InvestorLift in the opened browser, then press Enter here... ');
await ctx.close();
console.log('Session saved in .profile/');

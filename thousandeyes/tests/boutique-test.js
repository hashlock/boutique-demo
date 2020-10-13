import { By, Key } from 'selenium-webdriver';
import { driver, markers } from 'thousandeyes';

runScript();

async function runScript() {

  await configureDriver();

  markers.start('Load');
  await driver.get('<your Boutique app IP or URL>');
  markers.stop('Load');

  markers.start('Cart');
  await click(By.css(`[href="/product/66VCHSJNUP"] > div`));
  await click(By.css(`.btn`));
  await click(By.id(`email`));
  await typeText('email@domain.com', By.id(`email`));
  markers.stop('Cart');

  markers.start('Order');
  await click(By.xpath(`//button[text()="Place order"]`));
  await waitfor(By.css(`[role="button"]`));
  markers.stop('Order');
  await driver.takeScreenshot();
  await click(By.css(`[role="button"]`));

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().window().setRect({
    width: 1200,
    height: 1373 });

  await driver.manage().setTimeouts({
    implicit: 7 * 1000 // If an element is not found, reattempt for this many milliseconds
  });
}

async function waitfor(selector) {
  await simulateHumanDelay();

  const configuredTimeouts = await driver.manage().getTimeouts();
  const clickAttemptEndTime = Date.now() + configuredTimeouts.implicit;

  await reattemptUntil(attemptToClick, clickAttemptEndTime);

  async function attemptToClick() {
    await driver.findElement(selector);
  }
}

async function click(selector) {
  await simulateHumanDelay();

  const configuredTimeouts = await driver.manage().getTimeouts();
  const clickAttemptEndTime = Date.now() + configuredTimeouts.implicit;

  await reattemptUntil(attemptToClick, clickAttemptEndTime);

  async function attemptToClick() {
    await driver.findElement(selector).
    click();
  }
}

async function reattemptUntil(attemptActionFn, attemptEndTime) {
  const TIME_BETWEEN_ATTEMPTS = 100;
  let numberOfAttempts = 0;
  let attemptError;
  while (Date.now() < attemptEndTime || numberOfAttempts === 0) {
    try {
      numberOfAttempts += 1;
      await attemptActionFn();
    }
    catch (error) {
      attemptError = error;
      await driver.sleep(TIME_BETWEEN_ATTEMPTS);
      continue; // Attempt failed, reattempt
    }
    attemptError = null;
    break; // Attempt succeeded, stop attempting
  }

  const wasAttemptSuccessful = !attemptError;
  if (!wasAttemptSuccessful) {
    throw attemptError;
  }
}

async function simulateHumanDelay() {
  await driver.sleep(550);
}

async function typeText(value, selector) {
  await simulateHumanDelay();
  const element = await driver.findElement(selector);
  await element.clear();
  await element.sendKeys(value);
}
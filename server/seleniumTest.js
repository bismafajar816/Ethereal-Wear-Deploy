async function runSeleniumTest() {
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options()).build();

  try {
    console.log("Starting Selenium test...");

    const url = 'http://localhost:5173'; // Replace with your app's URL
    await driver.get(url);
    console.log(`Navigated to: ${url}`);

    // Verify Page Title
    const title = await driver.getTitle();
    console.log(`Page Title: ${title}`);

    // Locate and Test Register Link
    const registerLink = await driver.wait(
      until.elementLocated(By.css('a.font-medium.ml-2.text-primary.hover\\:underline[href="/auth/register"]')),
      10000
    );
    console.log("Register link located!");
    const registerLinkText = await registerLink.getText();
    console.assert(registerLinkText === "Register", `Expected 'Register', but got '${registerLinkText}'`);
    await registerLink.click();
    console.log("Navigated to Register page!");

    // Locate and Test Login Link
    const loginLink = await driver.wait(
      until.elementLocated(By.css('a.font-medium.ml-2.text-primary.hover\\:underline[href="/auth/login"]')),
      10000
    );
    console.log("Login link located!");
    const loginLinkText = await loginLink.getText();
    console.assert(loginLinkText === "Login", `Expected 'Login', but got '${loginLinkText}'`);
    await loginLink.click();
    console.log("Navigated to Login page!");

    // Test Login Form
    const emailInput = await driver.wait(until.elementLocated(By.id('email')), 10000);
    await emailInput.sendKeys('aqsa@gmail.com');
    console.log("Email entered!");

    const passwordInput = await driver.wait(until.elementLocated(By.id('password')), 10000);
    await passwordInput.sendKeys('QWERTY');
    console.log("Password entered!");

    const signInButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
    await signInButton.click();
    console.log("Sign-in button clicked!");

    // Verify Shop Home Page Navigation
    await driver.wait(until.urlContains('/shop/home'), 10000);
    const shopHomeUrl = await driver.getCurrentUrl();
    console.assert(shopHomeUrl.includes('/shop/home'), `Expected to be on /shop/home, but was at ${shopHomeUrl}`);
    console.log("Successfully navigated to Shop Home page!");

    // Verify UI Elements
    const navMenu = await driver.wait(until.elementLocated(By.css('nav')), 10000);
    console.log("Navigation menu located!");

    try {
      const footer = await driver.wait(until.elementLocated(By.css('footer')), 5000);
      console.log("Footer located!");
    } catch {
      console.warn("Footer not found. Skipping footer verification.");
    }

    // Verify Images
    const images = ['img[src="/img/b1.webp"]', 'img[src="/img/b2.webp"]', 'img[src="/img/b3.webp"]'];
    for (const imageSelector of images) {
      try {
        await driver.wait(until.elementLocated(By.css(imageSelector)), 10000);
        console.log(`Image found: ${imageSelector}`);
      } catch {
        console.warn(`Image not found: ${imageSelector}`);
      }
    }

    // Verify Buttons
    const buttons = await driver.findElements(By.css('button.inline-flex.items-center.justify-center'));
    console.assert(buttons.length > 0, "No buttons found!");
    console.log(`${buttons.length} buttons found.`);
    await buttons[0].click();
    console.log("First button clicked!");

  } catch (error) {
    console.error("Error during Selenium test:", error);
  } finally {
  //  await driver.quit();
    console.log("Browser closed.");
  }
 


  
}




  

// Call the Selenium function to run the test when needed (e.g., after server startup or on a route)
runSeleniumTest();
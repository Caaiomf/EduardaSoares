const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("C:/Users/caiof/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");

const root = __dirname;
const pageUrl = pathToFileURL(path.join(root, "index.html")).href;
const outDir = path.join(root, "output", "playwright");

const viewports = [
  { name: "desktop", width: 1440, height: 1200 },
  { name: "mobile", width: 390, height: 1200 },
];

async function triggerLazyImages(page) {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight * 0.75, 300);
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await wait(120);
    }

    window.scrollTo(0, 0);
    await wait(200);
  });

  await page.waitForLoadState("networkidle");
}

async function waitForImages(page, selector) {
  await page.evaluate(async (targetSelector) => {
    const images = [...document.querySelectorAll(targetSelector)];
    await Promise.all(
      images.map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }),
    );
  }, selector);
}

async function readProjectIntro(page) {
  return page.evaluate(() => ({
    type: document.querySelector("[data-project-type-name]")?.textContent.trim(),
    copy: document.querySelector("[data-project-type-copy]")?.textContent.trim(),
    image: document.querySelector("[data-project-type-image]")?.getAttribute("src"),
  }));
}

async function reviewViewport(browser, viewport) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(pageUrl, { waitUntil: "networkidle" });
  const projectIntroStart = await readProjectIntro(page);
  await page.waitForTimeout(4500);
  const projectIntroAfterRotation = await readProjectIntro(page);
  await triggerLazyImages(page);
  await page.screenshot({
    path: path.join(outDir, `${viewport.name}.png`),
    fullPage: true,
  });

  const metrics = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    const overflowing = [...document.querySelectorAll("*")]
      .filter((element) => element.scrollWidth > element.clientWidth + 1)
      .slice(0, 12)
      .map((element) => ({
        tag: element.tagName,
        className: element.className,
        text: element.textContent.trim().slice(0, 80),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }));

    return {
      title: document.title,
      height: Math.max(body.scrollHeight, html.scrollHeight),
      width: Math.max(body.scrollWidth, html.scrollWidth),
      viewportWidth: window.innerWidth,
      overflowing,
      activeFilters: document.querySelectorAll(".filter-button.active").length,
      visibleCards: [...document.querySelectorAll(".project-card")].filter((card) => getComputedStyle(card).display !== "none").length,
    };
  });

  await page.click('[data-filter="interiores"]');
  const filteredCards = await page.evaluate(() => [...document.querySelectorAll(".project-card")]
    .filter((card) => getComputedStyle(card).display !== "none")
    .map((card) => card.querySelector("h3")?.textContent.trim()));

  await page.click("[data-project-id]");
  await waitForImages(page, "[data-project-dialog] img");
  await page.screenshot({
    path: path.join(outDir, `${viewport.name}-dialog.png`),
    fullPage: false,
  });
  const dialogMetrics = await page.evaluate(() => ({
    open: Boolean(document.querySelector("[data-project-dialog]")?.open),
    title: document.querySelector("[data-dialog-title]")?.textContent.trim(),
    thumbs: document.querySelectorAll("[data-dialog-thumbs] button").length,
    coverLoaded: Boolean(document.querySelector("[data-dialog-cover]")?.complete),
  }));
  await page.click("[data-dialog-close]");

  await page.close();
  return {
    viewport: viewport.name,
    consoleErrors,
    pageErrors,
    metrics,
    projectIntro: {
      start: projectIntroStart,
      afterRotation: projectIntroAfterRotation,
    },
    filteredCards,
    dialogMetrics,
  };
}

async function main() {
  const browser = await chromium.launch();
  const results = [];
  for (const viewport of viewports) {
    results.push(await reviewViewport(browser, viewport));
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

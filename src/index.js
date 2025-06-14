import puppeteer from "puppeteer";

const ScrapeData = async (source, tagForArticleLinks) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(source, {
    waitUntil: "domcontentloaded",
  });

  const articleLinks = await page.evaluate(() => {
    const List = document.querySelectorAll('h1 > a[href^="/blog/"]');

    return Array.from(List).map((link) => link.href);
  });

  const extractDataFromLinks = async (links) => {
    const markdown = [];

    for (const link of links) {
      await page.goto(link, {
        waitUntil: "domcontentloaded",
      });

      const info = await page.evaluate(() => {
        const title = document.querySelector("h1")?.innerText || "";
        const paragraphs = Array.from(
          document.querySelectorAll('div[class^="leading-7"] > p'),
        );
        const data = paragraphs.map((p) => p.innerText).join("\n");
        return { title, data };
      });

      markdown.push(info);
    }

    return markdown;
  };

  const markdown = await extractDataFromLinks(articleLinks);

  console.log(markdown);

  await browser.close();
};

ScrapeData();

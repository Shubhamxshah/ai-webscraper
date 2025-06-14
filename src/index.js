import puppeteer from "puppeteer";

const ScrapeData = async (source, tagForArticleLinks, titleTag, markdownTag) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(source, {
    waitUntil: "domcontentloaded",
  });

  const articleLinks = await page.evaluate((tagForArticleLinks) => {
    const List = document.querySelectorAll(tagForArticleLinks);
    return Array.from(List).map((link) => link.href);
  }, tagForArticleLinks);

  const extractDataFromLinks = async (links) => {
    const markdown = [];

    for (const link of links) {
      try {
        await page.goto(link, {
          waitUntil: "domcontentloaded",
        });

        const info = await page.evaluate((titleTag, markdownTag) => {
          const title = document.querySelector(titleTag)?.innerText || "";
          const paragraphs = Array.from(
            document.querySelectorAll(markdownTag)
          );
          const data = paragraphs.map((p) => p.innerText).join("\n");
          return { title, data };
        }, titleTag, markdownTag);

        markdown.push(info);
      } catch (err) {
        console.error(`Error scraping ${link}:`, err);
      }
    }

    return markdown;
  };

  const markdown = await extractDataFromLinks(articleLinks);

  console.log(markdown);

  await browser.close();
};

ScrapeData(
  "https://interviewing.io/blog",
  `h1 > a[href^="/blog/"]`,
  "h1",
  `div[class^="leading-7"] > p`
);


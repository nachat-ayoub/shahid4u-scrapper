const axios = require("axios");
const cheerio = require("cheerio");

const config = {
  headers: {
    Referer: "https://shahed4u.ws/",
    "Cache-Control": "no-cache",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
  },
};

module.exports.getFilmByUrl = async (url) => {
  try {
    config.headers.Referer = url;
    const { data } = await axios.get(url, config); // encodeURI(url)
    const $ = cheerio.load(data);
    const src = $(
      `body > div.container.page-content > div.media-stream > div:nth-child(1) > input[type=hidden]`
    )
      .first()
      .attr("value");
    return src;
  } catch (e) {
    console.log(e);
  }
};

module.exports.getFilmByName = async (name) => {
  try {
    // Step 1 : Search By Name And Select First Url
    let url = "https://shahed4u.ws/?s=" + name;

    config.headers.Referer = url;
    const search_resp = await axios.default.get(url, config);

    console.log("\n\nResponseData Status", search_resp.status, "\n\n");
    const $ = cheerio.load(search_resp.data);
    const isFound = $(`.MediaGrid .media-block`).length === 0 ? false : true;
    if (isFound) {
      console.log("Results found!!");

      const films_Url = $(`.MediaGrid .media-block .content-box a:first-child`);

      console.log(films_Url.length);

      const getAllFilmsData = async () => {
        const allFilms = [];
        // films_Url.each(async (i, e) => {
        // Step 2 : get Watch Link
        for (let i = 0; i < films_Url.length; i++) {
          config.headers.Referer = $(films_Url[i]).attr("href");
          const watch_resp = await axios.default.get(
            $(films_Url[i]).attr("href"),
            config
          );
          const $$ = cheerio.load(watch_resp.data);

          const watch_link = $$(
            `body > div.container.page-content > div.media-details > div > div.details.col-12.col-m-9 > div.btns > a.btns-play.watch-btn.primary.btn`
          ).attr("href");

          console.log(watch_link);

          const src = await this.getFilmByUrl(watch_link);
          const title = $$(`.title h1`).first().text();
          const rate = $$(`.imdbR span`).first().text();
          const story = $$(`.post-story p`).first().text();
          const poster = $$(`.poster-image`)
            .first()
            .css("background-image")
            .slice(4, -1)
            .replace(/["']/g, "");

          filmData = {
            src,
            title,
            poster,
            story,
            rate,
          };
          // console.log(src);
          allFilms.push(filmData);
          // return filmData;
        }
        return allFilms;
      };

      const data = await getAllFilmsData();
      console.log(data);

      return { error: null, data };
    } else {
      console.log("Oops! No Results found!!");
      return { error: "No Results found!!", data: null };
    }
  } catch (e) {
    console.log(e);
    return { error: "No Results found!!", data: null };
  }
};

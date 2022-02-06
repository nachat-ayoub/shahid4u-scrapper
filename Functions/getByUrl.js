const axios = require("axios");
const cheerio = require("cheerio");

const config = {
  headers: {
    Referer: "https://shahed4u.pro/",
  },
};

module.exports.getFilmByUrl = async (url) => {
  try {
    const { data } = await axios.default.get(url, config); // encodeURI(url)
    const $ = cheerio.load(data);
    const src = $(`iframe`).first().attr("src");
    return src;
  } catch (e) {
    console.log(e);
  }
};

module.exports.getFilmByName = async (name) => {
  try {
    // Step 1 : Search By Name And Select First Url
    const search_resp = await axios.default.get(
      "https://shahed4u.pro/?s=" + name,
      config
    );

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
          const watch_resp = await axios.default.get(
            $(films_Url[i]).attr("href"),
            config
          );
          const $$ = cheerio.load(watch_resp.data);

          const watch_link = $$(
            `body > div.container.page-content > div.media-details > div > div.details.col-12.col-m-9 > div.btns > a.btns-play.watch-btn`
          ).attr("href");

          const src = await this.getFilmByUrl(watch_link);
          const title = $$(`.title h1`).first().text();
          const rate = $$(`.imdbR span`).first().text();
          const story = $$(`.post-story p`).first().text();
          const poster = $$(`.poster-image`)
            .first()
            .css("background-image")
            .slice(4, -1)
            .replace(/["']/g, "");

          // console.log(watch_link);

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
    return { error: "No Results found!!", data: null };
    console.log(e);
  }
};

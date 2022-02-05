const axios = require("axios");

module.exports.getFilmByUrl = async (url) => {
  try {
    const { JSDOM } = require("jsdom");

    const { data } = await axios.default.get(url); // encodeURI(url)
    const dom = new JSDOM(data);
    const src = dom.window.document.querySelector(`iframe`).src;

    return src;
  } catch (e) {
    console.log(e);
  }
};

module.exports.getFilmByName = async (name) => {
  try {
    const { JSDOM } = require("jsdom");

    // Step 1 : Search By Name And Select First Url
    const search_resp = await axios.default.get(
      "https://shahed4u.pro/?s=" + name
    );

    const search_dom = new JSDOM(search_resp.data);
    const isFound = search_dom.window.document
      .querySelector(`.MediaGrid`)
      .hasChildNodes();
    if (isFound) {
      console.log("Results found!!");

      const films_Url = search_dom.window.document.querySelectorAll(
        `.MediaGrid .media-block .content-box a:first-child`
      );

      let allFilms = [];
      console.log(films_Url.length);
      for (let i = 0; i < films_Url.length; i++) {
        // Step 2 : get Watch Link
        const watch_resp = await axios.default.get(films_Url[i].href);
        const watch_dom = new JSDOM(watch_resp.data);
        const watch_link = watch_dom.window.document.querySelector(
          `body > div.container.page-content > div.media-details > div > div.details.col-12.col-m-9 > div.btns > a.btns-play.watch-btn`
        ).href;
        const title =
          watch_dom.window.document.querySelector(`.title h1`).textContent;
        const rate =
          watch_dom.window.document.querySelector(`.imdbR span`).textContent;
        const story =
          watch_dom.window.document.querySelector(`.post-story p`).textContent;
        const poster = watch_dom.window.document
          .querySelector(`.poster-image`)
          .style.backgroundImage.slice(4, -1)
          .replace(/["']/g, "");

        const src = await this.getFilmByUrl(watch_link);
        filmData = {
          src,
          title,
          poster,
          story,
          rate,
        };
        // console.log(src);
        allFilms.push(filmData);
      }

      // console.log(allFilms);
      return { error: null, data: allFilms };
    } else {
      return { error: "No Results found!!", data: null };
    }
  } catch (e) {
    return { error: "No Results found!!", data: null };
    console.log(e);
  }
};

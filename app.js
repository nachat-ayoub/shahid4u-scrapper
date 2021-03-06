const express = require("express");
const {
  getMovieByUrl,
  getFilmByUrl,
  getFilmByName,
} = require("./Functions/getByUrl");
const app = express();
require("dotenv").config();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// set the view engine to ejs
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect("/film");
});

// Watch film :
app.get("/film/watch/", async (req, res) => {
  const src = req.query.src;
  if (src) {
    res.render("player", { src });
  } else res.redirect("/film");
});

// search Film
app.get("/film", async (req, res) => {
  try {
    const { s } = req.query;
    if (s) {
      const resp = await getFilmByName(s);
      res.render("film", { s, error: resp.error, data: resp.data });
    } else {
      res.render("film", { s: "", error: null, data: [] });
    }
  } catch (err) {
    console.log(err);
  }
});

// Series
app.get("/series", (req, res) => {
  const { link } = req.query;
  res.send("query " + link);
});

app.listen(process.env.PORT || 9000, () => {
  console.log(`Server Running...`);
});

// American Underdog 2021

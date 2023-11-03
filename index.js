import express from "express";
import nunjucks from "nunjucks";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

const app = express();
const __dirname = path.resolve();

// body parser set
app.use(bodyParser.urlencoded({ extended: false })); // express 기본 모듈 사용
app.use(bodyParser.json());

// view engine set
app.set("view engine", "html"); // main.html -> main(.html)

// nunjucks
nunjucks.configure("views", {
  watch: true, // html 파일이 수정될 경우, 다시 반영 후 렌더링
  express: app,
});

// mongoose connect
mongoose
  .connect("mongodb://127.0.0.1:27017")
  .then(() => console.log("db 연결 성공"))
  .catch((e) => console.error(e));

// mongoose set
const { Schema } = mongoose;
const WritingSchema = new Schema({
  title: String,
  contents: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const Writing = mongoose.model("Writing", WritingSchema);

// middleware
// main page GET
app.get("/", async (req, res) => {
  let writings = await Writing.find({});
  // console.log(writings);
  res.render("main", { writings });
});

app.get("/write", (req, res) => {
  res.render("write");
});

app.post("/write", async (req, res) => {
  const title = req.body.title;
  const contents = req.body.contents;

  const writing = new Writing({
    title,
    contents,
  });

  const result = await writing
    .save()
    .then(() => {
      // console.log("Success");
      res.render("detail", {
        result: { id: writing.id, title: title, contents: contents },
      });
    })
    .catch((e) => {
      console.error(e);
      res.render("write");
    });
});

app.get("/detail/:id", async (req, res) => {
  const id = req.params.id;

  const detail = await Writing.findOne({ _id: id })
    .then((result) => {
      res.render("detail", { result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;

  const edit = await Writing.findOne({ _id: id })
    .then((result) => {
      res.render("detail", { edit: result });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  const contents = req.body.contents;

  const edit = await Writing.replaceOne(
    { _id: id },
    { title: title, contents: contents }
  )
    .then((result) => {
      console.log("update success");
      res.render("detail", {
        result: { id: id, title: title, contents: contents },
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

app.post("/delete/:id", async (req, res) => {
  const id = req.params.id;

  const delete_content = await Writing.deleteOne({ _id: id })
    .then(() => {
      console.log("delete success");
      res.redirect("/");
    })
    .catch((e) => {
      console.log(e);
    });
});

app.listen(3000, () => {
  console.log("Server is running");
});

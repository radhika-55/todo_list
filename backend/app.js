const express = require("express");
const app = express();
const conn = require("./conn/conn");
const auth = require("./router/auth");
const list = require("./router/list");

app.use(express.json());

conn();

app.get("/", (req, res) => {
  res.json({ message: "MERN Todo API is running" });
});

app.use("/api/v1", auth);
app.use("/api/v2", list);

app.listen(3000, () => {
  console.log("server started on http://localhost:3000");
});

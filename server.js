const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require('cors')

require("dotenv").config();
app.use(cors())

//init middleware
app.use(express.json());

//connect DB
// const db = process.env.DB_URI;
const db = "mongodb+srv://MahdiKazama:Mahdi1986@project.t2hmi.mongodb.net/userDB?retryWrites=true&w=majority";
mongoose.connect(
  db,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err) => {
    if (err) throw err;
    console.log("database connected....");
  }
);

app.use("/api/user", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/abonne", require("./routes/Abonne"));
app.use("/api/employee", require("./routes/employee"));
app.use("/api/caisse", require("./routes/caisse"));


let port = process.env.PORT || 5000;
app.listen(port, () => console.log("server is running on port " + port));

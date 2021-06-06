require("dotenv").config();
// third parties
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
let mongoose = require("mongoose");
let passport = require("passport");

let apiRoutes = require("./routes/api");


const app = express();
const server = http.createServer(app);
//Use CORS
app.use(cors());
// connect to db
mongoose.connect(
    process.env.MONGO_DB_CONN_STRING, {
        useNewUrlParser: true
    },
    function (err) {
        if (err) console.log(err);
        else console.log("connected..");
    }
);

// Use bodyparser
app.use(bodyParser.json({}));

// Bring in defined Passport Strategy

require("./config/passport")(passport);

// Initialize passport for use
app.use(passport.initialize());
app.use(passport.session());


app.use("/api", apiRoutes);

app.use("/", (req, res) => {
  res.json({
    IsSuccess: true,

  });
});



// Port Set
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`started on port: ${port}`);
});
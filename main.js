const express = require("express"),
  app = express(),
  router = require("./routes/index"),
  methodOverride = require("method-override"),
  layouts = require("express-ejs-layouts"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  cookieParser = require("cookie-parser"),
  expressSession = require("express-session"),
  expressValidator = require("express-validator"),
  connectFlash = require("connect-flash"),
  User = require("./models/user"),
  homeController = require("./controllers/homeController");
//
//using Promises with Mongoose
mongoose.Promise = global.Promise;
//initiate connection to MongoDB cloud or local
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/confetti_cuisine",
  {
    useNewUrlParser: true,
  }
);
mongoose.set("useCreateIndex", true);
//connect to db
const db = mongoose.connection;
//invokes callback once upon receiving an "open" event from the database
db.once("open", () => {
  console.log("Successfully connected to MongoDB using Mongoose!");
});
//
//Middlewares; middlewares are invoked in the order they are defined
//
//app.use is global middlewares; invoked on every request
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(methodOverride("_method", { methods: ["POST", "GET"] }));
app.use(layouts);
app.use(express.static("public"));
app.use(express.json());

//use sessions through cookies setup
app.use(cookieParser("my_passcode"));
app.use(
  expressSession({
    secret: "my_passcode",
    cookie: {
      maxAge: 4000000,
    },
    resave: false,
    saveUninitialized: false,
  })
);
//express validator setup
app.use(expressValidator());

//conect-flash setup
app.use(connectFlash());

//passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//save flash messages from req.flash(), set loggedIn flag/var, and set current user
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash(); //key/value pairs
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

app.use(homeController.logRequestPaths);
//handle all routes that starts with /
app.use("/", router);

const server = app.listen(app.get("port"), () => {
  console.log(`Server is running on port ${app.get("port")}`);
});

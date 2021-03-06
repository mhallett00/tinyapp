// WELCOME TO TINYAPP!
// --------------------------------------------------------
// REQUIRE, USE, SET
// --------------------------------------------------------

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");


app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({
  name: "session",
  keys: ["key1","key2"]
}));

app.set("view engine", "ejs");

// --------------------------------------------------------
// GLOBAL CONSTANTS
// --------------------------------------------------------

const saltRounds = 10;
const PORT = 8080;
const {
  getUserByEmail,
  generateRandomString,
  urlsByUser
} = require("./helpers");

// --------------------------------------------------------
// DATABASE DECLARATIONS
// --------------------------------------------------------

const urlDatabase = {};
const users = {};

// --------------------------------------------------------
// TINYAPP ROUTING
// --------------------------------------------------------

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.redirect("login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//shows urls for the logged in user, asks to register/login for visitors/logged out users
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
    urls: urlsByUser(urlDatabase, req.session["user_id"])
  };

  res.render("urls_index", templateVars);
});

// gets the registration form
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]]
  };
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

// registers a new user under a unique ID if not currently in the user database
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Error 400\nPlease fill out the fields!");
  } else if (getUserByEmail(users, req.body.email)) {
    res.status(400).send("Error 400\nAccount already exists!");
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, saltRounds)
    };
    req.session["user_id"] = userID;
    res.redirect("/urls");
  }
});

// checks databse for registered user and logs them in
app.post("/login", (req, res) => {
  const user = getUserByEmail(users, req.body.email);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session["user_id"] = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Error 403\nEmail not found or password incorrect! Please try again or register!");
  }
});

// Gets login form
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]]
  };
  if (req.session["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

// Logout user, clears cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// redirect to the original URL when clicking on a shortURL from it's creation route
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('no URL');
  }
});

// posts edits to the original url for logged in users editing their short URL. Redirects in the case of logged out users
app.post("/urls/:id", (req,res) => {
  if (!req.session["user_id"]) {
    res.status(403).send("Please login to edit short links!");
  } else if (urlDatabase[req.params.id].userID === users[req.session["user_id"]].id) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(403).send("You don't own this link!");
  }


});

// enters a random key into the database for the new shortURL. Also redirects to the shortURL's creation route
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };
  res.redirect(`/urls/${shortURL}`);
});

// deletes a short URL entry from the urlDatabase if the logged in user owns the short URL
app.post("/urls/:shortURL/delete", (req,res) => {
  if (!req.session["user_id"]) {
    res.status(403).send("please log in to delete a short link!");
  } else if (urlDatabase[req.params.shortURL].userID === users[req.session["user_id"]].id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("You don't own this!");
  }
});

// gets the new URL form to create a short URL for logged in users.
app.get("/urls/new", (req,res) =>{
  const templateVars = {
    user: users[req.session["user_id"]]
  };
  if (users[req.session["user_id"]]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// shows the short URL entry
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  
  if (req.session['user_id'] === undefined) {
    res.status(403).send("No credentials! Please login or register!");
  } else if (urlDatabase[req.params.shortURL] !== undefined && req.session['user_id'] !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send("You don't have permission to change this link!");
  }

  res.render("urls_show", templateVars);
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
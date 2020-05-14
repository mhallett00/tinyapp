const express = require("express");
const bodyParser = require("body-parser");
const app = express();
// const cookie = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const PORT = 8080; // default port 8080
const saltRounds = 10;

app.use(bodyParser.urlencoded({extended:true}));
// app.use(cookie());
app.use(cookieSession({
  name: 'session', 
  keys: ['key1','key2']
}));

app.set("view engine", "ejs");

const urlDatabase = {};

// Users database
const users = {};

function generateRandomString() {
const alphaNumString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let randomString = '';
  for (i = 0; i < 6; i++) {
    randomString += alphaNumString[Math.floor(Math.random() * alphaNumString.length)]
  } 
return randomString;
};

function checkIfEmailExists(users, email) {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id];
    } 
  }
};

function urlsByUser(urls, user) {
  const userURLS = {};

  for (url in urls) {
    // console.log(urls[url].userID, user)
    if (urls[url].userID === user) {
     userURLS[url] = urls[url]
    }
  }
  return userURLS;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  // console.log(req.session);
  // console.log(req.session["user_id"]);
  let templateVars = { 
    user: users[req.session["user_id"]],
    urls: urlsByUser(urlDatabase, req.session["user_id"]) 
  };

  console.log(templateVars.urls)
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
console.log(req.session);
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if(req.body.email && req.body.password && !checkIfEmailExists(users, req.body.email)) {
    let userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, saltRounds)
    };
    req.session["user_id"] = userID;
    res.redirect("/urls");
  } else {
    res.status(400).send("Error 400\nInvalid entry or account already registered!");
    
  }
})

app.post("/login", (req, res) => {
  const user = checkIfEmailExists(users, req.body.email)
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
      req.session["user_id"] = user.id;
      res.redirect("/urls");
  } else {
    res.status(403).send("Error 403\nEmail not found or password incorrect! Please try again or register!")
  }
})

app.get("/login", (req, res) => {
let templateVars = {
  user: users[req.session["user_id"]]
};
  res.render("login", templateVars);
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
})

// Redirect to the original URL when clicking on a shortURL from it's creation route
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id", (req,res) => {
  if (urlDatabase[req.params.id].userID === req.session["user_id"]) {
  urlDatabase[req.params.id].longURL = req.body.longURL
}
  res.redirect("/urls")

})

// enters a random key into the database for the new shortURL. Also redirects to the shortURL's creation route
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };
  res.redirect(`/urls/${shortURL}`);
});

// deletes a short URL entry from the urlDatabase updated to prevent others from deleting content
app.post("/urls/:shortURL/delete", (req,res) => {
  // console.log(users[req.cookies["user_id"]].id)
  // console.log(urlDatabase[req.params])
  // console.log(urlDatabase[req.params.shortURL].userID)

  if (urlDatabase[req.params.shortURL].userID === users[req.session["user_id"]].id) {
    delete urlDatabase[req.params.shortURL];
  };
  res.redirect("/urls");
})

app.get(("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  }
  res.render("urls_show", templateVars);
}));

app.get("/urls/new", (req,res) =>{
  let templateVars = {
    user: users[req.session["user_id"]]
  }
  if (users[req.session["user_id"]]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    user: users[req.session["user_id"]], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
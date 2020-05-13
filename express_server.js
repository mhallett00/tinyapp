const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require('cookie-parser');


app.use(bodyParser.urlencoded({extended:true}));
app.use(cookie());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Users database
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};

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

// function checkIfPasswordsMatch(

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
  let templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if(req.body.email && req.body.password && !checkIfEmailExists(users, req.body.email)) {
    let randomUserID = generateRandomString();
    users[randomUserID] = req.body;
    users[randomUserID].id = randomUserID;
    res.cookie("user_id", randomUserID);
    res.redirect("/urls");
  } else {
    res.status(400).send("Error 400\nInvalid entry or account already registered!");
    
  }
})

app.post("/login", (req, res) => {
  const user = checkIfEmailExists(users, req.body.email)
  if (user && user.password === req.body.password) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
  } else {
    res.status(403).send("Error 403\nEmail not found or password incorrect! Please try again or register!")
  }
})

app.get("/login", (req, res) => {
let templateVars = {
  user: users[req.cookies["user_id"]]
};
  res.render("login", templateVars);
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
})

// Redirect to the original URL when clicking on a shortURL from it's creation route
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id", (req,res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls")
})

// enters a random key into the database for the new shortURL. Also redirects to the shortURL's creation route
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// deletes a short URL entry from the urlDatabase
app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.get(("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_show", templateVars);
}));

app.get("/urls/new", (req,res) =>{
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    user: users[req.cookies["user_id"]], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
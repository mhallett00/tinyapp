
// Cross checks the users object by email and returns the randonly generated user ID key if the email already exists
const getUserByEmail = (users, email) => {
  for (let user in users) {
    if (users[user].email === email) {
      
      return users[user];
    }
  }
  return undefined;
};

// Returns a 6 digit "random" string
const generateRandomString = () => {
  const alphaNumString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    randomString += alphaNumString[Math.floor(Math.random() * alphaNumString.length)];
  }

  return randomString;

};

// Returns a new object containing all the urlsDatabase entries that belong to the user
const urlsByUser = (urls, user) => {
  const userURLS = {};
  
  for (let url in urls) {
    if (urls[url].userID === user) {
      userURLS[url] = urls[url];
    }
  }

  return userURLS;

};


module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsByUser
};

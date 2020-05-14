
// Cross checks the users object by email and returns the randonly generated user ID key if the email already exists 
function getUserByEmail(users, email) {
  for (let user in users) {
    if (users[user].email === email) {
      
      return users[user];
    } 
  }
  return undefined;
};

// Returns a 6 digit "random" string
function generateRandomString() {
  const alphaNumString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

    for (i = 0; i < 6; i++) {
      randomString += alphaNumString[Math.floor(Math.random() * alphaNumString.length)]
    } 

  return randomString;

  };

  // Returns a new object containing all the urlsDatabase entries that belong to the user
  function urlsByUser(urls, user) {
    const userURLS = {};
  
    for (url in urls) {
      if (urls[url].userID === user) {
       userURLS[url] = urls[url]
      }
    }

    return userURLS;

  };


module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsByUser
};

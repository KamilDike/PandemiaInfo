
//CLOUD FUNCTIONS
// const admin = require('firebase-admin');
// admin.initializeApp();

// const db = admin.firestore();


//LOCAL SERV
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://epidemicinfo-dee86.firebaseio.com"
});

exports.admin = admin;
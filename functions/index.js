const functions = require("firebase-functions");
const fbAdmin = require("firebase-admin");
const cors = require("cors")({ origin: true });
fbAdmin.initializeApp();

const {
  userSignup,
  getUser,
  getUsers,
} = require("./services/users/usersService");
const { updateProfile } = require("./services/profile/profileService");
const { selectUser, getMatches } = require("./services/matches/matchService");

exports.userSignup = userSignup;
exports.getUser = getUser;
exports.getUsers = getUsers;

exports.updateProfile = updateProfile;

exports.selectUser = selectUser;
exports.getMatches = getMatches;
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

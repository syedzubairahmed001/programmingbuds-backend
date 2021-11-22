const functions = require("firebase-functions");
const fbAdmin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const { verifyIdToken } = require("../../helpers/auth");

// getUser, selectUser, rejectUser, showUsers, updateProfile, showMatches, showLikes

exports.userSignup = functions.auth.user().onCreate(async (user) => {
  console.log(user);
  return fbAdmin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    profilePictureURL: user.photoURL,
    name: user.displayName,
    linkedin: "",
    github: "",
    profileProgram: "",
    lang: "",
  });
});

exports.getUser = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    console.log("fetching");
    const userEmail = req.get("email");
    const user = await fbAdmin
      .firestore()
      .collection("users")
      .where("email", "==", userEmail)
      .get();
    if (user) {
      return res.json({
        data: user.docs[0],
      });
    } else {
      return res.json({
        error: {
          message: "user not found",
        },
      });
    }
  });
});

exports.getUsers = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const userId = req.get("userId");

    const users = await fbAdmin.firestore().collection("users").get();
    if (users) {
      return res.json({
        data: users,
      });
    } else {
      return res.json({
        error: {
          message: "users not found",
        },
      });
    }
  });
});

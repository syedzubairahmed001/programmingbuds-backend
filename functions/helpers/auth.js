const fbAdmin = require("firebase-admin");
exports.verifyIdToken = async (idToken) => {
  console.log(idToken);
  return fbAdmin.auth().verifyIdToken(idToken);
};






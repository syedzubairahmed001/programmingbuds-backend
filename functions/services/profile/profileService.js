const functions = require("firebase-functions");
const fbAdmin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const { verifyIdToken } = require("../../helpers/auth");

exports.updateProfile = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const userId  = req.get("userId")

      const { linkedin, github, profileProgram, lang } = req.body || {};
      // const user = await fbAdmin
      //   .firestore()
      //   .collection("users")
      //   .where("email", "==", authUserEmail)
      //   .get();
      // console.log(user.docs);
      const updateUser = await fbAdmin
        .firestore()
        .collection("users")
        .doc(userId)
        .update(
          {
            linkedin,
            github,
            profileProgram,
            lang,
            profileUpdatedAt: new Date(),
          },
          {
            merge: true,
          }
        );
      return res.json({
        success: true,
      });
    } catch (error) {
      console.log(error);
    }
  });
});

const functions = require("firebase-functions");
const fbAdmin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const { verifyIdToken } = require("../../helpers/auth");

const matchStates = require("../../matchStates.json");

exports.selectUser = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    const authUser = await verifyIdToken(req.get("Authorization"));
    const userId = req.get("userId");
    const { otherUserId } = req.body || {};
    if (!otherUserId) {
      res.json({
        error: {
          message: "otherUserId is required",
        },
      });
    }
    let currUserCreatedRelation = await fbAdmin
      .firestore()
      .collection("userRelations")
      .where("relationFromId", "==", userId)
      .where("relationToId", "==", otherUserId)
      .get();
    currUserCreatedRelation = currUserCreatedRelation.docs[0];
    if (currUserCreatedRelation) {
      const newStatus = await updateRelation({
        relationFromId: currUserCreatedRelation[0].relationFromId,
        relationToId: currUserCreatedRelation[0].relationToId,
        currentStatus: matchStates.select,
        previousStatus: currUserCreatedRelation[0].status,
      });
      return res.json({
        success: true,
        match: newStatus,
      });
    } else {
      let otherUserCreatedRelation = await fbAdmin
        .firestore()
        .collection("userRelations")
        .where("relationFromId", "==", otherUserId)
        .where("relationToId", "==", userId)
        .get();
      otherUserCreatedRelation = otherUserCreatedRelation.docs[0];
      if (otherUserCreatedRelation) {
        const newStatus = await updateRelation({
          relationFromId: otherUserCreatedRelation[0].relationFromId,
          relationToId: otherUserCreatedRelation[0].relationToId,
          currentStatus: matchStates.select,
          previousStatus: otherUserCreatedRelation[0].status,
        });
        return res.json({
          success: true,
          match: newStatus,
        });
      }
    }

    const newStatus = await updateRelation({
      relationFromId: userId,
      relationToId: otherUserId,
      currentStatus: matchStates.select,
      previousStatus: null,
    });
    return res.json({
      success: true,
      match: newStatus,
    });

    const user = await fbAdmin
      .firestore()
      .collection("users")
      .doc(authUser.uid)
      .get();
    if (user) {
      return res.json({
        data: user,
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

exports.getMatches = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    const userId = req.get("userId");
    const currUserCreatedRelation = await fbAdmin
      .firestore()
      .collection("userRelations")
      .where("relationFromId", "==", userId)
      .where("status", "==", matchStates.match)
      .get();
    const otherUserCreatedRelation = await fbAdmin
      .firestore()
      .collection("userRelations")
      .where("relationToId", "==", userId)
      .where("status", "==", matchStates.match)
      .get();

    let relationArr = [];
    relationArr = currUserCreatedRelation.docs.map((e) => {
      return e.relationToId;
    });
    relationArr = relationArr.filter((e) => {
      return !otherUserCreatedRelation.docs.includes(e);
    });
    let tempArr = otherUserCreatedRelation.docs.map((e) => {
      return e.relationFromId;
    });
    relationArr = [...relationArr, ...tempArr];

    const matchedUsers = await fbAdmin
      .firestore()
      .collection("users")
      .where(
        fbAdmin.firestore.FieldPath.documentId(),
        "array-contains-any",
        relationArr
      )
      .get();
    return res.json({
      data: matchedUsers,
    });
  });
});

const updateRelation = async ({
  relationFromId,
  relationToId,
  previousStatus,
  currentStatus,
}) => {
  let status = "";
  if (!previousStatus) {
    status = currentStatus;
  } else {
    if (
      previousStatus === matchStates.reject ||
      previousStatus === matchStates.match
    ) {
      return;
    } else if (previousStatus === matchStates.select) {
      status = matchStates.match;
    }
  }
  let relationData = await fbAdmin
    .firestore()
    .collection("userRelations")
    .where("relationFrom", "==", authUser.uid)
    .get();
  relationData = relationData.docs[0];

  await fbAdmin
    .firestore()
    .collection("userRelations")
    .doc(relationData._ref._path.segments[1])
    .set(
      {
        relationFromId,
        relationToId,
        status,
      },
      { merge: true }
    );
  return {
    match: status === matchStates.match ? true : false,
  };
};

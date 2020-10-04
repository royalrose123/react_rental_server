global.XMLHttpRequest = require("xhr2");

const firebase = require("firebase/app");
const admin = require("firebase-admin");
const { v4: uuid } = require("uuid");
require("firebase/storage");
require("firebase/database");
require("firebase/auth");

const { TOKEN_ERROR } = require("../constants/firebaseMessage");
const serviceAccount = require("../react-rental-db23c-firebase-adminsdk-t97xi-4e2d0d4613.json");

const firebaseConfig = {
  apiKey: "AIzaSyCp5j6T62AOD-7qkEt_0lMkepvGMNiBl6w",
  authDomain: "react-rental-db23c.firebaseapp.com",
  databaseURL: "https://react-rental-db23c.firebaseio.com",
  projectId: "react-rental-db23c",
  storageBucket: "react-rental-db23c.appspot.com",
  messagingSenderId: "1041973803814",
  appId: "1:1041973803814:web:226798689401c1fd8c1fe7",
  measurementId: "G-MJ7528V4EE",
};

firebase.initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://react-rental-db23c.firebaseio.com",
});

function getFirebaseData(ref, orderBy = null, value) {
  if (!orderBy) {
    return firebase
      .database()
      .ref(ref)
      .once("value")
      .then((snap) => snap.val())
      .then((val) => {
        return val ? Object.keys(val).map((key) => val[key]) : [];
      });
  } else {
    return firebase
      .database()
      .ref(ref)
      .orderByChild(orderBy)
      .equalTo(value)
      .once("value")
      .then((snap) => snap.val())
      .then((val) => {
        return Array.isArray(val)
          ? val.filter((item) => item)[0]
          : Object.values(val)[0];
      });
  }
}

function setFirebaseData(ref, id, data) {
  return firebase
    .database()
    .ref(`${ref}/${id}`)
    .update({ ...data });
}

function uploadFile(file, postId) {
  return new Promise(async (resolve, reject) => {
    const { createReadStream, filename, mimetype, encoding } = await file;

    const stream = createReadStream();

    const storage = firebase.storage();
    const storageRef = storage.ref();

    const newFilename = `${filename}`;
    const pathname = `images/house${postId}/${uuid()}_${newFilename}`;

    const tempFile = [];

    stream
      .on("data", async (data) => {
        tempFile.push(data);
      })
      .on("end", async () => {
        var newbuff = Buffer.concat(tempFile);

        storageRef
          .child(pathname)
          .put(newbuff)
          .then((result) => {
            let pathReference = storageRef.child(pathname);

            pathReference.getDownloadURL().then(function (url) {
              return resolve({ url, filename: newFilename });
            });
          })
          .catch((error) => console.log("uploadImg error", error));
      });
  });
}

function createUserAccount(data) {
  return firebase
    .auth()
    .createUserWithEmailAndPassword(data.email, data.password)
    .then(async (result) => {
      const { user } = result;
      const { uid, email, displayName, photoURL } = user;

      const userData = {
        userId: uid,
        email,
        gender: "",
        phone: "",
        userCreateTime: new Date().getTime(),
        userName: displayName,
        userPhoto: photoURL,
      };

      await user.sendEmailVerification();

      await setFirebaseData("user", uid, userData);

      return { uid };
    })
    .catch((error) => {
      console.log("error", error);
      return error;
    });
}

function login(data) {
  return firebase
    .auth()
    .signInWithEmailAndPassword(data.email, data.password)
    .then(async (result) => {
      const { user } = result;
      const { emailVerified, uid } = user;
      if (!emailVerified) {
        throw new Error("信箱尚未驗證，請先前往驗證");
      } else {
        const token = await user.getIdToken(true);

        const userInfo = await getFirebaseData("user", "userId", uid);

        return {
          token,
          email: userInfo.email,
          userId: userInfo.userId,
          displayName: userInfo.displayName,
          photoURL: userInfo.photoURL,
          emailVerified: userInfo.emailVerified,
          phoneNumber: userInfo.phoneNumber,
        };
      }
    });
}

function login(data) {
  return firebase
    .auth()
    .signInWithEmailAndPassword(data.email, data.password)
    .then(async (result) => {
      const { user } = result;
      const { emailVerified, uid } = user;
      if (!emailVerified) {
        throw new Error("信箱尚未驗證，請先前往驗證");
      } else {
        const token = await user.getIdToken();

        const userInfo = await getFirebaseData("user", "userId", uid);

        return {
          token,
          email: userInfo.email,
          userId: userInfo.userId,
          displayName: userInfo.displayName,
          photoURL: userInfo.photoURL,
          emailVerified: userInfo.emailVerified,
          phoneNumber: userInfo.phoneNumber,
        };
      }
    });
}

async function logout(data) {
  await firebase.auth().signOut();

  const user = await firebase.auth().currentUser;

  if (!user) {
    return { returnCode: "0000", message: "Logout successfully!" };
  } else {
    throw new Error("登出失敗");
  }
}

function verifyToken(token) {
  const newToken = token.split("Bearer ").join("");

  return admin
    .auth()
    .verifyIdToken(newToken)
    .then((decodedToken) => {
      let uid = decodedToken.uid;

      return uid;
    })
    .catch(function (error) {
      console.log("checkToken error 11111", error);

      const { errorInfo } = error;
      const { code } = errorInfo;

      const errorMessage = TOKEN_ERROR[code];

      if (errorMessage) {
        throw new Error(TOKEN_ERROR[code]);
      } else {
        throw new Error(code);
      }
    });
}

module.exports = {
  getFirebaseData,
  setFirebaseData,
  uploadFile,
  createUserAccount,
  login,
  logout,
  verifyToken,
};

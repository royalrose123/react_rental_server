global.XMLHttpRequest = require("xhr2");

const firebase = require("firebase/app");
const { v4: uuid } = require("uuid");
require("firebase/storage");
require("firebase/database");

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
        return Array.isArray(val) ? val.filter(item => item)[0] : Object.values(val)[0];
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

module.exports = { getFirebaseData, setFirebaseData, uploadFile };

global.XMLHttpRequest = require("xhr2");

const firebase = require("firebase/app");
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

function getFirebaseData(ref) {
  return firebase
    .database()
    .ref(ref)
    .once("value")
    .then((snap) => snap.val())
    .then((val) => {
      return val ? Object.keys(val).map((key) => val[key]) : [];
    });
}

function setFirebaseData(ref, id, data) {
  return app
    .database()
    .ref(`${ref}/${id}`)
    .update({ ...data });
}

function uploadFile(file, thisPostId) {
  return new Promise(async (resolve, reject) => {
    const { createReadStream, filename, mimetype, encoding } = await file;

    const stream = createReadStream();

    const storage = firebase.storage();
    const storageRef = storage.ref();

    stream.on("data", async (data) => {
      const uploadImg = storageRef.child(`images/${filename}`).put(data);

      uploadImg.on(
        "state_changed",
        function (snapshot) {
          let progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`${thisPostId} progress`, progress);
          switch (progress) {
            case 0:
              break;
            case 100:
              break;
          }
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              //                console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              //                console.log('Upload is running');
              break;
          }
        },
        function (error) {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case "storage/unauthorized":
              console.log("storage/unauthorized", error);
              break;
            case "storage/canceled":
              console.log("storage/canceled", error);
              break;
            case "storage/unknown":
              console.log("storage/unknown", error);
              break;
          }
        },
        function () {
          let pathReference = storageRef.child(`images/${filename}`);

          pathReference.getDownloadURL().then(function (url) {
            console.log("getDownloadURL url 66666", url);
            return resolve(url);
          });
        }
      );
    });
  });
}

module.exports = { getFirebaseData, setFirebaseData, uploadFile };

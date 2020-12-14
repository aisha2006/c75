import * as firebase from 'firebase';
require("@firebase/firestore")

var firebaseConfig = {
    apiKey: "AIzaSyCdinZub4GPgUbJRTxliULCtXr_7q5ZiF0",
    authDomain: "wily-app-362ab.firebaseapp.com",
    projectId: "wily-app-362ab",
    storageBucket: "wily-app-362ab.appspot.com",
    messagingSenderId: "1005063272757",
    appId: "1:1005063272757:web:ae3149821657e2019db47c"
  };

  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();
/**
 * Firebase configuration and initialization.
 * Configures the Firebase SDK with the provided credentials.
 */
var config = {
  apiKey: "AIzaSyAF-IdZDqP_R2TwdOmUqB9iNjYJpSJMGpE",
  authDomain: "vaultin-code.firebaseapp.com",
  projectId: "vaultin-code",
  storageBucket: "vaultin-code.firebasestorage.app",
  messagingSenderId: "994300410425",
  appId: "1:994300410425:web:8ad4600314558f3c84abe8",
  measurementId: "G-20JN452H3S",
  databaseURL: "https://vaultin-code-default-rtdb.asia-southeast1.firebasedatabase.app"
};
firebase.initializeApp(config);
var db = firebase.database();


var url = window.location.href;



firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
      const uid = user.uid;
    getRepoFiles();
        document.getElementById("no-repo-chosen").style.display = "none";

              document.querySelector(".main--editor").style.display = "block";
    init();
console.log("init happened");
      // Display user image


      if (user !== null) {
          user.providerData.forEach(providerData => {
              document.getElementById("user-image-editor").src = providerData.photoURL;
          });
      }
  } else {
      window.location.href = "http://localhost/login?redirect=" + btoa(url);
    // firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
    // .then((result) => {
    //     console.log("User signed in:", result.user);
    // })
    // .catch((error) => {
    //     console.error("Sign-in error:", error);
    // });
    
  }
});


function expand(m){

var n = document.getElementById(m).style.display;

if (n === "none") {
document.getElementById(m).style.display="block";
}  else {
document.getElementById(m).style.display="none";
}
}
function sidebar(){

  var n = document.getElementById('output').style.display;

if (n === "none") {
  document.getElementById('output').style.display="block";
  document.querySelector('.editor-container').style.width='';
  window.editor.layout()
}  else {
  document.getElementById('output').style.display="none";
  document.querySelector('.editor-container').style.width='100%';
  window.editor.layout()
}
}



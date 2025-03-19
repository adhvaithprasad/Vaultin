/**
 * Firebase configuration and initialization.
 * Configures the Firebase SDK with the provided credentials.
 */
var config = {
  apiKey: "AIzaSyC-3XDB0vSiQlbGL-Sa9rOiteFYitYfstw",
  authDomain: "firescrypt-web.firebaseapp.com",
  databaseURL: "https://firescrypt-web-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "firescrypt-web",
  storageBucket: "firescrypt-web.appspot.com",
  messagingSenderId: "276701233302",
  appId: "1:276701233302:web:5e513b1d8c681e830082b7",
  measurementId: "G-T12DZ6GPNN"
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
              document.getElementById("user-image-editor").src ="https://api.dicebear.com/9.x/dylan/svg?seed="+uid;
          });
      }
  } else {
      window.location.href = "http://localhost/auth?redirect=" + btoa(url);
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



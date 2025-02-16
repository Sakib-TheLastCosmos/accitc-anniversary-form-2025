import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  doc,
  getFirestore,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  arrayUnion,
  setDoc
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import "./index.css";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// Function to Handle Google Sign-In
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("User signed in:", user);
    goNext($(".button-0").parent())
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    alert("Authentication failed! Please try again.");
  }
};

// Check If User is Authenticated Before Showing Page
onAuthStateChanged(auth, (user) => {
  if (user) {
    goNext($(".button-0").parent())
  }
});

$(document).ready(async () => {
  // Google Sign-In Button Event
  $("#google-signin-btn").click(e => {
    e.preventDefault();
    signInWithGoogle()
  });

  $(".form-wrapper").on("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission on Enter key
    }
  });

  $(".button").click((e) => {
    e.preventDefault();
  });

  const data = {};

  const DOM = {
    button1: $(".button-1"),
    button2: $(".button-2"),
    button3: $(".button-3"),
    radioButtons: document.querySelectorAll('input[type="radio"][name="r1"]'),
    totalPayment: $("#total-payment")
  };

  DOM.button1.click(async () => {
    data.name = $("#name").val();
    data.session = $("#dropdownSelect").val();
    data.post = $("#post").val();
    data.phone = $("#phone").val();
    data.email = $("#mail").val();
    data.facebook = $("#fb").val();

    if (!data.name || !data.session || !data.post || !data.phone || !data.email || !data.facebook) {
      alert("Please fill in all the required fields.");
    } else {
        goNext(DOM.button1);
      }
  });

  $(".bkash").click(() => {
    data.payment_method = "bkash";
  });

  $(".nagad").click(() => {
    data.payment_method = "nagad";
  });

  function updateButtonText() {
    // Find the selected radio button
    const selectedRadio = document.querySelector('input[type="radio"][name="r1"]:checked');

    if (selectedRadio) {
        // Get the corresponding price from the adjacent label
        const priceText = selectedRadio.nextElementSibling.querySelector("p").textContent;

        // Update the button text
        console.log(priceText)
        const paymentButton = document.querySelector('.button-2');
        paymentButton.textContent = `Pay ${priceText}`;
    }
  }

  // Add event listeners to each radio button
  DOM.radioButtons.forEach(radio => {
      radio.addEventListener("change", updateButtonText);
  });

  DOM.button2.click(e => {
    data.platter = $("input[name='r1']:checked").val();

    const selectedRadio = document.querySelector('input[type="radio"][name="r1"]:checked');
    if (selectedRadio) {
        const selectedAmount = parseFloat(selectedRadio.getAttribute("data-amount"));
        data.amount = selectedAmount
    }

    goNext(DOM.button2);

    DOM.totalPayment.html(`Total Payment: ${data.amount.toFixed(2)} BDT`)
  });

  DOM.button3.click(async () => {
    try {
      // console.log("1AA")

      const transIDsRef = doc(db, "data", "transID");
      const transIDsSnap = await getDoc(transIDsRef);
  
      const transIDArr = transIDsSnap.data().IDs;
      const transID = $("#transID").val();
  
      if (transID === "") {
        alert("Please fill in the required fields");
      } else if (transIDArr.includes(transID)) {
        alert("The Transaction ID you provided is already in use");
      } else {
        data.transaction_id = $("#transID").val();
        let currentDate = new Date().toDateString();
        data.date = currentDate;
  
        data.is_confirmed = false;
        // console.log("1A")

        await setDoc(doc(db, "members", getAuth().currentUser.uid), data);
        // console.log("A")
        await updateDoc(doc(db, "data", "transID"), {
          IDs: arrayUnion(data.transaction_id),
          UIDs: arrayUnion(getAuth().currentUser.uid)
        });

        // await updateDoc(doc(db, "data", "transID"), {
        // });
  
        goNext(DOM.button3);
      }
    } catch (e) {
      alert("Something went wrong : ( \nYou are probably trying to register more than once with single google account. It is recommended that you use one gmail account per registration")
    }

  });
});

// Function to Move to the Next Step
const goNext = (current) => {
  var currentSection = current.parents(".section");
  var currentSectionIndex = currentSection.index();
  var headerSection = $(".steps li").eq(currentSectionIndex);

  // Hide the current section and show the next
  currentSection.removeClass("is-active").next().addClass("is-active");
  headerSection.removeClass("is-active").next().addClass("is-active");
};




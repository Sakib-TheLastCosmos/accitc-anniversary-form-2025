
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { doc, getFirestore, getDoc, addDoc, collection, updateDoc, arrayUnion } from 'firebase/firestore';

import './style.css';


// Access Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);


$(document).ready(async (event) => {


    $(".form-wrapper").on("keydown", function(event) {
      if (event.key === "Enter") {
          event.preventDefault(); // Prevent form submission on Enter key
      }
    });

    $(".button").click(e => {
        e.preventDefault()
    })


    const data = {};

    const DOM = {
      button1: $(".button-1"),
      button2: $(".button-2"),
      button3: $(".button-3")
    }

    DOM.button1.click(async () => {
        data.name = $("#name").val();
        data.session = $("#dropdownSelect").val();
        data.post = $("#post").val();
        data.phone = $("#phone").val();
        data.email = $("#mail").val();
        data.facebook = $("#fb").val();

        
        const phoneRef = doc(db, "data", "phone_numbers");
        const phoneSnap = await getDoc(phoneRef);

        const emailRef = doc(db, "data", "email_addresses");
        const emailSnap = await getDoc(emailRef);

        const phoneNumsArr = phoneSnap.data().phoneNums;
        const emailArr = emailSnap.data().emails;
        if (!data.name || !data.session || !data.post || !data.phone || !data.email || !data.facebook) {
            alert("Please fill in all the required fields.");
          } else {
            // Check if phone number or email has already been used
            if (phoneNumsArr.includes(data.phone) || emailArr.includes(data.email)) {
              alert("Phone number or Email Address has already been used once. Use another phone number.");
            } else {
                goNext(DOM.button1)
            }
          }
        
    })


    $(".bkash").click(() => {
      data.payment_method = "bkash";
    })

    $(".nagad").click(() => {
      data.payment_method = "nagad";
    })

    DOM.button2.click(() => {
        data.platter = $("input[name='r1']:checked").val();

         goNext(DOM.button2)
    })


    DOM.button3.click(async () => {
        const transIDsRef = doc(db, "data", "transIDs");
        const transIDsSnap = await getDoc(transIDsRef);

        const transIDArr = transIDsSnap.data().IDs;

        const transID = $("#transID").val()


        if (transID == "") {
            alert("Please fill in the required fields")
        } else if (transIDArr.includes(transID)) {
            alert("The Transaction ID you provided is already in use")
        } else {
            data.transaction_id = $("#transID").val();
            let currentDate = new Date().toDateString();
            data.date = currentDate;
    
            data.is_confirmed = false
    
            await addDoc(collection(db, "members"), data)
            await updateDoc(doc(db, "data", "email_addresses"), {
                emails: arrayUnion(data.email)
            })
            await updateDoc(doc(db, "data", "phone_numbers"), {
                phoneNums: arrayUnion(data.phone)
            })
            await updateDoc(doc(db, "data", "transIDs"), {
                IDs: arrayUnion(data.transaction_id)
            })
    
            goNext(DOM.button3)
        }
    })


  })


  const goNext = current => {
    var currentSection = current.parents(".section");
    var currentSectionIndex = currentSection.index();
    var headerSection = $('.steps li').eq(currentSectionIndex);
    
    // Hide the current section and show the next
    currentSection.removeClass("is-active").next().addClass("is-active");
    headerSection.removeClass("is-active").next().addClass("is-active");        

  }
  


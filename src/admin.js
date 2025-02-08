import "./admin.css";
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, getDoc, getDocs, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import emailjs from 'emailjs-com';

// Firebase Configuration
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
const auth = getAuth();
const provider = new GoogleAuthProvider();

// Initialize EmailJS
emailjs.init(process.env.EMAILJS_API_KEY);

$(document).ready(async () => {
  // Google Sign-In Authentication
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const adminEmailArr = process.env.ADMIN_EMAIL.split(",");

      // Check if the user is an admin (for example, by checking the email or UID)
      if (adminEmailArr.includes(user.email)) { // You can replace this with a list of admin emails
        // Proceed with loading the admin data
      } else {
        alert('You do not have access to this admin panel.');
        signOut(auth);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert("Authentication failed! Please try again.");
    }
  };

  // On Auth State Change (to keep track of logged-in user)
  onAuthStateChanged(auth, (user) => {
    const adminEmailArr = process.env.ADMIN_EMAIL.split(",");

    if (user && adminEmailArr.includes(user.email)) { // Replace with your admin email
      loadAdminData();
      $("#google-sign-in-btn").hide()

    } else if (user) {
      alert('You do not have access to this admin panel.');
      signOut(auth);
    }
  });

  // Function to load admin data
  const loadAdminData = async () => {
    const querySnapshot = await getDocs(collection(db, "members"));
    const tableBody = document.querySelector("tbody");

    let index = 1;
    let total_confirmed = 0, platter1 = 0, platter2 = 0, present = 0, absent = 0;

    querySnapshot.forEach((doc) => {
      const person = doc.data();

      if (!person.status) person.status = "Absent";

      const row = document.createElement("tr");

      if (person.is_confirmed) total_confirmed++;
      if (person.platter === 'Platter 1') platter1++;
      if (person.platter === 'Platter 2') platter2++;
      if (person.status == "Present") present++;
      else absent++;

      row.innerHTML = `
        <td>${index}</td>
        <td>${person.name}</td>
        <td>${person.session}</td>
        <td>${person.post}</td>
        <td>${person.phone}</td>
        <td>${person.email}</td>
        <td><a href="https://${person.facebook}" target="_blank">Profile</a></td>
        <td>${person.platter}</td>
        <td>${person.date}</td>
        <td>${person.transaction_id}</td>
      `;

      if (person.is_confirmed) {
        row.innerHTML += "<td class='payment_confirmed' style='color: green; font-weight: 600;'>Confirmed</td>";
      } else {
        row.innerHTML += `<td class='payment_confirmed'><button style="background: green;" id=${doc.id} class="confirm_btn confirm_btnn">Confirm</button> <button id=${doc.id}  class="confirm_btn delete_btn">Delete</button></td>`;
      }

      if (person.status == "Present") row.innerHTML += `<td style="font-weight: 600; color: green;">${person.status}</td>`;
      else row.innerHTML += `<td style="font-weight: 600; color: red;">${person.status}</td>`;

      tableBody.appendChild(row);

      $(".data").width($("table").width());

      index++;
    });

    $('#total_reg').html(index - 1);
    $('#total_confirmed').html(total_confirmed);
    $('#total_payment').html((550 * total_confirmed).toFixed(2));
    $('#platter-1').html(platter1);
    $('#platter-2').html(platter2);
    $('#total-present').html(present);
    $('#total-absent').html(absent);

    // Attach click event listener to confirm buttons
    $(".confirm_btnn").click(async (e) => {
      // Ask for confirmation before proceeding
      const isConfirmed = confirm("Are you sure you want to confirm this person?");
      if (!isConfirmed) return;  // If user cancels, do nothing
    
      const id = e.target.id;
      const person = querySnapshot.docs.find(doc => doc.id === id).data();
    
      const templateParams = {
        to_name: person.name,
        name: person.name,
        session: person.session,
        post: person.post,
        phone: person.phone,
        email: person.email,
        platter: person.platter,
        date: person.date,
        transaction_id: person.transaction_id,
        image_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://sakib-thelastcosmos.github.io/accitc-anniversary-form-2025/dist/admin.html?verify=${id}`
      };
    
      try {
        const adminEmailArr = process.env.ADMIN_EMAIL.split(",");
    
        if (getAuth().currentUser && adminEmailArr.includes(getAuth().currentUser.email)) {
          const response = await emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID, templateParams);
          console.log('Email sent successfully:', response);
    
          const personRef = doc(db, "members", id);
          await updateDoc(personRef, { is_confirmed: true });
    
          $(`#${id}`).parent().html("Confirmed");
          location.reload();
        }
      } catch (error) {
        alert('Error sending email:', error);
      }
    });
    
    $(".delete_btn").click(async e => {
      // Ask for confirmation before deleting
      const isConfirmed = confirm("Are you sure you want to delete this person and their transaction?");
      if (!isConfirmed) return;  // If user cancels, do nothing
    
      e.preventDefault();
      
      // Get the ID of the button (which corresponds to the document ID in Firestore)
      const id = e.target.id;
    
      try {
        // 1. Delete the document from "members"
        const personRef = doc(db, "members", id);
        const personSnap = await getDoc(personRef)
        const person = personSnap.data()
        await deleteDoc(personRef);  // Use deleteDoc to remove the document
    
        // 2. Remove the transaction ID and UID from "data/transID"
        const transactionId = person.transaction_id;  // Assuming the transaction ID is stored in a data attribute
        const userUID = id;  // Assuming the UID is stored in a data attribute as well
    
        const transRef = doc(db, "data", "transID");  // Assuming you are storing transaction IDs and UIDs in a specific document
        const transDoc = await getDoc(transRef);
    
        if (transDoc.exists()) {
          const transData = transDoc.data();
          
          // Remove the transaction ID and UID from their respective arrays
          const updatedTransIDs = transData.IDs.filter(trans => trans !== transactionId); // Remove the transaction ID
          const updatedUIDs = transData.UIDs.filter(uid => uid !== userUID); // Remove the UID
    
          // Update the "transID" document with the updated arrays
          await updateDoc(transRef, {
            IDs: updatedTransIDs,
            UIDs: updatedUIDs
          });
        }
    
        alert("Document, transaction ID, and UID deleted successfully.");
        location.reload();  // Refresh the page to reflect changes
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Error deleting the document. Please try again.");
      }
    });
    
    
    };

  // Add Google Sign-In button event listener
  document.getElementById("google-sign-in-btn").addEventListener("click", signInWithGoogle);
});

// signOut(auth).then(() => console.log("Signed out successfully")).catch(error => console.error("Sign-out error:", error));
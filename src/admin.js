import "./admin.css";
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, getDoc, getDocs, collection, doc, updateDoc } from 'firebase/firestore';
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

// Initialize EmailJS
emailjs.init(process.env.EMAILJS_API_KEY); 

$(document).ready(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const verifyId = urlParams.get('verify');

  if (verifyId) {
    // User is verifying their registration
    const docRef = doc(db, "members", verifyId);
    const docSnap = await getDoc(docRef);

    await updateDoc(docRef, { status: "Present" });

    if (docSnap.exists() && docSnap.data().is_confirmed) {
      const person = docSnap.data();
      $("body").html(`
        <h1 style="color: green;">Registration Confirmed</h1>
        <p><strong>Name:</strong> ${person.name}</p>
        <p><strong>Session:</strong> ${person.session}</p>
        <p><strong>Post:</strong> ${person.post}</p>
        <p><strong>Phone:</strong> ${person.phone}</p>
        <p><strong>Email:</strong> ${person.email}</p>
        <p><strong>Platter:</strong> ${person.platter}</p>
        <p><strong>Date:</strong> ${person.date}</p>
        <p><strong>Transaction ID:</strong> ${person.transaction_id}</p>
      `);
    } else {
      $("body").html("<h1 style='color: red;'>Invalid or Unconfirmed Registration</h1>");
    }
    return; // Stop execution since verification mode is active
  }

  // Admin authentication
  let password = process.env.ADMIN_PASSWORD;
  let userInput;
  do {
    userInput = prompt("Enter Admin Password:");
  } while (userInput !== password);

  const querySnapshot = await getDocs(collection(db, "members"));
  const tableBody = document.querySelector("tbody");

  let index = 1;
  let total_confirmed = 0, platter1 = 0, platter2 = 0, present = 0, absent = 0;

  querySnapshot.forEach((doc) => {
    const person = doc.data();

    if (!person.status) person.status = "Absent"

    const row = document.createElement("tr");

    if (person.is_confirmed) total_confirmed++;
    if (person.platter === 'Platter 1') platter1++;
    if (person.platter === 'Platter 2') platter2++;
    if (person.status == "Present") present ++;
    else absent ++;

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
      row.innerHTML += `<td class='payment_confirmed'><button id=${doc.id} class="confirm_btn">Confirm</button></td>`;
    }

    
    if (person.status == "Present") row.innerHTML += `<td style="font-weight: 600; color: green;">${person.status}</td>`
    else row.innerHTML += `<td style="font-weight: 600; color: red;">${person.status}</td>`

    tableBody.appendChild(row);
    index++;
  });

  $('#total_reg').html(index - 1);
  $('#total_confirmed').html(total_confirmed);
  $('#total_payment').html((550 * total_confirmed).toFixed(2));
  $('#platter-1').html(platter1);
  $('#platter-2').html(platter2);
  $('#total-present').html(present);
  $('#total-absent').html(absent)

  // Attach click event listener to confirm buttons
  $(".confirm_btn").click(async (e) => {
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
      const response = await emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID, templateParams);
      console.log('Email sent successfully:', response);

      const personRef = doc(db, "members", id);
      await updateDoc(personRef, { is_confirmed: true });

      $(`#${id}`).parent().html("Confirmed");
      location.reload();
    } catch (error) {
      alert('Error sending email:', error);
    }
  });
});

// import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
// import { doc, getFirestore, getDoc, addDoc, collection, updateDoc, arrayUnion } from 'firebase/firestore';


// Access Firebase config from environment variables
const firebaseConfig = {
    apiKey: "AIzaSyB3epd9QNbDHEB50bLL7jB8-EovBD9v5A4",
    authDomain: "accitc-anniversary-form.firebaseapp.com",
    projectId: "accitc-anniversary-form",
    storageBucket: "accitc-anniversary-form.firebasestorage.app",
    messagingSenderId: "229814471232",
    appId: "1:229814471232:web:20c717404c40212517ada5",
    measurementId: "G-SK90VVCPFZ"
  };  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);







const init = async () => {
    const people = [];
    const querySnapshot = await getDocs(collection(db, "cities"));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
    });

    // Select the tbody where rows will be added
    const tableBody = document.querySelector("tbody");

    // Loop through each person and create a new row
    people.forEach(person => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${person.name}</td>
            <td>${person.date}</td>
            <td>${person.email}</td>
            <td><a href="https://${person.facebook}" target="_blank">Profile</a></td>
            <td class="${person.is_confirmed ? 'confirmed' : 'not-confirmed'}">
                ${person.is_confirmed ? 'Yes' : 'No'}
            </td>
            <td>${person.phone}</td>
            <td>${person.platter}</td>
            <td>${person.post}</td>
            <td>${person.session}</td>
            <td>${person.payment_method}</td>
            <td>${person.transaction_id}</td>
        `;

        tableBody.appendChild(row);
    });
}

init()




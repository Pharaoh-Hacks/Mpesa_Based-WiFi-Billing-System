const bcrypt = require("bcryptjs");
const db = require("../config/db");

const email = "adm@gmail.com";  // Change this
const password = "ad"; // Change this

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
    process.exit(1);
  }
       
    db.query(
      "INSERT INTO admins (email, password) VALUES (?, ?)",
      [email, hash], 
      (err, _result) => {
        if (err) {
            console.error("Error inserting admin:", err);
        } else {
            console.log("Admin added successfully!");
        }
        process.exit();
    }
  );
});

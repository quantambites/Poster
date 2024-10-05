import React, { useState, useRef } from "react";
import axios from "axios";
//import nodemailer from "nodemailer";
import Modal from "react-modal";
import "./forgotpass.css";
import {
  collection,addDoc,
  query, where, getDoc ,getDocs, doc
} from "firebase/firestore";
import { db } from "../firebase";
import { Mail } from "lucide-react"


 const from_name = 'harshenduswarnakar@gmail.com';
const infoRef = collection(db, 'info')
const ForgotpassModal = ({ isOpen, onRequestClose, onGetPass, onSignInRedirect }) => {
  const [username, setUsername] = useState("");
  const [mailerror, setMailerror] = useState("");
  const form = useRef();
 const [emailSent,setemailsent] = useState(false);

  const handleforgotpass = async (event) => {
    event.preventDefault();
    try {
      if (username !== "") {
        const q = query(
          infoRef,
          where("username", "==", username)
        );
        const querySnapshot = await getDocs(q);
  
        console.log("Query Results:", querySnapshot.docs);
  
        if (querySnapshot.size === 1) {
          const password = await getPasswordForUsername();
          console.log("Password:", password);
  
          if (password) {
            console.log(username, password, from_name);
            
            if (!emailSent) {
              await onGetPass(username, password, from_name);
              setemailsent(true); // Set the flag to true after the first successful retrieval
              onRequestClose();
            }
            else{
              alert("email already sent,try again latter")
            }
            
           
          } else {
            console.error("Password not found.");
            // Handle the case where the password is not available
          }
        } else {
          console.error("Username not found ");
          alert("Username not found")
          // Handle the case where the username is not found or multiple usernames found
        }
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle other errors, like network issues
    }
  };
  

  const getPasswordForUsername = async() =>{
    setMailerror("");

    if (!username.endsWith(".com")) {
      setMailerror("Enter Email Address");
      return;
    } else {
      setMailerror("");
    }

    const q = query(
        infoRef,
        where("username", "==", username)     
      );
      const querySnapshot = await getDocs(q);
  
      if(querySnapshot.size === 1){
       const userDoc = querySnapshot.docs[0];
       const userid = userDoc.id;
       console.log(userid);
       const userDocRef = doc(db, "info", userid);
       const userDocSnapshot = await getDoc(userDocRef);
 
       if (userDocSnapshot.exists()) {
         const userData = userDocSnapshot.data();
         return(userData.password);
  }}
   else{
    setMailerror("Email don't exists");
   }
}

    
   

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Sign Up Modal"
      className="sign-up-modal"
      overlayClassName="sign-up-overlay"
    >
       <div className="sign-in-header">
          <span>Recover password</span>
          
        </div>
        <hr className="underline" />
      <div className="sign-in-container">

        <form ref={form}>
          <div className="form-group">
          <Mail className="input-icon"/>
            <input
              type="email"
              placeholder="Email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          {mailerror?(
          <div className="err">
             {mailerror} 
            </div>
          ):( <></>)}   
          <button type="button" onClick={handleforgotpass} className="css">
            Get password
          </button>

        </form>
        <p style={{marginTop: "25px"}}>
          <span className="signup-link" onClick={onSignInRedirect} style={{color: "#c93afd", fontSize: "15px"}}>
          Get back to <span className="signup-underlined" style={{fontSize: "17px"}} >Sign In</span>
          </span>
        </p>
      </div>
    </Modal>
  );
};

export default ForgotpassModal;

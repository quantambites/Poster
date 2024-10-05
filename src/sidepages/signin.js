// SignInModal.js

// SignInModal.jsx

import React, { useState } from "react";
import Modal from "react-modal";
import "./signin.css";
import {
  collection,
  query, where, getDocs
} from "firebase/firestore";
import { db } from "../firebase";
import { Mail,Lock } from "lucide-react"

const infoRef = collection(db, 'info')
const SignInModal = ({ isOpen, onRequestClose, onSignIn, onSignUpRedirect ,onForgotpassword }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mailerror, setMailerror] = useState("");
  const [passworderror,setPassworderror ]  = useState("");


  const handleSignIn = async() => {
    setMailerror("");
    setPassworderror("");
    if (!username.endsWith(".com")) {
      setMailerror("Enter Email Address");
      return;
    } else {
      setMailerror("");
    }

    if (password.length <= 4) {
      setPassworderror("Password should be atleast 5 letters");
      return;
    } else {
      setPassworderror("");
    }
    const q = query(
      infoRef,
      where("username", "==", username),
      where("password", "==", password)
    );
    const querySnapshot = await getDocs(q);
    const p = query(
      infoRef,
      where("username", "==", username)
    );
    const userquerySnapshot = await getDocs(p);

    if((username,password !=="")&&(querySnapshot.size === 1)){
     const userDoc = querySnapshot.docs[0];
     const userid = userDoc.id;
     console.log(userid);
     

     onSignIn(username, password, userid);
   
    onRequestClose();
    }
     else if(userquerySnapshot.size === 1 ){
      setPassworderror("Wrong Password");
        return;
      }
      else{ 
    setMailerror("User not Found! try Sign up");
  }};

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Sign In Modal"
      className="sign-in-modal"
      overlayClassName="sign-in-overlay"
    >

      <div className="sign-in-header">
          <span>Sign In</span>
          
        </div>
        <hr className="underline" />
      <div className="sign-in-container">

       
        
        <form>
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

          <div className="form-group">
          <Lock  className="input-icon"/>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {passworderror?(
          <div className="err">
             {passworderror}
            </div>
          ):( <></>)} 


          <p  style={{fontSize: "13px", textAlign: "right"}}>
          <span className="forgot-underlined" onClick={onForgotpassword}  >
          Forgot Password
          </span>
        </p>

          <button type="button" onClick={handleSignIn} className="css">
            Sign In
          </button>
        </form>
        <p style={{marginTop: "25px"}}>
          <span className="signup-link" onClick={onSignUpRedirect} style={{color: "#c93afd", fontSize: "15px"}}>
          Don't have an account? <span className="signup-underlined" style={{fontSize: "17px"}} >Sign Up</span>
          </span>
        </p>
        
      </div>
    </Modal>
  );
};

export default SignInModal;
//
// SignUpModal.jsx

import React, { useState } from "react";
import Modal from "react-modal";
import "./signup.css";
import {
  collection,addDoc,
  query, where, getDocs
} from "firebase/firestore";
import { db } from "../firebase";
import { Mail,Lock } from "lucide-react"

const infoRef = collection(db, 'info')
const SignUpModal = ({ isOpen, onRequestClose, onSignUp, onSignInRedirect }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mailerror, setMailerror] = useState("");
  const [passworderror,setPassworderror ]  = useState("");


  const handleSignUp = async() => {

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
      where("username", "==", username)
    );
    const querySnapshot = await getDocs(q);

    if (username !== "" && password !== "" && querySnapshot.size !== 1){ 
     
    onSignUp(username, password);
   
    onRequestClose();
    }
    else{
      setMailerror("Email already exists");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Sign Up Modal"
      className="sign-up-modal"
      overlayClassName="sign-up-overlay"
    >

      <div className="sign-in-header">
          <span>Sign Up</span>
          
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

          <button type="button" onClick={handleSignUp} className="css">
            Sign Up
          </button>
        </form>
        <p style={{marginTop: "25px"}}>
          <span className="signup-link" onClick={onSignInRedirect} style={{color: "#c93afd", fontSize: "15px"}}>
          Already have an account? <span className="signup-underlined" style={{fontSize: "17px"}} >Sign In</span>
          </span>
        </p>
      </div>
    </Modal>
  );
};

export default SignUpModal;

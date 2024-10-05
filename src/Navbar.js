import React, { useState,useEffect } from "react";
import { storage,db } from "./firebase";
import { Link} from "react-router-dom"
import { AlignJustify } from "lucide-react"
import "./navbar.css"
import Cookies from "js-cookie";
import Sidebar from "./sidebar"
import SignInModal from "./sidepages/signin"; 
import SignUpModal from "./sidepages/signup";
import ForgotpassModal from "./sidepages/forgotpass";
import {
  collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where,orderBy, getDocs
} from "firebase/firestore";
import Modal from "react-modal";
//import userid from "./pages/sub-pages/car"
import emailjs from '@emailjs/browser';

const infoRef = collection(db, 'info')
Modal.setAppElement("#root");

export default function Navbar() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
    const [userId, setUserId] = useState("");
    const [isForgotpassModalOpen, setIsForgotpassModalOpen] = useState(false);
  

    /*if(userid!="")
    setUserId(userid)*/

    const toggleSidebar = () => {
      setSidebarOpen(!isSidebarOpen);
    };
  
    const closeSidebar = () => {
      setSidebarOpen(false);
    };

   

    useEffect(() => {
      // Retrieve the user ID from the cookie
      const userIdFromCookie = Cookies.get("userId");
    
      // Optionally, you can also set the user ID in the state
      setUserId(userIdFromCookie);
    }, []);
  
    console.log(userId);


    const handleSignIn = async (username, password, userid) => {
    
          Cookies.set("userId",userid );
          setUserId(userid);
      
          window.location.reload();
    };
   
     const handlepassword =async(username,password,from_name) =>{
      console.log(username,password,from_name)
      try{
      var templateParams = {
        password: password,
        from_name: from_name,
        username: username,
      }
      if(password!=="")
      {
       
        await emailjs.send('service_ul8wcaa', 'template_dxfbpod', templateParams,{publicKey: '9gcSP5jpI2vOjV_dK'})
        
         .then (
          () => {
            console.log('SUCCESS!');
            alert("Recovery password sent to registered email address");
          },
          (error) => {
            console.log('FAILED...', error.text);
            alert("Failed to send email try again")
          },)

      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error; // Rethrow error to handle it in the calling function
    }
     }
   
    const handleSignUp = async(username, password) => {
      console.log(`Sign In: Username - ${username}, Password - ${password}`);
      await addDoc(infoRef, {
        username: username,
        password: password,
      })
      const q = query(
        infoRef,
        where("username", "==", username),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q)
      const userDoc = querySnapshot.docs[0];
      const userid = userDoc.id;
     
      Cookies.set("userId",userid );
       setUserId(userid);
     
      Cookies.set("userId",userid );
      setUserId(userid);

    };

  return (
    <div className="nav">
      <ul className="compu">
        <button className='butonnn' onClick={toggleSidebar}>
          <AlignJustify style={{transform: "scale(1.5)"}}/>
        </button>
      <Link to="/" className="site-title">
        Site Name
      </Link>
      </ul>
      <ul className="compu">

      <button className='butoonn' style={{}} onClick={() =>setIsSignInModalOpen(true)}>Sign in</button>
        
      </ul>
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <SignInModal
        isOpen={isSignInModalOpen}
        onRequestClose={() => setIsSignInModalOpen(false)}
        onSignIn={handleSignIn}
        onSignUpRedirect={() =>[setIsSignInModalOpen(false),setSignUpModalOpen(true)]}
        onForgotpassword={() =>[setIsSignInModalOpen(false),setIsForgotpassModalOpen(true)]}
      />

      <SignUpModal
        isOpen={isSignUpModalOpen}
        onRequestClose={() =>setSignUpModalOpen(false)}
        onSignUp={handleSignUp}
        onSignInRedirect={() =>[setIsSignInModalOpen(true),setSignUpModalOpen(false)]} // Redirect to sign-in when clicked
      />

      <ForgotpassModal
        isOpen={isForgotpassModalOpen}
        onRequestClose={() =>setIsForgotpassModalOpen(false)}
        onGetPass={handlepassword}
        onSignInRedirect={() =>[setIsSignInModalOpen(true),setIsForgotpassModalOpen(false)]} // Redirect to sign-in when clicked
      />
    </div>
  )
}

/*
*/

import React from "react";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import "./enlarged.css"
import { ShoppingCart  } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { storage,db } from "../firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import {
  collection, onSnapshot,
  addDoc, deleteDoc, doc, getDoc,updateDoc,
  query, where,orderBy, getDocs
} from "firebase/firestore";
import SignInModal from "../sidepages/signin"; 
import SignUpModal from "../sidepages/signup"
import ForgotpassModal from "../sidepages/forgotpass"
import SelectAddressModal from "../sidepages/address"; 
import ConfirmationModal from "../sidepages/orderconfirmation";
import emailjs from '@emailjs/browser';
import { Star,Share2 } from "lucide-react";


const EnlargedImagePage = () => {
  const [imageUrls, setimageUrls] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isForgotpassModalOpen, setIsForgotpassModalOpen] = useState(false);
  const [isSelectAddressModalOpen, setIsSelectAddressModalOpen] = useState(false);
  const [isAddressSubmitted, setIsAddressSubmitted] = useState(false);
  const [selectusername, setselectusername] = useState("");
  const [selectpassword, setselectpassword] = useState("");
  const [selectfulladdress, setselectfulladdress] = useState("");
  const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState("");
  const [loadpath, setLoadpath] = useState("");
  const [dimension, setDimension] = useState("");
  const [creator,setCreator] = useState("");
  const [copied, setCopied] = useState(false);


  const imageListRef = ref(storage, "cars/");
  const colRef = collection(db, 'pikachu')
  const infoRef = collection(db,'info')
  const detailsRef = collection(db,'Details')
  
  useEffect(() => {
    // Retrieve the user ID from the cookie
    const userIdFromCookie = Cookies.get("userId");
    if (userIdFromCookie) {
      setUserId(userIdFromCookie);
    } 
  }, []);


  const location = useLocation();
  const imageUrl = location.state ? location.state.imageUrl : null;
  const currentUrl = window.location.href;
  const decodedImageUrl = decodeURIComponent(currentUrl);
  const urlAfterHttps = decodedImageUrl.slice(decodedImageUrl.indexOf("https://") + "https://".length);
  console.log(urlAfterHttps);


  const handleSignIn = async (username, password, userid) => {
      

    try {
        
        setselectusername(username);
        setselectpassword(password);
  
        Cookies.set("userId",userid );
        setUserId(userid);
  
       
       
    } catch (error) {
      console.error("Error signing in:", error);
      // Handle the error
    }
  };
  
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
   
    setIsSelectAddressModalOpen(true);
    setselectusername(username);
    setselectpassword(password);
  
  };
  
  const handleAddressSubmit = async(fulladdress) => {
    console.log(`Address Information-${fulladdress}`);
    setselectfulladdress(fulladdress);
    setIsAddressSubmitted(true);
    await updateDoc(doc(infoRef, userId), {
      fulladdress: fulladdress,
    })
  }
  
  useEffect(() => {
    if (isAddressSubmitted) {
      // If address is submitted, then execute handleOrderNow
      setIsConfirmationModalOpen(true);
  
      // Reset the state to false after executing handleOrderNow
      setIsAddressSubmitted(false);
    }
  }, [isAddressSubmitted]);

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
   const handleOrderNow = async(orderId,productPrice) => {
    console.log("Ordering now:", selectedImageName);
  
    if (selectedImageName !== "") {
      addDoc(colRef, {
        username: selectusername,
        password: selectpassword,
        fulladdress: selectfulladdress,
        order: "/cars/"+selectedImageName,
        paymentId: orderId,
        price: productPrice,
      })
        .then(() => {
          console.log("Ordered successfully");
          alert("Ordered successfully");
        })
        .catch((error) => {
          console.error("Error Occurred - Retry", error);
          alert("Error Occurred - Retry", error);
        });
  
      }}

  const handleBuyNow = async (imageName) => {
    if (userId === "") {
      // No userId available, open the sign-in modal
      setIsSignInModalOpen(true);
    } else {
      const userDocRef = doc(db, "info", userId);
        const userDocSnapshot = await getDoc(userDocRef);
  
        if (userDocSnapshot.exists()) {
          // User found, set the username and password
          const userData = userDocSnapshot.data();
          setselectusername(userData.username);
          setselectpassword(userData.password);
          if(!userData.fulladdress)
          setIsSelectAddressModalOpen(true);
          else{
            setselectfulladdress(userData.fulladdress);
            setIsAddressSubmitted(true);
          }
         
        } else {
          console.log("User not found");
          // Handle the case where the user is not found
        }
    }
    setSelectedImageName(imageName);
  };

  const handleAddToCart = async (imageName) => {
    if (!userId) {
      // No userId available, open the sign-in modal
      setIsSignInModalOpen(true);
    } else {
      const userDocRef = doc(db, "info", userId);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        // User found, set the username and password
        const userData = userDocSnapshot.data();
        setselectusername(userData.username);
        setselectpassword(userData.password);
  
          const updatedCart = userData.cart ? `${userData.cart},/cars/${imageName}` : imageName;
          await updateDoc(userDocRef, {
            cart: updatedCart,
          })
            .then(() => {
              alert(`Added to Cart: ${imageName}`);
            })
            .catch((error) => {
              console.error("Error adding to cart", error);
            });
        }
      }
    }
  
    const handleClickBuyNow = async (link) => {
      try{
        console.log(link)
      const q = query(detailsRef, where("link", "==", link));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const path = userDoc.data().path;
        handleBuyNow(path);
      } else {
        console.log("No document found with the specified link");
        // Handle the case where no document matches the query
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      // Handle the error appropriately
    }
 
    };
  
    

    const AddToCart = async (link) => {
      try{
        console.log(link)
      const q = query(detailsRef, where("link", "==", link));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const path = userDoc.data().path;
        handleAddToCart(path);
      } else {
        console.log("No document found with the specified link");
        // Handle the case where no document matches the query
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      // Handle the error appropriately
    }
 
    };


  
      useEffect(() => {
        const fetchData = async () => {
          if (urlAfterHttps) {
            
            const detailsRef = collection(db, 'Details');
    
            try {
              const q = query(detailsRef, where("link", "==", `https://${urlAfterHttps}`));
              const querySnapshot = await getDocs(q);
    
              if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const rating = userDoc.data().rating;
                const pathe = userDoc.data().path;
                const dimen = userDoc.data().Dimension;
                const crt = userDoc.data().creator;
                const index = pathe.indexOf('/'); // Use double backslash to escape the backslash character
                const loadPath = index !== -1 ? pathe.substring(index + 1) : pathe;
                setRating(rating);
                setLoadpath(loadPath);
                setDimension(dimen);
                setCreator(crt);
              } else {
                console.log("No document found with the specified link");
                // Handle the case where no document matches the query
              }
            } catch (error) {
              console.error("Error fetching document:", error);
              // Handle the error appropriately
            }
          }
        };
    
        fetchData(); // Call the function to fetch data
    
      }, [urlAfterHttps]);

      const copyUrlToClipboard = () => {
        
        const currentUrl = window.location.href; // Get the current page's URL
        navigator.clipboard.writeText(currentUrl)
          .then(() => {
            // Set copied state to true to show a confirmation message (optional)
            setCopied(true);
            // Reset copied state after a short delay (optional)
            setTimeout(() => setCopied(false), 2000);
            window.alert("URL copied to clipboard!");
          })
          .catch((error) => {
            console.error("Failed to copy URL to clipboard:", error);
          });
      };
    

     
      
  return (
    <div className="enlarged-image-page">
      <div className="image-container">
                <div style={{ paddingBottom: '10px' }}>
      {!rating || rating === '1' ? (
        <><Star className="starfill" size={20} />
        <Star className="star" size={20} />
        <Star className="star" size={20} />
        <Star className="star" size={20} />
        <Star className="star" size={20} /></>
      ) : (
        rating === '2' ? (
          <><Star className="starfill" size={20} />
          <Star className="starfill" size={20} />
          <Star className="star" size={20} />
          <Star className="star" size={20} />
          <Star className="star" size={20} /></>
        ) : (
          rating === '3' ? (
            <><Star className="starfill" size={20} />
            <Star className="starfill" size={20} />
            <Star className="starfill" size={20} />
            <Star className="star" size={20} />
            <Star className="star" size={20} /></> 
          ) : (
            rating === '4' ? (
              <><Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="star" size={20} /></> 
           ) : (
            rating === '5' ? (
              <><Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} /></>  
             ) : (<></>)))))}
           </div>

        <img src={`https://`+urlAfterHttps} alt="Enlarged Car" />
       
      </div >
      <div className="data-container">
        <p> <span>Name-  </span>{loadpath}</p>
        <p> <span>Creator -</span>{creator} </p>
        <p> <span>Dimension -</span>{dimension} cm</p>
        <div className="btns">
      <button className="cse" onClick={() => handleClickBuyNow(`https://`+urlAfterHttps)}>
                Buy now
              </button>
              <button className="cartbtn" onClick={() => AddToCart(`https://`+urlAfterHttps)}>
                <ShoppingCart />
              </button>
              <button className="cartbtn" onClick={copyUrlToClipboard}>
                <Share2 />
              </button>
              </div>
              
      </div>
      <SignInModal
        isOpen={isSignInModalOpen}
        onRequestClose={() => setIsSignInModalOpen(false)}
        onSignIn={handleSignIn}
        onSignUpRedirect={() =>[setIsSignInModalOpen(false),setSignUpModalOpen(true)]}
        onForgotpassword={() =>[setIsSignInModalOpen(false),setIsForgotpassModalOpen(true)]}
      />
       <SelectAddressModal
        isOpen={isSelectAddressModalOpen}
        onClose={() => setIsSelectAddressModalOpen(false)}
        onAddressSelected={handleAddressSubmit}
        
      />
       <SignUpModal
        isOpen={isSignUpModalOpen}
        onRequestClose={() =>setSignUpModalOpen(false)}
        onSignUp={handleSignUp}
        onSignInRedirect={() =>[setIsSignInModalOpen(true),setSignUpModalOpen(false)]} // Redirect to sign-in when clicked
      />

        <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        selectedImageName={selectedImageName}
        username={selectusername}
        fulladdress={selectfulladdress}
        onhandlechangeaddress={() => setIsSelectAddressModalOpen(true)}
        onhandleordernow={handleOrderNow}
        productPrice={1}
      />
       <ForgotpassModal
        isOpen={isForgotpassModalOpen}
        onRequestClose={() =>setIsForgotpassModalOpen(false)}
        onGetPass={handlepassword}
        onSignInRedirect={() =>[setIsSignInModalOpen(true),setIsForgotpassModalOpen(false)]} // Redirect to sign-in when clicked
      />
    
    </div>
  );
};

export default EnlargedImagePage;


/*const [hoveredStars, setHoveredStars] = useState(0);
const [selectedStars, setSelectedStars] = useState(0);

const handleStarHover = (starCount) => {
  setHoveredStars(starCount);
};

const handleStarClick = (starCount) => {
  setSelectedStars(starCount);
};

const renderStars = () => {
  const stars = [];
  const totalStars = 5; // Total number of stars

  for (let i = 1; i <= totalStars; i++) {
    const isFilled = i <= (hoveredStars || selectedStars);
    stars.push(
      <Star
        key={i}
        className="star"
        size={20}
        onMouseEnter={() => handleStarHover(i)}
        onMouseLeave={() => handleStarHover(selectedStars)}
        onClick={() => handleStarClick(i)}
        style={{ cursor: "pointer", color: isFilled ? "#FFD700" : "gray" }}
      />
    );
  }

  return stars;
};

<div className="rate">
               <h1>Rate this Poster!</h1>
               
               <Star className="star" size={20} />
               <Star className="star" size={20} />
               <Star className="star" size={20} />
               <Star className="star" size={20} />
               <Star className="star" size={20} />
              </div>*/
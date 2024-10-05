// App.js
import Cookies from "js-cookie";
import { useState, useEffect, useRef } from "react";
import { storage,db } from "../../firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import {
  collection, onSnapshot,
  addDoc, deleteDoc, doc, getDoc,updateDoc,
  query, where,orderBy, getDocs
} from "firebase/firestore";
import { ShoppingCart,Star,Share2 } from "lucide-react";
import Modal from "react-modal";
import "./car.css";
import SignInModal from "../../sidepages/signin"; 
import SignUpModal from "../../sidepages/signup"
import ForgotpassModal from "../../sidepages/forgotpass"
import SelectAddressModal from "../../sidepages/address"; 
import ConfirmationModal from "../../sidepages/orderconfirmation";
import emailjs from '@emailjs/browser';
import EnlargedImagePage from "../../sidepages/enlargedimagepage";
import axios from "axios";
import { Link } from 'react-router-dom';


//import userid from "../../Navbar"

Modal.setAppElement("#root"); // Set the root element for accessibility
function App() {
  const [imageUrls, setimageUrls] = useState([]);
  const [rating, setRating] = useState([]);
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
  const [selectedUrl, setSelectedUrl] = useState("");
  const [isEnlargedPageOpen, setIsEnlargedPageOpen] = useState(false);
  const [copied, setCopied] = useState(false);



  const imageListRef = ref(storage, "cars/");
  const colRef = collection(db, 'pikachu')
  const infoRef = collection(db,'info')
  

 
  useEffect(() => {
    // Retrieve the user ID from the cookie
    const userIdFromCookie = Cookies.get("userId");
    if (userIdFromCookie) {
      setUserId(userIdFromCookie);
    } 
  }, []);

 useEffect(()=>{//display all content on database
  getDocs(infoRef).then((snapshot)=>{
    var books=[];
    snapshot.docs.forEach((doc)=>{
      books.push({...doc.data(),id: doc.id})
    })
    console.log(books)
  })
  
 },[])

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

 


useEffect(() => {
  listAll(imageListRef)
    .then((response) => {
      // Map each item to a promise that resolves to { url, name }
      const downloadURLPromises = response.items.map((item) =>
        getDownloadURL(item).then((url) => ({ url, name: item.name }))
      );
      return Promise.all(downloadURLPromises);
    })
    .then((imageDataArray) => {
      // Now imageDataArray is an array of objects { url, name }
      // Extract image names from imageDataArray
      const imageNames = imageDataArray.map((item) => item.name);

      // Fetch ratings for each image name
      const ratingsPromises = imageNames.map(async (imageName) => {
        try {
          const rating = await fetchRatingForImage(imageName); // Fetch rating for the image
          const imageData = imageDataArray.find((item) => item.name === imageName); // Find corresponding image data
          return { ...imageData, rating }; // Merge image data with rating
        } catch (error) {
          console.error(`Error fetching rating for ${imageName}`, error);
          return null; // Handle error gracefully
        }
      });

      // Wait for all ratingsPromises to resolve
      return Promise.all(ratingsPromises);
    })
    .then((imageDataArrayWithRatings) => {
      // Now imageDataArrayWithRatings is an array of objects { url, name, rating }
      // Update imageUrls state with imageDataArrayWithRatings
      setimageUrls(imageDataArrayWithRatings);
      console.log(imageDataArrayWithRatings);
    })
    .catch((error) => {
      console.error("Error fetching image data", error);
    });
}, []);

const fetchRatingForImage = async (name) => {
  const detailsRef = collection(db, 'Details');

  try {
    const q = query(detailsRef, where("path", "==", `cars/${name}`));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const rating = userDoc.data().rating;
      return rating; // Return the fetched rating
    } else {
      console.log("No document found with the specified link");
      return null; // Return null if no document found
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    return null; // Return null in case of error
  }
};

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
  
  const copyUrlToClipboard = async (link) => {
    const currentUrl = `http://localhost:3000/enlarged-image/${encodeURIComponent(link)}`;

    try {
      await navigator.clipboard.writeText(currentUrl);
      // Clipboard write succeeded
      window.alert("URL copied to clipboard!");
    } catch (error) {
      // Clipboard write failed
      console.error("Failed to copy URL to clipboard:", error);
    }
  };
  

 
  return (
    <div className="App">
      <div className="main">
        {imageUrls.map((item, index) => {
          // Encode the URL before using it in the link
          
          return (
            <div key={index}>
              {/* Use the encoded URL in the link */}
              <Link to={{
               pathname: `/enlarged-image/${encodeURIComponent(item.url)}`,
                state: { imageUrl: item.url }
                }}>
                   <div className="rating">
      {!item.rating || item.rating === '1' ? (
        <><Star className="starfill" size={20} />
        <Star className="star" size={20} />
        <Star className="star" size={20} />
        <Star className="star" size={20} />
        <Star className="star" size={20} /></>
      ) : (
        item.rating === '2' ? (
          <><Star className="starfill" size={20} />
          <Star className="starfill" size={20} />
          <Star className="star" size={20} />
          <Star className="star" size={20} />
          <Star className="star" size={20} /></>
        ) : (
          item.rating === '3' ? (
            <><Star className="starfill" size={20} />
            <Star className="starfill" size={20} />
            <Star className="starfill" size={20} />
            <Star className="star" size={20} />
            <Star className="star" size={20} /></> 
          ) : (
            item.rating === '4' ? (
              <><Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="star" size={20} /></> 
           ) : (
            item.rating === '5' ? (
              <><Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} /></>  
             ) : (<></>)))))}
           </div>

                 <img src={item.url} alt={`Car ${index + 1}`} className="thumbnail" />
              </Link>
              <div className="butns">
              <button className="cse" onClick={() => handleBuyNow(item.name)}>
                Buy now
              </button>
              <button className="cartbtn" onClick={() => handleAddToCart(item.name)}>
                <ShoppingCart />
              </button>
              <button className="cartbtn" onClick={() => copyUrlToClipboard(item.url)}>
                <Share2 />
              </button>
              </div>
            </div>
          );
        })}
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
        selectedImageName={"/cars/"+selectedImageName}
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
}

export default App;





/*setIsForgotpassModalOpen(true)
<Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Enlarged Image Modal"
        className="enlarged-image-modal"
        overlayClassName="enlarged-image-overlay"
      >
        <button className="close-button" onClick={closeModal}>
          <X />
        </button>
        <img src={selectedImageUrl} alt="Enlarged Car" />
        <button className="order-now" onClick={handleOrderNow}>
          Order Now
        </button>
      </Modal>
*/



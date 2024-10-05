import DragDropFiles from "./components/drag&drop";
import "./Developer.css";
import Cookies from "js-cookie";
import { useState, useEffect, useRef } from "react";
import { storage,db } from "../firebase";
import {
  collection, onSnapshot,
  addDoc, deleteDoc, doc, getDoc,updateDoc,
  query, where,orderBy, getDocs
} from "firebase/firestore";
import { ShoppingCart, X  } from "lucide-react";
import Modal from "react-modal";
import "./style.css";
import SignInModal from "../sidepages/signin"; 
import SignUpModal from "../sidepages/signup"
import SelectAddressModal from "../sidepages/address"; 
import SelectBankDetails from "../sidepages/account"; 
import ConfirmationModal from "../sidepages/uploadconfirmation";
import { ref, uploadBytes,getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import "./style.css";
import ForgotpassModal from "../sidepages/forgotpass"
import emailjs from '@emailjs/browser';
import { Code } from "lucide-react"

Modal.setAppElement("#root");
function App() {
   const [selectedImageUrl, setSelectedImageUrl] = useState("");
   const [selectedImageName, setSelectedImageName] = useState("");
   const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
   const [isSelectAddressModalOpen, setIsSelectAddressModalOpen] = useState(false);
   const [isSubmitted, setIsSubmitted] = useState(false);
   const [selectusername, setselectusername] = useState("");
   const [selectpassword, setselectpassword] = useState("");
   const [selectfulladdress, setselectfulladdress] = useState("");
   const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
   const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
   const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
   const [account, setAccount] = useState("");
   const [userId, setUserId] = useState("");
   const [file, setFile] = useState(null);
   const [userUploads, setUserUploads] = useState([]);
   const [isForgotpassModalOpen, setIsForgotpassModalOpen] = useState(false);
   const [selectedCategory, setSelectedCategory] = useState("");


   const imageListRef = ref(storage, "developer/");
   const colRef = collection(db, 'uploads')
   const infoRef = collection(db,'info')
   
   
   useEffect(() => {
     // Retrieve the user ID from the cookie
     const userIdFromCookie = Cookies.get("userId");
     if (userIdFromCookie) {
       setUserId(userIdFromCookie);
     } 
     //
     else {
      setIsSignInModalOpen(true);
     }
     //
   }, []);

   useEffect(() => {
      if (selectusername)
      fetchUserUploads()
   },[selectusername])

   useEffect(() => {
      // Call handleBuyNow when userId is set
      if (userId) {
        handleBuyNow();
      }
    }, [userId,selectusername]);

    useEffect(() => {
      if (isSubmitted) {
        setIsSubmitted(false);
        handleUpload(file);
        fetchUserUploads();
      }
    }, [isSubmitted]);
    
    const fetchUserUploads = async () => {
      try {
        // Query Firestore for user uploads
        const q = query(
          collection(db, "uploads"),
          where("username", "==", selectusername)
        );
        const querySnapshot = await getDocs(q);
    
        // Extract image URLs from the query result
        const uploads = querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const imageUrl = `${data.upload}`;
          try {
            const Url = await getDownloadURL(ref(storage, "/" + imageUrl));
            return {
              imageUrl: imageUrl,
              Url: Url,
            };
          } catch (error) {
            console.log("Error fetching image URL:", error);
            return {
              imageUrl: imageUrl,
              Url: null,
            };
          }
        });
    
        // Wait for all promises to resolve
        const resolvedUploads = await Promise.all(uploads);
        console.log(resolvedUploads);
    
        // Set user uploads state
        setUserUploads(resolvedUploads);
      } catch (error) {
        console.error("Error fetching user uploads:", error);
      }
    };
    
    const handleSelectChange = (category) => {
      setSelectedCategory(category);
    };
 
  const handleOrderNow = async () => {
   console.log("Ordering now:", selectedImageName);

   if (selectedImageName !== "") {
     // Add the order to the database with the selected image name
     addDoc(colRef, {
       username: selectusername,
       password: selectpassword,
       fulladdress: selectfulladdress,
       paymentdetails: account,
       upload: `${selectedCategory}/${selectedImageName}`, // Set the image name of the order
     })
       .then(() => {
         console.log("Uploaded successfully");
         alert("Uploaded successfully");
       })
       .catch((error) => {
         console.error("Error Occurred - Retry", error);
         alert("Error Occurred - Retry", error);
       });

     // Automatically upload the file to storage
     const imageRef = ref(storage, `${selectedCategory}/${selectedImageName}`);
     uploadBytes(imageRef, file)
       .then(() => {
         console.log("Image Uploaded");
       })
       .catch((error) => {
         console.error("Error uploading image", error);
         alert("Error uploading image", error);
       });
   }
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
 const handleSignIn = async (username, password, userid) => {
  
 
   try {
      // setIsSelectAddressModalOpen(true);
       setselectusername(username);
       setselectpassword(password);
 
       Cookies.set("userId",userid );
       setUserId(userid);
       setIsSubmitted(true);
      
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
  
   //setIsSelectAddressModalOpen(true);
   setselectusername(username);
   setselectpassword(password);
   setIsSubmitted(true)
   
 
 };
 
 const handleAddressSubmit = async(fulladdress) => {
   console.log(`Address Information-${fulladdress}`);
   setselectfulladdress(fulladdress);
 
   await updateDoc(doc(infoRef, userId), {
     fulladdress: fulladdress,
   })
  setIsSubmitted(true)
 }
 

 const handleAccountSubmit = async(bankdetails) => {
  console.log(`Account Information-${bankdetails}`);
  setAccount(bankdetails);
  await updateDoc(doc(infoRef, userId), {
    paymentdetails: bankdetails,
  })
setIsSubmitted(true)
  
}

const handleBuyNow = async () => {
  if (!userId) {
    return; // Exit if userId is not available
  }

  const userDocRef = doc(db, "info", userId);
  const userDocSnapshot = await getDoc(userDocRef);

  if (userDocSnapshot.exists()) {
    const userData = userDocSnapshot.data();
    setselectusername(userData.username);
    setselectpassword(userData.password);
    setAccount(userData.paymentdetails);

    // Check if both username and full address are available
    if (userData.username && userData.fulladdress) {
      setselectfulladdress(userData.fulladdress);
      setIsSelectAddressModalOpen(false); // Close the address modal if open
    }
  }
};

const handleUpload = async (file) => {
   setFile(file);
    if (!selectusername) {
      // User is not signed in, open sign-in/sign-up modal
      setIsSignInModalOpen(true);
    } else if (!selectfulladdress) {
      // Address is not available, open address modal
      setIsSelectAddressModalOpen(true);
    } else if (!account) {
      // Address is not available, open address modal
      setIsAccountModalOpen(true);
    } else {
      // User is signed in and address is available, proceed with upload
      // Your upload logic goes here
     
        setIsConfirmationModalOpen(true);
         const filename =file.name + v4();
        setSelectedImageName(filename)
    
    }
  };

  return (
    <div className="App">
      <div className="txt">
      <Code className="I1"/>
     <div className="hr">
      <h1 className="hdr">
        Earn with sitename
      </h1>
      <a>Recive upto 90% Profits from your Poster</a>
      </div>
      </div>
      <div className="drop">
      <DragDropFiles  handleUpload={handleUpload} />
      </div>
      <div className="uploads">
      <p style={{fontSize:"30px"}}>Previoius Uploads</p>
      {userUploads.map((upload) => (
        <img key={upload.Url} src={upload.Url} alt="Uploaded" className="uploadimg" />
      ))}
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onRequestClose={() => setIsSignInModalOpen(false)}
        onSignIn={handleSignIn}
        onSignUpRedirect={() =>[setIsSignInModalOpen(false),setSignUpModalOpen(true)]}
        onForgotPassword={() =>[setIsSignInModalOpen(false),setIsForgotpassModalOpen(true)]}
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
        payinfo={account}
        onhandleordernow={handleOrderNow}
        onSelectChange={handleSelectChange}
        file={file}
        onhandleChangeAddress={() => setIsSelectAddressModalOpen(true)}
        onhandleChangepayinfo={() => setIsAccountModalOpen(true)}
      />

        <SelectBankDetails
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onAddressSelected={handleAccountSubmit}
        
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
//name
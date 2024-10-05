import { useEffect, useState } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, query, where, getDocs,addDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { storage, db } from "../firebase";
import Cookies from "js-cookie";
import "./profile.css";
import SelectAddressModal from "../sidepages/address";
import Modal from "react-modal";
import { CircleUserRound,Star,Share2 } from "lucide-react";
import ConfirmationModal from "../sidepages/orderconfirmation";
import { v4 } from "uuid";

Modal.setAppElement("#root");

export default function AddAddress() {
  const [userId, setUserId] = useState("");
  const [idRetrieved, setIdRetrieved] = useState(false);
  const [address, setAddress] = useState("");
  const [isSelectAddressModalOpen, setIsSelectAddressModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [itemCounts, setItemCounts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [over, setOver] = useState(false);
  const [selectedImageName,setSelectedImageName] = useState("")
  const [isAddressSubmitted, setIsAddressSubmitted] = useState(false);
  const [selectfulladdress, setselectfulladdress] = useState("");
  const [selectpassword, setselectpassword] = useState("");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [productPrice, setProductPrice] = useState(0);
  const [user,setUser] = useState("");
  const [address1,setAddress1] = useState('');
  const [address2,setAddress2] = useState('');
  const [address3,setAddress3] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const infoRef = collection(db, 'info');
  const colRef = collection(db, 'pikachu');
  const uploadRef = collection(db, 'uploads');


  useEffect(() => {
    // Retrieve the user ID from the cookie
    const userIdFromCookie = Cookies.get("userId");
    if (userIdFromCookie) {
      setUserId(userIdFromCookie);
      setIdRetrieved(true);
    }
  }, []);

  useEffect(() => {
    if (idRetrieved) {
      getAddress();
    }
  }, [idRetrieved]);

  const getAddress = async () => {
    const userDocRef = doc(db, "info", userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      // User found, set the address
      const userData = userDocSnapshot.data();
      const usernameSubstring = userData.username.substring(0, 5) +"****"+ userData.username.slice(-10);
      setUser(usernameSubstring);
      setAddress(userData.fulladdress);
      setUsername(userData.username);
      setselectpassword(userData.password);
      getCart(userData.cart);
      getOrders(userData.username);
    }
  };

  const getCart = async (cart) => {
    if(cart){
    const cartItems = cart.split(",");
    const itemCounts = [];

    await Promise.all(cartItems.map(async (item) => {
      const imageUrl = item.trim();
      if (imageUrl) {
        try {
          const downloadUrl = await getDownloadURL(ref(storage, imageUrl));
          const rating = await fetchRatingForImage(imageUrl.slice(1));
          const existingItemIndex = itemCounts.findIndex(item => item.url === imageUrl && item.imageUrl === downloadUrl);

          if (existingItemIndex !== -1) {
            itemCounts[existingItemIndex].count += 1;
          } else {
            itemCounts.push({ url: imageUrl,imageUrl: downloadUrl, count: 1 ,rating: rating});
          }
        } catch (error) {
          console.error("Error getting image URL:", error);
        }
      }
    }));

    setItemCounts(itemCounts);
    console.log(itemCounts)
  }};

  const getOrders = async (username) => {
    const q = query(colRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    const orders = [];

    await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const orderWithImages = { ...data }; // Copy order data
      const orderImage = data.order;

      try {
        // Get the image URL from Firebase Storage
        const imageUrl = await getDownloadURL(ref(storage, orderImage));
        orderWithImages.image = imageUrl;
        orderWithImages.rating = await fetchRatingForImage(orderImage.slice(1));
        console.log(imageUrl);
      } catch (error) {
        // Handle error
        console.error("Error getting image URL:", error);
      }

      orders.push(orderWithImages);
    }));

    // Set the state after all promises are resolved
    setOrders(orders);
    console.log(orders);
  };

  const fetchRatingForImage = async (name) => {
    const detailsRef = collection(db, 'Details');
  
    try {
      const q = query(detailsRef, where("path", "==", `${name}`));
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
  }

  const handleAddressSubmit = async (fulladdress) => {
    setAddress(fulladdress);
    await updateDoc(doc(infoRef, userId), {
      fulladdress: fulladdress, // Update with the new address
    });
    setIsSelectAddressModalOpen(false); // Close the modal after submitting address
  };

  const handleQuantityChange = async(index, newQuantity) => {
    const newItems = [...itemCounts];
    const oldQuantity = newItems[index].count;
    newItems[index].count = newQuantity;
    setItemCounts(newItems);
    console.log(newItems)

    try {
      const newItem = newItems[index];
      const imageUrl = newItem.url;
      const userDocRef = doc(db, "info", userId);

      // Get the current user's cart data from Firestore
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          let cart = userData.cart ;
          console.log(cart)

          if (oldQuantity < newQuantity) {
            // Increase quantity: Add the URL multiple times to the cart
            const diff = newQuantity - oldQuantity;
            for (let i = 0; i < diff; i++) {
                cart += cart ? `,${imageUrl}` : imageUrl;
            }
        } else if (oldQuantity > newQuantity) {
          const cartItems = cart.split(",");
          const newCartItems = [];
          let removedCount = 0;
          for (const item of cartItems) {
              if (item === imageUrl && removedCount < oldQuantity - newQuantity) {
                  // Skip adding this URL to the new cart
                  removedCount++;
              } else {
                  newCartItems.push(item);
              }
          }
          cart = newCartItems.join(",");
      }

          // Update the cart data in Firestore
          await updateDoc(userDocRef, { cart });
      }
  } catch (error) {
      console.error("Error updating cart in Firestore:", error);
  }
};
const handleBuyNow = async (imageName) => {
  console.log("Image name received:", imageName);

  if (Array.isArray(imageName)) {
    let concatenatedImageName = imageName.map(item => item.url).join(',');

    const userDocRef = doc(db, "info", userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      // User found, set the username and password
      const userData = userDocSnapshot.data();
      setUsername(userData.username);
      setselectpassword(userData.password);
      
      if (!userData.fulladdress) {
        setIsSelectAddressModalOpen(true);
      } else {
        setselectfulladdress(userData.fulladdress);
        setIsAddressSubmitted(true);
      }
    } else {
      console.log("User not found");
      // Handle the case where the user is not found
    }

    const productPrice = imageName.length;

    setProductPrice(productPrice);
    setSelectedImageName(concatenatedImageName);
    console.log(concatenatedImageName);
  } else if (typeof imageName === 'string') {
    // If imageName is already a string, use it directly
    const userDocRef = doc(db, "info", userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      // User found, set the username and password
      const userData = userDocSnapshot.data();
      setUsername(userData.username);
      setselectpassword(userData.password);
      
      if (!userData.fulladdress) {
        setIsSelectAddressModalOpen(true);
      } else {
        setselectfulladdress(userData.fulladdress);
        setIsAddressSubmitted(true);
      }
    } else {
      console.log("User not found");
      // Handle the case where the user is not found
    }

    const productPrice = 1;

    setProductPrice(productPrice);
    setSelectedImageName(imageName);
    console.log(imageName);
  } else {
    console.log("Invalid input type");
  }
};


useEffect(() => {
  if (isAddressSubmitted) {
    // If address is submitted, then execute handleOrderNow
    setIsConfirmationModalOpen(true);

    // Reset the state to false after executing handleOrderNow
    setIsAddressSubmitted(false);
  }
}, [isAddressSubmitted]);

const handleOrderNow = async(orderId,productPrice) => {
  console.log("Ordering now:", selectedImageName);
  const trimmedImageName = selectedImageName.substring(1);

  if (selectedImageName !== "") {
    addDoc(colRef, {
      username: username,
      password: selectpassword,
      fulladdress: selectfulladdress,
      order: trimmedImageName,
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
    useEffect(() => {
      if (!username ) {
        const generatedDefaultName = "Guest " + v4().substring(0, 4);
        setUser(generatedDefaultName);
      }
    }, [username]);

    useEffect(() => {
      if (address) {
        console.log(address);
        setAddress1(address.fulladdress.address1 || ''); // Ensure address1 is set or fallback to empty string
        setAddress2(address.fulladdress.address2 || '');
        setAddress3(address.fulladdress.phoneNumber || '');
      }
    }, [address]);


    useEffect(() => {
      const fetchUploads = async () => {
        if (username) {
          setLoading(true);
          setError(null);
          try {
            const q = query(uploadRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);
  
            if (!querySnapshot.empty) {
              const allUploads = querySnapshot.docs.map(doc => doc.data().upload || []);
            console.log(allUploads.flat());
            setUploads(allUploads.flat());
            } else {
              console.log("User not found in uploads");
              setUploads([]);
            }
          } catch (error) {
            console.error("Error fetching uploads:", error);
            setError(error);
            setUploads([]);
          } finally {
            setLoading(false);
          }
        } else {
          setUploads([]); // Reset uploads if no username provided
        }
      };
  
      fetchUploads(); // Invoke the fetchUploads function
    }, [username]);
  
  return (
    <div className="address-container">
      <div>
        <CircleUserRound  className="u1"/>
        <div className="nam"><p>{user}</p></div>
        
      </div>
      {!idRetrieved ? (
        <div className="signin-section">
          <p>Please sign in to view or add an address.</p>     
        </div>
      ) : !address ? (
        <div className="signin-section">
          <p>No address found. Add a new address:</p>
          <button onClick={() => setIsSelectAddressModalOpen(true)}>Add Address</button>
        </div>
      ) : (
        <div className="signin-section">
          <div className="addr">
          <p>Address  - {address1},{address2}</p>
          <p>Phone - {address3}</p>
          </div>
          <button onClick={() => setIsSelectAddressModalOpen(true)}>Change Address</button>
        </div>
      )}
      <div className="cart-orders-container">
        <div className="cart">
          <div className="cart-heading">
            <a>Cart</a>
            {itemCounts.length > 0 ? (<button className="order-all-button" onClick={() => handleBuyNow(itemCounts)}>Order all</button>) :(<></>)}
          </div>
          <div className="cart-item-container">
            {itemCounts.length > 0 ? (
              itemCounts.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="contain">
                  <Link to={{
               pathname: `/enlarged-image/${encodeURIComponent(item.imageUrl)}`,
                state: { imageUrl: item.imageUrl }
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
                  <img src={item.imageUrl} alt={`Cart item ${index + 1}`} />
                  </Link>
                  </div>
                  <div className="details">
                  <h1>Cart {index+1}</h1>
                  <p>Name - {item.imageName}</p>
                  <p>Dimension - {item.imageWidth}cm x {item.imageHeight}cm</p>
                  <div className="card-style">
                    
                  <p>Quantity{"    "}
                        <select value={item.count} onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}>
                            {[...Array(5)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                    </p>   
                  <button className="order-all-button" onClick={() => handleBuyNow(item.url)}>Order</button>
    
                  </div>
                </div>
                </div>
              ))
            ) : (
              <div className="defal">
                <p>You are yet to add items to the cart</p>
              </div>
            )}
          </div>
        </div>

        <div className="order">
          <p style={{fontSize:"30px"}}>Orders</p>
          {orders && orders.length > 0 ? (
            <div>
              {orders.map((order, index) => (
                <div key={index} className="order-item">
                  <Link to={{
               pathname: `/enlarged-image/${encodeURIComponent(order.image)}`,
                state: { imageUrl: order.image }
                }}>
                   <div className="rating">
      {!order.rating || order.rating === '1' ? (
        <><Star className="starfill" size={20} />
        <Star className="star" size={20} />
        <Star className="star" size={20} />
        <Star className="star" size={20} />
        <Star className="star" size={20} /></>
      ) : (
        order.rating === '2' ? (
          <><Star className="starfill" size={20} />
          <Star className="starfill" size={20} />
          <Star className="star" size={20} />
          <Star className="star" size={20} />
          <Star className="star" size={20} /></>
        ) : (
          order.rating === '3' ? (
            <><Star className="starfill" size={20} />
            <Star className="starfill" size={20} />
            <Star className="starfill" size={20} />
            <Star className="star" size={20} />
            <Star className="star" size={20} /></> 
          ) : (
            order.rating === '4' ? (
              <><Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="star" size={20} /></> 
           ) : (
            order.rating === '5' ? (
              <><Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} />
              <Star className="starfill" size={20} /></>  
             ) : (<></>)))))}
           </div>
                  <img
                    src={order.image}
                    alt={"retry"} />

              </Link>
                    <div className="details">
                      
                  <p>Order {index + 1}:</p>
                  <p>Name - </p>
                  <p>Dimension - </p>
                  <button className="ordernow" onClick={() => handleBuyNow(order.image)}>Order again</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="defal">
              <p>You are yet to order.</p>
              <button className="csec">
                <CustomLink to="/" className="shop-now-btn">
                  Shop Now
                </CustomLink>
              </button>
            </div>
          )}
        </div>
      </div>
      <SelectAddressModal
        isOpen={isSelectAddressModalOpen}
        onClose={() => setIsSelectAddressModalOpen(false)}
        onAddressSelected={handleAddressSubmit}
      />
       <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        selectedImageName={selectedImageName}
        username={username}
        fulladdress={selectfulladdress}
        onhandlechangeaddress={() => setIsSelectAddressModalOpen(true)}
        onhandleordernow={handleOrderNow}
        productPrice={productPrice}
      />
    </div>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}

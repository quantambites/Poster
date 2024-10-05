import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import './confirm.css';
import PaypalCheckoutButton from '../pages/components/paypalcheckoutbutton';
import { getDownloadURL, ref, child } from 'firebase/storage';
import { storage, db } from '../firebase';
import { ChevronUp , ChevronDown } from "lucide-react"

const ConfirmationModal = ({
  isOpen,
  onClose,
  selectedImageName,
  onhandleordernow,
  onhandlechangeaddress,
  username,
  fulladdress,
  productPrice,
}) => {
  const [orderidno, setOrderidno] = useState('');
  const [concatenatedImageName, setconcatenatedImageName] = useState('');
  const [image, setImage] = useState('');
  const [address1,setAddress1] = useState('');
  const [address2,setAddress2] = useState('');
  const [address3,setAddress3] = useState('');
  const [isToggled, setIsToggled] = useState(false);
  const deliveryfee = 2;
  const product = {
    description: 'poster',
    price: productPrice+deliveryfee,
  };

  const handlePayNow = () => {
    console.log('Order confirmed!');
    onhandleordernow(orderidno, productPrice);
    onClose();
  };

  const handleChangeAddress = () => {
    onhandlechangeaddress(true);
    onClose();
  };

  useEffect(() => {
    if (fulladdress) {
      console.log(fulladdress);
      setAddress1(fulladdress.fulladdress.address1 || ''); // Ensure address1 is set or fallback to empty string
      setAddress2(fulladdress.fulladdress.address2 || '');
      setAddress3(fulladdress.fulladdress.phoneNumber || '');
    }
  }, [fulladdress]);
  
  useEffect(() => {

    if (selectedImageName) {
      const selectedImageRef = ref(storage, selectedImageName);
      getDownloadURL(selectedImageRef)
        .then((url) => {
          setImage(url);
        })
        .catch((error) => {
          console.error('Error fetching download URL:', error);
        });
    }
    console.log(image)
  }, [selectedImageName]);
  const handleToggle = () => {
    setIsToggled(!isToggled); // Toggle the state
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Order Confirmation Modal"
      className="confirmation-modal"
      overlayClassName="confirmation-overlay"
    >
      <div className="sign-in-header">
        <span>Order Confirmation</span>
      </div>
      <hr className="underline" />
      <div className="sign-in-container">
        <div className='order-container'>
        <img src={image} alt={concatenatedImageName}  className='img'/>
        <p >Quantity - {productPrice/1}</p>
        <p>Fees - ${productPrice}(product cost)+${deliveryfee}(delivery)</p>
        <p style={{color:'white',margin:"3px"}}>Amount - ${productPrice+deliveryfee} </p>
        <p style={{color:'white',marginTop:"0px"}}> (Payable in any currency)</p>
        </div>
        <div  style={{display: 'flex', justifyContent: 'center' }}>
        <button  onClick={handleToggle} className={`toggle-button ${isToggled ? 'on' : 'off'}`} title={isToggled ? 'Hide user Details' : 'Show user Details'}>
        {isToggled ? <ChevronDown /> : <ChevronUp />}
        
       </button>
       </div>
    {isToggled ?(
        <div className='user-container'>
            <p>User - {username}</p>
        <p>Address  - {address1},{address2}</p>
        <p>Phone - {address3}</p>
        <button onClick={handleChangeAddress} className='css'>Change Address</button>
        </div>):(<></>)}
       
        <div className="paypal-button-container" >
          <PaypalCheckoutButton product={product} onOrderIdChange={(orderId) => [setOrderidno(orderId), handlePayNow]} />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

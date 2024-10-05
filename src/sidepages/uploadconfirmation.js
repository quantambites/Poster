import React, { useState,useEffect } from 'react';
import Modal from 'react-modal';
import './confirm.css';
import { getDownloadURL, ref, child } from 'firebase/storage';
import { storage, db } from '../firebase';
import { ChevronUp , ChevronDown } from "lucide-react"

const ConfirmationModal = ({
    isOpen,
    onClose,
    selectedImageName,
    onhandleordernow,
    username,
    fulladdress,
    payinfo,
    onSelectChange,
    file,
    onhandleChangeAddress,
    onhandleChangepayinfo,
  }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [imageDataUrl, setImageDataUrl] = useState('');
    const [address1,setAddress1] = useState('');
    const [address2,setAddress2] = useState('');
    const [address3,setAddress3] = useState('');
    const [payinfo1,setPayinfo1] = useState('');
    const [payinfo2,setPayinfo2] = useState('');
    const [payinfo3,setPayinfo3] = useState('');
    const [isToggled, setIsToggled] = useState(false);
    const [isToggled2, setIsToggled2] = useState(false);
    const ChangeAddress = () => {
      onhandleChangeAddress(true);
      onClose();
    };

    const Changepayinfo = () => {
      onhandleChangepayinfo(true);
      onClose();
    };

    useEffect(() => {
      const loadImageDataUrl = async () => {
        if (file) {
          const imageData = await readFileAsync(file);
          setImageDataUrl(imageData);
        }
      };
  
      loadImageDataUrl();
    }, [file]);
  
    const readFileAsync = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    useEffect(() => {
      if (payinfo) {
        console.log(payinfo);
        setPayinfo1(payinfo.paymentdetails.name || ''); // Ensure address1 is set or fallback to empty string
        setPayinfo2(payinfo.paymentdetails.cardnumber+' , '+payinfo.paymentdetails.expirydate|| '');
        setPayinfo3(payinfo.paymentdetails.uniqueidtype+' , '+payinfo.paymentdetails.uniqueid || '');
      }
    }, [payinfo]);

    useEffect(() => {
      if (fulladdress) {
        console.log(fulladdress);
        setAddress1(fulladdress.fulladdress.address1 || ''); // Ensure address1 is set or fallback to empty string
        setAddress2(fulladdress.fulladdress.address2 || '');
        setAddress3(fulladdress.fulladdress.phoneNumber || '');
      }
    }, [fulladdress]);
   
    const handlePayNow = () => {
      // Execute order now function or update information to the server
      console.log('Order confirmed!');
      // Additional logic for updating the server goes here
      onhandleordernow(true);
      onClose(); // Close the modal after processing the order
    };

    const handleCategoryChange = (event) => {
      setSelectedCategory(event.target.value);
      if (onSelectChange) {
        onSelectChange(event.target.value); // Passing selected category to the parent component
      }
    };

    const handleToggle = () => {
      setIsToggled(!isToggled); // Toggle the state
    };

    const handleToggle2 = () => {
      setIsToggled2(!isToggled2); // Toggle the state
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
        <span>Upload Confirmation</span>
      </div>
      <hr className="underline" />
      <div className="sign-in-container">
        <div className='order-container'>
          <img src={imageDataUrl} alt={selectedImageName} />
          <p>Name - {selectedImageName.slice(0, 30)}....</p>
          
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
        <button onClick={ChangeAddress} className='css'>Change Address</button>
        </div>):(<></>)}
          
          </div>
          <div  style={{display: 'flex', justifyContent: 'center' }}>
        <button  onClick={handleToggle2} className={`toggle-button ${isToggled2 ? 'on' : 'off'}`} title={isToggled2 ? 'Hide user Details' : 'Show user Details'}>
        {isToggled2 ? <ChevronDown /> : <ChevronUp />}       
       </button>
       </div>
        {isToggled2 ?(
        <div className='user-container'>
          <p> Name - {payinfo1}</p>
          <p> Card - {payinfo2}</p>
          <p> ID - {payinfo3}</p>
          <button onClick={Changepayinfo} className='css'>Change Payment</button>
          </div>):(<></>)}
          <div className="custom-select-wrapper">
          <label htmlFor="category">Select Category - </label>
          <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">Select...</option>
          <option value="cars">Cars</option>
          <option value="Modern">Modern</option>
          <option value="Abstract">Abstract</option>
          <option value="Office">Office</option>
          <option value="Relaxing">Relaxing</option>
          </select>
          </div>
          <button onClick={handlePayNow} className='css'>Upload Image</button>
          
        </div>
      </Modal>
    );
  };
  
  export default ConfirmationModal;
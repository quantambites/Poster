// SelectAddressModal.js

import React, { useState, useEffect } from "react";
import "./SelectAddressModal.css"; // Include your modal styling
import Modal from "react-modal";

const SelectAddressModal = ({ isOpen, onClose, onAddressSelected }) => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [roadNumber, setRoadNumber] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin,setPin] = useState("")
  const [inputerror,setInputerror] = useState("")



  const handleSave = () => {
    setInputerror("");
    if(selectedCountry == "" ||selectedState == "" ||selectedDistrict == "" ||
   pin == "" || roadNumber == "" || landmark == "" || phoneNumber == ""){
   setInputerror("Please fill in all fields.");
   return;}
   else 
   setInputerror("")
   if(phoneNumber.length != 10){
   setInputerror("Please enter a 10-digit phone number.")  ;
    return;}
   else 
   setInputerror("")  
    const fulladdress = {
      address1: `${selectedCountry}, ${selectedState}, ${selectedDistrict}`,
      address2: `${pin},${roadNumber}, ${landmark}`,
      phoneNumber,
    };

    if (onAddressSelected) {
      onAddressSelected({
        fulladdress
        
      });
    }

    onClose(); // Close the modal
  };

  return (
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      contentLabel="select-address-modal"
      className="sign-up-modal"
      overlayClassName="sign-up-overlay"
    >
      <div className="sign-in-header">
          <span>Delivery Address</span>
          
        </div>
        <hr className="underline" />
      <div className="sign-in-container">
       
      <div className="form-group">
          <a>Country</a>
            <input
            placeholder="Enter country name"
              id="country"
              type="text"          
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            />
          </div>
          
          <div className="form-group">
          <a>State</a>
            <input
            placeholder="Enter state name"
            id="state"
            type="text"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          />
        </div>
        <div className="form-group">
          <a>City</a>
            <input
            placeholder="Enter City name"
            id="district"
            type="text"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          />
        </div>
        <div className="form-group">
          <a>Road</a> 
            <input
            placeholder="Enter Road number / Name "
            id="road"
            type="text"
            value={roadNumber}
            onChange={(e) => setRoadNumber(e.target.value)}
          />
        </div>
        <div className="form-group">
           <a>PIN</a>
            <input
            placeholder="Enter your PIN / ZIP code"
            id="pin"
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>
        <div className="form-group">
          <a>Landmark</a>
            <input
            placeholder="Enter nearby landmark"
            id="landmark"
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />
        </div>
        <div className="form-group">
           <a>Number</a>
            <input
            placeholder="Enter your contact number"
            id="phonenumber"
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        {inputerror?(
          <div className="err">
             {inputerror}
            </div>
          ):( <></>)}
        <button onClick={handleSave} className="css">Save</button>
      </div>
      </Modal>
  );
};

export default SelectAddressModal;

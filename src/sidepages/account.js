import React, { useState, useEffect } from "react";
import "./account.css"; // Include your modal styling
import Modal from "react-modal";


const SelectAddressModal = ({ isOpen, onClose, onAddressSelected }) => {
  const [name, setName] = useState("");
  const [cardnumber, setCardnumber] = useState("");
  const [uniqueid, setUniqueid] = useState("");
  const [uniqueidtype,setUniqueidtype] =useState("");
  const [expirydate,setExpirydate] = useState("");
  const [inputerror,setInputerror] = useState("");

  const handleSave = () => {
    setInputerror("");
    if(name == "" ||cardnumber == "" ||expirydate == "" ||
   uniqueidtype == "" || uniqueid == "" ){
   setInputerror("Please fill in all fields.");
   return;}
   else 
   setInputerror("")
    
    const paymentdetails = {
      name: `${name}`,
      cardnumber: `${cardnumber}`,
      expirydate: `${expirydate}`,
      uniqueidtype: `${uniqueidtype}`,
      uniqueid: `${uniqueid}`,
    };

    if (onAddressSelected) {
      onAddressSelected({
        paymentdetails
        
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
          <span>Update KYC</span>
          
        </div>
        <hr className="underline" />
        
      <div className="sign-in-container">
        <div className="card-details">
          <p className="semihd"> Card details -</p>
        <div className="form-group">
          <a>Name</a>
            <input
            placeholder="Enter your full name"
              id="name"
              type="text"          
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
      
          <div className="form-group">
          <a>Card</a>
            <input
            placeholder="Enter your card number"
              id="card"
              type="text"          
              value={cardnumber}
              onChange={(e) => setCardnumber(e.target.value)}
            />
          </div>

          <div className="form-group">
          <a>Expires</a>
            <input
            placeholder="MM/YY  Enter your Expiry date"
              id="card"
              type="text"          
              value={expirydate}
              onChange={(e) => setExpirydate(e.target.value)}
            />
          </div>
          </div>
          <div className="identity-details">
          <p className="semihd"> Identity details -</p>
          <div className="form-group">
          <a >Unique ID type</a>
            <input
            placeholder="Enter your Unique Identity type"
              id="idtype"
              type="text"          
              value={uniqueidtype}
              onChange={(e) => setUniqueidtype(e.target.value)}
            />
          </div>
            
          <div className="form-group">
          <a>Unique ID number</a>
            <input
            placeholder="Enter your Unique Identity number"
              id="idnum"
              type="text"          
              value={uniqueid}
              onChange={(e) => setUniqueid(e.target.value)}
            />
          </div>
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


/*<div className="form-group">
            <a>CSC</a>
              <input
              placeholder="Enter your CSC "
                id="card"
                type="text"          
                value={expirydate}
                onChange={(e) => setExpirydate(e.target.value)}
              />
            </div>*/
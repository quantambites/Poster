import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";


const PaypalCheckoutButton = (props) => {
  const { product, onOrderIdChange } = props;
    const [orderIdno,setOrderIdno] = useState("");

    const handleApprove = (orderId) => {
        setOrderIdno(orderId);
        onOrderIdChange(orderId); 
      };

      return <PayPalButtons 
      style={{
        color: "silver",       
        tagline: false,      
      }}
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              description: product.description,
              amount: {
                value: product.price
              }
            }
          ]
        });
      }}
      onApprove={async (data, actions) => {
        const order = await actions.order.capture(); 
        console.log("order", order);
      
        handleApprove(data.orderID);
      }}
      />
      
  };
  
  export default PaypalCheckoutButton;
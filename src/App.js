import Navbar from "./Navbar"
import './app.css'
import Sidebar from "./sidebar"
import Custom from "./pages/Custom"
import Developer from "./pages/Developer"
import Profile from "./pages/profile"
import Home from "./pages/Home"
import Car from "./pages/sub-pages/car"
import Modern from "./pages/sub-pages/modern"
import Abstract from "./pages/sub-pages/abstract"
import Office from "./pages/sub-pages/office"
import Relaxing from "./pages/sub-pages/relaxing"
import EnlargedImagePage from "./sidepages/enlargedimagepage";
import { Route, Routes } from "react-router-dom"
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useParams,useLocation } from "react-router-dom";


function App() {
  useLocation();
  useParams();
  return (
    <>
     
    
      <Navbar />
      <PayPalScriptProvider  options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID }}>
      <div className="App main-content" style={{margin:"0px",padding:"0px"}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" elements={<Home />} />
          <Route path="/custom" element={<Custom />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/car" element={<Car/>}/>
          <Route path="/modern" element={<Modern/>}/>
          <Route path="/abstract" element={<Abstract/>}/>
          <Route path="/office" element={<Office/>}/>
          <Route path="/relaxing" element={<Relaxing/>}/>
          <Route path="/enlarged-image/:imageUrl" element={<EnlargedImagePage />} />
        </Routes>
        
      </div>
      </PayPalScriptProvider>
      
    </>
    

    
  )
}

export default App
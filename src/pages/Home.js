import "./home.css";
import { useState,useEffect,useRef } from "react";
import { storage } from "../firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import {ChevronLeft, ChevronRight , Circle, CircleDot } from "lucide-react"
import { Link ,useMatch, useResolvedPath } from "react-router-dom";
import backgroundImage from "./components/background.jpg";

function App() {
  const [imageUrls, setimageUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carImage, setCarImage] = useState(null);
  const [modernImage, setmodernImage] = useState(null);
  const [abstractImage, setabstractImage] = useState(null);
  const [officeImage, setofficeImage] = useState(null);
  const [relaxingImage, setrelaxingImage] = useState(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const imageListRef = ref(storage, "highlights/");
  const imageListRefc = ref(storage, "h1/");
  const imageListRefm = ref(storage, "h2/");
  const imageListRefa = ref(storage, "h3/");
  const imageListRefo = ref(storage, "h4/");
  const imageListRefr = ref(storage, "h5/");
  var s=0;
  useEffect(() => {
    listAll(imageListRef).then((response) => {
        const firstItem = response.items[0]; // Get the first item
        response.items.forEach((item) => {
            if (firstItem.fullPath === item.fullPath) { // Compare the fullPaths (or use another property)
                s = s + 1;
            }
            if (s === 2) {
                return;
            }
            getDownloadURL(item).then((url)=> {
                console.log(url)
                setimageUrls((prev) =>[...prev,url]);
            });
        });
    });
}, []);

  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : imageUrls.length - 1
    );
  };

  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < imageUrls.length - 1 ? prevIndex + 1 : 0
    );
  };

  

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleNextClick();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentImageIndex]);

  
  useEffect(() => {
    listAll(imageListRefc).then((response) => {
      if (response.items.length > 0) {
        const firstCarImage = response.items[0];

        getDownloadURL(firstCarImage).then((url) => {
          setCarImage(url);
        });
      }
    });
  }, []);

  useEffect(() => {
    listAll(imageListRefm).then((response) => {
      if (response.items.length > 0) {
        const firstCarImage = response.items[0];

        getDownloadURL(firstCarImage).then((url) => {
          setmodernImage(url);
        });
      }
    });
  }, []);

  useEffect(() => {
    listAll(imageListRefa).then((response) => {
      if (response.items.length > 0) {
        const firstCarImage = response.items[0];

        getDownloadURL(firstCarImage).then((url) => {
          setabstractImage(url);
        });
      }
    });
  }, []);

  useEffect(() => {
    listAll(imageListRefo).then((response) => {
      if (response.items.length > 0) {
        const firstCarImage = response.items[0];

        getDownloadURL(firstCarImage).then((url) => {
          setofficeImage(url);
        });
      }
    });
  }, []);

  useEffect(() => {
    listAll(imageListRefr).then((response) => {
      if (response.items.length > 0) {
        const firstCarImage = response.items[0];

        getDownloadURL(firstCarImage).then((url) => {
          setrelaxingImage(url);
        });
      }
    });
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNextClick();
    } else if (touchEndX.current - touchStartX.current > 50) {
      handlePrevClick();
    }
  };
 

  return (
   <div className="App" style={{ backgroundColor: "rgb(0, 0, 0, 0.2)", backgroundSize: 'cover' }}>
    <section
    aria-label="Image Slider"
    style={{ width: "100%", height: "100%", position: "relative",backgroundColor:"rgb(0, 0, 0, 0.2)"}}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    >
      
      <div className="Slidebar" style={{ height: imageUrls.length > 0 ? "auto" : "100%", position: "relative" }}>
  {imageUrls.length > 0 && (
    <>
      <img
        src={imageUrls[currentImageIndex]}
        alt="highlight"
        className="highlight"
        onLoad={() => {
          const img = document.querySelector(".highlight");
          if (img) {
            const height = img.offsetHeight;
            document.querySelector(".Slidebar").style.height = `${height}px`;
          }
        }}
        style={{ width: "100%" }}
      />
      <div
        className="text-overlay"
        style={{
          position: "absolute",
          top: "45%",
          left: "100px",
          transform: "translateY(-50%)", // Center vertically
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
          display: "flex",
          flexDirection: "column", // Stack the text and button vertically
          alignItems: "flex-start", // Align items to the left
        }}
      >
        <p
          style={{
            margin: "0 0 10px 0", // Add some space below the text
            fontSize: "35px"
          }}
        >
          Bring life to your house with Postlify
        </p>
        <button
         className="butonn"
          style={{
            cursor: "pointer"
          }}
          onClick={() => {
            const scrollDuration = 400; // Duration of the scroll in milliseconds
            const scrollStep = window.innerHeight / (scrollDuration / 15); // Calculate step size based on duration
        
            let scrollInterval = setInterval(() => {
              if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
                clearInterval(scrollInterval); // Stop scrolling when reaching the bottom
              } else {
                window.scrollBy(0, scrollStep); // Scroll by calculated step
              }
            }, 15); // Run the interval every 15 milliseconds
          }}
        >
          Explore now
        </button>
      </div>
    </>
  )}
</div>
          <button 
          onClick={handlePrevClick}
          className="img-slider-btn"
          style={{left: 0,backgroundColor: "rgba(255, 255, 255, 0)"}}
          aria-label="View Previous Image"
          >
            <ChevronLeft />
          </button>
          <button 
          onClick={handleNextClick}
          className="img-slider-btn"
          style={{right: 0,backgroundColor: "rgba(255, 255, 255, 0)"}}
          aria-label="View Next Image"
          >
            <ChevronRight />
          </button>
        
      <div
        style={{
          position: "absolute",
          bottom: ".5rem",
          left: "50%",
          translate: "-50%",
          display: "flex",
          gap: ".25rem",
        }}
      >
        {imageUrls.map((_, index) => (
          <button
            key={index}
            className="img-slider-dot-btn"
            aria-label={`View Image ${index + 1}`}
            onClick={() => setCurrentImageIndex(index)}
          >
            {index === currentImageIndex ? (
              <CircleDot aria-hidden />
            ) : (
              <Circle aria-hidden />
            )}
          </button>
        ))}
      </div>

    </section>
    <div className="cards">
  {/* First Group */}
    <div className="element">
      {carImage && (
         <CustomLink to="/car">
         <>
         <div className="content">
           <img src={carImage}  alt="Car" />
           <h2>Cars</h2>
           <div className="ele">   
           <a style={{ textDecoration: 'none' }}>cars</a>
           </div> 
           </div>
         </>
         </CustomLink>
      )}
    </div>

    <div className="element">
      {modernImage && (
        <CustomLink to="/modern" style={{}}>
        <>
        <div className="content">
          <img src={modernImage} className="cars" alt="Modern" />
          <h2>Modern</h2>
          <div className="ele">
            <a>modern</a>
          </div>
          </div>
        </>
        </CustomLink>
      )}
    </div>

    <div className="element">
      {abstractImage && (
        <CustomLink to="/abstract">
        <>
        <div className="content">
          <img src={abstractImage} className="cars" alt="Abstract" />
          <h2>Abstract</h2>
          <div className="ele">
            <a>
              Abstract
            </a>
          </div>
          </div>
        </>
        </CustomLink>
      )}
    </div>
 
    <div className="element">
      {officeImage && (
         <CustomLink to="/office">
         <>
         <div className="content">
           <img src={officeImage} className="cars" alt="Office" />
           <h2>Office</h2>
           <div className="ele">
            <a>
              Office
            </a>
           </div>
           </div>
         </>
         </CustomLink>
      )}
    </div>

    <div className="element">
      {relaxingImage && (
       <CustomLink to="/relaxing">
       <>
       <div className="content">
         <img src={relaxingImage} className="cars" alt="Relaxing" />
         <h2>Relaxing</h2>
         <div className="ele">
          <a>
            Relaxing
          </a>
         </div>
         </div>
       </>
       </CustomLink>
      )}
    </div>
  </div>

  </div>
  );
}

export default App;

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const isActive = useMatch({ path: resolvedPath.pathname, end: true })

  return (
    <Link to={to} className={isActive ? "active" : ""} {...props}>
      {children}
    </Link>
  )
}
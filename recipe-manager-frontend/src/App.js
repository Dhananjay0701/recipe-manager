import { use, useState } from "react";
import ToggleSwitch from "./components/ToggleSwitch/ToggleSwitch"
import ScrollableComponent from "./components/ScrollableComponent/ScrollableComponent"
import "./App.css";
import StarRating from "./components/StarRating/StarRating";


export function RecipeButton({ images}){
    const [hoveredImage, setHoveredImage] = useState(null);

    const handleMouseEnter = (id) => {
      setHoveredImage(id);
    };
  
    const handleMouseLeave = () => {
      setHoveredImage(null);
    };  
    return (
    <div className="recipe-grid">
        {images.map((image, index) => (
            <button
                key={index}
                className="Big-button"
                style={{
                    backgroundImage: `url(/static/${image.Image_path})`,
                }}
                onMouseEnter={() => handleMouseEnter(image.id)}
                onMouseLeave={handleMouseLeave}>
                {hoveredImage === image.id && (
                <div className="hover-all">
                    <div className="hover-text">{String(image.Name).charAt(0).toUpperCase() + String(image.Name).slice(1)}</div>
                    <div className="hover-image"></div>
                    <div className="hover-date">{String(image.date.substr(0, 3) + "  " + image.date.substr(3)).split(" ").slice(1).join(" ")}</div>
                    <div className="hover-rating"><StarRating rating={image.Rating}/></div>
                </div>
                )}
            </button>
        ))}
    </div>
    );
  };

export function TopBar(){
    return (
        <div className="Top-bar">
            <div className="Topbar-elements">
                <button className="Logo-tag"></button>
                <button className = 'Logo-name'>BroIsCooked</button>
                <div class="search">
                    <input
                        type="text"
                        className="Search-input"
                        placeholder="Search here..."
                    />
                </div>
                <button className="All-recipes">ALL-RECIPES</button>
                <button className="Dairy">DAIRY</button>
                <button className="Add-recipe"><p className="Add-p">+</p>ADD RECIPE</button>
                <div className="User-details">
                    <button className="User-acc"></button>
                    <button className="User-text">DT</button>
                </div>
            </div>
        </div>
    )
}

export function BannerText(){
    return (
    <div>
        <button className="BannerImg"></button>
        <div className="Banner-text">Welcome Back <span className="Bt-span"> Dhananjay</span>, Look how you massacred all these boys...</div>
    </div>
    )
}

const Dropdown = ({ title, options }) => {
  const [open, setOpen] = useState(false);
  const ic_val = (title === "Sort by") ? "sby-icon" : "icon";
  console.log(ic_val);
  return (
    <div className="dropdown" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button>
        {title} <span className={ic_val}>▼</span>
      </button>
      {open && (
        <div className="dropdown-content">
          {options.map((option, index) => (
            <a key={index} href="#" onClick={() => setOpen(false)}>
              {option}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export function FilterBar() {
  return (
    <div className="container">
      <hr className="hr-1" />
      <div className="filters">
        <Dropdown title="CUISINE" options={["USA", "UK", "India"]} />
        <Dropdown title="TYPE" options={["Available", "Out of Stock", "New Arrivals"]} />
        <Dropdown title="YEAR" options={["Available", "Out of Stock", "New Arrivals"]} />
        <Dropdown title="FILTER" options={["Available", "Out of Stock", "New Arrivals"]} />
        <Dropdown title="Sort by" options={["Price", "Date", "Popularity"]} />
        
      </div>
      <hr className="hr-2" />
    </div>
  );
}


const imagePaths = [
    {'id' : 1,"Name": "Spaghetti al pomodoro", "Image_path" : "spagethi_phone.webp", 'date': "20 Jan 2024", 'Rating': 4},
    {'id' : 2,"Name": "pizza", "Image_path" : "pizza.jpeg", 'date': "02 Feb 2024", 'Rating': 4.5},
    {'id' : 3,"Name": "Foccacia", "Image_path" : "Roasted-Tomato-and-Olive-Focaccia-Bread-2.jpg", 'date': "21 Mar 2024", 'Rating': 4.5},
    {'id' : 4,"Name": "Sourdough", "Image_path" : "sourdough-bread-round-1-of-1.webp", 'date': "15 Apr 2024", 'Rating': 3},
    {'id' : 5,"Name": "Spaghetti alio e olio", "Image_path" : "spaghetti-aglio-e-olio-close-up-800x1200.jpg", 'date': "20 Jan 2024", 'Rating': 2},
    {'id' : 6,"Name": "Brownie", "Image_path" : "Chocolate-Brownie-Recipe-5.jpg", 'date': "31 Jan 2024", 'Rating': 3},
    {'id' : 7,"Name": "Chole", "Image_path" : "chole-masala-recipe27.jpg", 'date': "20 Jan 2024", 'Rating': 4},
    {'id' : 8,"Name": "Sev tamatar", "Image_path" : "sev-tameta-nu-shaak.jpg", 'date': "20 Jan 2024", 'Rating': 4.5},
    {'id' : 9,"Name": "Cinnamon Role", "Image_path" : "Perfect-Cinnamon-Rolls-10-1067x1600.jpg", 'date': "20 Jan 2024", 'Rating': 3.5},
    ];

export default function Home(){
    return <div>
        <TopBar/>
        <BannerText/>
        <FilterBar/>
        <RecipeButton
        images={imagePaths}/>
        </div>;
}


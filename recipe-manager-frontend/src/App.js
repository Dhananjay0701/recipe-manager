import { use, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import ToggleSwitch from "./components/ToggleSwitch/ToggleSwitch"
import ScrollableComponent from "./components/ScrollableComponent/ScrollableComponent"
import "./App.css";
import StarRating from "./components/StarRating/StarRating";
import AddRecipeModal from "./components/AddRecipeModal/AddRecipeModal";
import RecipeDetail from "./components/RecipeDetail/RecipeDetail";


export function RecipeButton({ images}){
    const [hoveredImage, setHoveredImage] = useState(null);
    const navigate = useNavigate();

    const handleMouseEnter = (id) => {
      setHoveredImage(id);
    };
  
    const handleMouseLeave = () => {
      setHoveredImage(null);
    };  

    const handleRecipeClick = (recipe) => {
        navigate(`/${recipe.Name}`);
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
                onMouseLeave={handleMouseLeave}
                onClick={() => handleRecipeClick(image)}>
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
    const [showModal, setShowModal] = useState(false);
    
    const handleAddRecipeClick = () => {
        setShowModal(true);
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
    };
    
    return (
        <div className="Top-bar">
            <div className="Logo-section">
                <button className="Logo-tag"></button>
                <button className="Logo-name">BroIsCooked</button>
            </div>
            
            <div className="search">
                <input 
                    className="Search-input" 
                    type="text" 
                    placeholder="Search recipe" 
                />
            </div>
            
            <div className="nav-links">
                <button className="All-recipes">ALL-RECIPES</button>
                <button className="Dairy">DAIRY</button>
                <button className="Add-recipe" onClick={handleAddRecipeClick}>
                    <p className="Add-p">+</p>ADD RECIPE
                </button>
            </div>
            
            <div className="User-section">
                <button className="User-acc"></button>
                <button className="User-text">DT</button>
            </div>
            
            {showModal && <AddRecipeModal onClose={handleCloseModal} onAddRecipe={() => window.location.reload()} />}
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


export default function App() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchRecipes = () => {
        fetch('http://localhost:5001/api/recipes')
            .then(response => response.json())
            .then(data => {
                setRecipes(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                setLoading(false);
            });
    };
    
    useEffect(() => {
        fetchRecipes();
        
        // Listen for recipe updates
        const handleRecipeUpdate = () => {
            fetchRecipes();
        };
        
        window.addEventListener('recipe-updated', handleRecipeUpdate);
        
        return () => {
            window.removeEventListener('recipe-updated', handleRecipeUpdate);
        };
    }, []);
    
    return (
        <Router>
            <TopBar />
            <Routes>
                <Route path="/" element={
                    <>
                        <BannerText />
                        <FilterBar />
                        {loading ? (
                            <div className="loading">Loading recipes...</div>
                        ) : (
                            <RecipeButton images={recipes}/>
                        )}
                    </>
                } />
                <Route path="/:recipeName" element={<RecipeDetail recipes={recipes} />} />
            </Routes>
        </Router>
    );
}


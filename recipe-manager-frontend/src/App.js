import { use, useState } from "react";
import ToggleSwitch from "./components/ToggleSwitch/ToggleSwitch"
import ScrollableComponent from "./components/ScrollableComponent/ScrollableComponent"
import "./App.css";

const RecipeButton = ({ images}) => {
    return (
    <div className="recipe-grid">
        {images.map((image_name, index) => (
            <button
                key={index}
                className="Big-button"
                style={{
                    backgroundImage: `url(/static/${image_name})`,
                }}>
            </button>
        ))}
    </div>
    );
  };
// Example usage:

const imagePaths = [
    "spagethi_phone.webp",
    "pizza.jpeg",
    "Roasted-Tomato-and-Olive-Focaccia-Bread-2.jpg",
    "sourdough-bread-round-1-of-1.webp",
    "spaghetti-aglio-e-olio-close-up-800x1200.jpg",
    "Chocolate-Brownie-Recipe-5.jpg",
    'chole-masala-recipe27.jpg',
    'sev-tameta-nu-shaak.jpg',
    'Perfect-Cinnamon-Rolls-10-1067x1600.jpg'
  ];

export default function Home(){
    return <RecipeButton
        images={imagePaths}/>;
}


import React from "react";
import { FaStar, FaRegStar,FaStarHalfAlt } from "react-icons/fa"; // Icons for filled and empty stars
import "./StarRating.css";

export function StarRating({ rating, maxStars = 5 }){
    const stars = Array.from({ length: maxStars }, (_, index) => {
    if (index + 1 <= rating) {
        return <FaStar key={index} className="star-filled" />;
    } else if (index + 0.5 === rating) {
        return <FaStarHalfAlt key={index} className="star-half" />;
    } else {
        return <FaRegStar key={index} className="star-empty" />;
    }
    });

    return <div className="star-rating">{stars}</div>;
};

export default StarRating;
    

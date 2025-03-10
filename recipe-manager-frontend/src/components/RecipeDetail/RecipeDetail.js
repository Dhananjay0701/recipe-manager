import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import './RecipeDetail.css';

const RecipeDetail = ({ recipes }) => {
    const { recipeName } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recipeText, setRecipeText] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState('');
    const [links, setLinks] = useState([]);
    const [newLink, setNewLink] = useState('');

    useEffect(() => {
        // First try to find the recipe in passed props
        if (recipes && recipes.length > 0) {
            const found = recipes.find(r => r.Name === recipeName);
            if (found) {
                setRecipe(found);
                setRecipeText(found.recipeText || '');
                setIngredients(found.ingredients || []);
                setLinks(found.links || []);
                setLoading(false);
                return;
            }
        }

        // If not found or recipes not loaded, fetch from API
        fetch(`http://localhost:5001/api/recipes/${recipeName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Recipe not found');
                }
                return response.json();
            })
            .then(data => {
                setRecipe(data);
                setRecipeText(data.recipeText || '');
                setIngredients(data.ingredients || []);
                setLinks(data.links || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching recipe:', error);
                setLoading(false);
            });
    }, [recipeName, recipes]);

    const handleRatingChange = (newRating) => {
        if (!recipe) return;
        
        // Ensure the rating is a number
        const numericRating = parseFloat(newRating);
        fetch(`http://localhost:5001/api/recipes/${recipe.id}/rating`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating: numericRating }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update rating');
                }
                return response.json();
            })
            .then(data => {
                // Update the local state with the new rating
                setRecipe({ ...recipe, Rating: numericRating });
                
                // Force a refresh of the recipes in App.js to update the main page
                window.dispatchEvent(new CustomEvent('recipe-updated'));
                
                console.log('Rating updated successfully');
            })
            .catch(error => {
                console.error('Error updating rating:', error);
            });
    };

    const handleRecipeTextChange = (e) => {
        setRecipeText(e.target.value);
    };

    const saveRecipeText = () => {
        if (!recipe) return;
        
        fetch(`http://localhost:5001/api/recipes/${recipe.id}/text`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipeText }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Recipe text saved');
            })
            .catch(error => {
                console.error('Error saving recipe text:', error);
            });
    };

    const handleIngredientCheck = (index) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index].checked = !updatedIngredients[index].checked;
        setIngredients(updatedIngredients);
        if (!recipe) return;
        
        fetch(`http://localhost:5001/api/recipes/${recipe.id}/ingredients`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: updatedIngredients }),
        })
            .then(response => response.json())
            .then(() => {
                window.dispatchEvent(new CustomEvent('recipe-updated'));
            })
            .catch(error => {
                console.error('Error updating ingredients:', error);
            });
    };

    const addIngredient = () => {
        if (!newIngredient.trim() || !recipe) return;
        
        const newIngredientObj = { name: newIngredient, checked: false };
        const updatedIngredients = [...ingredients, newIngredientObj];
        
        console.log('Sending ingredients update for recipe ID:', recipe.id);
        console.log('Updated ingredients:', updatedIngredients);
        
        fetch(`http://localhost:5001/api/recipes/${recipe.id}/ingredients`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: updatedIngredients }),
        })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error('Failed to update ingredients');
                }
                return response.json();
            })
            .then(() => {
                setIngredients(updatedIngredients);
                setNewIngredient('');
                window.dispatchEvent(new CustomEvent('recipe-updated'));
            })
            .catch(error => {
                console.error('Error adding ingredient:', error);
            });
    };

    const deleteIngredient = (index) => {
        if (!recipe) return;
        
        const updatedIngredients = [...ingredients];
        updatedIngredients.splice(index, 1);
        
        fetch(`http://localhost:5001/api/recipes/${recipe.id}/ingredients`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: updatedIngredients }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update ingredients');
                }
                return response.json();
            })
            .then(() => {
                setIngredients(updatedIngredients);
                window.dispatchEvent(new CustomEvent('recipe-updated'));
            })
            .catch(error => {
                console.error('Error deleting ingredient:', error);
            });
    };

    const addLink = () => {
        if (!newLink.trim() || !recipe) return;
        
        const updatedLinks = [...links, newLink];
        
        fetch(`http://localhost:5001/api/recipes/${recipe.id}/links`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ links: updatedLinks }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update links');
                }
                return response.json();
            })
            .then(() => {
                setLinks(updatedLinks);
                setNewLink('');
                window.dispatchEvent(new CustomEvent('recipe-updated'));
            })
            .catch(error => {
                console.error('Error adding link:', error);
            });
    };

    const deleteLink = (index) => {
        if (!recipe) return;
        
        const updatedLinks = [...links];
        updatedLinks.splice(index, 1);
        
        fetch(`http://localhost:5001/api/recipes/${recipe.id}/links`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ links: updatedLinks }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update links');
                }
                return response.json();
            })
            .then(() => {
                setLinks(updatedLinks);
                window.dispatchEvent(new CustomEvent('recipe-updated'));
            })
            .catch(error => {
                console.error('Error deleting link:', error);
            });
    };

    const handleBackClick = () => {
        navigate('/');
    };

    if (loading) {
        return <div className="loading">Loading recipe...</div>;
    }

    if (!recipe) {
        return <div className="error">Recipe not found</div>;
    }

    return (
        <div className="recipe-detail-container">
            <button className="back-button" onClick={handleBackClick}>← Back to Recipes</button>
            
            <h1 className="recipe-title">
                {String(recipe.Name).charAt(0).toUpperCase() + String(recipe.Name).slice(1)}
            </h1>
            
            <div className="recipe-content">
                <div className="recipe-image">
                    <img src={`/static/${recipe.Image_path}`} alt={recipe.Name} />
                    
                    <div className="links-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Useful Links</th>
                                </tr>
                            </thead>
                            <tbody>
                                {links.map((link, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="link-item">
                                                <a href={link.startsWith('http') ? link : `https://${link}`} 
                                                   target="_blank" 
                                                   rel="noopener noreferrer">
                                                    {link}
                                                </a>
                                                <button 
                                                    className="delete-btn-link" 
                                                    onClick={() => deleteLink(index)}
                                                >
                                                    -
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td>
                                        <div className="add-link">
                                            <input
                                                type="text"
                                                value={newLink}
                                                onChange={(e) => setNewLink(e.target.value)}
                                                placeholder="Add new link"
                                                onKeyPress={(e) => e.key === 'Enter' && addLink()}
                                            />
                                            <button onClick={addLink}>Add</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="recipe-info">
                    <div className="recipe-rating">
                        <h3>Rating</h3>
                        <StarRating 
                            rating={recipe.Rating} 
                            interactive={true} 
                            onRatingChange={handleRatingChange} 
                        />
                    </div>
                    
                    <div className="recipe-instructions">
                        <h3>Instructions</h3>
                        <textarea 
                            value={recipeText} 
                            onChange={handleRecipeTextChange}
                            onBlur={saveRecipeText}
                            placeholder="Type your recipe instructions here..."
                        />
                    </div>
                    
                    <div className="recipe-ingredients">
                        <h3>Ingredients</h3>
                        <div className="ingredients-list">
                            {ingredients.map((ingredient, index) => (
                                <div key={index} className="ingredient-item">
                                    <input
                                        type="checkbox"
                                        checked={ingredient.checked}
                                        onChange={() => handleIngredientCheck(index)}
                                    />
                                    <span className={ingredient.checked ? 'checked' : ''}>
                                        {ingredient.name}
                                    </span>
                                    <button 
                                        className="delete-btn-ingredient" 
                                        onClick={() => deleteIngredient(index)}
                                    >
                                        -
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className="add-ingredient">
                            <input
                                type="text"
                                value={newIngredient}
                                onChange={(e) => setNewIngredient(e.target.value)}
                                placeholder="Add new ingredient"
                                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                            />
                            <button onClick={addIngredient}>Add</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail; 
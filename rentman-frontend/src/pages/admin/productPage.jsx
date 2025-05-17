import React, { useState, useEffect } from 'react';
// import { sampleProducts } from "../../assets/sampleData.js";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
// import { FaRegTrashCan } from "react-icons/fa6";
// import { MdPageview } from "react-icons/md";
// import { FaEdit } from "react-icons/fa";
// import { VscPreview } from "react-icons/vsc";
import toast from 'react-hot-toast';

export default function AdminProductPage() {

    const [isLoading, setIsLoading] = useState(true);
    // State variables to hold product data and loading state
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading == true) {
            // Fetch product data from the API when the component mounts
            axios.get(import.meta.env.VITE_API_BASE_URL + "/api/itemmaster")
                .then((res) => {
                    console.log(res.data);
                    setProducts(res.data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching products:", error);
                })
        }
    }
        , [isLoading]);

    function deleteProduct(productId) {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (token === null) {
            toast.error("You are not logged in, please log-in as Administrator to delete a product")
            return;
        }
        if (!token === "admin") {
            toast.error("You are not logged in as Administrator, please log-in as Administrator to delete a product")
            return;
        }
        try {
            axios.delete(import.meta.env.VITE_API_BASE_URL + "/api/products/" + productId, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(() => {
                toast.success("Product deleted successfully");
                setIsLoading(true);
            }).catch((error) => {
                toast.error("Error deleting product: " + error.message);
            })
        } catch (error) {
            toast.error("Error deleting product: " + error.message);
        }
    }

    const handleView = (product) => {
        // Your modify logic here
        console.log("View product:", product);
    };
    const handleModify = (product) => {
        // Your modify logic here
        console.log("Modify product:", product);
        // Navigate to the modify product page with the product ID
        navigate('/admin/edit-product', {
            state: item
        });
    };

    const handleDelete = (productId) => {
        // Your delete logic here
        console.log("Delete product with ID:", productId);
    };


    return (
        <div className="w-full h-full max-h-full overflow-y-auto bg-gray-50">
            <h1>Product Management Page</h1>
        </div >
    );
}
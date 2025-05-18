import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function AdminProductPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) {
            axios.get(import.meta.env.VITE_API_BASE_URL + "/api/itemmaster")
                .then((res) => {
                    setProducts(res.data);
                    setFilteredProducts(res.data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching products:", error);
                    toast.error("Failed to load products");
                });
        }
    }, [isLoading]);

    useEffect(() => {
        const results = products.filter(product =>
            Object.values(product).some(
                value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            ));
        setFilteredProducts(results);
    }, [searchTerm, products]);

    const handleView = (product) => {
        navigate('/admin/view-product', { state: product });
    };

    const handleModify = (product) => {
        navigate('/admin/edit-product', { state: product });
    };

    const confirmDelete = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!productToDelete) return;

        setIsLoading(true);
        const token = localStorage.getItem('token');

        axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/itemmaster/${productToDelete._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                toast.success("Product deleted successfully");
                setIsDeleteModalOpen(false);
                setIsLoading(true); // Triggers refresh
            })
            .catch((error) => {
                toast.error("Error deleting product: " + error.message);
                setIsLoading(false);
            });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-800';
            case 'Rented': return 'bg-blue-100 text-blue-800';
            case 'DryClean': return 'bg-yellow-100 text-yellow-800';
            case 'Blocked': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="w-full h-full max-h-full overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                    <Link
                        to="/admin/add-product"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <FaPlus className="mr-2" /> Add New Item
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <tr key={product._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.itemCode}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="font-medium">{product.itemName}</div>
                                                    <div className="text-gray-400">{product.itemShortName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.itemGroup}
                                                    {product.itemGroupDesc && (
                                                        <div className="text-gray-400">{product.itemGroupDesc}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.itemSize}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.itemPrice?.toLocaleString('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(product.itemStatus)}`}>
                                                        {product.itemStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleView(product)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="View"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            onClick={() => handleModify(product)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Edit"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(product)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No products found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onRequestClose={() => setIsDeleteModalOpen(false)}
                className="modal"
                overlayClassName="modal-overlay"
            >
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                    <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                    <p className="mb-6">
                        Are you sure you want to delete <strong>{productToDelete?.itemName}</strong> (Code: {productToDelete?.itemCode})?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
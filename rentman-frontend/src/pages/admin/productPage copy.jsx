import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue, SelectLabel } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

Modal.setAppElement('#root');

export default function AdminProductPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [groups, setGroups] = useState([]);

    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // const [productToDelete, setProductToDelete] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    // const navigate = useNavigate();

    // Fetch groups on component mount
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoadingGroups(true);
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/groupmaster`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        transformResponse: [function (data) {
                            return data ? JSON.parse(data) : [];
                        }]
                    }
                );

                const data = response.data;

                console.log("Fetched groups:", data); // Confirm data shape

                // Check if data is an array
                if (Array.isArray(data)) {
                    // const sortedGroups = data.sort((a, b) =>
                    //     (a.groupShortName || '').localeCompare(b.groupShortName || '')
                    // );

                    // setGroups(sortedGroups);
                    setGroups(data);
                    console.log("Groups after fetch:", data);

                } else {
                    // If data is not an array, handle accordingly
                    setGroups([]);
                    console.warn("Expected an array but got:", data);
                }
            } catch (error) {
                console.error("Fetch failed:", error);
                setGroups([]);
            } finally {
                setLoadingGroups(false);
            }

        };

        fetchGroups();
    }, []);

    // useEffect(() => {
    //     const fetchGroups = async () => {
    //         try {
    //             setLoadingGroups(true);
    //             const token = localStorage.getItem("token");

    //             const response = await axios.get(
    //                 `${import.meta.env.VITE_API_BASE_URL}/api/groupmaster`,
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                         'Content-Type': 'application/json'
    //                     },
    //                     transformResponse: [function (data) {
    //                         // Handle case where server returns 204 with no body
    //                         return data ? JSON.parse(data) : [];
    //                     }]
    //                 }
    //             );

    //             console.log("Response data:", response.data); // Should now log [] if empty

    //             const sortedGroups = response.data?.sort((a, b) =>
    //                 a.groupShortName.localeCompare(b.groupShortName)
    //             ) || []; // Fallback to empty array

    //             setGroups(sortedGroups);
    //         } catch (error) {
    //             console.error("Fetch failed:", error);
    //             setGroups([]); // Explicit empty state
    //         } finally {
    //             setLoadingGroups(false);
    //         }
    //     };

    //     fetchGroups();
    // }, []);

    useEffect(() => {
        console.log("Updated groups state:", groups);
    }, [groups]);


    // Fetch products on component mount
    // This will also be triggered when isLoading is set to true
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

    const handleGroupChange = (value) => {
        setSelectedProduct(prev => ({
            ...prev,
            itemGroupShortDesc: value
        }));
    };

    useEffect(() => {
        const results = products.filter(product =>
            Object.values(product).some(
                value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            ));
        setFilteredProducts(results);
    }, [searchTerm, products]);

    const handleView = (product) => {
        // navigate('/admin/view-product', { state: product });
        setSelectedProduct(product);
        setIsViewModalOpen(true);
    };

    const handleModify = (product) => {
        // navigate('/admin/edit-product', { state: product });
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const confirmDelete = (product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const modalStyles = {
        overlay: {
            backgroundColor: 'rgba(57, 62, 70, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        content: {
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '0',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            maxWidth: '500px',
            width: '90%',
            margin: '0 auto',
            overflow: 'hidden',
            position: 'relative',
            inset: 'unset',
            transform: 'none'
        }
    };

    const handleDelete = () => {
        if (!selectedProduct) return;
        // console.log("Deleting product message from modal screen:", productToDelete);
        setIsLoading(true);
        const token = localStorage.getItem('token');

        axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/itemmaster/${selectedProduct.itemCode}`, {
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
            case 'Available': return 'bg-green-100 text-green-800 shadow-lg shadow-green-500/50';
            case 'Rented': return 'bg-blue-100 text-blue-800 shadow-lg shadow-blue-500/50';
            case 'DryClean': return 'bg-yellow-100 text-yellow-800 shadow-lg shadow-yellow-500/50';
            case 'Blocked': return 'bg-red-100 text-red-800 shadow-lg shadow-red-500/50';
            default: return 'bg-gray-100 text-gray-800 shadow-lg shadow-gray-500/50';
        }
    };
    console.log('Groups data near return statement:', groups);
    return (
        <div className="w-full h-full max-h-full  bg-gray-50 p-6">
            <div className=" mx-auto">
                {/* add new item button */}
                <div className="sticky top-0 z-50 bg-white pb-6">
                    <div className="flex justify-between items-center mb-6 pt-4 px-4">
                        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                        <Link
                            to="/dashboard/itemmaster/add"
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="mr-2" /> Add New Item
                        </Link>
                    </div>
                    {/* searchbar */}
                    <div className="bg-white rounded-lg shadow p-4 mx-4">
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
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            {/* Delete Confirmation Modal */}
                            <Modal
                                isOpen={isDeleteModalOpen}
                                onRequestClose={() => setIsDeleteModalOpen(false)}
                                className="modal"
                                shouldCloseOnOverlayClick={true}
                                contentLabel="Confirm Deletion"
                                overlayClassName="modal-overlay"
                                style={modalStyles}
                                ariaHideApp={false} // Prevent warning about app element
                            >
                                <div className="p-8 w-full">
                                    <div className="flex flex-col items-center mb-6">
                                        {/* Warning icon */}
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-10 w-10 text-red-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                />
                                            </svg>
                                        </div>

                                        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Confirm Deletion</h2>
                                        <p className="text-gray-600 text-center">
                                            {/* keep the format as the question in the first line then the second line should display the product name and code */}
                                            Are you sure you want to delete <br />  <strong className="text-gray-800 text-3xl">{selectedProduct?.itemName} (Code: {selectedProduct?.itemCode})?</strong>
                                        </p>
                                        <p className="text-red-600 font-medium mt-2 text-center">This action cannot be undone.</p>
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={() => setIsDeleteModalOpen(false)}
                                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </Modal>
                            {/* View Product Modal */}
                            <Modal
                                isOpen={isViewModalOpen}
                                onRequestClose={() => setIsViewModalOpen(false)}
                                style={{
                                    overlay: {
                                        backgroundColor: 'rgba(57, 62, 70, 0.75)',
                                        backdropFilter: 'blur(4px)',
                                        zIndex: 1000,
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflowY: 'auto',
                                        padding: '2rem 0'
                                    },
                                    content: {
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '0',
                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                                        maxWidth: '800px',
                                        width: '90%',
                                        margin: '0 auto',
                                        position: 'relative',
                                        inset: 'unset',
                                        transform: 'none',
                                        maxHeight: '90vh',
                                        overflow: 'hidden'
                                    }
                                }}
                                ariaHideApp={false}
                            >
                                {/* <div className="p-6 w-full h-full "> */}
                                <div className="p-6 overflow-y-auto flex-1">
                                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 z-10">
                                        <h2 className="text-2xl font-bold text-gray-800">Product Details - {selectedProduct?.itemName}</h2>
                                        <button
                                            onClick={() => setIsViewModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700 text-2xl"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    {selectedProduct && (
                                        <div className="space-y-4">
                                            {/* Basic Information Section */}
                                            <div className="bg-gray-50 p-1 rounded-lg">
                                                <h3 className="font-semibold text-lg mb-1 text-gray-700 border-b pb-1">Basic Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Item Code</p>
                                                        <p className="text-gray-900 font-mono">{selectedProduct.itemCode}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Name</p>
                                                        <p className="text-gray-900">{selectedProduct.itemName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Short Description</p>
                                                        <p className="text-gray-900">{selectedProduct.itemShortDesc || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Group</p>
                                                        <p className="text-gray-900">{selectedProduct.itemGroupShortDesc || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Size</p>
                                                        <p className="text-gray-900">{selectedProduct.itemSize || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Price</p>
                                                        <p className="text-gray-900">
                                                            {selectedProduct.itemPrice ? `Rs. ${selectedProduct.itemPrice.toLocaleString()}` : "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Information Section */}
                                            <div className="bg-gray-50 p-1 rounded-lg">
                                                <h3 className="font-semibold text-lg mb-1 text-gray-700 border-b pb-1">Status Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Current Status</p>
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(selectedProduct.itemStatus)}`}>
                                                            {selectedProduct.itemStatus}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Blocked</p>
                                                        <p className="text-gray-900">{selectedProduct.isBlocked ? 'Yes' : 'No'}</p>
                                                    </div>
                                                    {selectedProduct.isBlocked && (
                                                        <>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-500">Blocked Reason</p>
                                                                <p className="text-gray-900">{selectedProduct.itemBlockedReason || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-500">Blocked Date</p>
                                                                <p className="text-gray-900">
                                                                    {selectedProduct.itemBlockedDate ?
                                                                        new Date(selectedProduct.itemBlockedDate).toLocaleDateString() :
                                                                        'N/A'}
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Rent Count</p>
                                                        <p className="text-gray-900">{selectedProduct.itemRentCount}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Material Information Section */}
                                            <div className="bg-gray-50 p-1 rounded-lg">
                                                <h3 className="font-semibold text-lg mb-1 text-gray-700 border-b pb-1">Material Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Material Type</p>
                                                        <p className="text-gray-900">{selectedProduct.itemMaterialType || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Material Vendor</p>
                                                        <p className="text-gray-900">{selectedProduct.itemMaterialVendor || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">School Item</p>
                                                        <p className="text-gray-900">{selectedProduct.isSchoolItem ? 'Yes' : 'No'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dates Section */}
                                            <div className="bg-gray-50 p-1 rounded-lg">
                                                <h3 className="font-semibold text-lg mb-1 text-gray-700 border-b pb-1">Dates</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Date Added</p>
                                                        <p className="text-gray-900">
                                                            {selectedProduct.itemDateAdded ?
                                                                new Date(selectedProduct.itemDateAdded).toLocaleDateString() :
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Last Rented</p>
                                                        <p className="text-gray-900">
                                                            {selectedProduct.itemLastRented ?
                                                                new Date(selectedProduct.itemLastRented).toLocaleDateString() :
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Last Dry Clean</p>
                                                        <p className="text-gray-900">
                                                            {selectedProduct.itemLastDryClean ?
                                                                new Date(selectedProduct.itemLastDryClean).toLocaleDateString() :
                                                                'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Additional Information Section */}
                                            <div className="bg-gray-50 p-1 rounded-lg">
                                                <h3 className="font-semibold text-lg mb-1 text-gray-700 border-b pb-1">Additional Information</h3>
                                                <div className="grid grid-cols-3 gap-4">

                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Contributor</p>
                                                        <p className="text-gray-900">{selectedProduct.contributor || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Last Rented Invoice</p>
                                                        <p className="text-gray-900">{selectedProduct.itemLastRentedInv || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className='mt-4'>
                                                    <p className="text-sm font-medium text-gray-500">Remarks</p>
                                                    <p className="text-gray-900 whitespace-pre-line">
                                                        {selectedProduct.itemRemarks || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 flex gap-3 justify-end">
                                        <Button
                                            onClick={() => {
                                                setIsViewModalOpen(false)
                                                setIsEditModalOpen(true)
                                            }
                                            }
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Edit This Product
                                        </Button>
                                        <Button
                                            onClick={() => setIsViewModalOpen(false)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </Modal>
                            {/* Edit Product Modal */}
                            <Modal
                                isOpen={isEditModalOpen}
                                onRequestClose={() => setIsEditModalOpen(false)}
                                style={modalStyles}
                                ariaHideApp={false}
                            >
                                <div className="p-6 w-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold text-gray-800">Edit Item</h2>
                                        <button
                                            onClick={() => setIsEditModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    {selectedProduct && (
                                        <form className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Item Code</label>
                                                    <input
                                                        type="text"
                                                        value={selectedProduct.itemCode}
                                                        readOnly
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                    />
                                                </div>
                                                <div className='col-span-2'>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                                                    <input
                                                        type="text"
                                                        value={selectedProduct.itemName}
                                                        onChange={(e) => setSelectedProduct({
                                                            ...selectedProduct,
                                                            itemName: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Short Description</label>
                                                    <input
                                                        type="text"
                                                        value={selectedProduct.itemShortDesc || ''}
                                                        onChange={(e) => setSelectedProduct({
                                                            ...selectedProduct,
                                                            itemShortDesc: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="itemGroupShortDesc">Group *</Label>
                                                    {loadingGroups ? (
                                                        <Input placeholder="Loading groups..." />
                                                    ) : (
                                                        <Select
                                                            value={selectedProduct?.itemGroupShortDesc || ""}
                                                            onValueChange={handleGroupChange}
                                                            required
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select a group" />
                                                            </SelectTrigger>
                                                            <SelectContent className="z-50 max-h-60 overflow-y-auto">
                                                                {groups.length > 0 ? (
                                                                    groups.map((group) => (
                                                                        <SelectItem
                                                                            key={group.groupId}
                                                                            value={group.groupShortName}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium">{group.groupShortName}</span>
                                                                                <span className="text-muted-foreground text-xs">
                                                                                    ({group.groupName})
                                                                                </span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <SelectItem value="none" disabled>
                                                                        No groups available
                                                                    </SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>


                                                {/* <div>

<div className="space-y-2">
                                                    <Label htmlFor="itemGroupShortDesc">Group *</Label>
                                                    {loadingGroups ? (

                                                        <Input disabled placeholder="Loading groups..." />
                                                    ) : (
                                                        <Select
                                                            value={selectedProduct.itemGroupShortDesc}
                                                            onValueChange={handleGroupChange}
                                                            required
                                                            className="z-50"
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a group" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {groups.map((group) => (
                                                                    <SelectItem
                                                                        key={group.groupId}
                                                                        value={group.groupShortName}
                                                                    >
                                                                        {group.groupShortName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>

                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Group</label>
                                                    <input
                                                        type="text"
                                                        value={selectedProduct.itemGroupShortDesc || ''}
                                                        onChange={(e) => setSelectedProduct({
                                                            ...selectedProduct,
                                                            itemGroupShortDesc: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    />
                                                </div> */}
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Size</label>
                                                    <input
                                                        type="text"
                                                        value={selectedProduct.itemSize || ''}
                                                        onChange={(e) => setSelectedProduct({
                                                            ...selectedProduct,
                                                            itemSize: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                                                    <input
                                                        type="text"
                                                        value={selectedProduct.itemPrice || ''}
                                                        onChange={(e) => setSelectedProduct({
                                                            ...selectedProduct,
                                                            itemPrice: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    />
                                                </div>

                                                <div className="flex items-center border p-2 border-gray-300 rounded-md">
                                                    <input
                                                        type="checkbox"
                                                        id="isBlocked"
                                                        checked={selectedProduct.isBlocked}
                                                        onChange={(e) => setSelectedProduct({
                                                            ...selectedProduct,
                                                            isBlocked: e.target.checked
                                                        })}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="isBlocked" className="ml-2 block text-sm font-bold text-gray-700">
                                                        Blocked
                                                    </label>
                                                </div>
                                                <div className="flex items-center border p-2 border-gray-300 rounded-md">
                                                    <input
                                                        type="checkbox"
                                                        id="isBlocked"
                                                        checked={selectedProduct.isSchoolItem}
                                                        onChange={(e) => setSelectedProduct({
                                                            ...selectedProduct,
                                                            isSchoolItem: e.target.checked
                                                        })}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="isBlocked" className="ml-2 block text-sm font-bold text-gray-700">
                                                        School Item
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Remarks</label>
                                                <input
                                                    type="area"
                                                    name="remarks"
                                                    id="remarks"
                                                    maxLength={500}
                                                    autoComplete="off"
                                                    rows="2"
                                                    placeholder="Enter remarks"
                                                    value={selectedProduct.itemRemarks || ''}
                                                    onChange={(e) => setSelectedProduct({
                                                        ...selectedProduct,
                                                        itemRemarks: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Material Type</label>
                                                <input
                                                    type="text"
                                                    value={selectedProduct.itemMaterialType || ''}
                                                    onChange={(e) => setSelectedProduct({
                                                        ...selectedProduct,
                                                        itemMaterialType: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Material Vendor</label>
                                                <input
                                                    type="text"
                                                    value={selectedProduct.itemMaterialVendor || ''}
                                                    onChange={(e) => setSelectedProduct({
                                                        ...selectedProduct,
                                                        itemMaterialVendor: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Contributor</label>
                                                <input
                                                    type="text"
                                                    value={selectedProduct.contributor || ''}
                                                    onChange={(e) => setSelectedProduct({
                                                        ...selectedProduct,
                                                        contributor: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                            </div>

                                            <div className="mt-6 flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditModalOpen(false)}
                                                    className="px-4 py-2 border border-gray-300 font-bold text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer hover:text-white transition-colors duration-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        toast.success('Product updated successfully');
                                                        setIsEditModalOpen(false);
                                                        setIsLoading(true); // Refresh data
                                                    }}
                                                    className="px-4 py-2 bg-green-600 font-bold text-white rounded-md hover:bg-green-700 cursor-pointer hover:text-white transition-colors duration-200"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </Modal>

                            {/* keep the table responsive */}
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 shadow-lg border-2 bg-grey-600 shadow-gray-200 sticky top-0 z-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Short Name</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Group</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Size</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Rent Count</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Date Added</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Last Rented</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Last Dry Clean</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Blocked</th>
                                        <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Contributor</th>
                                        <th className="px-6 py-3 text-center text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-400 border-2 shadow-lg shadow-gray-200">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <tr key={product.itemCode} className="hover:bg-gray-50 " >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.itemCode}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="font-medium">{product.itemName}</div>
                                                    <div className="text-gray-400">{product.itemShortName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.itemGroupShortDesc}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.itemSize}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {/* {product.itemPrice?.toLocaleString('en-US', {
                                                        style: 'currency',
                                                        currency: 'SLR'
                                                    })} */}
                                                    {product.itemPrice ? `Rs. ${product.itemPrice.toLocaleString()}` : "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.rentCount ? product.rentCount : "N/A"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {product.itemDateAdded
                                                        ? new Date(product.itemDateAdded).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }).replace(/ /g, "-") // Converts "15 Jan 2023" → "15-Jan-2023"
                                                        : "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.lastRented ? product.lastRented : "N/A"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.lastDryClean ? product.lastDryClean : "N/A"}</td>

                                                < td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full  ${getStatusBadge(product.itemStatus)}`}>
                                                        {product.itemStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.blocked ? "Yes" : "No"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.contributor ? product.contributor : "N/A"}</td>
                                                <td className="px-6 py-4 ">
                                                    <div className="flex space-x-4">
                                                        <button
                                                            onClick={() => handleView(product)}
                                                            className="text-white bg-blue-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-blue-200 text-md shadow-lg shadow-blue-500/50 hover:scale-110 transition-all duration-200"
                                                            title="View"
                                                        >
                                                            <FaEye /> View
                                                        </button>
                                                        <button
                                                            onClick={() => handleModify(product)}
                                                            className="text-white bg-green-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-green-200 text-md shadow-lg shadow-green-500/50 hover:scale-110 transition-all duration-200"
                                                            title="Edit"
                                                        >
                                                            <FaEdit /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(product)}
                                                            className="text-white bg-red-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-red-200 text-md shadow-lg shadow-red-500/50 hover:scale-110 transition-all duration-200"
                                                            title="Delete"
                                                        >
                                                            <FaTrash /> Delete
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
        </div>
    );
}
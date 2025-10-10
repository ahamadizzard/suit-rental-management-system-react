import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
// import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import { Eye } from 'lucide-react';
import moment from 'moment';

Modal.setAppElement('#root');

export default function AdminProductPage() {
    const [isLoading, setIsLoading] = useState(true);

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingContributor, setLoadingContributor] = useState(false);
    const [groups, setGroups] = useState([]);

    const [contributors, setContributors] = useState([]);

    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // Bookings (salesInvoiceDetails) for the selected item
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    // Single booking view
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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

                if (Array.isArray(data)) {
                    const sortedGroups = data.sort((a, b) =>
                        (a.groupShortName || '').localeCompare(b.groupShortName || '')
                    );

                    setGroups(sortedGroups);
                } else {
                    // If data is not an array, ensure groups is an empty array
                    setGroups([]);
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

    //fetch contributors on component mount
    useEffect(() => {
        const fetchContributors = async () => {
            try {
                setLoadingContributor(true);
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/contributor`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                setContributors(response.data);
                // console.log("Fetched contributors:", response.data);
            } catch (error) {
                console.error("Error fetching contributors:", error);
                toast.error("Failed to load contributors");
            } finally {
                setLoadingContributor(false);
            }
        };
        fetchContributors();
    }, []);

    // Fetch products on component mount
    // This will also be triggered when isLoading is set to true    
    useEffect(() => {
        if (isLoading) {
            axios.get(import.meta.env.VITE_API_BASE_URL + "/api/itemmaster")
                .then((res) => {
                    // sort by itemCode (numeric-aware, case-insensitive)
                    const sorted = [...res.data].sort((a, b) => {
                        const A = (a.itemCode ?? '').toString();
                        const B = (b.itemCode ?? '').toString();
                        return A.localeCompare(B, undefined, { numeric: true, sensitivity: 'base' });
                    });
                    setProducts(sorted);
                    setFilteredProducts(sorted);
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
    const handleContributorChange = (value) => {
        setSelectedProduct(prev => ({
            ...prev,
            contributor: value
        }));
    };

    const handleSaveProduct = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to save the changes?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem("token");
                    const response = await axios.put(
                        `${import.meta.env.VITE_API_BASE_URL}/api/itemMaster/${selectedProduct.itemCode}`,
                        selectedProduct,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    // toast.success("Product updated successfully!");
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Product updated successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    setIsEditModalOpen(false);
                    setIsLoading(true); // Refresh data
                    setIsEditModalOpen(false);
                    setIsLoading(true); // Refresh data
                } catch (error) {
                    console.error("Error updating product:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to update product. Please try again.',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });


    };

    useEffect(() => {
        const results = products.filter(product =>
            Object.values(product).some(
                value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            ));
        setFilteredProducts(results);
    }, [searchTerm, products]);

    const handleView = (product) => {
        setSelectedProduct(product);
        // clear previous bookings while new ones load
        setSelectedBookings([]);
        setIsViewModalOpen(true);
        // load bookings for this item
        fetchBookingsForItem(product?.itemCode);
    };

    const handleModify = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const openBookingModal = (booking) => {
        setSelectedBooking(booking);
        setIsBookingModalOpen(true);
    };

    const closeBookingModal = () => {
        setIsBookingModalOpen(false);
        setSelectedBooking(null);
    };

    const confirmDelete = (product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    // Fetch bookings for an item code from salesInvoiceDetails
    async function fetchBookingsForItem(itemCode) {
        if (!itemCode) return;
        try {
            setLoadingBookings(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/salesinvoicedetails/item/${encodeURIComponent(itemCode)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedBookings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching bookings for item:', itemCode, err);
            setSelectedBookings([]);
        } finally {
            setLoadingBookings(false);
        }
    }

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
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
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
                    <div className="bg-white rounded-lg shadow overflow-hidden mx-4">
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
                                onRequestClose={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedBookings([]);
                                    setLoadingBookings(false);
                                }}
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
                                        overflow: 'auto',
                                        WebkitOverflowScrolling: 'touch'
                                    }
                                }}
                                ariaHideApp={false}
                            >
                                {/* <div className="p-6 w-full h-full "> */}
                                <div className="p-6 overflow-y-auto flex-1" style={{ maxHeight: '78vh' }}>
                                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 z-10">
                                        <h2 className="text-2xl font-bold text-gray-800">Product Details for - <span className='text-blue-700'> {selectedProduct?.itemCode} - {selectedProduct?.itemName}</span></h2>
                                        <button
                                            onClick={() => setIsViewModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700 text-2xl"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    {selectedProduct && (
                                        <div className="space-y-4">
                                            {/* Bookings Section (from salesInvoiceDetails) */}
                                            <div className="bg-red-50 p-1 rounded-lg">
                                                <h3 className="font-bold text-lg mb-1 text-red-900 border-b pb-1">Bookings</h3>
                                                {loadingBookings ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                                                        <p className="text-sm text-gray-500">Loading bookings...</p>
                                                    </div>
                                                ) : selectedBookings && selectedBookings.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full text-sm text-left text-gray-700">
                                                            <thead className='text-red-900'>
                                                                <tr>
                                                                    <th className="px-2 py-1">Invoice #</th>
                                                                    <th className="px-2 py-1">Invoice Date</th>
                                                                    <th className="px-2 py-1">Delivery</th>
                                                                    <th className="px-2 py-1">Return</th>
                                                                    <th className="px-2 py-1">Status</th>
                                                                    <th className="px-2 py-1">Amount</th>
                                                                    <th className="px-2 py-1">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className='text-blue-800 font-semibold'>
                                                                {selectedBookings.map((b) => (
                                                                    <tr
                                                                        key={b._id || `${b.invoiceNo}-${b.itemCode}`}
                                                                        className="border-t hover:bg-gray-100"
                                                                    // onClick={() => openBookingModal(b)}
                                                                    // title={`Open booking ${b.invoiceNo}`}
                                                                    >
                                                                        <td className="px-2 py-1">{b.invoiceNo}</td>
                                                                        <td className="px-2 py-1">{b.invoiceDate ? new Date(b.invoiceDate).toLocaleDateString() : 'N/A'}</td>
                                                                        <td className="px-2 py-1">{b.deliveryDate ? new Date(b.deliveryDate).toLocaleDateString() : 'N/A'}</td>
                                                                        <td className="px-2 py-1">{b.returnDate ? new Date(b.returnDate).toLocaleDateString() : 'N/A'}</td>
                                                                        <td className="px-2 py-1">{b.bookingStatus || 'N/A'}</td>
                                                                        <td className="px-2 py-1">{b.amount != null ? `Rs. ${b.amount.toLocaleString()}` : 'N/A'}</td>
                                                                        <td className="px-2 py-1">
                                                                            <button
                                                                                onClick={() => openBookingModal(b)}
                                                                                className='flex flex-row gap-2 items-center text-blue-500 border border-blue-500 hover:bg-blue-700 hover:text-white font-bold py-1 px-2 rounded'
                                                                            >
                                                                                <Eye /> View
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No bookings found for this item.</p>
                                                )}
                                            </div>

                                            {/* Basic Information Section */}
                                            <div className="bg-gray-50 p-1 rounded-lg">
                                                <h3 className="font-bold text-lg mb-1 text-gray-700 border-b pb-1">Basic Information</h3>
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
                                                <h3 className="font-bold text-lg mb-1 text-gray-700 border-b pb-1">Status Information</h3>
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
                                                <h3 className="font-bold text-lg mb-1 text-gray-700 border-b pb-1">Material Information</h3>
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
                                                <h3 className="font-bold text-lg mb-1 text-gray-700 border-b pb-1">Dates</h3>
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
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Last Dry Clean Rent Count</p>
                                                        <p className="text-gray-900">
                                                            {selectedProduct.itemLastDryCleanRentCount}

                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Additional Information Section */}
                                            <div className="bg-gray-50 p-1 rounded-lg">
                                                <h3 className="font-bold text-lg mb-1 text-gray-700 border-b pb-1">Additional Information</h3>
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
                                                setSelectedBookings([]);
                                                setLoadingBookings(false);
                                                setIsEditModalOpen(true)
                                            }
                                            }
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer"
                                        >
                                            Edit This Product
                                        </Button>
                                        <Button
                                            onClick={() => { setIsViewModalOpen(false); setSelectedBookings([]); setLoadingBookings(false); }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </Modal>
                            {/* Booking Details Modal (single booking) */}
                            <Modal
                                isOpen={isBookingModalOpen}
                                onRequestClose={closeBookingModal}
                                style={modalStyles}
                                ariaHideApp={false}
                            >
                                <div className="p-6" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-gray-800">Booking Details for <br /> <span className='text-red-700'>{selectedProduct?.itemCode}-{selectedProduct?.itemName}</span></h2>
                                        <button onClick={closeBookingModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                                    </div>

                                    {selectedBooking ? (
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Invoice #</p>
                                                <p className="text-gray-900 font-semibold">{selectedBooking.invoiceNo}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Invoice Date</p>
                                                <p className="text-gray-900">{selectedBooking.invoiceDate ? new Date(selectedBooking.invoiceDate).toLocaleString() : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Delivery Date</p>
                                                <p className="text-gray-900">{selectedBooking.deliveryDate ? new Date(selectedBooking.deliveryDate).toLocaleString() : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Return Date</p>
                                                <p className="text-gray-900">{selectedBooking.returnDate ? new Date(selectedBooking.returnDate).toLocaleString() : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Status</p>
                                                <p className="text-gray-900">{selectedBooking.bookingStatus || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Amount</p>
                                                <p className="text-gray-900">{selectedBooking.amount != null ? `Rs. ${selectedBooking.amount.toLocaleString()}` : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Item Code</p>
                                                <p className="text-gray-900">{selectedBooking.itemCode || 'N/A'}</p>
                                            </div>
                                            <div className="mt-4 flex justify-end">
                                                <button onClick={closeBookingModal} className="px-4 py-2 bg-blue-600 text-white rounded-md">Close</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                                            <p className="text-sm text-gray-500">Loading...</p>
                                        </div>
                                    )}
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
                                        <h2 className="text-2xl font-bold text-blue-800">Edit Item</h2>
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
                                                    <label className="block text-sm font-bold text-blue-800 mb-1">Item Code</label>
                                                    <input
                                                        type="text"
                                                        value={selectedProduct.itemCode}
                                                        readOnly
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                    />
                                                </div>
                                                <div className='col-span-2'>
                                                    <label className="block text-sm font-bold text-blue-800 mb-1">Item Name</label>
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
                                                    <label className="block text-sm font-bold text-blue-800 mb-1">Short Description</label>
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
                                                    <label htmlFor="itemGroupShortDesc" className="block text-sm font-bold text-blue-800">
                                                        Group *
                                                    </label>

                                                    {loadingGroups ? (
                                                        <input
                                                            type="text"
                                                            placeholder="Loading groups..."
                                                            disabled
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                                                        />
                                                    ) : (
                                                        <div className="relative">
                                                            <select
                                                                id="itemGroupShortDesc"
                                                                value={selectedProduct?.itemGroupShortDesc || ""}
                                                                onChange={(e) => handleGroupChange(e.target.value)}
                                                                required
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                                            >
                                                                <option value="">{groups.length ? "Select group" : "No groups available"}</option>

                                                                {groups.length > 0 ? (
                                                                    groups.map((group) => (
                                                                        <option
                                                                            key={group.groupId}
                                                                            value={group.groupShortName}
                                                                            className="flex items-center gap-2 py-1"
                                                                        >
                                                                            {group.groupShortName} - {group.groupName}
                                                                        </option>
                                                                    ))
                                                                ) : (
                                                                    <option value="" disabled>
                                                                        No groups available
                                                                    </option>
                                                                )}
                                                            </select>

                                                            {/* Custom dropdown arrow */}
                                                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-blue-800 mb-1">Size</label>
                                                    <input
                                                        type="number"
                                                        value={selectedProduct.itemSize || ''}
                                                        onChange={(e) => setSelectedProduct({
                                                            ...selectedProduct,
                                                            itemSize: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-blue-800 mb-1">Price</label>
                                                    <input
                                                        type="number"
                                                        value={selectedProduct.itemPrice || ''}
                                                        onChange={(e) => setSelectedProduct({
                                                            ...selectedProduct,
                                                            itemPrice: e.target.value
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    />
                                                </div>

                                                <div className="flex items-center border p-2 text-blue-800 rounded-md">
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
                                                    <label htmlFor="isBlocked" className="ml-2 block text-sm font-bold text-blue-800">
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
                                                    <label htmlFor="isBlocked" className="ml-2 block text-sm font-bold text-blue-800">
                                                        School Item
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-blue-800 mb-1">Remarks</label>
                                                <textarea
                                                    name="remarks"
                                                    id="remarks"
                                                    maxLength={500}
                                                    autoComplete="off"
                                                    rows={2} // You can adjust the number of rows
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
                                                <label className="block text-sm font-bold text-blue-800 mb-1">Material Type</label>
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
                                                <label className="block text-sm font-bold text-blue-800 mb-1">Material Vendor</label>
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

                                            <div className="space-y-2">
                                                <label htmlFor="itemGroupShortDesc" className="block text-sm font-bold text-blue-800">
                                                    Contributor
                                                </label>

                                                {loadingContributor ? (
                                                    <input
                                                        type="text"
                                                        placeholder="Loading contributors..."
                                                        disabled
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                                                    />
                                                ) : (
                                                    <div className="relative">
                                                        <select
                                                            id="itemContributor"
                                                            value={selectedProduct?.contributor || ""}
                                                            onChange={(e) => handleContributorChange(e.target.value)}
                                                            required
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                                                        >
                                                            <option className='font-bold ' value="">{contributors.length ? "Select Contributor" : "No contributors available"}</option>

                                                            {contributors.length > 0 ? (
                                                                contributors.map((contributor) => (
                                                                    <option
                                                                        key={contributor.contributorId}
                                                                        value={contributor.contributorName}
                                                                        className="flex items-center gap-2 py-1"
                                                                    >
                                                                        {contributor.contributorName} - {contributor.percentage || 'N/A'}
                                                                    </option>
                                                                ))
                                                            ) : (
                                                                <option value="" disabled>
                                                                    No contributors available
                                                                </option>
                                                            )}
                                                        </select>

                                                        {/* Custom dropdown arrow */}
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6 flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditModalOpen(false)}
                                                    className="px-4 py-2 border border-gray-300 font-bold text-gray-700 rounded-md hover:bg-red-800 cursor-pointer hover:text-white transition-colors duration-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSaveProduct}
                                                    className="px-4 py-2 bg-blue-700 font-bold text-white rounded-md hover:bg-blue-900 cursor-pointer hover:text-white transition-colors duration-200"
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
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Code</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Short Name</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Group</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Size</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Price</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Rent Count</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Date Added</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Last Rented</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Last Dry Clean</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Status</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Blocked</th>
                                        <th className="px-3 py-1 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Contributor</th>
                                        <th className="px-3 py-1 text-center text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-400 border-2 shadow-lg shadow-gray-200">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <tr key={product.itemCode} className="hover:bg-gray-50 " >
                                                <td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900">{product.itemCode}</td>
                                                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="font-medium">{product.itemName}</div>
                                                    <div className="text-gray-400">{product.itemShortDesc}</div>
                                                </td>
                                                <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
                                                    {product.itemGroupShortDesc}
                                                </td>
                                                <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">{product.itemSize}</td>
                                                <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
                                                    {/* {product.itemPrice?.toLocaleString('en-US', {
                                                        style: 'currency',
                                                        currency: 'SLR'
                                                    })} */}
                                                    {product.itemPrice ? `Rs. ${product.itemPrice.toLocaleString()}` : "N/A"}
                                                </td>
                                                <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">{product.itemRentCount ? product.itemRentCount : "N/A"}</td>
                                                <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
                                                    {product.itemDateAdded
                                                        ? new Date(product.itemDateAdded).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }).replace(/ /g, "-") // Converts "15 Jan 2023" → "15-Jan-2023"
                                                        : "N/A"}
                                                </td>
                                                <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">{product.itemLastRented ? moment(product.itemLastRented).format("DD-MMM-YYYY") : "N/A"}</td>
                                                <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">{product.itemLastDryClean ? moment(product.itemLastDryClean).format("DD-MMM-YYYY") : "N/A"}</td>

                                                < td className="px-3 py-1 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full  ${getStatusBadge(product.itemStatus)}`}>
                                                        {product.itemStatus}
                                                    </span>
                                                </td>
                                                <td className={`px-3 py-1 whitespace-nowrap text-sm font-medium ${product.isBlocked ? "text-red-600" : "text-gray-500"}`}>
                                                    {product.isBlocked ? (
                                                        <span className="inline-flex items-center">
                                                            <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                            Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center">
                                                            <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                {/* <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">{product.contributor ? product.contributor : "N/A"}</td> */}
                                                <td className="px-3 py-3 ">
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
                                            <td colSpan="7" className="px-3 py-1 text-center text-sm text-gray-500">
                                                No products found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
                }
            </div >
        </div >
    );
}
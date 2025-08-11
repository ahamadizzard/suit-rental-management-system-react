import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FaEdit, FaEye, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';


Modal.setAppElement('#root');

export default function ViewCustomer() {
    const [isLoading, setIsLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [error, setError] = useState(null);

    // Load Customer Data
    // useEffect(() => {
    //     const fetchCustomers = async () => {
    //         try {
    //             setIsLoading(true);
    //             const token = localStorage.getItem('token');
    //             const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/customers');
    //             setCustomers(response.data);
    //             // console.log("Customer Data: ", response.data);
    //         } catch (error) {
    //             toast.error("Error fetching customers: " + error.message);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //     fetchCustomers();
    // }, []);
    // console.log("Customer Data: ", customers);
    // Filter customers by search term

    useEffect(() => {
        const searchCustomers = async () => {
            if (searchQuery.length > 0) {
                try {
                    const response = await axios.get(
                        import.meta.env.VITE_API_BASE_URL + '/api/customers/search/' + searchQuery
                    )
                    setCustomers(response.data);

                } catch (error) {
                    setError(error.response?.data?.message || "Failed to search products");
                    setCustomers([]); // Clear products on error
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                axios.get(import.meta.env.VITE_API_BASE_URL + '/api/customers/')
                    .then((response) => {
                        setCustomers(response.data)
                        setIsLoading(false)
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            }
        };
        // Add debouncing (500ms delay)
        const debounceTimer = setTimeout(() => {
            setIsLoading(true);
            searchCustomers();
        }, 500);

        return () => clearTimeout(debounceTimer); // Cleanup on unmount or query change
    }, [searchQuery]); // Add searchQuery as dependency

    // useEffect(() => {
    //     if (!searchTerm) {
    //         setFilteredCustomers(customers);
    //     } else {
    //         setFilteredCustomers(
    //             customers.filter(c =>
    //                 c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //                 c.customerAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //                 c.customerTel1.toLowerCase().includes(searchTerm.toLowerCase()) & " " +
    //                 c.customerTel2.toLowerCase().includes(searchTerm.toLowerCase())
    //             )
    //         );
    //     }
    // }, [searchTerm, customers]);

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

    const handleView = (customer) => {
        setSelectedCustomer(customer);
        setIsViewModalOpen(true);
    };

    const closeModal = () => {
        setIsViewModalOpen(false);
        setSelectedCustomer(null);
    };

    return (
        <div className="flex flex-col items-center w-full px-4 py-8">
            <div className="w-full mb-8">
                <div className="flex items-center justify-between gap-4 bg-white rounded-2xl shadow-lg border border-blue-100 px-8 py-6 mr-30">

                    <div className="flex flex-col">
                        {/* <span className="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full p-3 shadow-md">
                            <FaEye className="w-8 h-8" />
                        </span> */}
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight leading-tight">Customers List</h1>
                        <span className="text-sm text-gray-500 mt-1">View and manage all registered customers</span>
                    </div>
                    <Link
                        to="/dashboard/sales/customers/addcustomer"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <FaPlus className="mr-2" /> Add New Item
                    </Link>
                </div>
            </div>
            <div className="flex items-center mb-6 w-full max-w-xl">
                <div className="relative w-full">
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute left-3 top-2 text-gray-400">
                        <FaSearch />
                    </span>
                </div>

            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <span className="text-lg text-gray-500">Loading customers...</span>
                </div>
            ) : (
                <div className="w-full  bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telephone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount %</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Pur.Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Pur.Amnt</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Purch Amnt</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Purch count</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers.length === 0 && searchQuery ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No customers found "{searchQuery}"</td>
                                </tr>
                            ) : (
                                customers.map((customer, idx) => (
                                    // customers.map((customer, idx) => (
                                    <tr key={customer.customerId || idx}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.customerName}</td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap">{customer.customerAddress}</td> */}
                                        {/* <td className="px-6 py-4 whitespace-nowrap">{customer.customerEmail}</td> */}

                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div>
                                                {customer.customerAddress}
                                                {customer.customerEmail && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {customer.customerEmail}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {customer.customerTel1}
                                            {customer.customerTel2 && (
                                                <>
                                                    {" / "}
                                                    {customer.customerTel2}
                                                </>
                                            )}
                                        </td>

                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${customer.isBlocked ? "text-red-600" : "text-gray-500"}`}>
                                            {customer.isBlocked ? (
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

                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.joinedDate ? customer.joinedDate : "N/A"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.customerDiscount ? customer.customerDiscount : "N/A"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.lastPurchasedDate ? customer.lastPurchasedDate : "N/A"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.lastPurchaseAmount ? customer.lastPurchaseAmount : "N/A"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.totalPurchaseAmount ? customer.totalPurchaseAmount : "N/A"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{customer.customerTotalPurchaseCount ? customer.customerTotalPurchaseCount : "N/A"}</td>
                                        <td className="px-6 py-4 ">
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={() => handleView(customer)}
                                                    className="text-white bg-blue-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-blue-200 text-md shadow-lg shadow-blue-500/50 hover:scale-110 transition-all duration-200"
                                                    title="View"
                                                >
                                                    <FaEye /> View
                                                </button>
                                                <button
                                                    onClick={() => handleModify(customer)}
                                                    className="text-white bg-green-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-green-200 text-md shadow-lg shadow-green-500/50 hover:scale-110 transition-all duration-200"
                                                    title="Edit"
                                                >
                                                    <FaEdit /> Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(customer)}
                                                    className="text-white bg-red-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-red-200 text-md shadow-lg shadow-red-500/50 hover:scale-110 transition-all duration-200"
                                                    title="Delete"
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onRequestClose={closeModal}
                style={modalStyles}
                contentLabel="View Customer"
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Customer Details</h2>
                    {selectedCustomer ? (
                        <div className="space-y-2">
                            <div><span className="font-semibold">Name:</span> {selectedCustomer.name}</div>
                            <div><span className="font-semibold">Email:</span> {selectedCustomer.email}</div>
                            <div><span className="font-semibold">Phone:</span> {selectedCustomer.phone}</div>
                            {/* Add more fields as needed */}
                        </div>
                    ) : (
                        <div>No customer selected.</div>
                    )}
                    <div className="mt-6 flex justify-end">
                        <button
                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}


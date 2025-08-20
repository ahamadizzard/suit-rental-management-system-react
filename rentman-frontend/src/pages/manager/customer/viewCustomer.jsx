import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FaEdit, FaEye, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Switch } from "@/components/ui/switch"


Modal.setAppElement('#root');

export default function ViewCustomer() {
    const [isLoading, setIsLoading] = useState(true);
    const [customers, setCustomers] = useState([]);
    // const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteCustomerId, setDeleteCustomerId] = useState(null);

    // Helper to fetch full customer list (reusable so we can call it after edits)
    const fetchAllCustomers = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/customers/');
            setCustomers(response.data);
        } catch (err) {
            console.error('Failed to fetch customers', err);
            setCustomers([]);
        } finally {
            setIsLoading(false);
        }
    };

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
                        `${import.meta.env.VITE_API_BASE_URL}/api/customers/search/${encodeURIComponent(searchQuery)}`
                    );
                    setCustomers(response.data);
                } catch (error) {
                    setError(error.response?.data?.message || "Failed to search products");
                    setCustomers([]); // Clear products on error
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // use helper to fetch full list
                await fetchAllCustomers();
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

    // SweetAlert2 Edit Handler
    const handleModify = (customer) => {
        // Swal.fire({
        //     title: '<strong>Edit Customer</strong>',
        //     color: '#000',
        //     background: '#fff',
        //     html: `
        //     <div style="display: flex; flex-direction: column; align-items: stretch; gap:0;">
        //         <label class="swal2-label" style="margin-bottom: 12px;">Please fill in the customer details for customer ID: ${customer.customerId}</label>

        //         <label class="font-bold" >Name</label>
        //         <input id="swal-input1" class="swal2-input" placeholder="Name"  defaultValue="${customer.customerName || ''}" />
        //         <label class="font-bold" >Address</label>
        //         <input id="swal-input2" class="swal2-input" placeholder="Address" defaultValue="${customer.customerAddress || ''}" />
        //         <label class="font-bold" style="margin-bottom:2px;">Email</label>
        //         <input id="swal-input3" class="swal2-input" placeholder="Email" style="margin-bottom:5px;" defaultValue="${customer.customerEmail || ''}" />
        //         <label class="font-bold" style="margin-bottom:2px;">Telephone 1</label>
        //         <input id="swal-input4" class="swal2-input" placeholder="Telephone 1" style="margin-bottom:5px;" defaultValue="${customer.customerTel1 || ''}" />
        //         <label class="font-bold" style="margin-bottom:2px;">Telephone 2</label>
        //         <input id="swal-input5" class="swal2-input" placeholder="Telephone 2" style="margin-bottom:5px;" defaultValue="${customer.customerTel2 || ''}" />
        //         <label class="font-bold" style="margin-bottom:2px;">Joined Date</label>
        //         <input id="swal-input6" class="swal2-input" placeholder="Joined Date" style="margin-bottom:5px;" defaultValue="${customer.customerJoinedDate ? moment(customer.customerJoinedDate).format('YYYY-MM-DD') : ''}" type="date" />
        //         <label class="font-bold" style="margin-bottom:2px;">Discount Percentage</label>
        //         <input id="swal-input7" class="swal2-input" placeholder="Discount %" style="margin-bottom:5px;" type="number" defaultValue="${customer.customerDiscountPercentage || '0'}" />
        //     </div>
        //     `,
        //     focusConfirm: false,
        //     showCancelButton: true,
        //     confirmButtonText: 'Update',
        //     preConfirm: () => {
        //         return {
        //             customerName: document.getElementById('swal-input1').value,
        //             customerAddress: document.getElementById('swal-input2').value,
        //             customerEmail: document.getElementById('swal-input3').value,
        //             customerTel1: document.getElementById('swal-input4').value,
        //             customerTel2: document.getElementById('swal-input5').value,
        //             customerJoinedDate: document.getElementById('swal-input6').value,
        //             customerDiscountPercentage: document.getElementById('swal-input7').value,
        //         };
        //     }
        // }).then(async (result) => {
        //     if (result.isConfirmed) {
        //         try {
        //             const token = localStorage.getItem('token');
        //             await axios.put(
        //                 `${import.meta.env.VITE_API_BASE_URL}/api/customers/${customer.customerId}`,
        //                 result.value,
        //                 { headers: { Authorization: `Bearer ${token}` } }
        //             );
        //             toast.success('Customer updated successfully!');
        //             // Refresh customer list
        //             setIsLoading(true);
        //             const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/customers/');
        //             setCustomers(response.data);
        //             Swal.fire('Success', 'Customer updated successfully!', 'success');
        //             setIsLoading(false);
        //         } catch (error) {
        //             Swal.fire('Error', 'Failed to update customer. Please try again.', 'error');
        //         }
        //     }
        // });
    };

    return (
        <div className="flex flex-col items-center w-full px-4 py-8">
            <div className="w-full mb-8">
                <div className="flex items-center justify-between gap-4 bg-white rounded-2xl shadow-lg border border-blue-100 px-8 py-6">

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

                    {/* Update modal */}
                    <Modal
                        isOpen={isEditModalOpen}
                        onAfterOpen={() => { }}
                        onRequestClose={() => setIsEditModalOpen(false)}
                        shouldCloseOnOverlayClick={true}
                        contentLabel="User Details"
                        style={{
                            overlay: {
                                backgroundColor: 'rgba(57, 62, 70, 0.75)',
                                backdropFilter: 'blur(4px)'
                            },
                            content: {
                                backgroundColor: 'var(--color-secondary)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '0',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                                maxWidth: '800px',
                                width: '90%',
                                margin: 'auto',
                                overflow: 'hidden'
                            }
                        }}
                    >

                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Customer Details</h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* User Image */}
                            {/* <div className="flex justify-center mb-6">
                                    <img
                                        src={users[selectedUser]?.imgURL || 'https://avatar.iran.liara.run/public/boy?username=ash'}
                                        alt={`${users[selectedUser]?.firstName} ${users[selectedUser]?.lastName}`}
                                        className="w-24 h-24 rounded-full object-cover border-2 border-accent"
                                    />
                                </div> */}

                            {/* User Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Customer ID</label>
                                    <p className="text-lg font-medium disabled text-gray-800 p-2 bg-gray-50 rounded">

                                        {customers[selectedCustomer]?.customerId}
                                    </p>
                                </div>

                                {/* Editable customer details */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Name</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={customers[selectedCustomer]?.customerName || ''}
                                        onChange={e => {
                                            const updated = [...customers];
                                            updated[selectedCustomer] = {
                                                ...updated[selectedCustomer],
                                                customerName: e.target.value
                                            };
                                            setCustomers(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Email</label>
                                    <input
                                        type="email"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={customers[selectedCustomer]?.customerEmail || ''}
                                        onChange={e => {
                                            const updated = [...customers];
                                            updated[selectedCustomer] = {
                                                ...updated[selectedCustomer],
                                                customerEmail: e.target.value
                                            };
                                            setCustomers(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Address</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={customers[selectedCustomer]?.customerAddress || ''}
                                        onChange={e => {
                                            const updated = [...customers];
                                            updated[selectedCustomer] = {
                                                ...updated[selectedCustomer],
                                                customerAddress: e.target.value
                                            };
                                            setCustomers(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Telephone 1</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={customers[selectedCustomer]?.customerTel1 || ''}
                                        onChange={e => {
                                            const updated = [...customers];
                                            updated[selectedCustomer] = {
                                                ...updated[selectedCustomer],
                                                customerTel1: e.target.value
                                            };
                                            setCustomers(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Telephone 2</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={customers[selectedCustomer]?.customerTel2 || ''}
                                        onChange={e => {
                                            const updated = [...customers];
                                            updated[selectedCustomer] = {
                                                ...updated[selectedCustomer],
                                                customerTel2: e.target.value
                                            };
                                            setCustomers(updated);
                                        }}
                                    />
                                </div>
                                <div className='space-y-2 flex flex-row gap-4 items-center'>
                                    <label className="inline-flex items-center">
                                        <span className="ml-2 text-gray-700 font-medium mt-3">Customer Status: </span>
                                    </label>

                                    {/* Custom toggle: thumb turns red when blocked and green when unblocked. */}
                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={customers[selectedCustomer]?.isBlocked || false}
                                            onClick={() => {
                                                const updated = [...customers];
                                                const current = !!updated[selectedCustomer]?.isBlocked;
                                                updated[selectedCustomer] = {
                                                    ...updated[selectedCustomer],
                                                    isBlocked: !current
                                                };
                                                setCustomers(updated);
                                            }}
                                            className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors focus:outline-none ${customers[selectedCustomer]?.isBlocked ? 'bg-red-100' : 'bg-green-100'}`}
                                        >
                                            <span className={`absolute left-1 top-1 h-5 w-5 rounded-full transform transition-transform ${customers[selectedCustomer]?.isBlocked ? 'translate-x-7 bg-red-600' : 'translate-x-0 bg-green-600'}`}></span>
                                        </button>

                                        <span className={`text-sm font-medium ${customers[selectedCustomer]?.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                                            {customers[selectedCustomer]?.isBlocked ? 'blocked' : 'unblocked'}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={async () => {
                                            Swal.fire({
                                                title: 'Update Customer',
                                                text: 'Are you sure you want to update this customer?',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonText: 'Yes, update it!',
                                                cancelButtonText: 'No, cancel!'
                                            }).then(async (result) => {
                                                if (result.isConfirmed) {
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        const customer = customers[selectedCustomer];
                                                        const updateResponse = await axios.put(
                                                            import.meta.env.VITE_API_BASE_URL + "/api/customers/customers/" + customer.customerId,
                                                            customer,
                                                            { headers: { Authorization: `Bearer ${token}` } }
                                                        );
                                                        if (updateResponse.status === 200) {
                                                            Swal.fire({
                                                                title: 'Success',
                                                                text: 'Customer updated successfully!',
                                                                icon: 'success',
                                                                confirmButtonText: 'OK'
                                                            });
                                                            setIsEditModalOpen(false);
                                                            // Refresh full list after update
                                                            await fetchAllCustomers();
                                                        } else {
                                                            Swal.fire({
                                                                title: 'Error',
                                                                text: 'Failed to update customer. Please try again.',
                                                                icon: 'error',
                                                                confirmButtonText: 'OK'
                                                            })
                                                            setIsEditModalOpen(false);
                                                        }



                                                    } catch (error) {
                                                        Swal.fire({
                                                            title: 'Error',
                                                            text: 'Failed to update customer. Please try again.',
                                                            icon: 'error',
                                                            confirmButtonText: 'OK'
                                                        })
                                                        setIsEditModalOpen(false);
                                                    }
                                                }
                                            });
                                        }}
                                        className="px-4 py-2 bg-red-600 cursor-pointer hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        Update Customer
                                    </button>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 bg-gray-300 cursor-pointer hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Modal>


                    {/* delete modal */}
                    <Modal
                        isOpen={isDeleteModalOpen}
                        onAfterOpen={() => { }}
                        onRequestClose={() => setIsDeleteModalOpen(false)}
                        shouldCloseOnOverlayClick={true}
                        contentLabel="Delete Customer Confirmation"
                        style={{
                            overlay: {
                                backgroundColor: 'rgba(57, 62, 70, 0.75)',
                                backdropFilter: 'blur(4px)'
                            },
                            content: {
                                backgroundColor: 'var(--color-secondary)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '0',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                                maxWidth: '600px',
                                width: '90%',
                                margin: 'auto',
                                overflow: 'hidden'
                            }
                        }}
                    >

                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Delete Customer</h2>
                                {/* x button to close */}
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >

                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* User Image */}
                            {/* <div className="flex justify-center mb-6">
                                    <img
                                        src={users[selectedUser]?.imgURL || 'https://avatar.iran.liara.run/public/boy?username=ash'}
                                        alt={`${users[selectedUser]?.firstName} ${users[selectedUser]?.lastName}`}
                                        className="w-24 h-24 rounded-full object-cover border-2 border-accent"
                                    />
                                </div> */}

                            {/* User Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Customer ID</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">

                                        {customers[selectedCustomer]?.customerId}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Name</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">
                                        {customers[selectedCustomer]?.customerName}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">
                                        {customers[selectedCustomer]?.customerEmail}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Address</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">
                                        {customers[selectedCustomer]?.customerAddress}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Telephone 1</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">
                                        {customers[selectedCustomer]?.customerTel1}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Telephone 2</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">
                                        {customers[selectedCustomer]?.customerTel2 || 'N/A'}
                                    </p>
                                </div>



                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={async () => {
                                            Swal.fire({
                                                title: 'Are you sure?',
                                                text: 'You will not be able to recover this customer!',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#3085d6',
                                                cancelButtonColor: '#d33',
                                                confirmButtonText: 'Yes, delete it!'
                                            }).then(async (result) => {
                                                if (result.isConfirmed) {
                                                    try {
                                                        const token = localStorage.getItem("token");
                                                        // prefer explicit deleteCustomerId (actual customerId string), fallback to selected index lookup
                                                        const idToDelete = deleteCustomerId || customers[selectedCustomer]?.customerId;
                                                        await axios.delete(
                                                            `${import.meta.env.VITE_API_BASE_URL}/api/customers/customers/${idToDelete}`,
                                                            { headers: { 'Authorization': `Bearer ${token}` } }
                                                        );
                                                        Swal.fire(
                                                            'Deleted!',
                                                            'Your customer has been deleted.',
                                                            'success',
                                                        );
                                                        // Remove user from local state
                                                        const updatedCustomer = customers.filter((_, index) => index !== selectedCustomer);
                                                        setCustomers(updatedCustomer);
                                                        setIsDeleteModalOpen(false);
                                                    } catch (error) {
                                                        console.error("Failed to delete customer:", error);
                                                        Swal.fire('Error', 'Failed to delete customer. Please try again.', 'error');
                                                    }
                                                }
                                            });
                                            // if (window.confirm("Are you sure you want to delete this customer?")) {
                                            //     try {
                                            //         const token = localStorage.getItem("token");
                                            //         await axios.delete(
                                            //             `${import.meta.env.VITE_API_BASE_URL}/api/customers/${users[selectedCustomer].customerId}`,
                                            //             { headers: { 'Authorization': `Bearer ${token}` } }
                                            //         );
                                            //         // Remove user from local state
                                            //         const updatedCustomer = customers.filter((_, index) => index !== selectedCustomer);
                                            //         setCustomers(updatedCustomer);
                                            //         setIsModalOpen(false);
                                            //     } catch (error) {
                                            //         console.error("Failed to delete customer:", error);
                                            //     }
                                            // }
                                        }}

                                        className="px-4 py-2 bg-red-600 cursor-pointer hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        Delete Customer
                                    </button>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="px-4 py-2 bg-gray-300 cursor-pointer hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Modal>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">ID#</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Address</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Telephone</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Joined Date</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Discount %</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Last Pur.Date</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Last Pur.Amnt</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Total Purch Amnt</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Total Purch count</th>
                                <th className="px-4 py-2 text-center text-xs font-bold text-natural uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers.length === 0 && searchQuery ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-center text-gray-500">No customers found "{searchQuery}"</td>
                                </tr>
                            ) : (
                                customers.map((customer, index) => (
                                    // customers.map((customer, idx) => (
                                    <tr key={customer}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{customer.customerId}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{customer.customerName}</td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap">{customer.customerAddress}</td> */}
                                        {/* <td className="px-6 py-4 whitespace-nowrap">{customer.customerEmail}</td> */}

                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            <div>
                                                {customer.customerAddress}
                                                {customer.customerEmail && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {customer.customerEmail}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            {customer.customerTel1}
                                            {customer.customerTel2 && (
                                                <>
                                                    {" / "}
                                                    {customer.customerTel2}
                                                </>
                                            )}
                                        </td>

                                        <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${customer.isBlocked ? "text-red-600" : "text-gray-500"}`}>
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
                                        {/* format date to "dd-mmm-yyyy" */}
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{customer.customerJoinedDate ? moment(customer.customerJoinedDate).format("DD-MMM-YYYY") : "N/A"}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{customer.customerDiscountPercentage}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{customer.customerLastPurchasedDate ? customer.customerLastPurchasedDate : "N/A"}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{customer.customerLastPurchaseAmount ? customer.customerLastPurchaseAmount : "N/A"}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{customer.customerTotalPurchaseAmount ? customer.customerTotalPurchaseAmount : "N/A"}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{customer.customerTotalPurchaseCount ? customer.customerTotalPurchaseCount : "N/A"}</td>
                                        <td className="px-4 py-2 ">
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={() => handleView(customer)}
                                                    className="text-white bg-blue-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-blue-200 text-md shadow-lg shadow-blue-500/50 hover:scale-110 transition-all duration-200"
                                                    title="View"
                                                >
                                                    <FaEye /> View
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCustomer(index);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="text-white bg-green-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-green-200 text-md shadow-lg shadow-green-500/50 hover:scale-110 transition-all duration-200"
                                                    title="Edit"
                                                >
                                                    <FaEdit /> Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        // store selected index and actual customer id so modal can show data and delete can use the id
                                                        setSelectedCustomer(index);
                                                        setDeleteCustomerId(customer.customerId);
                                                        setIsDeleteModalOpen(true);
                                                    }}
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
                isOpen={isModalOpen}
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


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

export default function EmployeesList() {
    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    // const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);

    // Helper to fetch full customer list (reusable so we can call it after edits)
    const fetchAllEmployees = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/employees/');
            setEmployees(response.data);
        } catch (err) {
            console.error('Failed to fetch customers', err);
            setEmployees([]);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        const searchEmployees = async () => {
            if (searchQuery.length > 0) {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_BASE_URL}/api/employees/search/${encodeURIComponent(searchQuery)}`
                    );
                    setEmployees(response.data);
                } catch (error) {
                    setError(error.response?.data?.message || "Failed to search Employees");
                    setEmployees([]); // Clear products on error
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // use helper to fetch full list
                await fetchAllEmployees();
            }
        };

        // Add debouncing (500ms delay)
        const debounceTimer = setTimeout(() => {
            setIsLoading(true);
            searchEmployees();
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

    const handleView = (employee) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };


    const closeModal = () => {
        setIsViewModalOpen(false);
        setSelectedEmployee(null);
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
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight leading-tight">Employees List</h1>
                        <span className="text-sm text-gray-500 mt-1">View and manage all Employees</span>
                    </div>
                    <Link
                        to="/dashboard/addemployee"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <FaPlus className="mr-2" /> Add a new employee
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
                    <span className="text-lg text-gray-500">Loading employees...</span>
                </div>
            ) : (
                <div className="w-full  bg-white rounded-lg shadow-md overflow-x-auto">

                    {/* Update modal */}
                    <Modal
                        isOpen={isEditModalOpen}
                        onAfterOpen={() => { }}
                        onRequestClose={() => setIsEditModalOpen(false)}
                        shouldCloseOnOverlayClick={true}
                        contentLabel="Employee Details"
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
                                <h2 className="text-2xl font-bold text-gray-800">Employees Details</h2>
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
                                    <label className="block text-sm font-medium text-gray-600">Employee ID</label>
                                    <p className="text-lg font-medium disabled text-gray-800 p-2 bg-gray-50 rounded">

                                        {employees[selectedEmployee]?.employeeId}
                                    </p>
                                </div>

                                {/* Editable customer details */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">First Name</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.firstName || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                firstName: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Last Name</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.lastName || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                lastName: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Email</label>
                                    <input
                                        type="email"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.email || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                email: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Address</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.address || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                address: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Nic No:</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.nic || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                nic: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Telephone 1</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.telephone1 || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                telephone1: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Telephone 2</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.telephone2 || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                telephone2: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Joined Date</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.joinedDate || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                joinedDate: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Salary Rs.</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.salary || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                salary: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Department</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.department || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                department: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Designation</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.designation || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                designation: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Status</label>
                                    <input
                                        type="text"
                                        className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded w-full"
                                        value={employees[selectedEmployee]?.status || ''}
                                        onChange={e => {
                                            const updated = [...employees];
                                            updated[selectedEmployee] = {
                                                ...updated[selectedEmployee],
                                                status: e.target.value
                                            };
                                            setEmployees(updated);
                                        }}
                                    />
                                </div>
                                <div className='space-y-2 flex flex-row gap-4 items-center'>
                                    <label className="inline-flex items-center">
                                        <span className="ml-2 text-gray-700 font-medium mt-3">Is Blocked? </span>
                                    </label>

                                    {/* Custom toggle: thumb turns red when blocked and green when unblocked. */}
                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={employees[selectedEmployee]?.isBlocked || false}
                                            onClick={() => {
                                                const updated = [...employees];
                                                const current = !!updated[selectedEmployee]?.isBlocked;
                                                updated[selectedEmployee] = {
                                                    ...updated[selectedEmployee],
                                                    isBlocked: !current
                                                };
                                                setEmployees(updated);
                                            }}
                                            className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors focus:outline-none ${employees[selectedEmployee]?.isBlocked ? 'bg-red-100' : 'bg-green-100'}`}
                                        >
                                            <span className={`absolute left-1 top-1 h-5 w-5 rounded-full transform transition-transform ${employees[selectedEmployee]?.isBlocked ? 'translate-x-7 bg-red-600' : 'translate-x-0 bg-green-600'}`}></span>
                                        </button>

                                        <span className={`text-sm font-medium ${employees[selectedEmployee]?.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                                            {employees[selectedEmployee]?.isBlocked ? 'blocked' : 'unblocked'}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={async () => {
                                            Swal.fire({
                                                title: 'Update Employee',
                                                text: 'Are you sure you want to update this Employee?',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonText: 'Yes, update it!',
                                                cancelButtonText: 'No, cancel!'
                                            }).then(async (result) => {
                                                if (result.isConfirmed) {
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        const employee = employees[selectedEmployee];
                                                        const updateResponse = await axios.put(
                                                            import.meta.env.VITE_API_BASE_URL + "/api/employees/employees/" + employee.employeeId,
                                                            employee,
                                                            { headers: { Authorization: `Bearer ${token}` } }
                                                        );
                                                        if (updateResponse.status === 200) {
                                                            Swal.fire({
                                                                title: 'Success',
                                                                text: 'Employee updated successfully!',
                                                                icon: 'success',
                                                                confirmButtonText: 'OK'
                                                            });
                                                            setIsEditModalOpen(false);
                                                            // Refresh full list after update
                                                            await fetchAllEmployees();
                                                        } else {
                                                            Swal.fire({
                                                                title: 'Error',
                                                                text: 'Failed to update employee. Please try again.',
                                                                icon: 'error',
                                                                confirmButtonText: 'OK'
                                                            })
                                                            setIsEditModalOpen(false);
                                                        }



                                                    } catch (error) {
                                                        Swal.fire({
                                                            title: 'Error',
                                                            text: 'Failed to update employee. Please try again.',
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
                                        Update Employee
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
                        contentLabel="Delete Employee Confirmation"
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
                                <h2 className="text-2xl font-bold text-gray-800">Delete Employee</h2>
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
                                    <label className="block text-sm font-medium text-gray-600">Employee ID</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">

                                        {employees[selectedEmployee]?.employeeId}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">First Name</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">
                                        {employees[selectedEmployee]?.firstName}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Last Name</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">
                                        {employees[selectedEmployee]?.lastName || 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Address</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">
                                        {employees[selectedEmployee]?.address || 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Telephone 1</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">
                                        {employees[selectedEmployee]?.telephone1 || 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-600">Telephone 2</label>
                                    <p className="text-lg font-medium text-gray-800 p-2 bg-gray-50 rounded">
                                        {employees[selectedEmployee]?.telephone2 || 'N/A'}
                                    </p>
                                </div>



                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={async () => {
                                            Swal.fire({
                                                title: 'Are you sure?',
                                                text: 'You will not be able to recover this employee!',
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
                                                        const idToDelete = deleteEmployeeId || employees[selectedEmployee]?.employeeId;
                                                        await axios.delete(
                                                            `${import.meta.env.VITE_API_BASE_URL}/api/employees/employees/${idToDelete}`,
                                                            { headers: { 'Authorization': `Bearer ${token}` } }
                                                        );
                                                        Swal.fire(
                                                            'Deleted!',
                                                            'Your employee has been deleted.',
                                                            'success',
                                                        );
                                                        // Remove user from local state
                                                        const updatedEmployee = employees.filter((_, index) => index !== selectedEmployee);
                                                        setEmployees(updatedEmployee);
                                                        setIsDeleteModalOpen(false);
                                                    } catch (error) {
                                                        // console.error("Failed to delete employee:", error);
                                                        Swal.fire('Error', 'Failed to delete employee. Please try again.', 'error');
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
                                        Delete Employee
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
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Address & email</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Telephone Nos.</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Joined Date</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Salary</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Designation & Dept.</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Is Blocked</th>
                                <th className="px-4 py-2 text-center text-xs font-bold text-natural uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.length === 0 && searchQuery ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-center text-gray-500">No employees found "{searchQuery}"</td>
                                </tr>
                            ) : (
                                employees.map((employee, index) => (
                                    // customers.map((customer, idx) => (
                                    <tr key={employee}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{employee.employeeId}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{employee.firstName}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            <div>
                                                {employee.address}
                                                {employee.email && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {employee.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            {employee.telephone1}
                                            {employee?.telephone2 && (
                                                <>
                                                    {" / "}
                                                    {employee.telephone2}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{employee.joinedDate ? moment(employee.joinedDate).format("DD-MMM-YYYY") : "N/A"}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{employee?.salary}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            <div>
                                                {employee.designation}
                                                {employee.department && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {employee.department}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{employee?.status}</td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${employee.isBlocked ? "text-red-600" : "text-gray-500"}`}>
                                            {employee.isBlocked ? (
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

                                        <td className="px-4 py-2 ">
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={() => handleView(employee)}
                                                    className="text-white bg-blue-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-blue-200 text-md shadow-lg shadow-blue-500/50 hover:scale-110 transition-all duration-200"
                                                    title="View"
                                                >
                                                    <FaEye /> View
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmployee(index);
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
                                                        setSelectedEmployee(index);
                                                        setDeleteEmployeeId(employee.employee);
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
                contentLabel="View Employee Details"
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Employee Details</h2>
                    {selectedEmployee ? (
                        <div className="space-y-2">
                            <div><span className="font-semibold">Name:</span> {selectedEmployee.firstName}</div>
                            <div><span className="font-semibold">Name:</span> {selectedEmployee.lastName}</div>
                            <div><span className="font-semibold">Name:</span> {selectedEmployee.address}</div>
                            <div><span className="font-semibold">Email:</span> {selectedEmployee.email}</div>
                            <div><span className="font-semibold">Phone:</span> {selectedEmployee.telephone1}</div>
                            {/* Add more fields as needed */}
                        </div>
                    ) : (
                        <div>No employee+ selected.</div>
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


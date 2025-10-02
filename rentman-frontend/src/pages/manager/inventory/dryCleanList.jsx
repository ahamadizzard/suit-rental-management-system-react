import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FaEdit, FaEye, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Switch } from "@/components/ui/switch"
import { Badge } from '@/components/ui/badge'


Modal.setAppElement('#root');

export default function DryCleanList() {
    const [isLoading, setIsLoading] = useState(true);
    const [drycleans, setDrycleans] = useState([]);
    // const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDryclean, setSelectedDryclean] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteBookingId, setDeleteBookingId] = useState(null);

    const navigate = useNavigate()
    // Helper to fetch full Booking list (reusable so we can call it after edits)
    const fetchAllDrycleans = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/dryclean');

            // Sort by drycleanDate (newest first)
            const sortedData = response.data.sort((a, b) => new Date(b.drycleanDate) - new Date(a.drycleanDate));

            setDrycleans(sortedData);
        } catch (err) {
            console.error('Failed to fetch Drycleans', err);
            setDrycleans([]);
        } finally {
            setIsLoading(false);
        }
    };


    // search functionality with debounce
    useEffect(() => {
        const searchDrycleans = async () => {
            if (searchQuery.length > 0) {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_BASE_URL}/api/dryclean/search/${encodeURIComponent(searchQuery)}`
                    );
                    const sortedData = response.data.sort((a, b) => new Date(b.drycleanDate) - new Date(a.drycleanDate));
                    setDrycleans(sortedData);
                } catch (error) {
                    setError(error.response?.data?.message || "Failed to search drycleans");
                    setDrycleans([]); // Clear products on error
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // use helper to fetch full list
                await fetchAllDrycleans();
            }
        };

        // Add debouncing (500ms delay)
        const debounceTimer = setTimeout(() => {
            setIsLoading(true);
            searchDrycleans();
        }, 500);

        return () => clearTimeout(debounceTimer); // Cleanup on unmount or query change
    }, [searchQuery]); // Add searchQuery as dependency

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
        if (!selectedDryclean) return;
        setIsLoading(true);
        const token = localStorage.getItem('token');

        axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/dryclean/by-drycleanid/${selectedDryclean.drycleanId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                Swal.fire({
                    title: 'Success',
                    text: 'Dryclean deleted successfully',
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false
                });
                setIsDeleteModalOpen(false);
                fetchAllDrycleans();
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Error',
                    text: 'Error deleting drycleans: ' + error.message,
                    icon: 'error',
                    timer: 3000,
                    showConfirmButton: false
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };


    const confirmDelete = (dryclean) => {
        setSelectedDryclean(dryclean);
        setIsDeleteModalOpen(true);
    };

    const handlePosting = async (drycleanId) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/itemmaster/post-dryclean/${drycleanId}`
            );
            Swal.fire({
                title: 'Success',
                text: response.data.message || "Posted successfully!",
                icon: 'success',
                timer: 3000,
            })
            // alert(response.data.message || "Posted successfully!");
            // Optionally refresh dryclean list here
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || error.message,
                icon: 'error',
                // timer: 3000,
            })
            // alert("Failed to post: " + (error.response?.data?.message || error.message));
        }
    };

    const handleView = (dryclean) => {
        setSelectedDryclean(dryclean);
        setIsViewModalOpen(true);
    };

    const closeModal = () => {
        setIsViewModalOpen(false);
        setSelectedDryclean(null);
    };

    return (
        <div className="flex flex-col items-center w-full px-4 py-8">
            <div className="w-full mb-8">
                <div className="flex items-center justify-between gap-4 bg-white rounded-2xl shadow-lg border border-blue-100 px-8 py-6">

                    <div className="flex flex-col">
                        {/* <span className="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full p-3 shadow-md">
                            <FaEye className="w-8 h-8" />
                        </span> */}
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight leading-tight">Dryclean List</h1>
                        <span className="text-sm text-gray-500 mt-1">View and manage all all the drycleans</span>
                    </div>
                    <Link
                        to="/dashboard/dryclean/add"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <FaPlus className="mr-2" /> Create a new dryclean
                    </Link>
                </div>
            </div>
            <div className="flex items-center mb-6 w-full max-w-xl">
                <div className="relative w-full">
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Search by date, group, itemcode, short description and size..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute left-3 top-4 text-gray-400">
                        <FaSearch />
                    </span>
                </div>

            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <span className="text-lg text-gray-500">Loading drycleans...</span>
                </div>
            ) : drycleans.length === 0 ? (
                <div className="flex flex-col border-2 bg-gray-100 rounded-xl items-center justify-center h-64 w-full">
                    <span className="text-2xl font-semibold text-gray-400">No records to display</span>
                </div>
            ) : (
                <div className="w-full bg-white rounded-lg shadow-md overflow-x-auto">

                    {/* Update modal */}
                    <Modal
                        isOpen={isEditModalOpen}
                        onAfterOpen={() => { }}
                        onRequestClose={() => setIsEditModalOpen(false)}
                        shouldCloseOnOverlayClick={true}
                        contentLabel="Booking Edit Modal"
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
                                <h2 className="text-2xl font-bold text-gray-800">Dryclean Details</h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Booking Details Grid */}

                        </div>
                    </Modal>


                    {/* delete modal */}
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
                                    <span className="text-lg font-bold text-red-700 mb-4 flex items-center justify-center gap-2">
                                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Are you sure you want to delete this Dryclean?
                                    </span>
                                    <div className="bg-white border-2 border-red-200 rounded-2xl shadow-lg p-6 mt-2 mb-2 w-full max-w-md mx-auto flex flex-col items-center">
                                        <div className="w-full">
                                            {/* Invoice No */}
                                            <div className="flex flex-row items-center mb-3 w-full">
                                                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 118 0v2m-4-6v.01" /></svg>
                                                <span className="font-bold text-gray-700 w-60 text-left">Dryclean Id:</span>
                                                <span className="text-blue-700 font-bold w-60 text-left text-lg ml-6">{selectedDryclean?.drycleanId}</span>
                                            </div>
                                            <div className="border-t border-gray-200 w-full my-2"></div>
                                        </div>
                                    </div>
                                    <span className="text-red-600 font-bold mt-4 text-center text-base flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414A7 7 0 1116.95 7.05z" /></svg>
                                        This action cannot be undone.
                                    </span>
                                </p>

                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-300 cursor-pointer transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-6 py-2 bg-red-700 text-white rounded-md hover:bg-red-500 cursor-pointer transition-colors duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </Modal>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Dryclean ID & Dryclean Date</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Group</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">ItemCode</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Short Description</th>
                                <th className="px-2 py-2 text-left text-xs font-bold text-natural uppercase">Item Size</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Item RentCount</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Item Master Posted</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Dryclean Amount</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Actions</th>

                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {drycleans.length === 0 && searchQuery ? (
                                <tr>
                                    <td colSpan={4} className="px-2 py-1 text-center text-gray-500">No drycleans found "{searchQuery}"</td>
                                </tr>
                            ) : (
                                drycleans.map((dryclean, index) => (
                                    <tr key={index}>
                                        <td className="px-2 py-1 whitespace-nowrap font-semibold text-blue-700 text-sm">
                                            <div>
                                                {dryclean?.drycleanId}
                                                {dryclean?.drycleanDate && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {dryclean?.drycleanDate ? moment(dryclean?.drycleanDate).format("DD-MMM-YYYY") : "N/A"}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-1 py-1 whitespace-nowrap font-semibold text-blue-700 text-sm">
                                            <div>
                                                {dryclean?.itemGroupShortDesc}
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap text-sm">{dryclean?.itemCode}</td>
                                        <td className="px-2 py-1 whitespace-nowrap text-sm">{dryclean?.itemShortDesc}</td>
                                        <td className="px-2 py-1 whitespace-nowrap text-sm">{dryclean?.itemSize}</td>
                                        <td className="px-2 py-1 whitespace-nowrap text-sm">{dryclean?.itemRentCount}</td>

                                        <td className="px-2 py-1 whitespace-nowrap text-sm">
                                            {dryclean?.itemMasterPosted ? (
                                                <Badge variant="success" className="bg-green-100 text-green-800 border-green-300">
                                                    Posted
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-300">
                                                    Not Posted
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap text-sm">{dryclean?.drycleanAmount}</td>



                                        <td className="px-2 py-1 ">
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={() => {
                                                        // if (selectedDryclean.length === 0) {
                                                        //     Swal.fire({
                                                        //         icon: 'warning',
                                                        //         title: 'No items to save',
                                                        //     });
                                                        //     return;
                                                        // }
                                                        Swal.fire({
                                                            title: 'Are you sure?',
                                                            text: "Are you sure you want to post this to Item Master?",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#3085d6',
                                                            cancelButtonColor: '#d33',
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                handlePosting(dryclean.drycleanId);
                                                            }
                                                        });
                                                    }}
                                                    disabled={isLoading || dryclean.itemMasterPosted}
                                                    className={`text-white rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 text-md shadow-lg transition-all duration-200
        ${dryclean.itemMasterPosted
                                                            ? "bg-gray-400 cursor-not-allowed opacity-60"
                                                            : "bg-blue-600 hover:text-blue-200 shadow-blue-500/50 hover:scale-110"
                                                        }`}
                                                    title="Posting"
                                                >
                                                    <FaEye /> Post to Item Master
                                                </button>
                                                {/* <button
                                                    key={index}
                                                    onClick={() => {
                                                        navigate(`/dashboard/sales/modifybooking/${dryclean.drycleanId}`);
                                                    }}
                                                    className="text-white bg-green-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-green-200 text-md shadow-lg shadow-green-500/50 hover:scale-110 transition-all duration-200"
                                                    title="Edit"
                                                >
                                                    <FaEdit /> Edit
                                                </button> */}
                                                <button
                                                    onClick={() => confirmDelete(dryclean)}
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
                contentLabel="View dryclean Details"
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Dryclean Details</h2>
                    {/* {selectedBooking ? ( */}
                    <div className="space-y-2">
                        {/* <div><span className="font-semibold">Name:</span> {selectedCustomer.name}</div> */}
                        {/* <div><span className="font-semibold">Email:</span> {selectedCustomer.email}</div> */}
                        {/* <div><span className="font-semibold">Phone:</span> {selectedCustomer.phone}</div> */}
                        {/* Add more fields as needed */}
                    </div>
                    {/* ) : (
                        <div>No customer selected.</div>
                    )} */}
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


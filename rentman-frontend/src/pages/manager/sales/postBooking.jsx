import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FaSearch, FaTrash } from 'react-icons/fa';
import { FaBoxArchive } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Badge } from '@/components/ui/badge'


Modal.setAppElement('#root');

export default function PostBooking() {
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    // const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    // const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // const [deleteBookingId, setDeleteBookingId] = useState(null);

    const navigate = useNavigate()
    // Helper to fetch full Booking list (reusable so we can call it after edits)
    const fetchAllBookings = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/salesinvoice');
            setBookings(response.data);
        } catch (err) {
            console.error('Failed to fetch Bookings', err);
            setBookings([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const searchBookings = async () => {
            if (searchQuery.length > 0) {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_BASE_URL}/api/salesinvoice/search/${encodeURIComponent(searchQuery)}`
                    );
                    setBookings(response.data);
                } catch (error) {
                    setError(error.response?.data?.message || "Failed to search bookings");
                    setBookings([]); // Clear products on error
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // use helper to fetch full list
                await fetchAllBookings();
            }
        };

        // Add debouncing (500ms delay)
        const debounceTimer = setTimeout(() => {
            setIsLoading(true);
            searchBookings();
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
        if (!selectedBooking) return;
        // console.log("Deleting product message from modal screen:", productToDelete);
        setIsLoading(true);
        const token = localStorage.getItem('token');

        axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/batchbooking/${selectedBooking.invoiceNo}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                Swal.fire({
                    title: 'Success',
                    text: 'Booking deleted successfully',
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false
                });
                setIsDeleteModalOpen(false);
                fetchAllBookings(); // Refresh the bookings list
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Error',
                    text: 'Error deleting booking: ' + error.message,
                    icon: 'error',
                    timer: 3000,
                    showConfirmButton: false
                });
                setIsLoading(false);
            });
    };

    const handlePosting = async (booking, { setBookings, onPosted } = {}) => {
        if (!booking) return;
        console.log("Posting booking: ", booking);
        const steps = [
            "Copy invoice to Posted collection",
            "Update ItemMaster counts & last rented",
            "Update Customer last purchase fields",
            "Delete active invoice & details",
            "Commit transaction"
        ];

        const stepHtml = steps
            .map(
                (s, i) => `
    <div id="step-${i}" style="margin:6px 0; display:flex; align-items:center;">
      <div id="icon-${i}" style="width:26px; text-align:center">•</div>
      <div style="margin-left:8px; white-space:nowrap">${s}</div>
    </div>`
            )
            .join("");

        const html = `
    <div id="posting-steps">${stepHtml}</div>
    <div id="posting-error" style="color:red; margin-top:8px; display:none;"></div>
  `;

        Swal.fire({
            title: `Posting invoice ${booking.invoiceNo}`,
            html,
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                // noop - we'll control DOM in didOpen
            },
            didOpen: () => {
                const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
                const container = Swal.getHtmlContainer();

                const updateIcon = (index, icon, color) => {
                    const iconEl = container.querySelector(`#icon-${index}`);
                    const stepEl = container.querySelector(`#step-${index}`);
                    if (iconEl) iconEl.textContent = icon;
                    if (stepEl) stepEl.style.color = color || "inherit";
                };

                const setError = (msg) => {
                    const errEl = container.querySelector("#posting-error");
                    if (errEl) {
                        errEl.style.display = "block";
                        errEl.textContent = msg;
                    }
                };

                // Flags shared between animation and network logic
                let serverSuccess = false;
                let serverError = null;
                let currentStep = -1;

                // start server request (single API that does the transaction)
                const serverPromise = axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/postbooking/${booking.invoiceNo}`);

                // animate steps while backend runs
                (async () => {
                    const stepDelay = 1500; // ms per step (adjust)
                    for (let i = 0; i < steps.length; i++) {
                        currentStep = i;
                        // mark in-progress
                        updateIcon(i, "⏳", "#0b61ff");
                        // wait some time to show progress
                        await sleep(stepDelay);

                        // if server already errored -> mark this step failed and stop
                        if (serverError) {
                            updateIcon(i, "❌", "red");
                            setError(serverErrorMessage(serverError));
                            return;
                        }

                        // if server already succeeded -> mark this step and the rest as done
                        if (serverSuccess) {
                            updateIcon(i, "✅", "green");
                            for (let j = i + 1; j < steps.length; j++) updateIcon(j, "✅", "green");
                            return;
                        }

                        // normal progression: mark done and continue
                        updateIcon(i, "✅", "green");
                    }
                    // animation finished; wait for server if it's still pending
                })();

                // await server result and update final UI
                serverPromise
                    .then((res) => {
                        serverSuccess = true;

                        // mark all steps done immediately
                        for (let i = 0; i < steps.length; i++) updateIcon(i, "✅", "green");

                        // show success title/icon then close
                        Swal.update({ title: "Posted successfully", icon: "success" });
                        setTimeout(() => {
                            Swal.close();
                            // update local UI state: remove booking from list if setBookings provided
                            if (typeof setBookings === "function") {
                                setBookings((prev) => prev.filter((b) => b.invoiceNo !== booking.invoiceNo));
                            }
                            // optional callback
                            if (typeof onPosted === "function") onPosted(booking);
                        }, 800);
                    })
                    .catch((err) => {
                        serverError = err;
                        // show which step failed (best-effort: the currentStep where animation was)
                        if (currentStep >= 0) updateIcon(currentStep, "❌", "red");
                        Swal.update({ title: "Posting failed", icon: "error" });
                        setError(serverErrorMessage(err));
                    });

                function serverErrorMessage(err) {
                    // friendly error text extraction
                    return err?.response?.data?.message || err?.message || "Unknown server error";
                }
            }
        });
    };

    const confirmDelete = (booking) => {
        setSelectedBooking(booking);
        setIsDeleteModalOpen(true);
    };

    // const handleView = (booking) => {
    //     setSelectedBooking(booking);
    //     setIsViewModalOpen(true);
    // };

    const closeModal = () => {
        // setIsViewModalOpen(false);
        setSelectedBooking(null);
    };

    // Map invoiceStatus text to Badge variant
    const getStatusVariant = (status) => {
        const s = (status || '').toString().toLowerCase();

        switch (s) {
            case 'booked':
                return 'secondary';       // e.g., gray / neutral
            case 'delivered':
                return 'default';         // e.g., green / success
            case 'returned':
                return 'outline';         // e.g., blue / info
            case 'cancelled':
                return 'destructive';     // e.g., red / danger
            case 'return_partial':
                return 'warning';         // e.g., yellow / partial
            case 'return_overdue':
                return 'destructive';     // e.g., red / overdue
            case 'return_issue':
                return 'destructive';     // e.g., red / issue
            default:
                return 'secondary';       // fallback / neutral
        }
    };


    return (
        <div className="flex flex-col items-center w-full px-4 py-8">
            <div className="w-full mb-8">
                <div className="flex items-center justify-between gap-4 bg-white rounded-2xl shadow-lg border border-blue-100 px-8 py-6">

                    <div className="flex flex-col">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight leading-tight">Booking List to Post</h1>
                        <span className="text-sm text-gray-500 mt-1">Use this page to post the completed bookings</span>
                    </div>
                    {/* <Link
                        to="/dashboard/sales/newbooking"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <FaPlus className="mr-2" /> Create a new booking
                    </Link> */}
                </div>
            </div>
            <div className="flex items-center mb-6 w-full max-w-xl">
                <div className="relative w-full">
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Search by Inv.No, Customer Name, Address, Phone or invoice status..."
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
                    <span className="text-lg text-gray-500">Loading bookings...</span>
                </div>
            ) : (
                <div className="w-full  bg-white rounded-lg shadow-md overflow-x-auto">

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
                                        Are you sure you want to delete this booking?
                                    </span>
                                    <div className="bg-white border-2 border-red-200 rounded-2xl shadow-lg p-6 mt-2 mb-2 w-full max-w-md mx-auto flex flex-col items-center">
                                        <div className="w-full">
                                            {/* Invoice No */}
                                            <div className="flex flex-row items-center mb-3 w-full">
                                                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 118 0v2m-4-6v.01" /></svg>
                                                <span className="font-bold text-gray-700 w-60 text-left">Invoice No:</span>
                                                <span className="text-blue-700 font-bold w-60 text-left text-lg ml-6">{selectedBooking?.invoiceNo}</span>
                                            </div>
                                            <div className="border-t border-gray-200 w-full my-2"></div>
                                            {/* Customer Name */}
                                            <div className="flex flex-row items-center mb-3 w-full">
                                                <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="font-bold text-gray-700 w-60 text-left">Customer Name:</span>
                                                <span className="text-gray-800 font-bold w-60 text-left ml-6">{selectedBooking?.customerName}</span>
                                            </div>
                                            <div className="border-t border-gray-200 w-full my-2"></div>
                                            {/* Customer Address */}
                                            <div className="flex flex-row items-center mb-3 w-full">
                                                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M17 8V6a4 4 0 00-8 0v2m8 0a4 4 0 01-8 0m8 0v2a4 4 0 01-8 0V8" /></svg>
                                                <span className="font-bold text-gray-700 w-60 text-left">Customer Address:</span>
                                                <span className="text-gray-800 text-left w-60 font-bold ml-6">{selectedBooking?.customerAddress}</span>
                                            </div>
                                            <div className="border-t border-gray-200 w-full my-2"></div>
                                            {/* Invoice Total */}
                                            <div className="flex flex-row items-center mb-1 w-full">
                                                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 0C7.582 4 4 7.582 4 12c0 4.418 3.582 8 8 8s8-3.582 8-8c0-4.418-3.582-8-8-8z" /></svg>
                                                <span className="font-bold text-gray-700 w-60 text-left">Invoice Total:</span>
                                                <span className="text-green-700 font-bold w-60 text-left ml-6">{selectedBooking?.netTotal}</span>
                                            </div>
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
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Inv. No & Inv. Date</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Customer Details</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Delivery Date</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Return Date</th>
                                <th className="px-2 py-2 text-left text-xs font-bold text-natural uppercase">Total, Disc.Net Total</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Payments</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Balance</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Deposit</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">NIC Details</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Inv.Status</th>
                                <th className="px-4 py-2 text-left text-xs font-bold text-natural uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.length === 0 && searchQuery ? (
                                <tr>
                                    <td colSpan={4} className="px-2 py-1 text-center text-gray-500">No bookings found "{searchQuery}"</td>
                                </tr>
                            ) : (
                                bookings.map((booking, index) => (
                                    // customers.map((customer, idx) => (
                                    <tr key={index}>
                                        <td className="px-2 py-1 whitespace-nowrap font-semibold text-blue-700 text-sm">
                                            <div>
                                                {booking.invoiceNo}
                                                {booking.invoiceDate && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {booking.invoiceDate ? moment(booking.invoiceDate).format("DD-MMM-YYYY") : "N/A"}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-1 py-1 whitespace-nowrap font-semibold text-blue-700 text-sm">
                                            <div>
                                                {booking.customerName}
                                                {booking.customerAddress && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {booking.customerAddress}
                                                    </div>
                                                )}
                                                {booking.customerTel1 && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {booking.customerTel1} {booking.customerTel2 && (<> / {booking.customerTel2}</>)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap text-sm">{booking.deliveryDate ? moment(booking.deliveryDate).format("DD-MMM-YYYY") : "N/A"}</td>
                                        <td className="px-2 py-1 whitespace-nowrap text-sm">{booking.returnDate ? moment(booking.returnDate).format("DD-MMM-YYYY") : "N/A"}</td>
                                        <td className="px-2 py-1 text-sm align-middle">
                                            <div className="flex items-center gap-1">
                                                {/* Total Amount: bold, no-wrap */}
                                                <div className="font-semibold whitespace-nowrap leading-none">{booking.totalAmount}</div>

                                                {/* Discount: reserve a fixed-width slot so alignment doesn't shift when missing */}
                                                <div className="w-10 text-center">
                                                    {booking.totalDiscount ? (
                                                        <span className="text-md text-gray-500 whitespace-nowrap leading-none">{booking.totalDiscount}</span>
                                                    ) : (
                                                        <span className="text-md text-gray-500 whitespace-nowrap leading-none">0</span>
                                                    )}
                                                </div>

                                                {/* Net Total: fixed width and right-aligned to keep column alignment */}
                                                <div className="w-10 text-right">
                                                    {booking.netTotal ? (
                                                        <span className="font-bold text-md text-blue-600 whitespace-nowrap leading-none">{booking.netTotal}</span>
                                                    ) : (
                                                        <span className="whitespace-nowrap leading-none">&nbsp;</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap text-sm align-top">
                                            <div className="flex flex-col">
                                                {/* Payments horizontally, comma-separated */}
                                                <div className="text-sm">
                                                    {(() => {
                                                        const payments = [booking.payment1, booking.payment2, booking.payment3]
                                                            .filter(p => p !== undefined && p !== null && String(p).trim() !== '');
                                                        return payments.length ? payments.join(', ') : (booking.payment1 ?? 0);
                                                    })()}
                                                </div>

                                                {/* dashed separator */}
                                                <div className="text-xs text-gray-400 my-1">-----</div>

                                                {/* advancePaid (fallback to computed sum if missing) */}
                                                <div className="text-sm font-semibold">
                                                    {(() => {
                                                        if (booking.advancePaid !== undefined && booking.advancePaid !== null && String(booking.advancePaid).trim() !== '') {
                                                            return booking.advancePaid;
                                                        }
                                                        const p1 = parseFloat(booking.payment1) || 0;
                                                        const p2 = parseFloat(booking.payment2) || 0;
                                                        const p3 = parseFloat(booking.payment3) || 0;
                                                        const sum = p1 + p2 + p3;
                                                        return Number.isInteger(sum) ? sum : sum.toFixed(2);
                                                    })()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className={"px-2 py-1 whitespace-nowrap text-sm " + (parseFloat(String(booking.balanceAmount).replace(/,/g, '')) > 0 ? 'font-bold text-red-700' : 'text-gray-700')}>{booking.balanceAmount}</td>
                                        <td className="px-2 py-1 whitespace-nowrap text-sm">{booking.depositAmount}</td>
                                        <td className="px-2 py-1 whitespace-nowrap text-sm">
                                            <div>
                                                {booking.nic1}
                                                {booking.nic2 && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {booking.nic2}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-2 py-1 whitespace-nowrap text-sm">
                                            <Badge variant={getStatusVariant(booking.invoiceStatus)}>
                                                {booking.invoiceStatus ? booking.invoiceStatus.charAt(0).toUpperCase() + booking.invoiceStatus.slice(1) : 'N/A'}
                                            </Badge>
                                        </td>



                                        <td className="px-2 py-1 ">
                                            <div className="flex space-x-4">
                                                <button
                                                    // onClick={() => handlePosting(booking)}
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Are you sure?',
                                                            text: "You are about to post this booking. This action cannot be undone.",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#3085d6',
                                                            cancelButtonColor: '#d33',
                                                        }
                                                        ).then((result) => {
                                                            if (result.isConfirmed) {
                                                                // navigate(`/dashboard/sales/postbooking/${booking.invoiceNo}`);
                                                                handlePosting(booking, { onPosted: () => fetchAllBookings() });

                                                            }
                                                        })
                                                    }
                                                    }
                                                    disabled={isLoading}
                                                    className="text-white bg-blue-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-blue-200 text-md shadow-lg shadow-blue-500/50 hover:scale-110 transition-all duration-200"
                                                    title="View"
                                                >
                                                    <FaBoxArchive /> {isLoading ? "Posting..." : "Post Booking"}
                                                </button>

                                                <button
                                                    onClick={() => confirmDelete(booking)}
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
            )
            }
        </div >
    );
}


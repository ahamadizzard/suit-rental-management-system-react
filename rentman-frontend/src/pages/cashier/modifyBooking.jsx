import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";

export default function ModifyBooking() {
    const { invoiceNo } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [master, setMaster] = useState(null);
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const resMaster = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/salesinvoice/${encodeURIComponent(invoiceNo)}`);
                const resItems = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/salesinvoicedetails/${encodeURIComponent(invoiceNo)}/items`
                );
                setMaster(resMaster.data);
                setItems(resItems.data || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [invoiceNo]);

    useEffect(() => {
        if (master) {
            setMaster(prev => ({
                ...prev,
                balanceAmount: calculateBalance(items, prev.discount, prev.advancePaid)
            }));
        }
    }, [items]);


    const addItem = () => setItems(prev => [...prev, { itemCode: "", itemShortName: "", itemSize: "", amount: 0, deliveryDate: master?.deliveryDate, returnDate: master?.returnDate }]);

    const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

    const calculateBalance = (items, discount, advancePaid) => {
        const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0);
        return subtotal - (parseFloat(discount) || 0) - (parseFloat(advancePaid) || 0);
    };


    const saveAll = async () => {
        setSaving(true);
        setError(null);
        try {
            // Preferred: single endpoint that accepts master + items and updates atomically
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/salesinvoice/${encodeURIComponent(invoiceNo)}`, { master, items });
            navigate("/dashboard/sales"); // redirect back to list
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">Error: {error}</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2">
                <h1 className="text-2xl font-semibold">
                    Edit Booking – {invoiceNo}
                </h1>
                <div className="space-x-2">
                    <button
                        onClick={saveAll}
                        disabled={saving}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
            {/* Summary Section */}
            <div className="bg-gray-50 shadow rounded-lg p-4 mt-6 w-full md:w-1/2 ml-auto">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">
                            {items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0).toFixed(2)}
                        </span>
                    </div>

                    {/* <div className="flex justify-between">
                        <span>Discount:</span>
                        <input
                            type="number"
                            className="w-24 border rounded p-1 text-right"
                            value={master.discount || 0}
                            onChange={e => setMaster({ ...master, discount: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="flex justify-between">
                        <span>Advance Paid:</span>
                        <input
                            type="number"
                            className="w-24 border rounded p-1 text-right"
                            value={master.advancePaid || 0}
                            onChange={e => setMaster({ ...master, advancePaid: parseFloat(e.target.value) || 0 })}
                        />
                    </div> */}
                    <input
                        type="number"
                        className="w-24 border rounded p-1 text-right"
                        value={master.discount || 0}
                        onChange={e => {
                            const discount = parseFloat(e.target.value) || 0;
                            setMaster({
                                ...master,
                                discount,
                                balanceAmount: calculateBalance(items, discount, master.advancePaid)
                            });
                        }}
                    />

                    <input
                        type="number"
                        className="w-24 border rounded p-1 text-right"
                        value={master.advancePaid || 0}
                        onChange={e => {
                            const advancePaid = parseFloat(e.target.value) || 0;
                            setMaster({
                                ...master,
                                advancePaid,
                                balanceAmount: calculateBalance(items, master.discount, advancePaid)
                            });
                        }}
                    />


                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Balance:</span>
                        <span>
                            {(
                                items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0) -
                                (parseFloat(master.discount) || 0) -
                                (parseFloat(master.advancePaid) || 0)
                            ).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>


            {/* Master Details */}
            <div className="bg-white shadow rounded-lg p-4 grid grid-cols-2 gap-4">
                <label className="flex flex-col">
                    <span className="font-medium">Customer Name</span>
                    <input
                        className="border rounded p-2"
                        value={master.customerName || ""}
                        onChange={e => setMaster({ ...master, customerName: e.target.value })}
                    />
                </label>
                <label className="flex flex-col">
                    <span className="font-medium">Customer Tel</span>
                    <input
                        className="border rounded p-2"
                        value={master.customerTel1 || ""}
                        onChange={e => setMaster({ ...master, customerTel1: e.target.value })}
                    />
                </label>
                <label className="flex flex-col">
                    <span className="font-medium">Delivery Date</span>
                    <input
                        type="date"
                        className="border rounded p-2"
                        value={moment(master.deliveryDate).format("YYYY-MM-DD")}
                        onChange={e => setMaster({ ...master, deliveryDate: e.target.value })}
                    />
                </label>
                <label className="flex flex-col">
                    <span className="font-medium">Return Date</span>
                    <input
                        type="date"
                        className="border rounded p-2"
                        value={moment(master.returnDate).format("YYYY-MM-DD")}
                        onChange={e => setMaster({ ...master, returnDate: e.target.value })}
                    />
                </label>
            </div>

            {/* Items Table */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Items</h2>
                <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Code</th>
                            <th className="border p-2">Short Name</th>
                            <th className="border p-2">Size</th>
                            <th className="border p-2">Amount</th>
                            <th className="border p-2">Delivery</th>
                            <th className="border p-2">Return</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, idx) => (
                            <tr key={idx}>
                                <td className="border p-2">
                                    <input
                                        className="w-full border rounded p-1"
                                        value={it.itemCode}
                                        onChange={e => {
                                            const copy = [...items];
                                            copy[idx].itemCode = e.target.value;
                                            setItems(copy);
                                        }}
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        className="w-full border rounded p-1"
                                        value={it.itemShortName}
                                        onChange={e => {
                                            const copy = [...items];
                                            copy[idx].itemShortName = e.target.value;
                                            setItems(copy);
                                        }}
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        className="w-full border rounded p-1"
                                        value={it.itemSize || ""}
                                        onChange={e => {
                                            const copy = [...items];
                                            copy[idx].itemSize = e.target.value;
                                            setItems(copy);
                                        }}
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        className="w-full border rounded p-1"
                                        value={it.amount}
                                        onChange={e => {
                                            const copy = [...items];
                                            copy[idx].amount = parseFloat(e.target.value || 0);
                                            setItems(copy);
                                        }}
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="date"
                                        className="border rounded p-1"
                                        value={moment(it.deliveryDate).format("YYYY-MM-DD")}
                                        onChange={e => {
                                            const copy = [...items];
                                            copy[idx].deliveryDate = e.target.value;
                                            setItems(copy);
                                        }}
                                    />
                                </td>
                                <td className="border p-2">
                                    <input
                                        type="date"
                                        className="border rounded p-1"
                                        value={moment(it.returnDate).format("YYYY-MM-DD")}
                                        onChange={e => {
                                            const copy = [...items];
                                            copy[idx].returnDate = e.target.value;
                                            setItems(copy);
                                        }}
                                    />
                                </td>
                                <td className="border p-2 text-center">
                                    <button
                                        onClick={() => removeItem(idx)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    onClick={addItem}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    + Add Item
                </button>
            </div>
        </div>
    );

}
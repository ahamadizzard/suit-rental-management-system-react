import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import Transaction from "../pages/cashier/dailyTransaction.jsx";

export default function Home() {
    // Mock data for dashboard summary
    const summary = {
        totalSales: 125000,
        totalBookings: 320,
        fastMovingItems: [
            { name: "Classic Black Suit", count: 58 },
            { name: "Navy Blue Tuxedo", count: 44 },
            { name: "Grey Formal Suit", count: 39 },
        ],
        inventoryCount: 540,
        lowStock: 7,
        recentTransactions: [
            { id: 1, customer: "John Doe", item: "Classic Black Suit", date: "2025-05-19", amount: 1500 },
            { id: 2, customer: "Jane Smith", item: "Navy Blue Tuxedo", date: "2025-05-19", amount: 1800 },
        ],
    };

    // Mock sales data for line chart
    const salesData = [
        { month: "Jan", sales: 12000 },
        { month: "Feb", sales: 15000 },
        { month: "Mar", sales: 18000 },
        { month: "Apr", sales: 22000 },
        { month: "May", sales: 25000 },
    ];

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Dashboard</h1>
            <div className="flex justify-center" style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
                <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: 8, minWidth: 180 }}>
                    <h3>Total Sales</h3>
                    <p style={{ fontSize: 24, fontWeight: "bold" }}>₹{summary.totalSales.toLocaleString()}</p>
                </div>
                <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: 8, minWidth: 180 }}>
                    <h3>Total Bookings</h3>
                    <p style={{ fontSize: 24, fontWeight: "bold" }}>{summary.totalBookings}</p>
                </div>
                <div style={{ background: "#f5f5f5", padding: "1rem", borderRadius: 8, minWidth: 180 }}>
                    <h3>Inventory</h3>
                    <p style={{ fontSize: 18 }}>Total Items: <b>{summary.inventoryCount}</b></p>
                    <p style={{ color: "#d9534f" }}>Low Stock: <b>{summary.lowStock}</b></p>
                </div>
            </div>

            <hr style={{ marginBottom: "2rem" }} />

            <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
                <div style={{ flex: 1, background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
                    <h2>Fast Moving Items (Bar Chart)</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={summary.fastMovingItems}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="max-w-4xl" style={{ flex: 1, background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 2px 8px #eee" }}>
                    <ResponsiveContainer className="w-full h-[350px]">
                        <div className="flex flex-col justify-center items-center">
                            <h2 className="text-xl sticky font-bold text-blue-600">Daily Transaction Summary</h2>
                            <div className="w-full flex-1 overflow-y-auto">
                                <Transaction />
                            </div>
                        </div>
                    </ResponsiveContainer>
                </div>
            </div>
            <hr style={{ marginBottom: "2rem" }} />
            <div style={{ marginBottom: "2rem" }}>
                <h2>Fast Moving Items</h2>
                <ul>
                    {summary.fastMovingItems.map((item, idx) => (
                        <li key={idx}>{item.name} <span style={{ color: '#888' }}>(Rented {item.count} times)</span></li>
                    ))}
                </ul>
            </div>

            <div style={{ marginBottom: "2rem" }}>
                <h2>Recent Transactions</h2>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#eee" }}>
                            <th style={{ padding: 8, border: "1px solid #ccc" }}>Customer</th>
                            <th style={{ padding: 8, border: "1px solid #ccc" }}>Item</th>
                            <th style={{ padding: 8, border: "1px solid #ccc" }}>Date</th>
                            <th style={{ padding: 8, border: "1px solid #ccc" }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary.recentTransactions.map(tx => (
                            <tr key={tx.id}>
                                <td style={{ padding: 8, border: "1px solid #ccc" }}>{tx.customer}</td>
                                <td style={{ padding: 8, border: "1px solid #ccc" }}>{tx.item}</td>
                                <td style={{ padding: 8, border: "1px solid #ccc" }}>{tx.date}</td>
                                <td style={{ padding: 8, border: "1px solid #ccc" }}>₹{tx.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
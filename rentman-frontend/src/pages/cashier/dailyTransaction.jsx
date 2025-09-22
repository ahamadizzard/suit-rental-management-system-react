import { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const todayUTC = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(todayUTC);

    const fetchTransactions = async (date) => {
        setIsLoading(true);
        if (!date) return;

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/dailytransactions/date/${date}`
            );
            // const response = await axios.get(
            //     `${import.meta.env.VITE_API_BASE_URL}/api/dailytransactions/`
            // );
            setTransactions(response.data);
            // console.log("Fetched transactions:", response.data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setTransactions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(selectedDate);
    }, [selectedDate]);

    const formatDate = (dateString) => new Date(dateString).toLocaleString();
    const formatAmount = (amount) =>
        amount.toLocaleString("en-US", { style: "currency", currency: "LKR" });
    const formatDateUTC = (dateObj) => dateObj.toISOString().split("T")[0];

    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(formatDateUTC(newDate));
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        const nextDay = formatDateUTC(newDate);
        if (nextDay <= todayUTC) setSelectedDate(nextDay);
    };

    const goToToday = () => setSelectedDate(todayUTC);

    // Summary totals
    const totalCredit = transactions.reduce((sum, t) => sum + t.creditAmount, 0);
    const totalDebit = transactions.reduce((sum, t) => sum + t.debitAmount, 0);
    const isDebitHigher = totalDebit > totalCredit;

    return (
        <Card className="w-full p-4">
            <CardHeader className="text-center text-xl font-bold text-blue-600">
                <CardTitle>Daily Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <Button onClick={goToPreviousDay} size="sm">⬅ Previous</Button>
                    <input
                        type="date"
                        value={selectedDate}
                        max={todayUTC}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                    />
                    <Button onClick={goToToday} size="sm">Today 🏠</Button>
                    <Button onClick={goToNextDay} size="sm">Next ➡</Button>

                </div>

                {isLoading ? (
                    <p className="text-center py-4">Loading transactions...</p>
                ) : transactions.length === 0 ? (
                    <p className="text-center py-4">No transactions found for {selectedDate}.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left border-b">ID / Invoice</th>
                                    <th className="px-4 py-2 text-left border-b">Type / Description</th>
                                    <th className="px-4 py-2 text-left border-b">Date & Time</th>
                                    <th className="px-4 py-2 text-right border-b">Credit</th>
                                    <th className="px-4 py-2 text-right border-b">Debit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr key={t._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border-b">
                                            <div className="text-sm font-medium">{t.transactionId}</div>
                                            <div className="text-xs text-gray-500">{t.invoiceNo}</div>
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            <div className="text-sm font-medium">{t.transactionType}</div>
                                            <div className="text-xs text-gray-500">{t.transactionDesc || "-"}</div>
                                        </td>
                                        <td className="px-4 py-2 border-b text-sm">{formatDate(t.transactionDate)}</td>
                                        <td className="px-4 py-2 border-b text-right">{formatAmount(t.creditAmount)}</td>
                                        <td className="px-4 py-2 border-b text-right">{formatAmount(t.debitAmount)}</td>
                                    </tr>
                                ))}

                                {/* Summary row */}
                                <tr
                                    className={`font-bold ${isDebitHigher
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                        }`}
                                >
                                    <td colSpan={2} className="px-4 py-2 border-t">Total</td>
                                    <td className="px-4 py-2 border-t"></td>
                                    <td className="px-4 py-2 border-t text-right">{formatAmount(totalCredit)}</td>
                                    <td className="px-4 py-2 border-t text-right">{formatAmount(totalDebit)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

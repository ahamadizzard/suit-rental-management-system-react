// hooks/useInvoiceNumber.js
import { useState } from "react";
import axios from "axios";

export const useInvoiceNumber = () => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInvoiceNumber = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/invoices/generate-invoice-number`
      );
      setInvoiceNumber(response.data.invoiceNumber);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate invoice number"
      );
    } finally {
      setLoading(false);
    }
  };

  return { invoiceNumber, generateInvoiceNumber, loading, error };
};

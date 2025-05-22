import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";

export default function NewBookingInvoice() {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingLastId, setIsFetchingLastId] = useState(true);
    const [errors, setErrors] = useState({});

    // get the last invoice ID
    useEffect(() => {
        // Set loading state to true
        setIsLoading(true);
        // Make a GET request to the server to get the last invoice ID
        axios.get('/api/salesinvoice/lastId')
            .then(response => {
                // Set loading state to false
                setIsLoading(false);
                // Set fetching last ID state to false
                setIsFetchingLastId(false);
                // Check if the response data exists and has a lastInvoiceId property
                if (response.data && response.data.lastInvoiceId) {
                    // Parse the lastInvoiceId to an integer
                    const lastId = parseInt(response.data.lastInvoiceId);
                    // Increment the lastId by 1 and pad it with leading zeros to make it 3 digits long
                    const newInvoiceId = (lastId + 1).toString().padStart(3, '0');
                    // Set the invoiceNo in the form data to the newInvoiceId
                    setFormData(prev => ({ ...prev, invoiceNo: newInvoiceId }));
                } else {
                    // If the response data does not exist or does not have a lastInvoiceId property, set the invoiceNo in the form data to '001'
                    setFormData(prev => ({ ...prev, invoiceNo: '001' }));
                }
            })
            .catch(error => {
                // Set loading state to false
                setIsLoading(false);
                // Set fetching last ID state to false
                setIsFetchingLastId(false);
                // Set errors to the error response data
                setErrors(error.response.data.errors);
            });
    }, []);
    return (
        <div>
            <h1>Booking Invoice</h1>
            {/* Add your booking invoice form and logic here */}
        </div>
    );
}
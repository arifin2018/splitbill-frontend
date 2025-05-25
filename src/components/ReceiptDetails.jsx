import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import useSelector

function ReceiptDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Dapatkan fungsi dispatch


  // Mengambil data resi dan originalImageUrl dari Redux store
  const { receiptData, loading, error, originalImageUrl } = useSelector((state) => state.receipt);

  // Efek untuk menangani jika data tidak ada atau ada error
  useEffect(() => {
    if (!receiptData && !loading) {
      console.warn('No receipt data found in Redux. Redirecting to upload page.');
      navigate('/');
    }
    if (error) {
      console.error('Error fetching receipt details:', error);
    }
  }, [receiptData, loading, error, navigate]);

  const defaultReceipt = {
    image_url: 'https://via.placeholder.com/300x200?text=Receipt+Image', // Ini akan menjadi fallback
    shop_name: 'Unknown Shop',
    shop_address: 'N/A',
    date: 'N/A',
    total_amount: 0.00,
    items: [],
  };

  // --- Fungsi untuk mereset Redux store dan navigasi ---
  const handleStartNewBill = () => {
    dispatch({ type: 'app/resetStore' }); // Dispatch aksi reset
    navigate('/'); // Kemudian navigasi ke halaman utama
  };

  const displayedReceipt = receiptData || defaultReceipt;

  // const totalItems = displayedReceipt.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalItems = displayedReceipt.items.length;
  const payment = displayedReceipt.totals.payment || 0.00;

  const headerHeight = 60;
  const footerHeight = 60;
  const scrollableHeight = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-white">
        <p className="text-lg font-semibold text-gray-700">Loading receipt details...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-white p-4 text-center">
        <p className="text-lg font-semibold text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={handleStartNewBill}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white">
      <div className="flex flex-col rounded-lg shadow-xl w-full max-w-md h-screen md:h-auto">
        {/* Header */}
        <div className="flex-none flex justify-between items-center p-4 border-b bg-white h-12 md:h-16">
          <h2 className="text-xl font-semibold text-gray-800">Receipt details</h2>
          <button className="text-gray-500 hover:text-gray-700 flex items-center" onClick={handleStartNewBill}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="p-6 overflow-y-auto flex-grow"
          style={{ maxHeight: scrollableHeight }}
        >
          {/* Uploaded Receipt Image */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Uploaded receipt</h3>
            <p className="text-sm text-gray-500 mb-2">
              {totalItems} item{totalItems !== 1 ? 's' : ''}, Payment: {payment}
            </p>
            <div className="rounded-md overflow-hidden shadow-sm">
              <img
                src={originalImageUrl || displayedReceipt.image_url} // <-- Gunakan originalImageUrl di sini
                alt="Uploaded Receipt"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Details</h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              <div>
                <p className="font-medium">Shop Name</p>
                <p>{displayedReceipt.store_information.store_name}</p>
              </div>
              <div>
                <p className="font-medium">Shop Address</p>
                <p>{displayedReceipt.store_information.address}</p>
              </div>
              <div>
                <p className="font-medium">Date</p>
                <p>{displayedReceipt.transaction_information.date}</p>
              </div>
              <div>
                <p className="font-medium">Total</p>
                <p>${displayedReceipt.totals.total}</p>
              </div>
              <div>
                <p className="font-medium">Discount</p>
                <p>${displayedReceipt.totals.discount || 0}</p>
              </div>
              <div>
                <p className="font-medium">Tax</p>
                <p>${displayedReceipt.totals.tax.total_tax || 0}</p>
              </div>
              {displayedReceipt.service_charge && (
                <div>
                  <p className="font-medium">Service Charge</p>
                  <p>${displayedReceipt.service_charge}</p>
                </div>
              )}
              {displayedReceipt.tax_amount && (
                <div>
                  <p className="font-medium">Tax</p>
                  <p>${displayedReceipt.tax_amount}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Items</h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              {displayedReceipt.items && displayedReceipt.items.length > 0 ? (
                displayedReceipt.items.map((item, i) => (
                  <div key={item.id || `item-${i}`} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p>${item.price ? item.price : 'N/A'}, Quantity: {item.quantity || 1}</p>
                    </div>
                    <p className="font-semibold">{(Number(item.total.replace(/,/g, "")))}</p>
                  </div>
                ))
              ) : (
                <p>No items found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer Button */}
        <div className="flex-none p-6 border-t bg-white">
          <button onClick={() => navigate('/add_friend')} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-md w-full">
            Confirm and split
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptDetails;
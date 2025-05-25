import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setEditedReceiptData, clearReceiptData } from '../redux/actions/receiptActions';

function ReceiptDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { receiptData, loading, error, originalImageUrl } = useSelector((state) => state.receipt);

  const [isEditing, setIsEditing] = useState(false);
  const [editedReceipt, setEditedReceipt] = useState(null);

  const defaultReceipt = {
    image_url: 'https://via.placeholder.com/300x200?text=Receipt+Image',
    store_information: { store_name: 'Unknown Shop', address: 'N/A' },
    transaction_information: { date: 'N/A' },
    totals: { total: 0.00, discount: 0.00, tax: { total_tax: 0.00 }, payment: 0.00 },
    service_charge: 0.00,
    items: [],
  };

  // State untuk melacak apakah ada perubahan yang belum disimpan
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);


  useEffect(() => {
    if (receiptData) {
      setEditedReceipt(JSON.parse(JSON.stringify(receiptData)));
      // Reset status perubahan saat data diinisialisasi dari Redux
      setHasUnsavedChanges(false);
    } else if (!loading) {
      console.warn('No receipt data found in Redux. Redirecting to upload page.');
      navigate('/');
    }
    if (error) {
      console.error('Error fetching receipt details:', error);
    }
  }, [receiptData, loading, error, navigate]);


  // --- NEW useEffect for beforeunload event ---
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Periksa apakah ada perubahan yang belum disimpan DAN sedang dalam mode editing
      // Ini penting agar tidak selalu muncul pop-up
      if (hasUnsavedChanges && isEditing) {
        event.preventDefault();
        event.returnValue = ''; // Standard practice for cross-browser compatibility
        return ''; // Display a confirmation message to the user
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, isEditing]); // Depend on hasUnsavedChanges and isEditing


  // Update hasUnsavedChanges state when editedReceipt changes
  useEffect(() => {
    // Membandingkan editedReceipt dengan receiptData dari Redux
    // Gunakan JSON.stringify untuk deep comparison sederhana.
    // Untuk objek yang lebih kompleks dan performa, pertimbangkan library seperti 'lodash.isequal'
    if (editedReceipt && receiptData) {
      setHasUnsavedChanges(JSON.stringify(editedReceipt) !== JSON.stringify(receiptData));
    } else {
      setHasUnsavedChanges(false);
    }
  }, [editedReceipt, receiptData]);


  const handleStartNewBill = () => {
    // Tambahkan konfirmasi hanya jika ada perubahan yang belum disimpan
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Are you sure you want to start a new bill and discard changes?"
      );
      if (!confirmDiscard) {
        return; // Hentikan fungsi jika user membatalkan
      }
    }
    dispatch(clearReceiptData());
    navigate('/');
  };

  const displayedReceipt = receiptData || defaultReceipt;

  const totalItems = displayedReceipt.items.length;
  const payment = parseFloat(displayedReceipt.totals.payment) || 0.00;

  const headerHeight = 60;
  const footerHeight = 60;
  const scrollableHeight = `calc(90vh - ${headerHeight}px - ${footerHeight}px)`;

  const handleInputChange = (e, path, type = 'text') => {
    const { value } = e.target;
    setEditedReceipt(prevReceipt => {
      const newReceipt = JSON.parse(JSON.stringify(prevReceipt));
      let current = newReceipt;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      if (type === 'number' || type === 'float') {
        current[parts[parts.length - 1]] = parseFloat(value) || 0;
      } else if (type === 'integer') {
        current[parts[parts.length - 1]] = parseInt(value) || 0;
      } else {
        current[parts[parts.length - 1]] = value;
      }
      return newReceipt;
    });
  };

  const handleItemChange = (e, itemIndex, fieldName, type = 'text') => {
    const { value } = e.target;
    setEditedReceipt(prevReceipt => {
      const newReceipt = JSON.parse(JSON.stringify(prevReceipt));
      const newItem = { ...newReceipt.items[itemIndex] };

      if (type === 'number' || type === 'float') {
        newItem[fieldName] = parseFloat(value) || 0;
      } else if (type === 'integer') {
        newItem[fieldName] = parseInt(value) || 0;
      } else {
        newItem[fieldName] = value;
      }
      newReceipt.items[itemIndex] = newItem;
      return newReceipt;
    });
  };

  const handleSave = () => {
    dispatch(setEditedReceiptData(editedReceipt));
    setIsEditing(false);
    setHasUnsavedChanges(false); // Setelah disimpan, tidak ada lagi perubahan yang belum disimpan
  };

  const handleCancel = () => {
    setEditedReceipt(JSON.parse(JSON.stringify(receiptData)));
    setIsEditing(false);
    setHasUnsavedChanges(false); // Setelah dibatalkan, tidak ada lagi perubahan yang belum disimpan
  };

  if (loading || editedReceipt === null) {
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
          <div className="flex items-center">
            {isEditing ? (
              <>
                <button
                  className="text-green-500 hover:text-green-700 mr-2 font-semibold"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 mr-2 font-semibold"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="text-blue-500 hover:text-blue-700 mr-2 font-semibold"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
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
              {totalItems} item{totalItems !== 1 ? 's' : ''}, Payment: {payment.toFixed(2)}
            </p>
            <div className="rounded-md overflow-hidden shadow-sm">
              <img
                src={originalImageUrl || displayedReceipt.image_url}
                alt="Uploaded Receipt"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Details</h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              {/* Shop Name */}
              <div>
                <p className="font-medium">Shop Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-full text-gray-800"
                    value={editedReceipt?.store_information?.store_name || ''}
                    onChange={(e) => handleInputChange(e, 'store_information.store_name')}
                  />
                ) : (
                  <p className="text-gray-800">{displayedReceipt.store_information.store_name}</p>
                )}
              </div>
              {/* Shop Address */}
              <div>
                <p className="font-medium">Shop Address</p>
                {isEditing ? (
                  <textarea
                    className="border rounded px-2 py-1 w-full text-gray-800"
                    value={editedReceipt?.store_information?.address || ''}
                    onChange={(e) => handleInputChange(e, 'store_information.address')}
                    rows="2"
                  />
                ) : (
                  <p className="text-gray-800">{displayedReceipt.store_information.address}</p>
                )}
              </div>
              {/* Date */}
              <div>
                <p className="font-medium">Date</p>
                {isEditing ? (
                  <input
                    type="date"
                    className="border rounded px-2 py-1 w-full text-gray-800"
                    value={editedReceipt?.transaction_information?.date || ''}
                    onChange={(e) => handleInputChange(e, 'transaction_information.date')}
                  />
                ) : (
                  <p className="text-gray-800">{displayedReceipt.transaction_information.date}</p>
                )}
              </div>
              {/* Total */}
              <div>
                <p className="font-medium">Total</p>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    className="border rounded px-2 py-1 w-full text-gray-800"
                    value={editedReceipt?.totals?.total || 0}
                    onChange={(e) => handleInputChange(e, 'totals.total', 'float')}
                  />
                ) : (
                  <p className="text-gray-800">{(parseFloat(displayedReceipt.totals.total) || 0).toFixed(2)}</p>
                )}
              </div>
              {/* Discount */}
              <div>
                <p className="font-medium">Discount</p>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    className="border rounded px-2 py-1 w-full text-gray-800"
                    value={editedReceipt?.totals?.discount || 0}
                    onChange={(e) => handleInputChange(e, 'totals.discount', 'float')}
                  />
                ) : (
                  <p className="text-gray-800">{(parseFloat(displayedReceipt.totals.discount) || 0).toFixed(2)}</p>
                )}
              </div>
              {/* Tax */}
              <div>
                <p className="font-medium">Tax</p>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    className="border rounded px-2 py-1 w-full text-gray-800"
                    value={editedReceipt?.totals?.tax?.total_tax || 0}
                    onChange={(e) => handleInputChange(e, 'totals.tax.total_tax', 'float')}
                  />
                ) : (
                  <p className="text-gray-800">{(parseFloat(displayedReceipt.totals.tax.total_tax) || 0).toFixed(2)}</p>
                )}
              </div>
              {/* Service Charge (jika ada) */}
              {editedReceipt?.service_charge !== undefined && (
                <div>
                  <p className="font-medium">Service Charge</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border rounded px-2 py-1 w-full text-gray-800"
                      value={editedReceipt?.service_charge || 0}
                      onChange={(e) => handleInputChange(e, 'service_charge', 'float')}
                    />
                  ) : (
                    <p className="text-gray-800">{(parseFloat(displayedReceipt.service_charge) || 0).toFixed(2)}</p>
                  )}
                </div>
              )}
              {/* Tax Amount (Jika berbeda dengan totals.tax.total_tax, atau jika Anda ingin edit terpisah) */}
              {editedReceipt?.tax_amount !== undefined && (
                <div>
                  <p className="font-medium">Additional Tax Amount</p>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      className="border rounded px-2 py-1 w-full text-gray-800"
                      value={editedReceipt?.tax_amount || 0}
                      onChange={(e) => handleInputChange(e, 'tax_amount', 'float')}
                    />
                  ) : (
                    <p className="text-gray-800">{(parseFloat(displayedReceipt.tax_amount) || 0).toFixed(2)}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Items</h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
              {editedReceipt?.items && editedReceipt.items.length > 0 ? (
                editedReceipt.items.map((item, i) => (
                  <div key={item.id || `item-${i}`} className="flex justify-between items-center border p-2 rounded-md">
                    <div className="flex-grow mr-2">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            className="border rounded px-2 py-1 w-full mb-1 text-gray-800"
                            value={item.name || ''}
                            onChange={(e) => handleItemChange(e, i, 'name')}
                            placeholder="Item Name"
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="0.01"
                              className="border rounded px-2 py-1 w-1/2 text-gray-800"
                              value={item.price || 0}
                              onChange={(e) => handleItemChange(e, i, 'price', 'float')}
                              placeholder="Price"
                            />
                            <input
                              type="number"
                              step="1"
                              className="border rounded px-2 py-1 w-1/2 text-gray-800"
                              value={item.quantity || 1}
                              onChange={(e) => handleItemChange(e, i, 'quantity', 'integer')}
                              placeholder="Quantity"
                            />
                          </div>
                        </>
                      ) : (
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-gray-600">IDR {(parseFloat(item.price) || 0).toFixed(2)}, Qty: {item.quantity || 1}</p>
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-gray-800">
                      IDR {(parseFloat(item.total ? item.total.toString().replace(/,/g, "") : (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 1))).toFixed(2)}
                    </p>
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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  setActivePerson,
  assignItemToPerson,
  resetSplitBillState // Pastikan ini juga sudah diatur di Redux actions/reducers Anda
} from '../redux/actions/splitBillActions';

function SplitBillPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- Ambil data dari Redux Store ---
  const { receiptData, originalImageUrl } = useSelector((state) => state.receipt);
  const friends = useSelector((state) => state.friends.friends);
  const { activePersonId, personAssignments } = useSelector((state) => state.splitBill);

  // Persiapkan data items untuk digunakan di UI
  const items = receiptData?.items.map((item,index) => ({
    ...item,
    id: item.id || `${item.name.replace(/\s/g, '_').toLowerCase()}_${index}`,
    originalQuantity: item.quantity || 1,
  })) || [];

  // Persiapkan data people untuk digunakan di UI (menggunakan friends dari Redux)
  const peopleWithAssignments = friends.map(friend => ({
    ...friend,
    assignedItems: personAssignments[friend.id] || {},
    avatar: friend.avatar || `https://i.pravatar.cc/40?img=${friend.id % 20 + 10}`,
  }));

  // --- Helper Functions untuk Perhitungan ---
  const calculateTotalOwed = (person) => {
    let total = 0;
    for (const itemId in person.assignedItems) {
      const assignedQty = person.assignedItems[itemId];
      const item = items.find(i => i.id === itemId);
      if (item) {
        total += assignedQty * (item.price || 0);
      }
    }
    return total.toFixed(2);
  };

  const calculateRemainingQuantity = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return 0;

    let totalAssignedToAllPeople = 0;
    for (const personId in personAssignments) {
      totalAssignedToAllPeople += personAssignments[personId][itemId] || 0;
    }
    return item.originalQuantity - totalAssignedToAllPeople;
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + (item.originalQuantity * (item.price || 0)), 0).toFixed(2);
  };

  const calculateTotalAssignedByEveryone = () => {
    let totalAssigned = 0;
    for (const personId in personAssignments) {
      for (const itemId in personAssignments[personId]) {
        const assignedQty = personAssignments[personId][itemId];
        const item = items.find(i => i.id === itemId);
        if (item) {
          totalAssigned += assignedQty * (item.price || 0);
        }
      }
    }
    return totalAssigned.toFixed(2);
  };

  // --- Pindahkan perhitungan ini ke atas, sebelum useEffect yang menggunakannya ---
  const grandTotal = calculateGrandTotal();
  const totalAssignedByEveryone = calculateTotalAssignedByEveryone();
  const remainingTotal = (parseFloat(grandTotal) - parseFloat(totalAssignedByEveryone)).toFixed(2);

  // --- Inisialisasi Data (Jika tidak ada data, redirect atau tampilkan pesan) ---
  useEffect(() => {
    if (!receiptData || !receiptData.items || receiptData.items.length === 0) {
      console.warn('No receipt data found in Redux. Redirecting to receipt upload.');
      navigate('/');
      return;
    }
    if (!friends || friends.length === 0) {
      console.warn('No friends added in Redux. Redirecting to add friends page.');
      navigate('/add_friends');
      return;
    }
    if (!activePersonId && friends.length > 0) {
      dispatch(setActivePerson(friends[0].id));
    }
  }, [receiptData, friends, activePersonId, dispatch, navigate]);

  useEffect(()=>{
    console.log(receiptData);
  })

  // --- Konfirmasi saat refresh/keluar halaman ---
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Hanya tampilkan konfirmasi jika masih ada item yang belum dibagi habis
      if (remainingTotal !== '0.00') {
        const message = 'Anda memiliki item yang belum dibagi. Apakah Anda yakin ingin meninggalkan halaman ini?';
        event.returnValue = message; // Standar untuk browser
        return message; // Untuk kompatibilitas yang lebih luas
      }
      return undefined; // Jangan tampilkan konfirmasi jika semua sudah dibagi
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup: Hapus event listener saat komponen di-unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [remainingTotal]); // Dependency array: jalankan ulang efek jika remainingTotal berubah


  // --- Event Handlers ---
  const handleAssignItem = (itemId, change) => {
    if (!activePersonId) {
      alert("Silakan pilih orang yang akan mengassign item terlebih dahulu.");
      return;
    }

    const person = peopleWithAssignments.find(p => p.id === activePersonId);
    const item = items.find(i => i.id === itemId);

    if (!person || !item) return;

    const currentAssignedQtyForPerson = person.assignedItems[itemId] || 0;
    const newAssignedQtyForPerson = currentAssignedQtyForPerson + change;

    if (newAssignedQtyForPerson < 0) return;

    const currentRemainingQuantityGlobally = calculateRemainingQuantity(item.id);

    if (change > 0 && newAssignedQtyForPerson > currentAssignedQtyForPerson + currentRemainingQuantityGlobally) {
        alert(`Kuantitas yang tersedia untuk ${item.name} hanya ${currentRemainingQuantityGlobally}.`);
        return;
    }
    if (newAssignedQtyForPerson > item.originalQuantity) {
        alert(`Kuantitas total untuk ${item.name} hanya ${item.originalQuantity}.`);
        return;
    }

    dispatch(assignItemToPerson(activePersonId, itemId, change));
  };

  const handleSplitConfirm = () => {
    
    if (remainingTotal !== '0.00' ) {
        alert("Belum semua item dibagi habis atau ada kelebihan pembagian. Pastikan total assigned sama dengan grand total.");
        return;
    }
    navigate('/split_complete');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen font-sans" style={{ backgroundColor: '#F8F4ED' }}>
      <div className="bg-white rounded-lg shadow-md w-full max-w-xs md:max-w-sm flex flex-col h-full max-h-[95vh]">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 flex-none">
          <button className="text-gray-500 hover:text-gray-700" onClick={() => navigate(-1)}>
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <span className="text-xl font-semibold text-gray-800 mx-auto">Split bill</span>
          <div className="w-6 h-6"></div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto p-4">
          {/* Gambar Struk */}
          <div className="mb-4 bg-white overflow-hidden flex justify-center items-center">
            {originalImageUrl && (
              <img src={originalImageUrl} alt="Receipt" className="w-full h-auto object-cover rounded-md shadow-sm max-h-48" />
            )}
            {!originalImageUrl && (
              <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md">No Receipt Image</div>
            )}
          </div>

          {/* Items Section */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Items</h2>
            <div className="bg-white rounded-lg shadow-sm">
              {items.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">No items found in the receipt.</p>
              ) : (
                  items.map(item => {
                    const assignedToActivePerson = activePersonId ? (personAssignments[activePersonId]?.[item.id] || 0) : 0;
                    const currentRemainingQuantity = calculateRemainingQuantity(item.id);

                    return (
                      <div key={item.id} className="flex justify-between items-center px-4 py-3 border-b last:border-b-0">
                        <div className="flex-grow">
                          <p className="text-gray-700 font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.originalQuantity} 
                            item{item.originalQuantity > 1 ? 's' : ''}, IDR {(item.price || 0)}
                          </p>
                          {currentRemainingQuantity < item.originalQuantity && (
                            <p className="text-xs text-blue-500">
                              ({item.originalQuantity - currentRemainingQuantity} assigned, {currentRemainingQuantity} remaining)
                            </p>
                          )}
                        </div>
                        {activePersonId && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAssignItem(item.id, -1)}
                              disabled={assignedToActivePerson === 0}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="text-gray-800 font-semibold w-6 text-center">
                              {assignedToActivePerson}
                            </span>
                            <button
                              onClick={() => handleAssignItem(item.id, 1)}
                              disabled={currentRemainingQuantity === 0}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Who's Splitting Section */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Who's splitting?</h2>
            <div className="bg-white rounded-lg shadow-sm">
              {peopleWithAssignments.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">No friends added.</p>
              ) : (
                  peopleWithAssignments.map(person => (
                    <div
                      key={person.id}
                      className={`flex justify-between items-center py-3 px-4 border-b last:border-b-0 cursor-pointer ${activePersonId === person.id ? 'bg-orange-50 ring-2 ring-orange-400' : 'hover:bg-gray-50'}`}
                      onClick={() => dispatch(setActivePerson(person.id))}
                    >
                      <div className="flex items-center">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-gray-700 font-medium">{person.name}</p>
                          <p className="text-sm text-gray-500">
                            {calculateTotalOwed(person)}
                          </p>
                          {Object.keys(person.assignedItems).length > 0 && (
                            <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-1">
                              {Object.entries(person.assignedItems).map(([itemId, assignedQty]) => {
                                const item = items.find(i => i.id === itemId);
                                return (
                                  <span key={itemId} className="bg-gray-100 rounded-full px-2 py-0.5">
                                    {item?.name} ({assignedQty})
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Total and Action Buttons */}
        <div className="p-4 bg-white rounded-b-lg shadow-sm flex-none">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-800 text-lg font-semibold">Total:</p>
            <p className="text-gray-800 text-lg font-semibold">IDR {grandTotal}</p>
          </div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 text-sm">Assigned:</p>
            <p className="text-gray-600 text-sm">{totalAssignedByEveryone}</p>
          </div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 text-sm">Remaining:</p>
            <p className={`text-sm font-semibold ${ remainingTotal === '0.00' ? 'text-green-600' : 'text-red-600'}`}>
                {remainingTotal}
            </p>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleSplitConfirm}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={remainingTotal !== '0.00'}
            >
              Split and Charge
            </button>
            {/* <button onClick={() => navigate('/split_complete')} className="flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100">
              Charge
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplitBillPage;
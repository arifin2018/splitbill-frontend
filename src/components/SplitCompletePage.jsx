import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // Import useDispatch

function SplitCompletePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Dapatkan fungsi dispatch

  // --- Ambil data dari Redux Store ---
  const { receiptData } = useSelector((state) => state.receipt); // Ambil receiptData untuk detail item asli
  const friends = useSelector((state) => state.friends.friends); // Ambil daftar teman/peserta
  const { personAssignments } = useSelector((state) => state.splitBill); // Ambil hasil alokasi item

  // --- Siapkan data item asli dari Redux ---
  // Pastikan setiap item memiliki 'id' yang konsisten dengan cara Anda meng-assign di SplitBillPage
  const allOriginalItems = receiptData?.items.map((item, index) => ({
    ...item,
    id: item.id || `${item.name.replace(/\s/g, '_').toLowerCase()}_${index}`,
    originalQuantity: parseFloat(item.quantity) || 1, // Pastikan quantity adalah number
    price: parseFloat(item.price) || 0 // <<< PERBAIKAN DI SINI: Pastikan harga adalah number
  })) || [];

  // --- Ambil Total Diskon, Service Charge, dan Tax dari receiptData ---
  // <<< PERBAIKAN DI SINI: Pastikan semua nilai ini di-parse sebagai float
  const globalDiscountAmount = parseFloat(receiptData?.totals?.discount) || 0;
  const globalServiceChargeAmount = parseFloat(receiptData?.service_charge) || 0; 
  const globalTaxAmount = parseFloat(receiptData?.totals?.tax?.total_tax) || 0;

  // --- Hitung Total Subtotal dari SEMUA item di struk (untuk proporsi) ---
  const totalReceiptSubtotal = allOriginalItems.reduce((sum, item) => 
    sum + (item.price || 0) * (item.originalQuantity || 1), 0
  );

  // --- Siapkan data participants dengan item yang dialokasikan ---
  const participants = friends.map(friend => ({
    id: friend.id,
    name: friend.name,
    avatar: `https://i.pravatar.cc/40?img=${friend.id % 20 + 10}`,
    // Ambil assignedItems dari personAssignments berdasarkan friend.id
    assignedItems: Object.entries(personAssignments[friend.id] || {}).map(([itemId, quantity]) => ({
      itemId: itemId,
      quantity: quantity
    })),
    // additionalFees tetap di sini karena ini mungkin biaya spesifik per peserta
    additionalFees: 0.00 
  }));

  // Fungsi bantu untuk mendapatkan detail item dari ID
  const getItemDetails = (itemId) => {
    return allOriginalItems.find(item => item.id === itemId);
  };

  // Fungsi untuk menghitung total belanjaan item per participant (subtotal)
  const calculateSubtotal = (participant) => {
    return participant.assignedItems.reduce((sum, assigned) => {
      const item = getItemDetails(assigned.itemId);
      // Pastikan hasil perhitungan item.price * assigned.quantity adalah number
      return sum + (item ? (parseFloat(item.price) || 0) * (parseFloat(assigned.quantity) || 0) : 0);
    }, 0);
  };

  // FUNGSI: Menghitung jumlah diskon proporsional per peserta
  const calculateDiscountAmount = (participant) => {
    const participantSubtotal = calculateSubtotal(participant);
    if (totalReceiptSubtotal === 0) return 0;
    const proportionalDiscount = (participantSubtotal / totalReceiptSubtotal) * globalDiscountAmount;
    return proportionalDiscount;
  };

  // FUNGSI BARU: Menghitung jumlah Service Charge proporsional per peserta
  const calculateServiceChargeAmountForParticipant = (participant) => {
    const participantSubtotal = calculateSubtotal(participant);
    const discountAmountForParticipant = calculateDiscountAmount(participant);
    const subtotalAfterDiscount = participantSubtotal - discountAmountForParticipant;

    const totalReceiptSubtotalAfterDiscount = totalReceiptSubtotal - globalDiscountAmount;
    // Hindari pembagian dengan nol atau nilai negatif
    if (totalReceiptSubtotalAfterDiscount <= 0) return 0; 

    return (subtotalAfterDiscount / totalReceiptSubtotalAfterDiscount) * globalServiceChargeAmount;
  };

  // FUNGSI BARU: Menghitung jumlah Tax proporsional per peserta
  const calculateTaxAmountForParticipant = (participant) => {
    const participantSubtotal = calculateSubtotal(participant);
    const discountAmountForParticipant = calculateDiscountAmount(participant);
    const serviceChargeAmountForParticipant = calculateServiceChargeAmountForParticipant(participant);

    const subtotalAfterDiscountAndServiceCharge = participantSubtotal - discountAmountForParticipant + serviceChargeAmountForParticipant;
    
    const totalReceiptSubtotalAfterDiscountAndServiceCharge = totalReceiptSubtotal - globalDiscountAmount + globalServiceChargeAmount;
    // Hindari pembagian dengan nol atau nilai negatif
    if (totalReceiptSubtotalAfterDiscountAndServiceCharge <= 0) return 0;
    
    // <<< DEBUGGING: Coba log nilai-nilai ini
    // console.log('DEBUG Tax Calc - participantSubtotal:', participantSubtotal);
    // console.log('DEBUG Tax Calc - discountAmountForParticipant:', discountAmountForParticipant);
    // console.log('DEBUG Tax Calc - serviceChargeAmountForParticipant:', serviceChargeAmountForParticipant);
    // console.log('DEBUG Tax Calc - subtotalAfterDiscountAndServiceCharge:', subtotalAfterDiscountAndServiceCharge);
    // console.log('DEBUG Tax Calc - totalReceiptSubtotalAfterDiscountAndServiceCharge:', totalReceiptSubtotalAfterDiscountAndServiceCharge);
    // console.log('DEBUG Tax Calc - globalTaxAmount:', globalTaxAmount);


    return (subtotalAfterDiscountAndServiceCharge / totalReceiptSubtotalAfterDiscountAndServiceCharge) * globalTaxAmount;
  };

  // FUNGSI INI DIUBAH UNTUK MENGGUNAKAN NILAI ABSOLUT YANG DIPROPORSIKAN
  const calculateTotalOwed = (participant) => {
    const subtotal = calculateSubtotal(participant);
    const discountAmountForParticipant = calculateDiscountAmount(participant);
    const serviceChargeAmountForParticipant = calculateServiceChargeAmountForParticipant(participant);
    const taxAmountForParticipant = calculateTaxAmountForParticipant(participant);
    
    let total = subtotal;
    total -= discountAmountForParticipant;
    total += serviceChargeAmountForParticipant;
    // <<< DEBUGGING: Coba log nilai total sebelum dan sesudah penambahan tax
    // console.log('DEBUG Owed Calc - total before tax:', total);
    total += taxAmountForParticipant;
    // console.log('DEBUG Owed Calc - total after tax:', total);
    // console.log('DEBUG Owed Calc - taxAmountForParticipant:', taxAmountForParticipant);

    total += (participant.additionalFees || 0);

    return total;
  };

  // FUNGSI INI DIUBAH UNTUK MENGGABUNGKAN TOTAL SERVICE CHARGE DAN TAX PROPORSIONAL
  const calculateTaxAndServiceCharge = (participant) => {
    const serviceCharge = calculateServiceChargeAmountForParticipant(participant);
    const tax = calculateTaxAmountForParticipant(participant);
    return serviceCharge + tax;
  };


  // Menghitung total keseluruhan yang telah dialokasikan ke semua peserta
  const grandTotalAssigned = participants.reduce((sum, p) => sum + calculateTotalOwed(p), 0);

  useEffect(() => {
    console.log("receiptData");
    console.log(receiptData);
  }, [receiptData]);

  // --- Fungsi untuk mereset Redux store dan navigasi ---
  const handleStartNewBill = () => {
    dispatch({ type: 'app/resetStore' }); // Dispatch aksi reset
    navigate('/'); // Kemudian navigasi ke halaman utama
  };

  // --- Rendering UI ---
  return (
    <div className="flex flex-col items-center justify-center h-screen font-sans" style={{ backgroundColor: '#F8F4ED' }}>
      <div className="bg-white rounded-lg shadow-md w-full max-w-xs md:max-w-sm p-4 flex flex-col h-full max-h-[95vh]">
        {/* Header Modal */}
        <div className="flex justify-between items-center pb-4 flex-none">
          <span className="text-xl font-semibold text-gray-800 mx-auto">Split Complete</span>
          {/* Tombol Close/X */}
          <button className="text-gray-500 hover:text-gray-700" onClick={() => navigate('/')}>
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

        {/* Total Section (Global) */}
        <div className="mb-6 flex-none">
          <div className="flex items-center text-gray-800 font-semibold mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <p className="text-lg">Total</p>
          </div>
          <p className="text-sm text-gray-600 ml-8">You paid ${grandTotalAssigned.toFixed(0)}</p>
        </div>

        {/* Scrollable Participant Sections */}
        <div className='flex-grow overflow-y-auto pr-2'>
          {participants.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No participants found or items assigned.</p>
          ) : (
            participants.map(participant => (
              <div key={participant.id} className="mb-6">
                <div className="flex items-center mb-3">
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <h2 className="text-lg font-semibold text-gray-800">
                    {participant.name}
                  </h2>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  {/* Total Participant */}
                  <div className="flex items-center text-gray-800 font-semibold mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <p className="text-md">Total</p>
                    <span className="ml-auto font-bold">${calculateTotalOwed(participant).toFixed(0)}</span>
                  </div>

                  {/* Rincian Item Participant */}
                  {participant.assignedItems.length > 0 && (
                    <ul className="list-none p-0 mt-3 border-t border-gray-200 pt-3">
                      {participant.assignedItems.map((assigned, index) => {
                        const item = getItemDetails(assigned.itemId);
                        if (!item || assigned.quantity === 0) return null;
                        return (
                          <li key={index} className="flex justify-between text-gray-700 text-sm mb-1">
                            <span>{item.name} x{assigned.quantity}</span>
                            <span>${((item.price || 0) * assigned.quantity).toFixed(0)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Rincian Biaya Tambahan Participant */}
                  <ul className="list-none p-0 mt-3 border-t border-gray-200 pt-3 text-sm text-gray-600">
                    <li className="flex justify-between mb-1">
                      <span>Subtotal</span>
                      <span>${calculateSubtotal(participant).toFixed(0)}</span>
                    </li>
                    {/* Baris Diskon */}
                    {globalDiscountAmount > 0 && calculateDiscountAmount(participant) > 0 && (
                      <li className="flex justify-between mb-1 text-red-500 font-semibold">
                        <span>Discount</span>
                        <span>-${calculateDiscountAmount(participant).toFixed(0)}</span>
                      </li>
                    )}
                    {/* Tampilkan Tax & Service Charge jika totalnya > 0 */}
                    {calculateTaxAndServiceCharge(participant) > 0 && (
                      <li className="flex justify-between mb-1">
                        <span>Tax & Service Charge</span>
                        <span>${calculateTaxAndServiceCharge(participant).toFixed(0)}</span>
                      </li>
                    )}
                    {participant.additionalFees > 0 && (
                      <li className="flex justify-between mb-1">
                        <span>Other Fees</span>
                        <span>${participant.additionalFees.toFixed(0)}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>


        {/* Start a new bill Button */}
        <div className="pt-4 flex-none">
          <button
            className="w-full py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: '#ED8936' }}
            onClick={handleStartNewBill} // Panggil fungsi handleStartNewBill
          >
            Start a new bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default SplitCompletePage;
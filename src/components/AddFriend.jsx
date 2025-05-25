import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import hooks Redux
import {
  addFriend,
  updateFriendName,
  removeFriend,
  setFriends, // Import setFriends
} from '../redux/actions/friendActions'; // Sesuaikan path jika berbeda

function AddFriends() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Ambil daftar teman dari Redux store
  const friends = useSelector((state) => state.friends.friends);

  // useEffect untuk menginisialisasi setidaknya 2 teman jika daftar kosong
  useEffect(() => {
    if (friends.length === 0) {
      // Inisialisasi dengan 2 teman kosong
      dispatch(setFriends([
        { id: 1, name: '' },
        { id: 2, name: '' }
      ]));
    }
  }, [friends.length, dispatch]); // Terpicu hanya saat friends.length berubah atau dispatch berubah

  const handleNameChange = (id, event) => {
    dispatch(updateFriendName(id, event.target.value));
  };

  const addFriendInput = () => {
    // Cari ID terbesar yang ada, lalu tambahkan 1 untuk ID baru
    const newId = friends.length > 0 ? Math.max(...friends.map(f => f.id)) + 1 : 1;
    dispatch(addFriend({ id: newId, name: '' }));
  };

  const removeFriendInput = (idToRemove) => {
    if (friends.length > 2) { // Minimal harus ada 2 teman
      dispatch(removeFriend(idToRemove));
    } else {
      alert("Minimal harus ada dua teman."); // Ubah pesan alert
    }
  };

  const handleDone = () => {
    const addedFriends = friends.filter(friend => friend.name.trim() !== '');

    if (addedFriends.length === 0) {
        alert("Harap masukkan setidaknya satu nama teman.");
        return;
    }

    // Pastikan tidak ada nama teman yang duplikat (opsional, tapi baik untuk data bersih)
    const uniqueFriendNames = new Set(addedFriends.map(f => f.name.trim().toLowerCase()));
    if (uniqueFriendNames.size !== addedFriends.length) {
        alert("Terdapat nama teman yang sama. Harap gunakan nama yang unik.");
        return;
    }

    console.log("Friends added:", addedFriends);
    // Data teman sudah ada di Redux, jadi tidak perlu meneruskannya via navigate state.
    navigate('/split_bill'); // Arahkan ke halaman selanjutnya (misal: /split-bill)
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 font-sans">
      {/* Container utama modal, sesuaikan max-w-sm atau max-w-xs untuk lebih sempit */}
      <div className="bg-white rounded-lg shadow-md w-full max-w-xs md:max-w-sm p-4">
        {/* Header */}
        <div className="flex items-center pb-4">
          <button className="text-gray-800 mr-4" onClick={() => navigate(-1)}> {/* Tombol back */}
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
          <h1 className="text-xl font-semibold text-gray-800">Add friends</h1>
        </div>

        {/* Main Content (Input fields) */}
        <div className="flex flex-col items-center py-4 overflow-y-auto max-h-[17rem] md:max-h-80"> {/* overflow-y-auto, bukan overflow-scroll */}
          {friends.map(friend => (
            <div key={friend.id} className="relative w-full mb-4">
              <input
                type="text"
                placeholder="Name"
                value={friend.name}
                onChange={(e) => handleNameChange(friend.id, e)}
                className="w-full p-3 pl-4 pr-20 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-brown-500 placeholder-gray-500 text-gray-800"
                style={{ backgroundColor: '#F8F4ED', borderColor: '#D9D9D9' }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {friends.length > 2 && ( // Tombol hapus muncul jika teman lebih dari 2
                  <button
                    onClick={() => removeFriendInput(friend.id)}
                    className="text-gray-500 hover:text-red-500 mr-2"
                    aria-label="Remove friend"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Done Button */}
        <div className='flex flex-col gap-2'>
          <button
            onClick={addFriendInput}
            className="w-full py-3 mt-4 text-center text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-100"
            style={{ borderColor: '#D9D9D9' }}
          >
            Add another friend
          </button>
          <button
            onClick={handleDone}
            className="w-full py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: '#A08F7B' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddFriends;
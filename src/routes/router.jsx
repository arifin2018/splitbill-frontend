import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReceiptUpload from "../components/ReceiptUpload";
import ReceiptDetails from "../components/ReceiptDetails";
import AddFriend from "../components/AddFriend";
import SplitBillPage from "../components/SplitBillPage";
import SplitCompletePage from "../components/SplitCompletePage";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReceiptUpload />} /> {/* Rute untuk halaman upload */}
        <Route path="/details" element={<ReceiptDetails />} /> {/* Rute untuk halaman detail */}
        <Route path="/add_friend" element={<AddFriend />} />
        <Route path="/split_bill" element={<SplitBillPage />} />
        <Route path="/split_complete" element={<SplitCompletePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
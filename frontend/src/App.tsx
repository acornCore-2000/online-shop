import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Unisex from "./pages/Unisex";
import WinterCollectionMen from "./pages/WinterCollectionMen";
import SummerCollectionMen from "./pages/SummerCollectionMen";
import WinterCollectionWomen from "./pages/WinterCollectionWomen";
import SummerCollectionWomen from "./pages/SummerCollectionWomen";
import SummerCollectionUnisex from "./pages/SummerCollectionUnisex";
import WinterCollectionUnisex from "./pages/WinterCollectionUnisex";
import WinterShoeMen from "./pages/WinterShoeMen";
import SummerShoeMen from "./pages/SummerShoeMen";
import WinterShoeWomen from "./pages/WinterShoeWomen";
import SummerShoeWomen from "./pages/SummerShoeWomen";
import WinterShoeUnisex from "./pages/WinterShoeUnisex";
import SummerShoeUnisex from "./pages/SummerShoeUnisex";
import WinterClothingMen from "./pages/WinterClothingMen";
import SummerClothingMen from "./pages/SummerClothingMen";
import WinterClothingWomen from "./pages/WinterClothingWomen";
import SummerClothingWomen from "./pages/SummerClothingWomen";
import WinterClothingUnisex from "./pages/WinterClothingUnisex";
import SummerClothingUnisex from "./pages/SummerClothingUnisex";
import WinterAccessoriesMen from "./pages/WinterAccessoriesMen";
import SummerAccessoriesMen from "./pages/SummerAccessoriesMen";
import WinterAccessoriesWomen from "./pages/WinterAccessoriesWomen";
import SummerAccessoriesWomen from "./pages/SummerAccessoriesWomen";
import WinterAccessoriesUnisex from "./pages/WinterAccessoriesUnisex";
import SummerAccessoriesUnisex from "./pages/SummerAccessoriesUnisex";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Header from "./components/Header";
import BackButton from "./components/BackButton";

function AppLayout() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/profile" && <Header />}
      {location.pathname !== "/" && <BackButton />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/Women" element={<Women />} />
        <Route path="/Men" element={<Men />} />
        <Route path="/Unisex" element={<Unisex />} />
        <Route path="/cart" element={<Cart />} />

        
        <Route path="/men/Winter" element={<WinterCollectionMen />} />
        <Route path="/men/Summer" element={<SummerCollectionMen />} />
        <Route path="/men/winter/Shoes" element={<WinterShoeMen />} />
        <Route path="/men/summer/Shoes" element={<SummerShoeMen />} />
        <Route path="/men/winter/Clothing" element={<WinterClothingMen />} />
        <Route path="/men/summer/Clothing" element={<SummerClothingMen />} />
        <Route path="/men/winter/Accessories" element={<WinterAccessoriesMen />} />
        <Route path="/men/summer/Accessories" element={<SummerAccessoriesMen />} />

        <Route path="/women/Winter" element={<WinterCollectionWomen />} />
        <Route path="/women/Summer" element={<SummerCollectionWomen />} />
        <Route path="/women/winter/Shoes" element={<WinterShoeWomen />} />
        <Route path="/women/summer/Shoes" element={<SummerShoeWomen />} />
        <Route path="/women/winter/Clothing" element={<WinterClothingWomen />} />
        <Route path="/women/summer/Clothing" element={<SummerClothingWomen />} />
        <Route path="/women/winter/Accessories" element={<WinterAccessoriesWomen />} />
        <Route path="/women/summer/Accessories" element={<SummerAccessoriesWomen />} />

       
        <Route path="/unisex/Winter" element={<WinterCollectionUnisex />} />
        <Route path="/unisex/Summer" element={<SummerCollectionUnisex />} />
        <Route path="/unisex/winter/Shoes" element={<WinterShoeUnisex />} />
        <Route path="/unisex/summer/Shoes" element={<SummerShoeUnisex />} />
        <Route path="/unisex/winter/Clothing" element={<WinterClothingUnisex />} />
        <Route path="/unisex/summer/Clothing" element={<SummerClothingUnisex />} />
        <Route path="/unisex/winter/Accessories" element={<WinterAccessoriesUnisex />} />
        <Route path="/unisex/summer/Accessories" element={<SummerAccessoriesUnisex />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
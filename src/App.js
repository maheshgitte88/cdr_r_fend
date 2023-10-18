import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserData from './Comp/userData';
import './App.css';
import HomePage from './Comp/HomePage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/user/:userFullName" element={<UserData />} />
      </Routes>
    </BrowserRouter>

  );
}
export default App;

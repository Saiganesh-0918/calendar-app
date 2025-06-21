import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Routes } from 'react-router-dom';
import CalendarPage from "./components/CalendarPage";
import AadhaarVerificationPage from "./components/AadhaarVerificationPage";

function App() {
  // return <CalendarPage />;
  return (
  <Router>
      <div>
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/calendar-page">Calendar Page</a>
            </li>
            <li>
              <a href="/aadhaar-verification">Aadhaar Verification Page</a>
            </li>
          </ul>
        </nav>

        <Routes> {/* Use Routes instead of Switch */}
          <Route path="/calendar-page" element={<CalendarPage />} /> {/* Updated to use element prop */}
          <Route path="/aadhaar-verification" element={<AadhaarVerificationPage />} /> {/* Updated to use element prop */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

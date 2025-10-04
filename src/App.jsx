import Header from './components/Header.jsx'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import EmployeeManagement from './pages/EmployeeManagement.jsx'
import Home from './pages/Home.jsx'
import Footer from './components/Footer.jsx'
import {NameContextProvider} from './context/NameContext.jsx'

function App() {

  return (
    <div className = {"wrapper"}>
    <NameContextProvider>
    <BrowserRouter>
    <Header />
    <br />
    <br />
    <div className = {"content"}>
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/employeemanagement" element={<EmployeeManagement />} />
      </Routes>
    </div>
    <Footer />
    </BrowserRouter>
    </NameContextProvider>
    </div>
  )
}

export default App





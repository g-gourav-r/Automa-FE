import { Routes, Route } from 'react-router-dom'
import InvoiceParser from './pages/InvoiceParser' 
import FileUpload from './pages/FileUpload'  

function App() {
  return (
    <div>
      <Routes>

        {/* Route for review page */}
        <Route path="/" element={<FileUpload />} />
        
        {/* Route for home page */}
        <Route path="/review" element={<InvoiceParser />} />
      </Routes>
    </div>
  )
}

export default App

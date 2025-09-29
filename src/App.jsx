import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductionProvider } from './context/ProductionContext';
import { Layout } from './components/Layout';
import { FormPage } from './pages/FormPage';
import { OrdersPage } from './pages/OrdersPage';
import { PlanningPage } from './pages/PlanningPage';

function App() {
  return (
    <ProductionProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<FormPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/planning" element={<PlanningPage />} />
          </Routes>
        </Layout>
      </Router>
    </ProductionProvider>
  );
}

export default App;
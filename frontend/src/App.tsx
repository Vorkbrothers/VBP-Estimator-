import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BidDetail from './pages/BidDetail';
import Layout from './components/Layout';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bids/:id" element={<BidDetail />} />
      </Routes>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { Heart, Recycle, TrendingUp, Package, AlertCircle, MessageSquare, Pin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyRequests } from '../services/requestService';
import { toast } from 'react-toastify';




const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch active/pinned requests
      const requests = await getMyRequests();
      // Filter to show only non-cancelled active requests
      const active = requests.filter(r => 
        ['NEGOTIATING', 'CONFIRMED', 'ACTIVE'].includes(r.status) && r.status !== 'CANCELLED'
      );
      setActiveRequests(active);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      setError(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
        </div>
      </Layout>
    );
  }

  const stats = {};

  return (
    <Layout>
      <div className="fade-in">
        
      </div>
    </Layout>
  );
};

export default Dashboard;

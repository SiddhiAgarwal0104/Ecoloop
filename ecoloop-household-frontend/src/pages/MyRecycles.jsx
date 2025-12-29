import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from '../api/axios';
import { Plus, Recycle as RecycleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const MyRecycles = () => {
  const [recycles, setRecycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecycles();
  }, []);

  const fetchRecycles = async () => {
    try {
      const response = await axios.get('/recycle/my');
      setRecycles(response.data.data?.recycleRequests || []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch recycles:', error);
      setError(error.message || 'Failed to load recycles');
      setRecycles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecycles = recycles.filter((r) =>
    filter === 'ALL' ? true : r.status === filter
  );

  if (loading) {
    return (
      
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
        </div>
      
    );
  }

  if (error) {
    return (
      
        <div className="card bg-red-50 border border-red-200 p-6">
          <p className="text-red-600 font-semibold">Error: {error}</p>
          <button onClick={fetchRecycles} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      
    );
  }

  return (
   
      <div className="fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-eco-dark mb-2">My Recycle Requests</h1>
            <p className="text-gray-600">Track all your recycling contributions</p>
          </div>
          <Link to="/recycles/create" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            <span>New Recycle</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4">
            {['ALL', 'AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'RECYCLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${
                  filter === status
                    ? 'bg-eco-main text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Recycles Grid */}
        {filteredRecycles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecycles.map((recycle) => (
              <div key={recycle._id} className="card hover:shadow-2xl transition">
                {recycle.images?.[0] && (
                  <img
                    src={recycle.images[0]}
                    alt={recycle.wasteCategory}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-eco-dark">{recycle.wasteCategory}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    recycle.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    recycle.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-700' :
                    recycle.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {recycle.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Type:</strong> {recycle.wasteType}</p>
                  <p><strong>Quantity:</strong> {recycle.quantity} {recycle.unit}</p>
                  <p><strong>Location:</strong> {recycle.pickupLocation.address}</p>
                  {recycle.assignedRecycler && (
                    <p><strong>Recycler:</strong> {recycle.assignedRecycler.name}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {format(new Date(recycle.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <RecycleIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No recycle requests found</p>
          </div>
        )}
      </div>
    
  );
};

export default MyRecycles;

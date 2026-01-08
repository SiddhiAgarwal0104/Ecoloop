import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RequestForm from '../components/request/RequestForm';
import { createRequest } from '../services/requestService';
import { toast } from 'react-toastify';

const CreateRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      console.log('📝 Submitting request with data:', formData);
      
      const result = await createRequest(formData);
      console.log('✅ Request created successfully:', result);
      
      toast.success('Request created successfully!');
      navigate('/community/requests');
    } catch (error) {
      console.error('❌ Error details:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to create request';
      
      console.error('Error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/community/requests');
  };

  return (
    <div className="min-h-screen bg-eco-light p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/community/requests')}
            className="flex items-center gap-2 text-gray-600 hover:text-eco-main transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Requests</span>
          </button>
          <h1 className="text-3xl font-bold text-eco-dark mb-2">
            Create New Request
          </h1>
          <p className="text-gray-600">
            Request an item you need from your community
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          <RequestForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
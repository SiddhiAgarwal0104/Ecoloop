import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import axios from 'axios';

const AdminReports = () => {
  const [reportType, setReportType] = useState('weekly');
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [donationStatus, setDonationStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownloadWeeklyReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        '${import.meta.env.VITE_API_URL}/api/admin/reports/weekly',
        {
          params: { days },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weekly_platform_activity_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      alert('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDonationReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        '${import.meta.env.VITE_API_URL}/api/admin/reports/donations',
        {
          params: {
            startDate,
            endDate,
            status: donationStatus
          },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `donation_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      alert('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadNGOReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        '${import.meta.env.VITE_API_URL}/api/admin/reports/ngo-performance',
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ngo_performance_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      alert('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRecyclerReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        '${import.meta.env.VITE_API_URL}/api/admin/reports/recycler-performance',
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recycler_performance_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      alert('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCombinedReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await axios.get(
        '${import.meta.env.VITE_API_URL}/api/admin/reports/combined-partners',
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `combined_partner_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      alert('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Reports & Downloads</h1>
        <p className="text-gray-600">Generate and download platform reports in Excel format</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Report Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-eco-main p-3 rounded-xl">
              <Calendar className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-eco-dark">Weekly Activity Report</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Get a comprehensive report of all platform activities (donations, recycling, pickups) from the last N days.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Days to Include
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-2">Enter number of days (1-90)</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg mb-6 border border-green-200">
            <p className="text-sm text-green-800">
              ✓ Includes donations, recycling actions, and user statistics
            </p>
            <p className="text-sm text-green-800">
              ✓ Organized in multiple sheets for easy analysis
            </p>
          </div>

          <button
            onClick={handleDownloadWeeklyReport}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Download size={20} />
                Download Weekly Report
              </>
            )}
          </button>
        </div>

        {/* Donation Report Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500 p-3 rounded-xl">
              <Calendar className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-eco-dark">Donation Report</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Filter and download specific donation data with custom date ranges and status filters.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Donation Status
              </label>
              <select
                value={donationStatus}
                onChange={(e) => setDonationStatus(e.target.value)}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleDownloadDonationReport}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Download size={20} />
                Download Donation Report
              </>
            )}
          </button>
        </div>

        {/* NGO Performance Report Card */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500 p-3 rounded-xl">
              <Calendar className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-eco-dark">NGO Performance Report</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Comprehensive performance metrics for all verified NGOs including ratings, donations received, and verification status.
          </p>

          <div className="p-4 bg-purple-50 rounded-lg mb-6 border border-purple-200">
            <p className="text-sm text-purple-800">
              ✓ Shows verification status and approval dates
            </p>
            <p className="text-sm text-purple-800">
              ✓ Includes average ratings and review counts
            </p>
            <p className="text-sm text-purple-800">
              ✓ Tracks donations completed by each NGO
            </p>
          </div>

          <button
            onClick={handleDownloadNGOReport}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Download size={20} />
                Download NGO Performance Report
              </>
            )}
          </button>
        </div>

        {/* Recycler Performance Report Card */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-600 p-3 rounded-xl">
              <Calendar className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-eco-dark">♻️ Recycler Performance Report</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Detailed performance metrics for all verified recyclers including ratings, recycling actions completed, and total waste collected.
          </p>

          <div className="p-4 bg-green-50 rounded-lg mb-6 border border-green-200">
            <p className="text-sm text-green-800">
              ✓ Shows verification status and approval dates
            </p>
            <p className="text-sm text-green-800">
              ✓ Includes average ratings and review counts
            </p>
            <p className="text-sm text-green-800">
              ✓ Tracks recycling completed and total waste collected (KG)
            </p>
          </div>

          <button
            onClick={handleDownloadRecyclerReport}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Download size={20} />
                Download Recycler Performance Report
              </>
            )}
          </button>
        </div>

        {/* Combined Partners Report Card */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Calendar className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-eco-dark">🤝 Combined Partners Report (NGO + Recyclers)</h2>
          </div>

          <p className="text-gray-600 mb-6">
            All-in-one comprehensive report combining both NGO and Recycler performance data with comparative metrics and summary statistics.
          </p>

          <div className="p-4 bg-indigo-50 rounded-lg mb-6 border border-indigo-200">
            <p className="text-sm text-indigo-800">
              ✓ Separate sheets for NGOs and Recyclers
            </p>
            <p className="text-sm text-indigo-800">
              ✓ Side-by-side comparison of both programs
            </p>
            <p className="text-sm text-indigo-800">
              ✓ Summary statistics and performance metrics
            </p>
          </div>

          <button
            onClick={handleDownloadCombinedReport}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Download size={20} />
                Download Combined Partners Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Information */}
      <div className="card mt-8 bg-blue-50 border-l-4 border-blue-500">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Report Information</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ All reports are generated in Excel (.xlsx) format</li>
          <li>✓ Multiple sheets are included for detailed breakdown</li>
          <li>✓ Timestamps are included for all records</li>
          <li>✓ Reports can be easily imported into spreadsheet applications</li>
          <li>✓ Data is sorted chronologically for easier analysis</li>
        </ul>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;

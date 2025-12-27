import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const Reports = () => {
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchReportTypes();
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(format(today, 'yyyy-MM-dd'));
    setStartDate(format(thirtyDaysAgo, 'yyyy-MM-dd'));
  }, []);

  const fetchReportTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/reports/types`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReportTypes(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report types:', error);
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedReport) {
      alert('Please select a report type');
      return;
    }

    try {
      setDownloadLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        reportType: selectedReport,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const url = `${import.meta.env.VITE_API_BASE_URL}/reports/${selectedFormat}?${params}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${selectedReport}-${format(new Date(), 'yyyy-MM-dd')}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadLoading(false);
      alert('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
      setDownloadLoading(false);
    }
  };

  const getReportIcon = (format) => {
    return <FileText className="text-eco-main" size={24} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-eco-main"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">Reports & Export</h1>
        <p className="text-gray-600">Generate and download comprehensive reports</p>
      </div>

      {/* Report Generation Form */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-eco-dark mb-6 flex items-center gap-2">
          <Filter className="text-eco-main" />
          Generate Report
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Report Type *
            </label>
            <select
              value={selectedReport}
              onChange={(e) => {
                setSelectedReport(e.target.value);
                const report = reportTypes.find(r => r.id === e.target.value);
                if (report) {
                  setSelectedFormat(report.formats[0]);
                }
              }}
              className="input-field"
            >
              <option value="">Select a report type</option>
              {reportTypes.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
            {selectedReport && (
              <p className="text-xs text-gray-500 mt-2">
                {reportTypes.find(r => r.id === selectedReport)?.description}
              </p>
            )}
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Format *
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="input-field"
              disabled={!selectedReport}
            >
              {selectedReport && reportTypes
                .find(r => r.id === selectedReport)
                ?.formats.map((format) => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Date Range (only for certain reports) */}
        {selectedReport && ['waste-logs', 'localities'].includes(selectedReport) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} />
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
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownloadReport}
          disabled={!selectedReport || downloadLoading}
          className={`btn-primary w-full flex items-center justify-center gap-2 ${
            downloadLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {downloadLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <Download size={20} />
              Download Report
            </>
          )}
        </button>
      </div>

      {/* Available Reports Grid */}
      <div>
        <h2 className="text-xl font-bold text-eco-dark mb-6">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <div
              key={report.id}
              className="card hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="flex items-start gap-4">
                <div className="bg-eco-light p-3 rounded-xl">
                  {getReportIcon(report.formats[0])}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-eco-dark mb-2">{report.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  <div className="flex gap-2">
                    {report.formats.map((format) => (
                      <span
                        key={format}
                        className="px-2 py-1 bg-eco-light text-eco-main text-xs font-semibold rounded-lg"
                      >
                        {format.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="card mt-8 bg-blue-50 border-l-4 border-blue-500">
        <h3 className="font-semibold text-blue-900 mb-2">Report Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• CSV reports contain raw data suitable for Excel and data analysis</li>
          <li>• PDF reports contain formatted summaries with visualizations</li>
          <li>• Date ranges apply only to time-based reports (waste logs, localities)</li>
          <li>• Performance reports show current snapshot data</li>
          <li>• All reports respect admin access permissions</li>
        </ul>
      </div>
    </div>
  );
};

export default Reports;
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const WasteLog = require('../models/WasteLog');
const Locality = require('../models/Locality');
const NGO = require('../models/NGO');
const Recycler = require('../models/Recycler');
const { format } = require('date-fns');

/**
 * @desc    Generate and download CSV report
 * @route   GET /api/admin/reports/csv
 * @access  Private/Admin
 */
const generateCSVReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    let data = [];
    let fields = [];

    switch (reportType) {
      case 'waste-logs':
        data = await WasteLog.find({
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        })
          .populate('localityId', 'name city state')
          .populate('userId', 'name email')
          .lean();

        fields = [
          'date',
          'localityId.name',
          'localityId.city',
          'wasteType',
          'weight',
          'status',
          'impactMetrics.co2Saved',
          'impactMetrics.energySaved',
          'impactMetrics.landfillReduced'
        ];
        break;

      case 'localities':
        data = await Locality.find({}).lean();
        fields = [
          'name',
          'city',
          'state',
          'pincode',
          'totalHouseholds',
          'activeUsers',
          'participationRate',
          'wasteStats.totalWasteLogged',
          'impactMetrics.totalCO2Saved',
          'impactMetrics.totalEnergySaved'
        ];
        break;

      case 'ngos':
        data = await NGO.find({}).lean();
        fields = [
          'name',
          'email',
          'phone',
          'address.city',
          'address.state',
          'rating',
          'performanceMetrics.totalCollections',
          'performanceMetrics.totalWasteCollected',
          'isVerified',
          'isActive'
        ];
        break;

      case 'recyclers':
        data = await Recycler.find({}).lean();
        fields = [
          'name',
          'email',
          'facilityType',
          'address.city',
          'rating',
          'performanceMetrics.totalMaterialProcessed',
          'capacity.monthly',
          'isVerified',
          'isActive'
        ];
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Use: waste-logs, localities, ngos, recyclers'
        });
    }

    // Convert to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    // Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}-${Date.now()}.csv`);

    res.status(200).send(csv);
  } catch (error) {
    console.error('Generate CSV report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating CSV report',
      error: error.message
    });
  }
};

/**
 * @desc    Generate and download PDF report
 * @route   GET /api/admin/reports/pdf
 * @access  Private/Admin
 */
const generatePDFReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add header
    doc.fontSize(20).text('EcoLoop Admin Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${reportType}`, { align: 'center' });
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, { align: 'center' });
    
    if (startDate && endDate) {
      doc.text(`Period: ${format(new Date(startDate), 'dd MMM yyyy')} - ${format(new Date(endDate), 'dd MMM yyyy')}`, { align: 'center' });
    }
    
    doc.moveDown(2);

    switch (reportType) {
      case 'sustainability-impact':
        await generateSustainabilityPDF(doc, startDate, endDate);
        break;

      case 'locality-performance':
        await generateLocalityPDF(doc);
        break;

      case 'ngo-performance':
        await generateNGOPDF(doc);
        break;

      case 'recycler-performance':
        await generateRecyclerPDF(doc);
        break;

      default:
        doc.fontSize(14).text('Invalid report type', { align: 'center' });
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Generate PDF report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating PDF report',
      error: error.message
    });
  }
};

// Helper function to generate sustainability impact PDF
const generateSustainabilityPDF = async (doc, startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 12));
  const end = endDate ? new Date(endDate) : new Date();

  const stats = await WasteLog.getPlatformStats(start, end);
  const result = stats[0] || {
    totalWeight: 0,
    totalCO2Saved: 0,
    totalEnergySaved: 0,
    totalLandfillReduced: 0,
    totalLogs: 0
  };

  doc.fontSize(16).text('Sustainability Impact Summary', { underline: true });
  doc.moveDown();
  
  doc.fontSize(12);
  doc.text(`Total Waste Logged: ${result.totalWeight.toFixed(2)} kg`);
  doc.text(`Total CO2 Saved: ${result.totalCO2Saved.toFixed(2)} kg`);
  doc.text(`Total Energy Saved: ${result.totalEnergySaved.toFixed(2)} kWh`);
  doc.text(`Total Landfill Reduced: ${result.totalLandfillReduced.toFixed(2)} kg`);
  doc.text(`Total Logs: ${result.totalLogs}`);
  
  doc.moveDown();
  const treesEquivalent = (result.totalCO2Saved / 21).toFixed(0);
  doc.text(`Environmental Equivalents:`);
  doc.text(`  • Trees planted: ${treesEquivalent}`);
  doc.text(`  • Homes powered (yearly): ${(result.totalEnergySaved / 10950).toFixed(2)}`);
};

// Helper function to generate locality performance PDF
const generateLocalityPDF = async (doc) => {
  const topLocalities = await Locality.getTopPerformers(10);
  
  doc.fontSize(16).text('Top Performing Localities', { underline: true });
  doc.moveDown();
  
  doc.fontSize(10);
  topLocalities.forEach((locality, index) => {
    doc.text(`${index + 1}. ${locality.name}, ${locality.city}`);
    doc.text(`   Participation Rate: ${locality.participationRate.toFixed(2)}%`);
    doc.text(`   Total Waste: ${locality.wasteStats.totalWasteLogged.toFixed(2)} kg`);
    doc.moveDown(0.5);
  });
};

// Helper function to generate NGO performance PDF
const generateNGOPDF = async (doc) => {
  const topNGOs = await NGO.getTopPerformers(10);
  
  doc.fontSize(16).text('Top Performing NGOs', { underline: true });
  doc.moveDown();
  
  doc.fontSize(10);
  topNGOs.forEach((ngo, index) => {
    doc.text(`${index + 1}. ${ngo.name}`);
    doc.text(`   Rating: ${ngo.rating.toFixed(1)} / 5.0`);
    doc.text(`   Total Collections: ${ngo.performanceMetrics.totalCollections}`);
    doc.text(`   Waste Collected: ${ngo.performanceMetrics.totalWasteCollected.toFixed(2)} kg`);
    doc.moveDown(0.5);
  });
};

// Helper function to generate recycler performance PDF
const generateRecyclerPDF = async (doc) => {
  const topRecyclers = await Recycler.getTopPerformers(10);
  
  doc.fontSize(16).text('Top Performing Recyclers', { underline: true });
  doc.moveDown();
  
  doc.fontSize(10);
  topRecyclers.forEach((recycler, index) => {
    doc.text(`${index + 1}. ${recycler.name}`);
    doc.text(`   Facility Type: ${recycler.facilityType}`);
    doc.text(`   Rating: ${recycler.rating.toFixed(1)} / 5.0`);
    doc.text(`   Material Processed: ${recycler.performanceMetrics.totalMaterialProcessed.toFixed(2)} kg`);
    doc.moveDown(0.5);
  });
};

/**
 * @desc    Get available report types
 * @route   GET /api/admin/reports/types
 * @access  Private/Admin
 */
const getReportTypes = async (req, res) => {
  try {
    const reportTypes = [
      {
        id: 'waste-logs',
        name: 'Waste Logs Report',
        description: 'Detailed waste logging data',
        formats: ['csv']
      },
      {
        id: 'localities',
        name: 'Localities Report',
        description: 'All locality data and statistics',
        formats: ['csv']
      },
      {
        id: 'ngos',
        name: 'NGO Report',
        description: 'NGO performance and details',
        formats: ['csv']
      },
      {
        id: 'recyclers',
        name: 'Recycler Report',
        description: 'Recycler performance and details',
        formats: ['csv']
      },
      {
        id: 'sustainability-impact',
        name: 'Sustainability Impact Report',
        description: 'Environmental impact metrics',
        formats: ['pdf']
      },
      {
        id: 'locality-performance',
        name: 'Locality Performance Report',
        description: 'Top performing localities',
        formats: ['pdf']
      },
      {
        id: 'ngo-performance',
        name: 'NGO Performance Report',
        description: 'Top performing NGOs',
        formats: ['pdf']
      },
      {
        id: 'recycler-performance',
        name: 'Recycler Performance Report',
        description: 'Top performing recyclers',
        formats: ['pdf']
      }
    ];

    res.status(200).json({
      success: true,
      data: reportTypes
    });
  } catch (error) {
    console.error('Get report types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  generateCSVReport,
  generatePDFReport,
  getReportTypes
};
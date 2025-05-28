// Google Sheets Integration Module

class SheetsAPI {
  constructor() {
    // Google Sheets App Script Web App URL - replace with your actual web app URL
    this.apiUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    
    // Mock data for development - will be replaced with actual API calls
    this.mockData = this.initializeMockData();
  }
  
  // Initialize mock data for development
  initializeMockData() {
    return {
      flight: [
        {
          id: 'f1',
          fromCity: 'Mumbai',
          toCity: 'Dubai',
          bookingDate: '2024-05-15',
          travelDate: '2024-06-01',
          costPrice: 25000,
          sellingPrice: 28000,
          notes: 'Round trip, Emirates Airlines'
        },
        {
          id: 'f2',
          fromCity: 'Chennai',
          toCity: 'Singapore',
          bookingDate: '2024-05-10',
          travelDate: '2024-06-15',
          costPrice: 30000,
          sellingPrice: 34500,
          notes: 'One way, Singapore Airlines'
        }
      ],
      hotel: [
        {
          id: 'h1',
          hotelName: 'Burj Al Arab',
          location: 'Dubai, UAE',
          checkInDate: '2024-06-01',
          checkOutDate: '2024-06-05',
          costPrice: 120000,
          sellingPrice: 135000,
          notes: 'Deluxe suite, breakfast included'
        }
      ],
      tour: [
        {
          id: 't1',
          destination: 'Bali, Indonesia',
          travelDate: '2024-07-10',
          returnDate: '2024-07-17',
          costPrice: 85000,
          sellingPrice: 98000,
          details: 'Includes hotel, flights, and local tours',
          notes: '4-star accommodation, all meals included'
        }
      ],
      forex: [
        {
          id: 'fx1',
          currency: 'USD',
          amount: 5000,
          exchangeRate: 83.5,
          totalAmount: 417500,
          transactionDate: '2024-05-20',
          notes: 'For Dubai trip'
        }
      ],
      wajibath: [
        {
          id: 'w1',
          amountPaid: 50000,
          datePaid: '2024-05-01',
          notes: 'Hajj arrangement fee'
        }
      ],
      car: [
        {
          id: 'c1',
          fromLocation: 'Chennai',
          toLocation: 'Pondicherry',
          hireDate: '2024-05-25',
          returnDate: '2024-05-27',
          costPrice: 5000,
          sellingPrice: 6500,
          notes: 'SUV, with driver'
        }
      ],
      visa: [
        {
          id: 'v1',
          country: 'UAE',
          costPrice: 8000,
          sellingPrice: 10000,
          applicationDate: '2024-05-05',
          notes: '30-day tourist visa'
        }
      ],
      train: [
        {
          id: 'tr1',
          fromCity: 'Chennai',
          toCity: 'Delhi',
          bookingDate: '2024-05-18',
          travelDate: '2024-06-10',
          costPrice: 3500,
          sellingPrice: 4200,
          notes: 'AC First Class, Rajdhani Express'
        }
      ]
    };
  }
  
  // Get all records for a specific service
  async getRecords(service) {
    try {
      // In production, this would call the actual API
      // return await fetch(`${this.apiUrl}?action=getRecords&service=${service}`).then(res => res.json());
      
      // For development, use mock data
      return this.mockData[service] || [];
    } catch (error) {
      console.error(`Error fetching ${service} records:`, error);
      return [];
    }
  }
  
  // Add a new record
  async addRecord(service, record) {
    try {
      // In production, this would call the actual API
      // return await fetch(`${this.apiUrl}?action=addRecord&service=${service}`, {
      //   method: 'POST',
      //   body: JSON.stringify(record)
      // }).then(res => res.json());
      
      // For development, add to mock data
      record.id = this.generateId(service);
      this.mockData[service] = this.mockData[service] || [];
      this.mockData[service].push(record);
      return { success: true, record };
    } catch (error) {
      console.error(`Error adding ${service} record:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Update an existing record
  async updateRecord(service, record) {
    try {
      // In production, this would call the actual API
      // return await fetch(`${this.apiUrl}?action=updateRecord&service=${service}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(record)
      // }).then(res => res.json());
      
      // For development, update in mock data
      const index = this.mockData[service].findIndex(r => r.id === record.id);
      if (index !== -1) {
        this.mockData[service][index] = record;
        return { success: true, record };
      }
      return { success: false, error: 'Record not found' };
    } catch (error) {
      console.error(`Error updating ${service} record:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Delete a record
  async deleteRecord(service, recordId) {
    try {
      // In production, this would call the actual API
      // return await fetch(`${this.apiUrl}?action=deleteRecord&service=${service}&id=${recordId}`, {
      //   method: 'DELETE'
      // }).then(res => res.json());
      
      // For development, delete from mock data
      const index = this.mockData[service].findIndex(r => r.id === recordId);
      if (index !== -1) {
        this.mockData[service].splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Record not found' };
    } catch (error) {
      console.error(`Error deleting ${service} record:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // Get summary statistics
  async getSummaryStats() {
    try {
      // In production, this would call the actual API
      // return await fetch(`${this.apiUrl}?action=getSummaryStats`).then(res => res.json());
      
      // For development, calculate from mock data
      const stats = {
        totalCost: 0,
        totalRevenue: 0,
        totalProfit: 0,
        totalBookings: 0,
        serviceStats: {}
      };
      
      // Services that have cost and selling price
      const services = ['flight', 'hotel', 'tour', 'forex', 'car', 'visa', 'train'];
      
      services.forEach(service => {
        if (!this.mockData[service]) return;
        
        const serviceData = this.mockData[service];
        const serviceTotalCost = serviceData.reduce((sum, record) => sum + (parseFloat(record.costPrice) || 0), 0);
        const serviceTotalRevenue = serviceData.reduce((sum, record) => sum + (parseFloat(record.sellingPrice) || 0), 0);
        
        stats.totalCost += serviceTotalCost;
        stats.totalRevenue += serviceTotalRevenue;
        stats.totalBookings += serviceData.length;
        
        stats.serviceStats[service] = {
          totalCost: serviceTotalCost,
          totalRevenue: serviceTotalRevenue,
          totalProfit: serviceTotalRevenue - serviceTotalCost,
          count: serviceData.length
        };
      });
      
      // Special handling for wajibath (only has amount paid)
      if (this.mockData.wajibath) {
        const wajibathTotalCost = this.mockData.wajibath.reduce((sum, record) => sum + (parseFloat(record.amountPaid) || 0), 0);
        stats.totalCost += wajibathTotalCost;
        stats.totalBookings += this.mockData.wajibath.length;
        
        stats.serviceStats.wajibath = {
          totalCost: wajibathTotalCost,
          totalRevenue: 0,
          totalProfit: -wajibathTotalCost,
          count: this.mockData.wajibath.length
        };
      }
      
      stats.totalProfit = stats.totalRevenue - stats.totalCost;
      
      return stats;
    } catch (error) {
      console.error('Error fetching summary stats:', error);
      return {
        totalCost: 0,
        totalRevenue: 0,
        totalProfit: 0,
        totalBookings: 0,
        serviceStats: {}
      };
    }
  }
  
  // Get recent bookings across all services
  async getRecentBookings(limit = 10) {
    try {
      // In production, this would call the actual API
      // return await fetch(`${this.apiUrl}?action=getRecentBookings&limit=${limit}`).then(res => res.json());
      
      // For development, aggregate from mock data
      const bookings = [];
      
      // Map service names to display names
      const serviceNames = {
        flight: 'Flight Ticket',
        hotel: 'Hotel Reservation',
        tour: 'Tour Package',
        forex: 'Foreign Exchange',
        wajibath: 'Wajibath',
        car: 'Car Rental',
        visa: 'Visa',
        train: 'Train Booking'
      };
      
      // Collect all bookings with their service type
      Object.keys(this.mockData).forEach(service => {
        if (!this.mockData[service]) return;
        
        this.mockData[service].forEach(record => {
          // Get the date field depending on the service
          let date;
          let cost = 0;
          let revenue = 0;
          
          if (service === 'flight' || service === 'train' || service === 'visa') {
            date = record.bookingDate;
            cost = parseFloat(record.costPrice) || 0;
            revenue = parseFloat(record.sellingPrice) || 0;
          } else if (service === 'hotel') {
            date = record.checkInDate;
            cost = parseFloat(record.costPrice) || 0;
            revenue = parseFloat(record.sellingPrice) || 0;
          } else if (service === 'tour') {
            date = record.travelDate;
            cost = parseFloat(record.costPrice) || 0;
            revenue = parseFloat(record.sellingPrice) || 0;
          } else if (service === 'forex') {
            date = record.transactionDate;
            cost = 0;  // Forex doesn't have a cost
            revenue = parseFloat(record.totalAmount) || 0;
          } else if (service === 'wajibath') {
            date = record.datePaid;
            cost = parseFloat(record.amountPaid) || 0;
            revenue = 0;  // Wajibath doesn't generate revenue
          } else if (service === 'car') {
            date = record.hireDate;
            cost = parseFloat(record.costPrice) || 0;
            revenue = parseFloat(record.sellingPrice) || 0;
          }
          
          bookings.push({
            serviceType: serviceNames[service],
            date,
            cost,
            revenue,
            profit: revenue - cost,
            id: record.id,
            serviceKey: service
          });
        });
      });
      
      // Sort by date (most recent first) and take the specified limit
      return bookings
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      return [];
    }
  }
  
  // Generate CSV for a service
  generateCsv(service) {
    try {
      if (!this.mockData[service] || this.mockData[service].length === 0) {
        return '';
      }
      
      const records = this.mockData[service];
      const headers = Object.keys(records[0]).filter(key => key !== 'id');
      
      // Create CSV header row
      let csv = headers.map(header => {
        // Format header (e.g., 'fromCity' -> 'From City')
        return header
          .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
          .replace(/^./, str => str.toUpperCase())  // Capitalize first letter
          .trim();
      }).join(',') + '\n';
      
      // Add data rows
      records.forEach(record => {
        const row = headers.map(header => {
          let value = record[header] || '';
          // Escape quotes and wrap in quotes if value contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
        
        csv += row + '\n';
      });
      
      return csv;
    } catch (error) {
      console.error(`Error generating CSV for ${service}:`, error);
      return '';
    }
  }
  
  // Download CSV for a service
  downloadCsv(service, filename) {
    const csv = this.generateCsv(service);
    if (!csv) {
      alert('No data available to download');
      return;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `${service}_data.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Generate a unique ID for a new record
  generateId(service) {
    const prefix = service.charAt(0);
    const existingIds = this.mockData[service].map(r => r.id);
    let counter = 1;
    
    while (existingIds.includes(`${prefix}${counter}`)) {
      counter++;
    }
    
    return `${prefix}${counter}`;
  }
}

// Create and export a singleton instance
const sheetsAPI = new SheetsAPI();
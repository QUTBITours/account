# QT Holidays - Travel Management System

A comprehensive travel management system for QT Holidays travel agency, allowing them to track various travel services, monitor finances, and download reports.

## Features

- **User Authentication**: Simple front-end authentication system
- **Dashboard**: Overview of all services with financial summary
- **Multiple Service Management**:
  - Flight Tickets
  - Hotel Reservations
  - Tour Packages
  - Foreign Exchange
  - Wajibath
  - Car Rental
  - Visa Services
  - Train Bookings
- **Financial Tracking**: Monitor costs, revenue, and profit
- **Data Export**: Download service data as CSV/Excel
- **Google Sheets Integration**: Store all data in Google Sheets for easy access

## Setup Instructions

1. Clone the repository
2. Open the project in your favorite code editor
3. To connect with Google Sheets, create a Google Apps Script web app:
   - Create a new Google Sheets document with tabs for each service
   - Go to Extensions > Apps Script
   - Create a web app that exposes the necessary functions
   - Replace the API URL in `sheets.js` with your deployed web app URL

## Technologies Used

- HTML5, CSS3, JavaScript (vanilla)
- Google Sheets API for data storage
- Chart.js for data visualization

## Service Modules

The system includes dedicated modules for each service:

1. **Flight Tickets**: Track flight bookings, costs, and revenue
2. **Hotel Reservations**: Manage hotel bookings and associated finances
3. **Tour Packages**: Track comprehensive tour packages
4. **Foreign Exchange**: Manage currency exchange transactions
5. **Wajibath**: Track religious service payments
6. **Car Rental**: Manage vehicle rentals and revenue
7. **Visa Services**: Track visa application services
8. **Train Bookings**: Manage train ticket bookings

## Google Sheets Integration

The system connects to Google Sheets via a Google Apps Script web app. This approach allows:

- Secure data storage in Google Sheets
- Easy data management and backup
- Familiar spreadsheet interface for direct data editing
- API endpoints for read/write operations from the web app

## License

This project is proprietary software for QT Holidays.
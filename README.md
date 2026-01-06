# Health Insurance Management System

A comprehensive web application for managing health insurance policies, claims, and user roles with role-based access control.

## 🏗️ Architecture

- **Backend**: ASP.NET Core Web API (.NET 9)
- **Frontend**: Angular 18 with Angular Material
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Token-based authentication
- **Testing**: xUnit for unit testing

## 📋 Prerequisites

- **Visual Studio 2022** or **Visual Studio Code**
- **.NET 9 SDK**
- **Node.js** (v18 or higher)
- **Angular CLI** (`npm install -g @angular/cli`)
- **SQL Server** (LocalDB or SQL Server Express)

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Capstone
```

### 2. Backend Setup (API)

#### Navigate to API project
```bash
cd HealthInsuranceMgmtApi/HealthInsuranceMgmtApi
```

#### Install dependencies
```bash
dotnet restore
```

#### Update database connection string
Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=HealthInsuranceDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

#### Run database migrations
```bash
dotnet ef database update
```

#### Start the API
```bash
dotnet run
```
API will run on: `https://localhost:7075`

### 3. Frontend Setup (Angular)

#### Navigate to Angular project
```bash
cd ../../HealthInsurance-app
```

#### Install dependencies
```bash
npm install
```

#### Start the Angular application
```bash
ng serve
```
Frontend will run on: `http://localhost:4200`

## 🔐 Default Credentials

### Admin User
- **Email**: `admin@healthinsurance.com`
- **Password**: `Admin123!`
- **Role**: Admin

### Insurance Agent
- **Email**: `agent@healthinsurance.com`
- **Password**: `Agent123!`
- **Role**: Insurance Agent

### Claims Officer
- **Email**: `claims@healthinsurance.com`
- **Password**: `Claims123!`
- **Role**: Claims Officer

### Hospital Staff
- **Email**: `contact@cityhealth.com`
- **Password**: `Hospital123!`
- **Role**: Hospital Staff

### Policy Holder
- **Email**: `alice@email.com`
- **Password**: `User123!`
- **Role**: Policy Holder
### Policy Holder
- **Email**: `naveen@gmail.com`
- **Password**: `Naveen@123`
- **Role**: Policy Holder
### Policy Holder
- **Email**: `priyamehta@gmail.com`
- **Password**: `Priya@123`
- **Role**: Policy Holder
### Policy Holder
- **Email**: `ravisharma@gmail.com`
- **Password**: `Ravi@123`
- **Role**: Policy Holder
### Hospital Staff
- **Email**: `contact@apollohospitals.com`
- **Password**: `Apollo@123!`
- **Role**: Hospital Staff
### for any other users email is mentioned and password is Firstname@123


## 👥 User Roles & Permissions

### 🔧 Administrator
- Manage all users, hospitals, and insurance plans
- View system-wide statistics and reports
- Full access to all system features

### 💼 Insurance Agent
- Enroll new customers (Policy Holders)
- Create and manage policies
- View customer policies and basic statistics

### 📋 Claims Officer
- Review and approve/reject claims
- Process claim payments
- View claims statistics and pending reviews

### 🏥 Hospital Staff
- Add medical notes to submitted claims
- View hospital-specific claims
- Update claim status to "In Review"

### 👤 Policy Holder
- View personal policies and claims
- Submit new claims
- Track claim status and payments

## 🌟 Key Features

- **Role-based Dashboard**: Customized views for each user type
- **Policy Management**: Create, update, and track insurance policies
- **Claims Processing**: Submit, review, and process insurance claims
- **Real-time Notifications**: System notifications for important updates
- **Payment Tracking**: Monitor claim payments and policy premiums
- **Responsive Design**: Mobile-friendly interface with Angular Material

## 🗄️ Database Schema

The system includes the following main entities:
- **Users** (with role-based access)
- **Insurance Plans** (Individual, Family, Corporate)
- **Policies** (Active, Expired, Cancelled)
- **Claims** (Submitted, InReview, Approved, Rejected, Paid)
- **Hospitals** (Network providers)
- **Payments** (Premium and claim payments)
- **Notifications** (System alerts and updates)

## 🧪 Running Tests

### Backend Tests
```bash
cd HealthInsuranceMgmtApi/HealthInsuranceTesting
dotnet test
```

### Frontend Tests
```bash
cd HealthInsurance-app
ng test
```

## 📱 Usage

1. **Login** with any of the provided credentials
2. **Navigate** through role-specific features using the sidebar
3. **Create** policies, submit claims, or manage users based on your role
4. **Monitor** real-time notifications in the top navigation bar
5. **View** dashboard statistics relevant to your role

## 🔧 Configuration

### JWT Settings
Update JWT configuration in `appsettings.json`:
```json
{
  "Jwt": {
    "Key": "your-secret-key-here",
    "Issuer": "HealthInsuranceAPI",
    "Audience": "HealthInsuranceApp",
    "ExpireMinutes": 60
  }
}
```

### CORS Settings
Frontend URL is configured for `http://localhost:4200` by default.

## 📞 Support

For setup issues or questions, please check:
1. Ensure all prerequisites are installed
2. Verify database connection string
3. Check that both API and Angular apps are running
4. Confirm JWT configuration is correct

## 🏷️ Version
**Version**: 1.0.0  
**Last Updated**: January 2025
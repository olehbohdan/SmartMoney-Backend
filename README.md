# SmartMoney Backend

## Overview
SmartMoney is an intuitive budgeting application designed to help users manage their finances seamlessly. The backend server securely manages user data, account details, transaction histories, and integrates financial services through Plaid.

## Tech Stack
- **Node.js & Express:** Robust and scalable API development
- **MongoDB:** Efficient data storage with flexibility
- **Plaid API:** Secure integration with financial institutions
- **Axios:** HTTP client for frontend-backend communication
- **Auth0:** Authentication and user management

## Features
- User authentication and secure user management via Auth0
- Real-time financial data integration using Plaid
- Transaction retrieval and categorization
- CRUD operations for managing accounts and budget items

## Installation

1. Clone this repository:
```sh
git clone https://github.com/olehbohdan/SmartMoney-Backend.git
```

2. Navigate to the backend directory:
```sh
cd SmartMoney-Backend
```

3. Install dependencies:
```sh
npm install
```

## Configuration

Create a `.env` file at the root of the project and configure it:
```env
MONGODB_URI=your_mongodb_uri
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience
```

## Running the Server

Start the backend server:
```sh
npm start
```
The server runs by default on `http://localhost:3000`.

## API Endpoints
- **Authentication:** Managed by Auth0
- **Accounts**
  - `GET /accounts` – Retrieve linked accounts
  - `POST /accounts` – Link new accounts via Plaid
- **Transactions**
  - `GET /transactions` – Fetch transactions
  - `POST /transactions` – Add custom transactions

## Continuous Integration
This project includes CI pipelines for automated testing and deployment.

## Contributing
Contributions are welcome! Create a branch, submit a pull request, and we'll review it promptly.

## Organization Repository
[SmartMoney-Backend GitHub Repository](https://github.com/WSU-4110/smartmoney-backend.git)

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details."

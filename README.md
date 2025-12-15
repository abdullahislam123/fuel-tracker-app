# ⛽ Fuel Tracker App

**Fuel Tracker** is a simple, yet powerful web application designed to help users track their vehicle's fuel expenses and consumption. It is built using the **MERN Stack** (MongoDB, Express, React, Node.js).

## 🧭 Quick Navigation

* [✨ Features](#-features)
* [🚀 Technology Stack](#-technology-stack)
* [🛠️ Project Setup](#-project-setup-for-local-development)
* [🔑 Key Code Implementation](#-key-code-implementation-details)

---

## ✨ Features

The following features and functionalities are integrated into the application, designed for better user experience and data accuracy:

### 🔒 Authentication & Security

* **Login & Registration** 🔑: Secure user sign-up and sign-in process.
* **Consistent UI** 🎨: Login and Register forms share an identical interface design, and include the **Password Show/Hide** feature (using the eye icon).
* **Profile Management** 👤: Allows users to update their personal details.
* **Permanent Account Deletion (Danger Zone)** 🗑️: Provides the option, with strong confirmation and warning, to permanently delete the user's account and all associated data from the server.

### 📝 Data Entry & Management

* **Data Entry** ⛽: Record fuel entries (Date, Time, Liters, Price per Liter, Odometer reading).
* **Accurate Cost Calculation** 🧮: Total Cost calculation (`Liters * Price`) is automatically fixed to **two decimal places** for accurate currency representation (e.g., 2382.66).
* **History & Listing** 📜: Displays a detailed list of all recorded entries.
* **Edit & Update** ✏️: Provides the functionality to edit existing fuel entries.

### 📊 Reporting & Overview

* **Dashboard Summary** 📈: Shows a summary of key metrics, including total spent and average fuel rate.

---

## 🚀 Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, **Tailwind CSS**, React Icons, React Router DOM |
| **Backend** | Node.js, **Express.js** |
| **Database** | MongoDB (**Mongoose**) |
| **Security** | **JWT** (JSON Web Tokens) |

---

## 🛠️ Project Setup (For Local Development)

The project is divided into two parts: the Backend (API) and the Frontend (Client).

### 1. Backend Setup

1.  Clone the repository and navigate to the `backend` directory:
    ```bash
    git clone [https://github.com/abdullahislam123/fuel-tracker-app](https://github.com/abdullahislam123/fuel-tracker-app)
    cd backend 
    ```

2.  Install the necessary dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file and configure the following variables:
    ```
    PORT=5000
    MONGO_URI=<Your MongoDB Atlas Connection String>
    JWT_SECRET=<Any Unique Secret Key>
    ```

4.  Start the backend server:
    ```bash
    npm start 
    ```
    *The server will be running on port 5000.*

### 2. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend 
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **API URL Configuration:** In the relevant source file, ensure the API URL is set to your local server: `http://localhost:5000`.

4.  Start the frontend application:
    ```bash
    npm run dev
    ```
    *The app will load in your browser.*

---

## 🔑 Key Code Implementation Details

### 1. Data Accuracy Fixes (`.toFixed(2)`)

The cost calculation in **`AddFuel.jsx`** and **`History.jsx`** uses the `.toFixed(2)` method to ensure that all saved and displayed currency values are accurate to two decimal places.

### 2. Permanent Account Deletion Logic

The backend uses the dedicated `DELETE /profile` route to ensure the user's account and **all associated fuel entries** are atomically and permanently deleted from the database.

### 3. Git Deployment

Use the following standard commands to push your changes to GitHub and trigger a deployment (if connected to platforms like Vercel or Netlify):

```bash
git add .
git commit -m "Your descriptive commit message"
git push origin main

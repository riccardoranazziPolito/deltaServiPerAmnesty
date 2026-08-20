# 🚀 B2B E-Commerce Platform

A modern, full-stack B2B E-Commerce application built with **Next.js 15 (App Router)**, **TypeScript**, and **Prisma ORM**. Designed for wholesale distributors and B2B businesses to manage inventory, process orders, and handle customer accounts seamlessly.

<img width="1510" height="858" alt="Screenshot 2026-08-20 alle 12 35 38" src="https://github.com/user-attachments/assets/23f490c2-0450-4edf-bcdd-10f8b26875e2" />

## ✨ Key Features

### 🛒 For Clients (B2B Customers)
- **Secure Authentication**: Session-based authentication system.
- **Product Catalog**: Browse products with real-time stock availability.
- **Advanced Search & Filtering**: Global search by Name, SKU, or Description, combined with Category filtering.
- **Shopping Cart**: Add products, adjust quantities, and manage orders.
- **Shared Address Book**: Select shipping destinations from a shared company address book.
- **Automated Email Notifications**: Receive instant order confirmation receipts via email (powered by Nodemailer).

### 🛡️ For Administrators
- **Role-Based Access Control (RBAC)**: Secure admin dashboard restricted to authorized personnel.
- **Inventory Management**: Full CRUD operations for Products and Categories.
- **Stock Tracking**: Visual indicators for low stock and automatic deduction upon checkout.
- **User Management**: Create and manage client accounts directly from the dashboard.
- **Order Notifications**: Automated alerts sent to the admin email whenever a new order is placed.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (React), HTML, Vanilla CSS (Glassmorphism UI design).
- **Backend**: Next.js Server Actions, Node.js.
- **Database**: PostgreSQL (hosted on [Supabase](https://supabase.com/)).
- **ORM**: [Prisma](https://www.prisma.io/) (with `@prisma/adapter-pg`).
- **Email Service**: Nodemailer (configured with custom SMTP).
- **Deployment**: [Vercel](https://vercel.com/) (Serverless deployment).

## 🗄️ Database Schema

The database is built on a relational PostgreSQL architecture managed by Prisma:
- `User`: Handles authentication and roles (`ADMIN` or `CLIENT`).
- `Product` & `Category`: Manages inventory and relationships.
- `CartItem`: Temporary storage for user shopping sessions.
- `Order`: Finalized transactions linked to users and shipping addresses.
- `Recipient`: A shared address book for B2B shipping destinations.

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- A PostgreSQL database string (e.g., Supabase)
- An SMTP server for emails (e.g., Gmail, Resend, SendGrid)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/riccardoranazziPolito/deltaServiPerAmnesty.git
   cd deltaServiPerAmnesty

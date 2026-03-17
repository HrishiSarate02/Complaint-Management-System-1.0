# Complaint Management System

A full-stack complaint tracking application with role-based access control, 
automated notifications, and a complete admin workflow.

## What it does

Users can log complaints and track their status in real time.
Admins can view, assign, and resolve complaints from a dedicated dashboard.
The system sends automated email alerts on every status change.

Built as a real-world exercise in JWT authentication, 
role separation, and async email handling in Spring Boot.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot, Spring Security |
| Frontend | Angular 15, TypeScript |
| Database | MongoDB |
| Auth | JWT (User + Admin roles) |
| Notifications | JavaMailSender (SMTP) |
| API Testing | Postman |

## Key Features

- JWT-based authentication with two roles: User and Admin
- Users can raise, view, and track complaints
- Admins can update complaint status, assign tickets, and close issues
- Automated email notifications triggered on every status change
- Reduced manual complaint handling effort by ~60% vs spreadsheet-based tracking

## Architecture
```
Angular Frontend
      │
      ▼
Spring Boot REST API  ←→  MongoDB
      │
      ▼
JavaMailSender (Email Alerts)
```

## How to Run

**Backend**
```bash
cd Backend
mvn spring-boot:run
```

**Frontend**
```bash
cd Frontend/angularCrud
npm install
ng serve
```

API runs on `localhost:8080`, frontend on `localhost:4200`.

## What I learned

- Designing JWT auth with role-based route guards in Angular
- Handling async email triggers without blocking the main thread
- MongoDB document modeling for complaint lifecycle states

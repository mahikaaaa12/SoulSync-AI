# SoulSync AI 💖

An AI-powered matchmaking dashboard built for modern matchmaking teams to manage customer profiles, track relationship journeys, generate intelligent match recommendations, and streamline the matchmaking process.

## Overview

SoulSync AI is an internal matchmaking platform designed to help matchmakers efficiently manage clients, analyze compatibility, schedule meetings, track progress, and generate meaningful match suggestions using AI-inspired compatibility scoring.

The platform provides a centralized dashboard where matchmakers can:

* Manage customer profiles
* Track matchmaking journeys
* Generate compatibility-based match recommendations
* Record meeting notes and interactions
* Schedule introductions and follow-ups
* Monitor customer engagement status

---

## Features

### Authentication System

* Secure Login & Registration
* Session Management
* Remember Me functionality
* Django Authentication Integration

### Customer Management

* Create and manage customer profiles
* Store detailed biodata
* Customer status tracking
* Customer ID generation
* Profile filtering and sorting

### AI-Powered Matchmaking

* Compatibility scoring engine
* Gender-specific matchmaking logic
* Match ranking and prioritization
* Compatibility explanations
* High-potential match identification

### Match Management

* View recommended matches
* Match compatibility breakdown
* Match status tracking
* Match history management

### Meeting Management

* Schedule meetings
* Track meeting outcomes
* Meeting status management
* Introduction tracking

### Notes & Follow-ups

* Record client interactions
* Store follow-up notes
* Matchmaker observations
* Customer alerts and reminders

### Dashboard

* Customer overview
* Match suggestions
* Meeting schedules
* Status monitoring

---

## Matchmaking Logic

### Male Customer Matching

The algorithm evaluates:

* Age compatibility
* Height preferences
* Income compatibility
* Children preferences
* Religion compatibility
* Caste compatibility
* Education alignment
* Language compatibility

### Female Customer Matching

The algorithm evaluates:

* Professional compatibility
* Education alignment
* Relocation preferences
* Lifestyle compatibility
* Family preferences
* Personal values alignment

### Compatibility Scoring

Each candidate receives:

* Compatibility Score (0–100)
* Match Ranking
* Compatibility Breakdown
* Human-readable Explanation

Example:

91% Compatibility

✓ Similar educational background

✓ Compatible family goals

✓ Shared lifestyle preferences

✓ Matching views on children

---

## Technology Stack

### Backend

* Django
* Python

### Database

* SQLite (Development)

### Frontend

* HTML5
* CSS3
* JavaScript

### AI Logic

* Custom Compatibility Engine
* Rule-Based Match Scoring
* AI-Style Match Explanations

---

## Project Structure

```text
SoulSync-AI/
│
├── dashboard/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── matchmaking.py
│   ├── admin.py
│   ├── templates/
│   ├── static/
│   └── management/
│
├── soulsync/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── manage.py
└── requirements.txt
```

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd SoulSync-AI
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

### 3. Activate Environment

Windows:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Seed Dummy Profiles

```bash
python manage.py seed_profiles
```

### 7. Start Server

```bash
python manage.py runserver
```

Open:

```text
http://127.0.0.1:8000
```

---

## Demo Credentials

### Admin Login

```text
Username: admin
Password: admin123
```

Or create a new account using the signup page.

---

## Customer Journey Workflow

```text
New Lead
    ↓
Profile Review
    ↓
Active Search
    ↓
Matches Sent
    ↓
Meeting Scheduled
    ↓
Engagement In Progress
    ↓
Closed
```

---

## Future Enhancements

* OpenAI Integration
* Personalized Match Introductions
* Email Notifications
* Advanced Analytics Dashboard
* Profile Photo Uploads
* Role-Based Access Control
* Match Success Prediction
* Real-Time Messaging
* Video Meeting Integration

---

## Assumptions

* Match suggestions are generated using profile compatibility data.
* Customer preferences are represented through structured profile attributes.
* AI functionality is implemented through a custom compatibility engine and explanation generator.
* The platform is intended for internal matchmaking operations.

---

## Author

Developed as part of a matchmaking dashboard MVP focused on improving customer management, compatibility analysis, and matchmaking efficiency.

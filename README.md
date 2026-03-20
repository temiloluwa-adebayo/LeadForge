# LeadForge

> **A fully automated outbound sales engine. One click triggers a complete lead generation, qualification, and outreach pipeline — zero human steps required.**

[![Stack](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Automation](https://img.shields.io/badge/Automation-n8n-orange?style=flat-square)](https://n8n.io)
[![Database](https://img.shields.io/badge/Database-Supabase-green?style=flat-square&logo=supabase)](https://supabase.com)
[![Status](https://img.shields.io/badge/Status-Production-brightgreen?style=flat-square)]()

---

## Table of Contents

- [Overview](#overview)
- [The Problem It Solves](#the-problem-it-solves)
- [System Architecture](#system-architecture)
- [Automation Pipeline (9 Phases)](#automation-pipeline-9-phases)
- [Application Features](#application-features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Overview

LeadForge is a **multi-user SaaS lead generation platform** that converts a multi-hour manual sales process into a single button click. The system automatically finds businesses on Google, visits their websites, analyses their digital presence, scores their quality, recommends a service to pitch, generates a personalised PDF proposal, and sends a cold email — all without human intervention.

**Built for:** Digital agencies, freelancers, and sales teams who need a consistent, automated outbound pipeline.

## Screenshots

![Dashboard](assets/Screenshot%202026-03-20%20170210.png)
![Leads Table](assets/Screenshot%202026-03-20%20170223.png)
![Mobile View](assets/Screenshot%202026-03-20%20170236.png)
---

## The Problem It Solves

| Without LeadForge | With LeadForge |
|---|---|
| Manual Google search for leads | Automated Google discovery via ScrapingBee |
| Hours researching each business | Real-time website scraping and analysis |
| Writing emails from scratch | AI-generated personalised cold emails |
| Creating proposals manually | Auto-generated PDF proposals from Google Docs templates |
| Tracking outreach in spreadsheets | Centralised dashboard with live campaign status |
| Zero consistency at scale | Identical quality across hundreds of leads per day |

---

## System Architecture

```
┌─────────────────────────────────────────────┐
│              FRONTEND (Next.js 14)           │
│  Campaign Config → Dashboard → Leads → Analytics │
└────────────────────┬────────────────────────┘
                     │ POST (Webhook)
                     ▼
┌─────────────────────────────────────────────┐
│           AUTOMATION ENGINE (n8n)           │
│  Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7     │
└──────┬──────────────────────────────────────┘
       │
       ├── ScrapingBee (Google + Website Scraping)
       ├── Gmail API (Email Sending)
       ├── Google Docs (Proposal Generation)
       ├── Google Drive (PDF Storage)
       └── Google Sheets (Logging)
                     │
                     ▼
┌─────────────────────────────────────────────┐
│              DATABASE (Supabase)            │
│  profiles · campaigns · leads · run_history │
└─────────────────────────────────────────────┘
```

---

## Automation Pipeline (9 Phases)

The core of LeadForge is a 9-phase n8n automation workflow triggered by a single webhook call from the dashboard.

### Phase 0 — Configuration
Reads the user's campaign settings: search query, location, target industry, links, and output limits.

### Phase 1 — Lead Discovery
Uses ScrapingBee to perform a Google Business search. Extracts business name, website URL, phone number, rating, and review count for each result.

### Phase 2 — Deduplication
Generates a unique `Lead_ID` hash for each business. Compares against previously logged leads in Google Sheets. Removes all duplicates before processing continues.

### Phase 3 — Website Processing
For each unique lead with a website:
- Normalises the URL
- Fetches the raw HTML via ScrapingBee
- Extracts email addresses, phone numbers, social media links, and contact form presence

For leads without a website, default placeholder values are assigned.

### Phase 4 — Website Scoring
Analyses the scraped website data and outputs:
- **Quality Rating:** Good / Average / Poor
- **Issues List:** Missing SSL, no mobile responsiveness, outdated design, missing contact info, etc.

### Phase 5 — Service Recommendation
Based on the quality score and issues list, the system automatically recommends:
- A **primary service** to pitch (e.g. website redesign, SEO, social media)
- A **secondary service** as an upsell
- A **reason** explaining why this recommendation was made

### Phase 6 — Proposal & Email Generation
- Copies the user's Google Docs proposal template
- Replaces all variables (business name, service, reasons, links) with lead-specific data
- Converts the document to PDF and stores it in Google Drive
- Generates a personalised cold email body
- Attaches the PDF and sends via Gmail

### Phase 7 — Logging
Appends the complete lead record to Google Sheets and stores it in the Supabase `leads` table with status, outreach result, and proposal link.

---

## Application Features

### Dashboard — Campaign Control Centre
The main interface for launching and configuring campaigns.

**Search Targets Tab**
- Industry tags (multi-input array)
- Target location
- Maximum results per run
- Maximum pages to scrape

**Outreach Tab**
- Calendly booking link
- WhatsApp contact link
- Portfolio link
- Email subject line
- n8n webhook URL

**Schedule Tab**
- Trigger hour configuration
- Frequency settings
- Toggle switches: auto-send emails, generate PDFs, log to Sheets, scrape websites

**Filters Tab**
- Minimum quality score threshold
- Require email toggle (skip leads with no email)

**Live Feedback Panel**
Real-time progress display showing the current automation phase as the workflow executes.

### Leads Dashboard
- Full searchable and sortable table of all discovered leads
- Filter by outreach status
- CSV export
- Click any row to open a detailed right-side drawer with all lead data

### Analytics Dashboard
- Total leads discovered
- Emails sent
- Reply tracking
- Campaign run count
- 14-day activity line chart
- Industry distribution bar chart

### History Dashboard
Log of every automation run with: status, time started, duration, leads found, emails sent, PDFs generated, and duplicates skipped.

### Email Template Editor
- Rich subject and body editor
- Dynamic variable insertion: `{{business_name}}`, `{{calendly_link}}`
- Live preview mode that renders the actual personalised output

### Proposal Configuration
- Google Docs Template ID input
- Google Drive Folder ID input

### Integrations Dashboard
Live connection status for: n8n, Gmail, Google Sheets, Google Drive, Google Docs, ScrapingBee. Includes webhook update and connection test actions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Authentication | Supabase Auth |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Automation Engine | n8n (self-hosted) |
| Web Scraping | ScrapingBee API |
| Email Delivery | Gmail API |
| Proposal Generation | Google Docs API |
| File Storage | Google Drive API |
| Lead Logging | Google Sheets API |
| Hosting | Vercel |

---

## Database Schema

### `profiles`
Stores user account data, integration links, webhook URL, and setup completion status.

### `campaigns`
Stores search configuration (query, location, limits) and schedule settings per user.

### `leads`
Stores each discovered business: name, website, email, phone, quality score, recommended service, outreach status, and proposal PDF link.

### `run_history`
Records every automation execution with metrics: leads found, emails sent, PDFs generated, duplicates skipped, errors, and duration.

### `email_templates`
Stores user-configured email subject lines, body templates, and variable definitions.

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project
- n8n instance (self-hosted or cloud)
- ScrapingBee API key
- Gmail OAuth credentials
- Google Workspace (Docs, Drive, Sheets) credentials

### Installation

```bash
git clone https://github.com/temiloluwa-adebayo/leadforge.git
cd leadforge
npm install
cp .env.example .env.local
# Fill in your environment variables
npm run dev
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

All other integrations (n8n webhook, Google APIs, ScrapingBee) are configured per user through the Integrations dashboard inside the application.

---

## Author

**Temiloluwa Adebayo** — AI Software Engineer  
[GitHub](https://github.com/temiloluwa-adebayo) · [LinkedIn](https://linkedin.com/in/temiloluwa-adebayo-4843ba377)

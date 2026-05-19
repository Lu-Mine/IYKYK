# IYKYK - Database Structure Requirements

This document outlines the expected database structure for the IYKYK (If You Know You Know) quiz project. I am looking for recommendations on the best database solution (especially serverless-friendly ones that work well with Vercel) for this schema.

## Core Entities & Schema Details

### 1. Quizzes (试卷集合/表)
Stores the custom quizzes created by users.

- `id` / `userid`: (String) Primary Key. A unique identifier for the quiz, used in the shareable URL.
- `hostName`: (String) The creator's chosen name.
- `secret`: (String) A passcode used by the creator to view results later.
- `questions`: (Array of Strings) The list of custom questions set by the creator.
- `hostScores`: (Array of Numbers) The creator's self-assessed scores (1-7) corresponding to each question.
- `createdAt`: (Timestamp/Date) Record creation time.

### 2. Responses (回答集合/表)
Stores the answers submitted by friends who take the quiz.

- `id`: (String) Primary Key. A unique identifier for the response.
- `quizId`: (String) Foreign Key / Reference linking to the `Quizzes` table.
- `participantName`: (String) The friend's name.
- `participantScores`: (Array of Numbers) The friend's scores (1-7) corresponding to each question.
- `createdAt`: (Timestamp/Date) Response submission time.

## Project Context
- **Frontend**: React + TypeScript + Tailwind CSS.
- **Hosting**: Expected to be deployed on Vercel.
- **Backend Architecture**: Serverless APIs (e.g., Vercel Functions).
- **Traffic Pattern**: Likely bursty. Read-heavy on specific quiz IDs (many people viewing a shared URL), writes happen when a quiz is created or someone submits answers.
- **Data Volume**: Negligible. Small text fields and small arrays of integers per record. Non-relational or simple relational both work smoothly.

## Question
Given the above schema and Vercel serverless context, which database (e.g., Vercel KV, Vercel Postgres, Supabase, Firebase Firestore, MongoDB Atlas) would be the most lightweight, cost-effective, and easy-to-integrate choice for this project?

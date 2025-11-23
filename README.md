AI-Driven Mental Health Assessment and Assistance Platform


A clinically aligned, AI-powered digital mental health assessment system designed to provide accessible, private, and evidence-based screening using validated tools and modern web technologies. The platform integrates PHQ-9 scoring, machine learning–based severity classification, secure data handling, and real-time recommendations to support early detection and self-help.


Live Demo:
https://easeyourmind5.vercel.app/dashboard


Overview

Mental health challenges such as depression, stress, and anxiety continue to rise among students and young adults. Traditional mental health services face limitations including cost, accessibility, stigma, and long waiting periods. This project addresses these limitations by offering a digital, AI-enabled mental health screening and assistance platform based on clinically validated methods.
The system implements the PHQ-9 questionnaire, supplemented with additional wellness questions, and uses a trained machine learning model to classify users into five depression severity categories. With both anonymous and authenticated modes, secured data storage, crisis detection, and tailored recommendations, the platform offers a scalable and user-friendly solution suited for real-world deployment.


Key Features


-Clinically Validated Assessment
Implements the PHQ-9 questionnaire for evidence-based depression screening, supplemented with a wellness questionnaire for holistic assessment.

-Machine Learning Classification
A Gradient Boosting model trained on 2,000 mental-health assessments achieves a 91% accuracy rate in severity classification.

-Severity Level Prediction
Classifies user responses into five standard categories: Minimal, Mild, Moderate, Moderately Severe, and Severe.

-Crisis Detection
Identifies high-risk users based on PHQ-9 criteria and displays immediate access to crisis resources.

-Privacy-First Design
Supports both authenticated and fully anonymous assessments, with Supabase Row Level Security ensuring strict data isolation.

-Responsive and Accessible Interface
Designed using Next.js 15, TypeScript, and Tailwind CSS to ensure fast loading, responsive layouts, and accessibility compliant with WCAG 2.1 AA.

-Modern, Modular Architecture
A clean separation of frontend, backend, and machine learning services allows scalability and maintainability.



System Architecture


The platform follows a three-tier architecture:

1. Presentation Layer — Next.js 15 + TypeScript
Handles PHQ-9 forms, user interaction, routing, UI rendering, and integration with backend services.

2. Application Layer — Next.js API Routes & Flask ML Service
Next.js API routes manage user submissions and backend communication.
Flask-based machine learning API handles feature extraction, prediction, and recommendation logic.

3. Data Layer — Supabase (PostgreSQL)
Stores user profiles and assessments with Row Level Security to enforce per-user data access policies.



Machine Learning Model


Dataset
-2,000 student mental-health responses were used for training and cross-validation.


Algorithms Evaluated

-Logistic Regression
-Random Forest
-Gradient Boosting (selected model)


Selected Model Performance

-Accuracy: 91%
-F1-Score: 0.90
-Strong separation between distant severity levels, validated through confusion matrix results.



Prediction Pipeline

-Response preprocessing
-PHQ-9 score aggregation
-Feature extraction
-Severity classification
-Recommendation generation



Technology Stack


Frontend

-Next.js 15
-TypeScript
-Tailwind CSS
-shadcn/ui
-Lucide Icons


Backend

-Flask (Python)
-scikit-learn
-NumPy, Pandas


Database
-Supabase
-PostgreSQL
-Row Level Security (RLS) policies



Deployment

-Vercel for Next.js frontend and API routes
-Separate hosting for ML Flask API



Installation and Setup


1. Clone Repository
git clone https://github.com/g4rwe/mental-health-assessment-platform.git
cd mental-health-assessment-platform


2. Frontend Setup
cd client
npm install
npm run dev

~Create an .env.local file:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
FLASK_BACKEND_URL=


3. Backend (ML API) Setup
cd backend
pip install -r requirements.txt
python app.py

The Flask API runs on http://localhost:5000/predict.



Results and Evaluation


-Machine Learning Accuracy: 91%
-Assessment Completion Rate: 87%
-Returning Users: 34%
-Recommendation Helpfulness: 78%
-System tested against WCAG 2.1 AA accessibility standards
-Load tested up to 1,000 concurrent users with over 94% successful responses
These results demonstrate real-world viability and strong user acceptance of the system.



Future Enhancements


-Multi-language support
-GAD-7 integration for anxiety screening
-Predictive crisis forecasting
-Therapist portal for professional monitoring
-Native Android/iOS applications
-Reinforcement learning for personalized interventions
-NLP-based conversational mental-health assistant



Academic Attribution


This project was completed as part of the Bachelor of Technology (Computer Engineering – AI) program at Marwadi University during the academic year 2025–2026.


Contributors:

1.Elton Tendekai Garwe
2.Alemtsehay Tamene Tamiru

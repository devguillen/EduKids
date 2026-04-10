# EduKids AI 🧩

EduKids AI is a premium, gamified educational platform designed for children aged 4-12. Built with **React 19**, **Vite**, and **Google Gemini AI**, it offers a personalized learning experience that adapts to the child's age, interests, and neurodiversity profile.

## 🌟 Key Features

- **Personalized Onboarding**: A child-friendly wizard that captures name, age, subjects, and topics.
- **Neurodiverse Adaptability**: Specialized pedagogical logic for both neurotypical and neurodivergent children (ASD, ADHD, etc.).
- **AI-Powered Learning**: Dynamic mini-game generation using Gemini 1.5 Flash.
- **Calm Tech UI**: Accessible design with high contrast, large text support, and low sensory noise.
- **Safety First**: Secure environment management and pedagogical oversight.

## 🚀 Tech Stack

- **Framework**: React 19 + Vite
- **AI Integration**: Google Generative AI (Gemini SDK)
- **Styling**: Vanilla CSS with Dynamic Design Tokens
- **Testing**: Vitest + React Testing Library
- **Platform**: Tier 1 Standards (Clean Architecture, SOLID, Hexagonal Architecture patterns)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/devguillen/EduKids.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your `VITE_GEMINI_API_KEY`

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🧪 Testing

Run unit and integration tests:
```bash
npm test
```

## 📜 Repository Guidelines

- **Clean Code**: Follow SOLID and Clean Architecture principles.
- **Security**: Never commit `.env` files. Mask sensitive information in logs.
- **Workflow**: Use standard Git flow. Commits should be descriptive.

## 🤝 Contributing

This project follows Staff Engineer protocols for technical excellence. Please ensure all contributions include tests and proper documentation.

---

*Built with ❤️ for inclusive education.*

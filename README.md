# PDF Analyzer

A full-stack application that analyzes PDF documents to provide word statistics, frequency analysis, and AI-powered insights using NVIDIA's LLM API.

## Features

- 📄 PDF file upload with drag-and-drop support
- 📊 Comprehensive text analysis including:
  - Word count and character statistics
  - Sentence count
  - Average word length
  - Top 20 most frequent words
- 🤖 AI-powered insights using NVIDIA's LLM API
- 📥 Downloadable analysis reports
- ⚡ Real-time analysis with immediate results
- 🎯 Option to exclude stop words from analysis

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pdf-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development servers:
```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Express) servers concurrently:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## API Documentation

### PDF Analysis Endpoint

```
POST /api/analyze
```

Analyzes a PDF file and returns comprehensive statistics and insights.

#### Request

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body Parameters:
  - `pdf`: PDF file (required)
  - `excludeStopWords`: boolean (optional, default: false)

#### Response

```json
{
  "wordCount": number,
  "charCount": number,
  "charCountNoSpaces": number,
  "sentenceCount": number,
  "avgWordLength": number,
  "frequencies": [
    [string, number]  // [word, frequency] pairs
  ],
  "aiInsights": string
}
```

#### Error Responses

- `400 Bad Request`: No PDF file uploaded
- `500 Internal Server Error`: PDF parsing or analysis failed

## Design Decisions and Trade-offs

### Frontend

1. **React + Vite**
   - Pros: Fast development, excellent HMR, small bundle size
   - Trade-off: Newer tooling might have fewer resources/solutions for edge cases

2. **Tailwind CSS**
   - Pros: Rapid UI development, consistent styling, small production bundle
   - Trade-off: HTML can become verbose with utility classes

3. **Single Page Application**
   - Pros: Smooth user experience, no page reloads
   - Trade-off: Initial bundle size, SEO considerations

### Backend

1. **Express.js**
   - Pros: Lightweight, flexible, large ecosystem
   - Trade-off: Manual setup required for features that might be built-in with fuller frameworks

2. **Multer for File Upload**
   - Pros: Simple integration, memory storage for quick processing
   - Trade-off: Limited to smaller files due to memory storage

3. **PDF-Parse Library**
   - Pros: Simple API, good text extraction
   - Trade-off: Limited formatting preservation, might miss some complex PDF features

### API Design

1. **Single Endpoint Architecture**
   - Pros: Simple to understand and implement
   - Trade-off: Less flexibility for future features

2. **Synchronous Processing**
   - Pros: Immediate results, simple implementation
   - Trade-off: Might not scale well with large files or high concurrency

## Future Improvements

1. **Technical Enhancements**
   - Implement file size limits and validation
   - Add support for batch processing multiple PDFs
   - Implement caching for repeated analyses
   - Add support for more document formats (DOC, DOCX, TXT)

2. **Feature Additions**
   - Advanced text analysis (readability scores, sentiment analysis)
   - Custom stop words lists
   - Comparative analysis between multiple documents
   - Export results in multiple formats (CSV, PDF, Excel)
   - Save analysis history
   - User authentication and saved preferences

3. **Performance Optimizations**
   - Implement worker threads for PDF processing
   - Add request queuing for large files
   - Implement progress tracking for large documents
   - Add file compression before upload

4. **UI/UX Improvements**
   - Add dark mode support
   - Implement responsive visualizations for analysis results
   - Add keyboard shortcuts
   - Improve accessibility features
   - Add localization support

5. **Infrastructure**
   - Add automated testing (unit, integration, E2E)
   - Implement CI/CD pipeline
   - Add monitoring and error tracking
   - Implement rate limiting
   - Add API versioning

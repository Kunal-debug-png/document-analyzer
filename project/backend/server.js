import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pdf from 'pdf-parse';
import OpenAI from 'openai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Initialize OpenAI client with NVIDIA API
const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1', // Correct base URL
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// Helper function to count words and get frequencies
const analyzeText = (text, excludeStopWords = false) => {
  const stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i']);
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  const wordFreq = {};
  words.forEach(word => {
    if (!excludeStopWords || !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  return {
    wordCount: words.length,
    charCount: text.length,
    charCountNoSpaces: text.replace(/\s/g, '').length,
    sentenceCount: (text.match(/[.!?]+/g) || []).length,
    avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
    frequencies: Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
  };
};

app.post('/api/analyze', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const data = await pdf(req.file.buffer);
    const analysis = analyzeText(data.text, req.body.excludeStopWords === 'true');

    try {
      // Log the text being sent to the NVIDIA LLM
      console.log('Sending text to NVIDIA LLM:', data.text.slice(0, 500));

      // Log the full request payload
      const requestPayload = {
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [{
          role: "user",
          content: `Analyze this text and provide key insights in 2-3 sentences: ${data.text.slice(0, 500)}...`
        }],
        temperature: 0.5,
        top_p: 1,
        max_tokens: 1024,
        stream: true,
      };
      console.log('Request Payload:', JSON.stringify(requestPayload, null, 2));

      // Get AI insights from NVIDIA LLM
      const completion = await openai.chat.completions.create(requestPayload);

      let aiInsights = '';
      for await (const chunk of completion) {
        aiInsights += chunk.choices[0]?.delta?.content || '';
      }

      // Log the NVIDIA LLM response
      console.log('NVIDIA LLM Response:', aiInsights);

      res.json({
        ...analysis,
        aiInsights: aiInsights || 'No insights generated.'
      });
    } catch (aiError) {
      console.error('AI Analysis failed:', aiError);
      res.json({
        ...analysis,
        aiInsights: 'AI insights could not be generated.'
      });
    }
  } catch (error) {
    console.error('PDF Analysis failed:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Download } from 'lucide-react';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [excludeStopWords, setExcludeStopWords] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('excludeStopWords', excludeStopWords.toString());

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!analysis) return;
    
    const report = `
PDF Analysis Report
------------------
Document Statistics:
- Word Count: ${analysis.wordCount}
- Character Count: ${analysis.charCount}
- Character Count (no spaces): ${analysis.charCountNoSpaces}
- Sentence Count: ${analysis.sentenceCount}
- Average Word Length: ${analysis.avgWordLength.toFixed(2)}

Top 20 Most Frequent Words:
${analysis.frequencies.map(([word, count]: [string, number]) => `${word}: ${count}`).join('\n')}

AI Insights:
${analysis.aiInsights}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pdf-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">PDF Analyzer</h1>
        
        {/* Upload Section */}
        <div 
          className="bg-white p-8 rounded-lg shadow-md mb-8"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Drag and drop your PDF here, or</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600"
            >
              Select File
            </label>
            {file && (
              <p className="mt-4 text-sm text-gray-600">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={excludeStopWords}
                onChange={(e) => setExcludeStopWords(e.target.checked)}
                className="rounded"
              />
              <span>Exclude stop words from analysis</span>
            </label>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze PDF'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Analysis Results</h2>
              <button
                onClick={downloadReport}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Document Statistics</h3>
                <ul className="space-y-2">
                  <li>Word Count: {analysis.wordCount}</li>
                  <li>Character Count: {analysis.charCount}</li>
                  <li>Character Count (no spaces): {analysis.charCountNoSpaces}</li>
                  <li>Sentence Count: {analysis.sentenceCount}</li>
                  <li>Average Word Length: {analysis.avgWordLength.toFixed(2)}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Top 20 Most Frequent Words</h3>
                <ul className="space-y-1">
                  {analysis.frequencies.map(([word, count]: [string, number]) => (
                    <li key={word} className="flex justify-between">
                      <span>{word}</span>
                      <span className="text-gray-600">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {analysis.aiInsights && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
                <p className="text-gray-700">{analysis.aiInsights}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
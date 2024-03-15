const express = require('express');
const bodyParser = require('body-parser');
const openai = require('openai');

const app = express();
const port = 3000;

// Initialize OpenAI API client with your API key
const openaiClient = new openai.OpenAiApi('YOUR_OPENAI_API_KEY');

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to handle user queries
app.post('/query', async (req, res) => {
  try {
    const userQuery = req.body.query;
    
    // Send user query to OpenAI API for processing
    const response = await openaiClient.Completions.create({
      engine: 'text-davinci-002', // Choose the appropriate OpenAI model
      prompt: userQuery,
      max_tokens: 50 // Adjust based on your needs
    });
    
    // Extract the response text and send it back to the frontend
    res.json({ response: response.choices[0].text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the query' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

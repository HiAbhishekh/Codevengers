# BuildNow API Server

Backend API for the BuildNow DIY Project Generator built with Node.js, Express, and OpenAI.

## Features

- **AI Project Generation**: Generate 3 unique project ideas using OpenAI GPT-4o-mini
- **Prerequisites Generator**: Get learning prerequisites for any project
- **AI Step Helper**: Get help with specific project implementation steps
- **Cost Tracking**: Monitor token usage and API costs
- **Mock Endpoints**: Test without API costs

## API Endpoints

### 🤖 Main Endpoints

| Endpoint | Method | Description | Estimated Cost |
|----------|--------|-------------|----------------|
| `/api/generate-projects` | POST | Generate 3 AI project ideas | ~$0.001-0.003 |
| `/api/generate-prerequisites` | POST | Get learning prerequisites | ~$0.0008-0.002 |
| `/api/ai-step-help` | POST | Get help with project steps | ~$0.0005-0.001 |

### 🔧 Utility Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-projects/mock` | GET | Get 3 mock projects (free) |
| `/api/estimate-cost` | POST | Estimate API costs before requests |
| `/` | GET | Health check |

## Cost Optimization

### Token Usage Optimization

Our API is optimized for minimal token usage:

- **Short prompts**: Concise, focused prompts reduce input tokens
- **Structured output**: JSON format ensures consistent, predictable responses
- **Limited scope**: Generate exactly 3 projects (not 10+)
- **Efficient models**: Use `gpt-4o-mini` (60-80% cheaper than `gpt-4o`)

### Expected Usage

Based on your usage pattern (5 requests = 2500 input + 4500 output tokens):

- **Before optimization**: ~1400 tokens per request
- **After optimization**: ~600-800 tokens per request
- **Cost reduction**: ~50-60% savings

### Cost Breakdown

| Model | Input (per 1K tokens) | Output (per 1K tokens) |
|-------|----------------------|------------------------|
| gpt-4o-mini | $0.000150 | $0.000600 |
| gpt-4o | $0.002500 | $0.010000 |

**Typical request costs with gpt-4o-mini**:
- Project generation: $0.001-0.003
- Prerequisites: $0.0008-0.002  
- Step help: $0.0005-0.001

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Add your OpenAI API key
   echo "OPENAI_API_KEY=your_key_here" >> .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Start production server**:
   ```bash
   npm start
   ```

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
NODE_ENV=development
```

## Example API Usage

### Generate Projects
```javascript
const response = await fetch('/api/generate-projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    concept: 'Recursion',
    skillLevel: 'Beginner', 
    domain: 'Coding'
  })
});

const data = await response.json();
console.log(`Generated ${data.projects.length} projects`);
console.log(`Cost: $${data.totalCost}`);
```

### Estimate Costs First
```javascript
const estimate = await fetch('/api/estimate-cost', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    concept: 'Recursion',
    skillLevel: 'Beginner',
    domain: 'Coding',
    includePrerequisites: true
  })
});

const costData = await estimate.json();
console.log(`Estimated cost: $${costData.estimatedCost}`);
```

## Testing Without API Costs

Use the mock endpoint for development:

```javascript
const response = await fetch('/api/generate-projects/mock');
const data = await response.json(); // Free, no API key needed
```

## Cost Saving Tips

1. **Use mock endpoint** during development
2. **Estimate costs** before making requests
3. **Cache responses** on the frontend
4. **Batch similar requests** when possible
5. **Use gpt-4o-mini** instead of gpt-4o (60-80% savings)

## Response Format

All API responses include cost tracking:

```json
{
  "success": true,
  "projects": [...],
  "inputTokens": 245,
  "outputTokens": 892,
  "totalTokens": 1137,
  "totalCost": "0.000774",
  "provider": "OpenAI GPT-4o-mini"
}
```

## Error Handling

The API includes comprehensive error handling:
- Input validation
- OpenAI API error handling  
- Fallback responses for critical endpoints
- Detailed error messages in development mode

## Production Deployment

Ready for deployment on:
- Heroku
- Vercel
- Railway  
- Any Node.js hosting platform

Set environment variables and deploy!

---

**Cost-effective AI project generation for students and learners** 🚀 
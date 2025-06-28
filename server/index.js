import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Initialize OpenAI
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required in .env');
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Utility function to estimate tokens (rough approximation)
function estimateTokens(text) {
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Utility function to calculate costs (OpenAI pricing)
function calculateCost(inputTokens, outputTokens, model = 'gpt-4o-mini') {
  const pricing = {
    'gpt-4o-mini': { input: 0.000150, output: 0.000600 }, // per 1K tokens
    'gpt-4o': { input: 0.0025, output: 0.010 }
  };
  
  const rates = pricing[model] || pricing['gpt-4o-mini'];
  const inputCost = (inputTokens / 1000) * rates.input;
  const outputCost = (outputTokens / 1000) * rates.output;
  
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    inputCost: inputCost.toFixed(6),
    outputCost: outputCost.toFixed(6),
    totalCost: (inputCost + outputCost).toFixed(6)
  };
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'BuildNow API Server is running!', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Generate project ideas endpoint
app.post('/api/generate-projects', async (req, res) => {
  try {
    const { concept, skillLevel, domain } = req.body;
    if (!concept || !skillLevel || !domain) {
      return res.status(400).json({ error: 'Missing required fields: concept, skillLevel, and domain are required' });
    }

    // Ultra-optimized prompt for minimal tokens
    const prompt = `Create 3 ${concept} projects for ${skillLevel} ${domain} learners. Return JSON only:
[{"title":"Name","description":"1-2 sentences","tools":["${concept}","tool2"],"timeEstimate":"X hours","difficulty":1-5,"steps":["step1","step2","step3","step4","step5"],"starterCode":"code or empty","motivationalTip":"tip"}]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini model for cost efficiency
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500, // Reduced from 3000
      temperature: 0.8 // Slightly reduced for more focused responses
    });

    let text = completion.choices[0].message.content;
    if (text.startsWith('```json')) text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    else if (text.startsWith('```')) text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    const projects = JSON.parse(text);
    
    res.json({
      success: true,
      projects,
      generatedAt: new Date().toISOString(),
      totalProjects: projects.length,
      provider: 'OpenAI GPT-4o-mini',
      ...calculateCost(estimateTokens(prompt), estimateTokens(text))
    });
  } catch (error) {
    console.error('Error generating projects:', error);
    res.status(500).json({ error: 'Failed to generate project ideas.' });
  }
});

// Test endpoint with mock data (for development without API key)
app.get('/api/generate-projects/mock', (req, res) => {
  const mockProjects = [
    {
      title: "Personal Task Tracker",
      description: "Build a simple to-do app to manage your daily tasks with local storage.",
      tools: ["JavaScript", "HTML", "CSS", "localStorage"],
      timeEstimate: "2-3 hours",
      difficulty: 2,
      steps: [
        "Set up HTML structure with input and task list",
        "Add CSS styling for modern UI",
        "Create JavaScript functions to add/remove tasks", 
        "Implement localStorage to persist tasks",
        "Add task completion toggle functionality"
      ],
      starterCode: "// HTML: <input id='taskInput'><button onclick='addTask()'>Add</button><ul id='taskList'></ul>",
      motivationalTip: "Start simple - even professional developers began with basic projects like this!"
    },
    {
      title: "Random Quote Generator",
      description: "Create a web app that displays inspiring quotes with a refresh button.",
      tools: ["JavaScript", "Fetch API", "JSON", "CSS"],
      timeEstimate: "1-2 hours", 
      difficulty: 1,
      steps: [
        "Create HTML layout with quote display area",
        "Style the interface with CSS",
        "Set up array of quotes in JavaScript",
        "Add function to display random quotes",
        "Implement refresh button functionality"
      ],
      starterCode: "const quotes = [{text: 'Stay curious!', author: 'Anonymous'}]; function showQuote() { /* your code */ }",
      motivationalTip: "Small projects teach big lessons - focus on completing rather than perfecting!"
    },
    {
      title: "Color Palette Generator",
      description: "Build a tool that generates random color palettes for design inspiration.",
      tools: ["JavaScript", "CSS", "Color Theory", "DOM Manipulation"],
      timeEstimate: "3-4 hours",
      difficulty: 3,
      steps: [
        "Design HTML structure for color display grid",
        "Create CSS styles for color swatches",
        "Write function to generate random hex colors",
        "Add copy-to-clipboard functionality",
        "Implement palette export feature",
        "Add color accessibility checks"
      ],
      starterCode: "function generateRandomColor() { return '#' + Math.floor(Math.random()*16777215).toString(16); }",
      motivationalTip: "Every expert was once a beginner - embrace the learning process!"
    }
  ];

  res.json({
    success: true,
    projects: mockProjects,
    generatedAt: new Date().toISOString(),
    totalProjects: mockProjects.length,
    provider: 'Mock Data',
    note: 'This is demo data. Use the main endpoint for AI-generated projects.',
    ...calculateCost(estimateTokens(JSON.stringify(mockProjects)), estimateTokens(JSON.stringify(mockProjects)))
  });
});


// Generate prerequisites for a project
app.post('/api/generate-prerequisites', async (req, res) => {
  try {
    const { projectTitle, projectDescription, tools, domain, skillLevel } = req.body;

    // Validate input
    if (!projectTitle || !projectDescription) {
      return res.status(400).json({
        error: 'Missing required fields: projectTitle and projectDescription are required'
      });
    }

    console.log(`Generating prerequisites for: ${projectTitle} (${domain} - ${skillLevel})`);

    // Optimized prompt for prerequisites (fewer tokens)
    const prompt = `List 3-5 key prerequisites for project "${projectTitle}" (${domain}, ${skillLevel} level).

Tools: ${tools.join(', ')}
Description: ${projectDescription}

JSON format:
{
  "prerequisites": [
    {
      "category": "Core Concepts",
      "items": [
        {
          "title": "Concept name",
          "description": "Brief explanation of what this concept is",
          "importance": "Essential|Important|Helpful",
          "estimatedTime": "1-2 hours",
          "resources": [
            {
              "type": "YouTube|Website|Documentation|Course|Book",
              "title": "Resource title",
              "url": "https://actual-url-here.com",
              "description": "Brief description of what this resource covers",
              "duration": "10 min video|Free course|Official docs"
            }
          ]
        }
      ]
    },
    {
      "category": "Tools & Technologies", 
      "items": [
        {
          "title": "Tool name",
          "description": "What this tool is used for",
          "importance": "Essential|Important|Helpful",
          "estimatedTime": "30 minutes",
          "resources": [
            {
              "type": "YouTube|Website|Documentation|Course|Book",
              "title": "Resource title", 
              "url": "https://actual-url-here.com",
              "description": "Brief description of what this resource covers",
              "duration": "10 min video|Free course|Official docs"
            }
          ]
        }
      ]
    },
    {
      "category": "Skills & Techniques",
      "items": [
        {
          "title": "Skill name",
          "description": "What this skill involves",
          "importance": "Essential|Important|Helpful", 
          "estimatedTime": "2-3 hours",
          "resources": [
            {
              "type": "YouTube|Website|Documentation|Course|Book",
              "title": "Resource title",
              "url": "https://actual-url-here.com", 
              "description": "Brief description of what this resource covers",
              "duration": "10 min video|Free course|Official docs"
            }
          ]
        }
      ]
    }
  ],
  "totalEstimatedTime": "5-8 hours",
  "difficultyAssessment": "Beginner-friendly|Moderate|Advanced",
  "learningPath": [
    "Start with core concepts",
    "Learn essential tools", 
    "Practice basic skills",
    "Begin project implementation"
  ]
}

IMPORTANT REQUIREMENTS:
1. Include ONLY FREE resources (YouTube videos, free websites, official documentation, free courses)
2. Provide ACTUAL, WORKING URLs for each resource
3. Focus on high-quality, beginner-friendly content when possible
4. Include popular platforms like: YouTube, freeCodeCamp, MDN Web Docs, W3Schools, Khan Academy, Coursera (free courses), edX (free courses), GitHub tutorials, official documentation
5. Make sure URLs are real and accessible
6. Include a mix of video tutorials, written documentation, and interactive courses
7. Prioritize resources that are specifically relevant to the project's domain and tools

Focus on practical, actionable prerequisites that directly relate to completing this specific project. Include estimated learning times and helpful resources for each prerequisite.

IMPORTANT: Respond ONLY with valid JSON. No explanatory text before or after the JSON.`;

    // Call OpenAI API with optimized settings
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // More cost-effective
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 1200, // Reduced tokens
      temperature: 0.7
    });
    let text = completion.choices[0].message.content;
    // Clean up markdown code block if present
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse the JSON response
    let prerequisites;
    try {
      prerequisites = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', text);
      throw new Error('Failed to parse AI response');
    }

    // Add metadata
    const response = {
      success: true,
      project: { title: projectTitle, description: projectDescription, domain, skillLevel },
      prerequisites: prerequisites,
      generatedAt: new Date().toISOString(),
      provider: 'OpenAI GPT-4o',
      ...calculateCost(estimateTokens(prompt), estimateTokens(text))
    };

    res.json(response);

  } catch (error) {
    console.error('Error generating prerequisites:', error);
    
    // Fallback to mock prerequisites with actual resource links
    console.log('🔄 OpenAI API failed, using fallback prerequisites...');
    
    try {
      const mockPrerequisites = {
        prerequisites: [
          {
            category: "Core Concepts",
            items: [
              {
                title: "Basic understanding of the domain",
                description: "Fundamental concepts and principles related to this project",
                importance: "Essential",
                estimatedTime: "2-3 hours",
                resources: [
                  {
                    type: "YouTube",
                    title: "Introduction to Programming Concepts",
                    url: "https://www.youtube.com/watch?v=zOjov-2OZ0E",
                    description: "FreeCodeCamp's comprehensive introduction to programming",
                    duration: "4 hour course"
                  },
                  {
                    type: "Website",
                    title: "MDN Web Docs - Getting Started",
                    url: "https://developer.mozilla.org/en-US/docs/Learn",
                    description: "Mozilla's free web development learning resources",
                    duration: "Free tutorials"
                  }
                ]
              }
            ]
          },
          {
            category: "Tools & Technologies",
            items: [
              {
                title: "Development environment setup",
                description: "Setting up the necessary tools and software",
                importance: "Essential", 
                estimatedTime: "30-60 minutes",
                resources: [
                  {
                    type: "YouTube",
                    title: "How to Set Up Your Development Environment",
                    url: "https://www.youtube.com/watch?v=0fKg7e37bQE",
                    description: "Step-by-step guide to setting up your coding environment",
                    duration: "15 min video"
                  },
                  {
                    type: "Website",
                    title: "VS Code Setup Guide",
                    url: "https://code.visualstudio.com/learn",
                    description: "Official VS Code documentation and tutorials",
                    duration: "Free documentation"
                  }
                ]
              }
            ]
          }
        ],
        totalEstimatedTime: "3-4 hours",
        difficultyAssessment: "Beginner-friendly",
        learningPath: [
          "Review core concepts",
          "Set up development environment", 
          "Practice basic techniques",
          "Start project implementation"
        ]
      };

      const fallbackResponse = {
        success: true,
        project: { title: req.body.projectTitle, description: req.body.projectDescription, domain: req.body.domain, skillLevel: req.body.skillLevel },
        prerequisites: mockPrerequisites,
        generatedAt: new Date().toISOString(),
        note: "Generated using fallback mode due to API issues.",
        isDemoMode: true,
        ...calculateCost(estimateTokens(JSON.stringify(mockPrerequisites)), estimateTokens(JSON.stringify(mockPrerequisites)))
      };

      res.json(fallbackResponse);
      
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      res.status(500).json({
        error: 'Failed to generate prerequisites. Please try again.',
        type: 'generation_error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// AI Step Help Chatbot endpoint
app.post('/api/ai-step-help', async (req, res) => {
  try {
    const { project, currentStepIndex, previousSteps, userQuestion } = req.body;
    if (!project || typeof currentStepIndex !== 'number' || !userQuestion) {
      return res.status(400).json({ error: 'Missing required fields: project, currentStepIndex, userQuestion' });
    }

    const prompt = `You are an expert project assistant. The user is working on a project and is currently on the following step:

Project Title: ${project.title}
Project Description: ${project.description}
Domain: ${project.domain}

Previous Steps Completed:
${previousSteps && previousSteps.length > 0 ? previousSteps.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'None'}

Current Step (${currentStepIndex + 1}):
${project.steps[currentStepIndex]}

The user has a question about this step:
"""
${userQuestion}
"""

Give a clear, actionable, and friendly answer. If the question is about troubleshooting, provide step-by-step help. If the user is confused, break down the step and explain it simply. If the user asks for code, provide a relevant code snippet. Always keep your answer focused on the current step and the project context.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // More cost-effective
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 800, // Reduced for step help
      temperature: 0.8
    });
    const text = completion.choices[0].message.content;

    res.json({
      success: true,
      answer: text,
      generatedAt: new Date().toISOString(),
      provider: 'OpenAI GPT-4o',
      ...calculateCost(estimateTokens(prompt), estimateTokens(text))
    });
  } catch (error) {
    console.error('AI step help error:', error);
    res.status(500).json({
      error: 'Failed to generate AI help. Please try again.',
      type: 'generation_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    type: 'server_error'
  });
});

// Cost estimation endpoint
app.post('/api/estimate-cost', (req, res) => {
  try {
    const { concept, skillLevel, domain, includePrerequisites = false, includeStepHelp = false } = req.body;
    
    if (!concept || !skillLevel || !domain) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Estimate token usage for different endpoints
    const projectPrompt = `Generate exactly 3 unique project ideas for "${concept}" (${skillLevel} level, ${domain} domain)...`;
    const projectResponse = 'Estimated 3 project objects with all fields...';
    
    const projectCost = calculateCost(
      estimateTokens(projectPrompt), 
      estimateTokens(projectResponse), 
      'gpt-4o-mini'
    );

    let totalCost = parseFloat(projectCost.totalCost);
    const breakdown = [
      { service: 'Project Generation', ...projectCost }
    ];

    if (includePrerequisites) {
      const prereqCost = calculateCost(200, 800, 'gpt-4o-mini');
      totalCost += parseFloat(prereqCost.totalCost);
      breakdown.push({ service: 'Prerequisites (per project)', ...prereqCost });
    }

    if (includeStepHelp) {
      const helpCost = calculateCost(150, 400, 'gpt-4o-mini');
      totalCost += parseFloat(helpCost.totalCost);
      breakdown.push({ service: 'Step Help (per question)', ...helpCost });
    }

    res.json({
      success: true,
      estimatedCost: totalCost.toFixed(6),
      breakdown,
      note: 'These are rough estimates. Actual costs may vary based on response length.',
      tips: [
        'Use the /mock endpoint for testing without API costs',
        'gpt-4o-mini is 60-80% cheaper than gpt-4o',
        'Shorter prompts = lower costs',
        'Each request costs roughly $0.001-0.003'
      ]
    });

  } catch (error) {
    console.error('Cost estimation error:', error);
    res.status(500).json({ error: 'Failed to estimate costs' });
  }
});

// Cost comparison endpoint (before vs after optimization)
app.get('/api/cost-comparison', (req, res) => {
  try {
    // Your original usage pattern
    const originalUsage = {
      requests: 5,
      inputTokens: 2500,
      outputTokens: 4500,
      totalTokens: 7000,
      avgTokensPerRequest: 1400,
      model: 'gpt-4o'
    };

    // Optimized usage pattern  
    const optimizedUsage = {
      requests: 5,
      inputTokens: 1250, // ~50% reduction
      outputTokens: 2750, // ~40% reduction  
      totalTokens: 4000,
      avgTokensPerRequest: 800,
      model: 'gpt-4o-mini'
    };

    const originalCost = calculateCost(originalUsage.inputTokens, originalUsage.outputTokens, 'gpt-4o');
    const optimizedCost = calculateCost(optimizedUsage.inputTokens, optimizedUsage.outputTokens, 'gpt-4o-mini');

    const savings = {
      tokenReduction: ((originalUsage.totalTokens - optimizedUsage.totalTokens) / originalUsage.totalTokens * 100).toFixed(1),
      costReduction: ((parseFloat(originalCost.totalCost) - parseFloat(optimizedCost.totalCost)) / parseFloat(originalCost.totalCost) * 100).toFixed(1),
      dollarsaved: (parseFloat(originalCost.totalCost) - parseFloat(optimizedCost.totalCost)).toFixed(6)
    };

    res.json({
      success: true,
      comparison: {
        before: {
          ...originalUsage,
          ...originalCost
        },
        after: {
          ...optimizedUsage, 
          ...optimizedCost
        },
        savings: {
          tokensSaved: originalUsage.totalTokens - optimizedUsage.totalTokens,
          tokenReductionPercent: savings.tokenReduction + '%',
          costSaved: savings.dollarsaved,
          costReductionPercent: savings.costReduction + '%',
          monthlyProjection: {
            originalMonthly: (parseFloat(originalCost.totalCost) * 30).toFixed(4),
            optimizedMonthly: (parseFloat(optimizedCost.totalCost) * 30).toFixed(4),
            monthlySavings: ((parseFloat(originalCost.totalCost) - parseFloat(optimizedCost.totalCost)) * 30).toFixed(4)
          }
        }
      },
      recommendations: [
        'Use gpt-4o-mini for 60-80% cost savings',
        'Keep prompts concise and focused',
        'Generate exactly 3 projects (not 10+)',
        'Cache responses to avoid repeated requests',
        'Use mock endpoint during development'
      ]
    });

  } catch (error) {
    console.error('Cost comparison error:', error);
    res.status(500).json({ error: 'Failed to generate cost comparison' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BuildNow API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`🤖 Generate projects: http://localhost:${PORT}/api/generate-projects`);
  console.log(`🧪 Mock endpoint: http://localhost:${PORT}/api/generate-projects/mock`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  OpenAI API key not found. Use the mock endpoint for testing.');
  } else {
    console.log('✅ OpenAI API key configured');
  }
});
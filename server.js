import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  initDatabase,
  getUser,
  getLovedOne,
  getLovedOnesByUser,
  createConversation,
  getConversation,
  getConversations,
  addMessage,
  updateConversation,
  createLovedOne,
  updateLovedOne,
  getDashboardStats
} from './database.js';
import { chatWithLLM, buildSystemPromptFromProfile } from './openrouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Mock user for prototype
const MOCK_USER = {
  id: 'user_1',
  email: 'test@lonesomenomore.com',
  firstName: 'Test',
  lastName: 'User'
};

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const query = Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '';

  console.log('\n' + '='.repeat(80));
  console.log(`🕐 ${timestamp}`);
  console.log(`📨 ${method} ${path}${query ? ' ?' + query : ''}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  }

  // Intercept response to log it
  const originalJson = res.json.bind(res);
  res.json = function(body) {
    console.log(`📤 Response [${res.statusCode}]:`, JSON.stringify(body, null, 2));
    console.log('='.repeat(80));
    return originalJson(body);
  };

  next();
});

// Mock auth middleware - always returns mock user for prototype
function mockAuth(req, res, next) {
  req.user = MOCK_USER;
  next();
}

// Initialize database
await initDatabase();

// ==================== ROUTES ====================

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LoneSomeNoMore API',
    version: '1.0.0'
  });
});

// ==================== AUTH ENDPOINTS ====================

// POST /auth/login - Mock login
app.post('/auth/login', (req, res) => {
  const { email } = req.body;

  // Generate mock JWT
  const token = jwt.sign(
    { sub: MOCK_USER.id, email: MOCK_USER.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
    refreshToken: 'mock_refresh_token',
    user: MOCK_USER
  });
});

// GET /auth/me - Get current user
app.get('/auth/me', mockAuth, (req, res) => {
  const user = getUser(req.user.id);
  const lovedOnes = getLovedOnesByUser(req.user.id);

  res.json({
    success: true,
    user: {
      ...user,
      lovedOnes: lovedOnes.map(l => ({
        id: l.id,
        firstName: l.first_name,
        lastName: l.last_name,
        relationship: 'Family'
      }))
    }
  });
});

// POST /auth/logout - Mock logout
app.post('/auth/logout', mockAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ==================== LOVED ONES ENDPOINT ====================

// GET /loved-ones - Get all loved ones for dropdown
app.get('/loved-ones', mockAuth, (req, res) => {
  const lovedOnes = getLovedOnesByUser(req.user.id);

  res.json({
    success: true,
    lovedOnes: lovedOnes.map(l => ({
      id: l.id,
      firstName: l.first_name,
      lastName: l.last_name,
      nickname: l.nickname,
      age: l.age,
      location: l.location,
      personality: l.personality?.substring(0, 100) + '...' || null
    }))
  });
});

// ==================== CHAT ENDPOINT ====================

// POST /api/chat - Chat with LLM
app.post('/api/chat', mockAuth, async (req, res) => {
  try {
    const { messages, model, systemPrompt, systemPromptFile, lovedOneId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Messages array is required'
        }
      });
    }

    // Get loved one profile for context
    // Priority: 1) systemPrompt from request, 2) systemPromptFile, 3) build from lovedOne profile
    let finalSystemPrompt = systemPrompt || '';

    // Only build from profile if no systemPrompt was provided
    if (!finalSystemPrompt && lovedOneId) {
      const lovedOne = getLovedOne(lovedOneId);
      if (lovedOne) {
        finalSystemPrompt = buildSystemPromptFromProfile(lovedOne);
      }
    }

    // Create conversation record
    const conversationId = createConversation(lovedOneId || 'loved_789xyz');

    // Add user message to database
    const userMessage = messages[messages.length - 1];
    addMessage(conversationId, 'user', userMessage.content);

    // Chat with LLM
    const response = await chatWithLLM(messages, {
      model: model || 'anthropic/claude-3.5-sonnet',
      systemPrompt: finalSystemPrompt,
      systemPromptFile
    });

    // Add assistant message to database
    addMessage(conversationId, 'assistant', response.message.content);

    // Update conversation with summary (simplified for prototype)
    updateConversation(conversationId, {
      summary: userMessage.content.substring(0, 100) + '...',
      sentiment: 'positive'
    });

    res.json({
      success: true,
      message: response.message,
      conversationId,
      usage: response.usage
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.error || error.message || 'Failed to process chat request'
      }
    });
  }
});

// ==================== DASHBOARD ENDPOINTS ====================

// GET /dashboard/summary - Get dashboard summary
app.get('/dashboard/summary', mockAuth, async (req, res) => {
  try {
    const { lovedOneId } = req.query;
    const targetLovedOneId = lovedOneId || 'loved_789xyz';

    const lovedOne = getLovedOne(targetLovedOneId);
    if (!lovedOne) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Loved one not found'
        }
      });
    }

    const stats = getDashboardStats(targetLovedOneId);
    const recentConversations = getConversations(targetLovedOneId, 5);

    res.json({
      success: true,
      lovedOne: {
        id: lovedOne.id,
        firstName: lovedOne.first_name,
        lastName: lovedOne.last_name,
        nickname: lovedOne.nickname,
        phoneNumber: lovedOne.phone_number
      },
      stats: {
        lastCallDate: recentConversations[0]?.date || new Date().toISOString(),
        totalCalls: stats.totalCalls,
        averageMood: stats.averageMood,
        currentStreak: stats.currentStreak,
        upcomingCall: {
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          timezone: 'MST'
        }
      },
      recentConversations: recentConversations.map(c => ({
        id: c.id,
        date: c.date,
        duration: c.duration,
        summary: c.summary || 'No summary available',
        topics: c.topics ? JSON.parse(c.topics) : [],
        sentiment: c.sentiment,
        flags: [],
        transcriptAvailable: true
      })),
      weeklyInsight: {
        period: `${new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`,
        summary: `${lovedOne.first_name} has been consistently engaged and positive this week.`,
        moodTrend: 'stable',
        healthMentions: [],
        notableTopics: ['General conversation', 'Family', 'Interests']
      },
      alerts: []
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// ==================== CONVERSATION ENDPOINTS ====================

// GET /conversations - List conversations
app.get('/conversations', mockAuth, (req, res) => {
  try {
    const { lovedOneId, page = 1, limit = 20 } = req.query;
    const targetLovedOneId = lovedOneId || 'loved_789xyz';

    const offset = (page - 1) * limit;
    const conversations = getConversations(targetLovedOneId, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      conversations: conversations.map(c => ({
        id: c.id,
        date: c.date,
        duration: c.duration,
        summary: c.summary || 'No summary available',
        sentiment: c.sentiment
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(conversations.length / limit),
        totalItems: conversations.length,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Conversations list error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// GET /conversations/:id - Get conversation details
app.get('/conversations/:id', mockAuth, (req, res) => {
  try {
    const { id } = req.params;
    const conversation = getConversation(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Conversation not found'
        }
      });
    }

    res.json({
      success: true,
      conversation: {
        id: conversation.id,
        lovedOneId: conversation.loved_one_id,
        date: conversation.date,
        duration: conversation.duration,
        summary: conversation.summary || 'No summary available',
        fullTranscript: conversation.messages.map(m => ({
          timestamp: m.timestamp,
          speaker: m.role === 'user' ? 'User' : 'AI',
          text: m.content
        })),
        topics: conversation.topics ? JSON.parse(conversation.topics) : [],
        sentiment: {
          overall: conversation.sentiment,
          score: 0.8,
          emotionalMarkers: ['engaged', 'positive']
        },
        healthMentions: [],
        flags: [],
        insights: {
          engagementLevel: 'high',
          memoryRecall: 'good',
          conversationFlow: 'natural',
          concernLevel: 'none'
        }
      }
    });

  } catch (error) {
    console.error('Conversation detail error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// ==================== PROFILE ENDPOINTS ====================

// POST /intake/submit - Submit beta intake form
app.post('/intake/submit', mockAuth, async (req, res) => {
  try {
    const formData = req.body;

    // Extract loved one data from form
    const lovedOneData = {
      firstName: formData['loved-one']?.lovedOneFirstName,
      lastName: formData['loved-one']?.lovedOneLastName,
      nickname: formData['loved-one']?.nickname,
      age: formData['loved-one']?.age,
      phoneNumber: formData['loved-one']?.phoneNumber,
      location: formData['loved-one']?.location,
      lifeStory: formData['life-story'],
      interests: formData['interests'],
      health: formData['health'],
      communicationPreferences: formData['communication']
    };

    const lovedOneId = createLovedOne(req.user.id, lovedOneData);

    res.status(201).json({
      success: true,
      intakeId: `intake_${lovedOneId}`,
      lovedOneId,
      status: 'approved',
      message: 'Application submitted successfully',
      estimatedReviewTime: 'Approved for prototype'
    });

  } catch (error) {
    console.error('Intake submit error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// GET /profile/:lovedOneId - Get profile
app.get('/profile/:lovedOneId', mockAuth, (req, res) => {
  try {
    const { lovedOneId } = req.params;
    const lovedOne = getLovedOne(lovedOneId);

    if (!lovedOne) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Profile not found'
        }
      });
    }

    res.json({
      success: true,
      profile: {
        id: lovedOne.id,
        personalInfo: {
          firstName: lovedOne.first_name,
          lastName: lovedOne.last_name,
          nickname: lovedOne.nickname,
          age: lovedOne.age,
          phoneNumber: lovedOne.phone_number,
          location: lovedOne.location
        },
        lifeStory: lovedOne.life_story ? JSON.parse(lovedOne.life_story) : {},
        interests: lovedOne.interests ? JSON.parse(lovedOne.interests) : {},
        health: lovedOne.health_info ? JSON.parse(lovedOne.health_info) : {},
        communicationPreferences: lovedOne.communication_preferences ? JSON.parse(lovedOne.communication_preferences) : {}
      }
    });

  } catch (error) {
    console.error('Profile get error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// PATCH /profile/:lovedOneId/enrich - Update profile
app.patch('/profile/:lovedOneId/enrich', mockAuth, (req, res) => {
  try {
    const { lovedOneId } = req.params;
    const { section, field, value, append } = req.body;

    updateLovedOne(lovedOneId, { [field]: value });

    res.json({
      success: true,
      message: 'Profile enriched successfully'
    });

  } catch (error) {
    console.error('Profile enrich error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('\n🚀 LoneSomeNoMore API Server');
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`🔗 Ready for ngrok tunneling`);
  console.log('\n✅ Available endpoints:');
  console.log('   POST /auth/login');
  console.log('   GET  /auth/me');
  console.log('   GET  /loved-ones');
  console.log('   POST /api/chat');
  console.log('   GET  /dashboard/summary');
  console.log('   GET  /conversations');
  console.log('   GET  /conversations/:id');
  console.log('   POST /intake/submit');
  console.log('   GET  /profile/:lovedOneId');
  console.log('\n💡 Tip: Use `ngrok http 3001` to expose this server\n');
});

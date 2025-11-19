# Integration Guide: v0 → Cursor → Backend

## Step-by-Step Workflow

### Phase 1: Generate UI in v0.dev

1. **Go to v0.dev** (https://v0.dev)
2. **Paste the prompt** from `v0-prompt.md`
3. **Iterate on the design:**
   - Adjust colors if needed
   - Refine spacing and layout
   - Test responsive behavior
   - Try different message bubble styles
4. **Export the code:**
   - Click "Code" tab in v0
   - Copy all component files
   - Note any dependencies v0 added

### Phase 2: Set Up Next.js Project

```bash
# Create new Next.js project
npx create-next-app@latest lonesomenomore-web --typescript --tailwind --app

# Navigate into project
cd lonesomenomore-web

# Install additional dependencies
npm install axios dotenv lucide-react
npm install -D @types/node

# Copy your .env file
cp ../lonesomenomore/.env .env.local
```

### Phase 3: Integrate v0 Components

1. **Copy v0 components** into your Next.js project:
   - Paste main page component into `app/page.tsx`
   - Create `components/` folder for individual components
   - Paste each component into its own file

2. **Update imports:**
   - Ensure all relative imports work
   - Add any missing dependencies

### Phase 4: Add Backend Integration

1. **Create API route** at `app/api/chat/route.ts`:
   - Copy the code from `backend-template.ts` (created next)
   - This handles OpenRouter API calls

2. **Update frontend** to call your API:
   ```typescript
   const response = await fetch('/api/chat', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       messages: conversationHistory,
       model: selectedModel,
       systemPrompt: systemPrompt
     })
   });
   ```

3. **Add state management:**
   - Use React useState for messages array
   - Manage loading states
   - Handle errors gracefully

### Phase 5: Refine in Cursor

Use Cursor's AI to add:
- Markdown rendering for messages (use `react-markdown`)
- Code syntax highlighting (use `react-syntax-highlighter`)
- Message copy buttons
- Conversation export (JSON/Markdown)
- Local storage for conversation persistence
- Streaming responses (optional, requires SSE)
- Dark mode toggle
- Accessibility improvements

### Phase 6: Test & Deploy

```bash
# Run locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## Common Issues & Solutions

**Issue:** v0 components don't match Next.js App Router
- **Solution:** Ensure components use 'use client' directive if they have interactivity

**Issue:** API calls failing
- **Solution:** Check `.env.local` has `OPENROUTER_API_KEY` set

**Issue:** Styling looks different locally
- **Solution:** Make sure Tailwind config includes v0's custom classes

**Issue:** TypeScript errors
- **Solution:** Add proper type definitions for props and state

## Files You'll Need

From v0:
- ✅ Main page component
- ✅ Chat message component
- ✅ Sidebar component
- ✅ Input area component

From existing CLI:
- ✅ OpenRouter API integration logic
- ✅ System prompt loading (file/inline)
- ✅ Conversation history management
- ✅ .env configuration

## Tips for Success

1. **Don't modify v0 code immediately** - paste it as-is first
2. **Test the UI** before adding backend logic
3. **Use Cursor's AI** to explain v0's code structure
4. **Keep your CLI version** as reference for logic
5. **Commit often** as you integrate each piece

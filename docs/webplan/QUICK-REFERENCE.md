# Quick Reference Card

## 🎯 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `v0-prompt.md` | Prompt to use in v0.dev for UI generation |
| `INTEGRATION-GUIDE.md` | Detailed step-by-step integration instructions |
| `WORKFLOW-CHECKLIST.md` | Track your progress through the workflow |
| `backend-template.ts` | API route template for Next.js |
| `frontend-integration-examples.tsx` | React hooks and utilities to connect UI to backend |

## 🔧 Essential Commands

### Project Setup
```bash
# Create Next.js project
npx create-next-app@latest lonesomenomore-web --typescript --tailwind --app

# Install dependencies
npm install axios lucide-react

# Install optional dependencies (for enhancements)
npm install react-markdown react-syntax-highlighter
npm install -D @types/react-syntax-highlighter
```

### Development
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

### Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 🎨 v0.dev Tips

### Getting Better Results
1. **Be specific** about colors, spacing, and layout
2. **Request TypeScript** explicitly
3. **Ask for Tailwind CSS** for styling
4. **Mention "Next.js App Router"** for compatibility
5. **Iterate** - refine the design through conversation

### Example Refinement Prompts
- "Make the sidebar narrower and add a collapse button"
- "Change message bubbles to have more rounded corners"
- "Add a loading skeleton for messages"
- "Make it more mobile-friendly"

## 🔗 Useful Resources

- **v0.dev**: https://v0.dev
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Cursor AI**: https://cursor.sh

## 📦 Project Structure

```
lonesomenomore-web/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main chat page (from v0)
│   ├── globals.css          # Global styles
│   └── api/
│       └── chat/
│           └── route.ts     # OpenRouter API endpoint
├── components/
│   ├── ChatInterface.tsx    # Main chat UI (from v0)
│   ├── MessageBubble.tsx    # Individual messages (from v0)
│   ├── Sidebar.tsx          # Settings sidebar (from v0)
│   └── InputArea.tsx        # Message input (from v0)
├── hooks/
│   └── useChat.ts           # Chat state management
├── lib/
│   └── utils.ts             # Helper functions
├── types/
│   └── chat.ts              # TypeScript types
├── public/                  # Static assets
├── .env.local               # Environment variables (API keys)
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 🐛 Common Issues & Quick Fixes

### Issue: "Module not found" errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: TypeScript errors from v0 components
```typescript
// Add to component file
// @ts-nocheck  (temporary fix)

// Or properly type the props
interface Props {
  message: string;
  onSend: (text: string) => void;
}
```

### Issue: Tailwind classes not working
```javascript
// Check tailwind.config.ts includes:
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
]
```

### Issue: API route not found
```
# Ensure file is at: app/api/chat/route.ts (not route.js)
# Restart dev server: Ctrl+C then npm run dev
```

### Issue: Environment variables not loading
```
# File must be named .env.local (not .env)
# Restart dev server after adding variables
# Verify with: console.log(process.env.OPENROUTER_API_KEY)
```

## 💡 Cursor AI Tips

### Useful Cursor Commands
- `Cmd+K` - Ask Cursor to edit code
- `Cmd+L` - Open chat with Cursor
- `Cmd+Shift+K` - Generate code from comment

### Example Prompts for Cursor
- "Add markdown rendering to the MessageBubble component"
- "Implement auto-scroll when new message arrives"
- "Add a copy button that appears on message hover"
- "Fix TypeScript errors in this file"
- "Optimize this component for performance"

## 🎨 Design Tokens (for consistency)

```css
/* Use these in your components */
--color-primary: #a855f7     /* Purple */
--color-secondary: #06b6d4   /* Cyan */
--color-accent: #10b981      /* Green */
--color-bg-dark: #1a1a1a     /* Dark background */
--color-bg-light: #f5f5f5    /* Light background */

--spacing-xs: 0.25rem        /* 4px */
--spacing-sm: 0.5rem         /* 8px */
--spacing-md: 1rem           /* 16px */
--spacing-lg: 1.5rem         /* 24px */
--spacing-xl: 2rem           /* 32px */

--radius-sm: 0.375rem        /* 6px */
--radius-md: 0.5rem          /* 8px */
--radius-lg: 0.75rem         /* 12px */
--radius-full: 9999px        /* Fully rounded */
```

## 📱 Testing Checklist

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile browsers

## 🚀 Performance Optimization

```typescript
// Use React.memo for components that don't change often
export const MessageBubble = React.memo(({ message }) => {
  // component code
});

// Use useCallback for functions passed as props
const handleSend = useCallback((text: string) => {
  sendMessage(text);
}, [sendMessage]);

// Lazy load heavy components
const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'));
```

---

**Pro Tip:** Keep this file open in a split pane while working! 🎯

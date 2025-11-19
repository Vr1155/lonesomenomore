# v0 Prompt for LoneSomeNoMore Chat Interface

## Copy this prompt to v0.dev:

Create a modern, beautiful chat interface called "LoneSomeNoMore" with the following specifications:

**Layout:**
- Full-screen chat application with a left sidebar and main chat area
- Left sidebar (300px width, collapsible on mobile):
  - Header with "✨ LoneSomeNoMore" branding
  - Model selector dropdown (default: "anthropic/claude-3.5-sonnet")
  - System prompt textarea with toggle between inline/file mode
  - "Clear Chat" button
  - Footer with "Powered by OpenRouter" text
- Main chat area:
  - Header bar with current model name and config status
  - Scrollable message history
  - Fixed bottom input area with text field and send button

**Styling:**
- Color scheme: Purple/magenta (#a855f7) primary, cyan (#06b6d4) accents, gray backgrounds
- User messages: Right-aligned, green accent (#10b981), rounded corners
- Assistant messages: Left-aligned, purple/cyan gradient, rounded corners
- Clean, modern design with smooth animations
- Dark mode ready with proper contrast
- Glassmorphism effects on sidebar
- Smooth transitions and hover states

**Components needed:**
- ChatMessage component with role (user/assistant), content, timestamp
- Sidebar with collapsible drawer for mobile
- InputArea with auto-resize textarea, send button, loading state
- MessageBubble with markdown support preview
- SettingsPanel for model and system prompt config

**Features to mock:**
- Message sending with loading state (⏳ Thinking...)
- Auto-scroll to latest message
- Empty state with welcome message
- Keyboard support (Enter to send, Shift+Enter for new line)
- Copy message button on hover
- Timestamp display (relative time)

**Typography:**
- Use Inter or similar modern sans-serif font
- Message text: readable size (16px)
- Proper line height for readability

Please create a fully functional React/Next.js component with TypeScript, Tailwind CSS, and smooth UX.

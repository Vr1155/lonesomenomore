# LoneomeNoMore - CLI Chat Interface

A simple command-line interface for chatting with LLMs using the OpenRouter API.

## Features

- Interactive CLI chat interface
- Conversation history maintained throughout the session
- Colorful terminal output for better readability
- Support for any OpenRouter-compatible model
- Simple commands to manage your chat session

## Prerequisites

- Node.js (v14 or higher)
- An OpenRouter API key ([Get one here](https://openrouter.ai/keys))

## Setup

1. **Clone or download this project**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your API key:**

   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```

4. **(Optional) Choose a different model:**

   By default, the app uses `anthropic/claude-3.5-sonnet`. You can change this in the `.env` file:
   ```
   MODEL=openai/gpt-4
   ```

   See [available models](https://openrouter.ai/models) on OpenRouter.

## Usage

Start the chat interface:

```bash
npm start
```

Or:

```bash
node chat.js
```

### Commands

Once in the chat interface, you can use these commands:

- Type your message and press Enter to chat with the LLM
- `exit` or `quit` - Exit the chat
- `clear` - Clear the conversation history
- `Ctrl+C` - Exit the chat

## Example

```
===========================================
   CLI Chat Interface - OpenRouter API
===========================================
Model: anthropic/claude-3.5-sonnet
Type your message and press Enter to chat.
Type "exit", "quit", or press Ctrl+C to exit.
Type "clear" to clear conversation history.
===========================================

You: Hello! What can you help me with?
Assistant: I can help you with a wide variety of tasks...

You: exit
Goodbye!
```

## Project Structure

```
.
├── chat.js           # Main chat interface
├── package.json      # Project dependencies
├── .env              # Your API configuration (not tracked)
├── .env.example      # Example environment configuration
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Troubleshooting

**Error: OPENROUTER_API_KEY is not set**
- Make sure you've created a `.env` file (not `.env.example`)
- Ensure your API key is properly set in the `.env` file

**API Error 401 (Unauthorized)**
- Your API key might be invalid or expired
- Get a new key from [OpenRouter](https://openrouter.ai/keys)

**Network errors**
- Check your internet connection
- Verify that OpenRouter's API is accessible

## License

MIT

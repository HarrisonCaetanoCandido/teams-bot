# Systems Integration Chatbot for Microsoft Teams

This project is a case study demonstrating the creation of an intelligent chatbot for Microsoft Teams, capable of orchestrating automation workflows between systems through natural language commands.

## Objective

To simulate a real-world corporate systems integration solution with a conversational interface, combining Node.js for orchestration, Python for natural language processing, and Azure Cosmos DB for data persistence.

## Technologies Used

- Backend: Node.js + Express + TypeScript
- AI Service: Python + FastAPI + LangChain
- Database: Azure Cosmos DB (simulated with MongoDB for development)
- Language Processing: Azure OpenAI API + LangChain
- Vector Store: Chroma DB (for implementing RAG, Retrieval-Augmented Generation)
- Integration APIs: JSONPlaceholder API (simulating corporate systems)
- Containerization: Docker + Docker Compose

## Features
- ✅ Natural language command interpretation
- ✅ Integration with external system APIs
- ✅ RAG system with contextual documentation
- ✅ Conversation history persistence
- ✅ Simulation of corporate automation workflows

## Main Webhook Endpoints (Node.js/Express)

The webhook acts as the bridge between Teams and the bot’s logic.

1. POST /api/messages

    Purpose: The official Bot Framework webhook. Microsoft Teams sends all user messages to this endpoint.

    Flow:

    - Receives the Teams activity.

    - Checks if the activity is a message.

    - Calls the AI Service (POST /ai/parse-command) to interpret user intent.

    - Based on the returned intent, executes the appropriate action (e.g., calls an internal endpoint or an external API).

    - Formats the response and sends it back to the Teams channel via the Bot Framework Adapter.

    - Authentication: Middleware validates the JWT token sent by the Bot Framework.

2. POST /api/commands/:commandName

    Purpose: Internal endpoints for specific actions. The AI Service decides which command to call, and the webhook executes it.

    Examples:

    - POST /api/commands/list-users       # Lists users from JSONPlaceholder
    - POST /api/commands/execute-flow     # Executes a specific automation flow
    - POST /api/commands/get-task-status  # Checks the status of a task


    Flow:

    - Receives command-specific parameters (e.g., { "department": "Finance" }).

    - Executes business logic (e.g., makes a GET request to https://jsonplaceholder.typicode.com/users).

    - Persists the result and context in the database (logs, activities).

    - Returns the result to the caller (the /api/messages handler).

3. GET /api/status/:executionId

    Purpose: Check the status of a long-running automation workflow execution.

    Response: Returns an object with status (running, completed, failed), timestamps, and execution logs.

4. GET /health

    Purpose: Simple health check for monitoring and service availability.

    Response:

    { "success": true }

## Webhook API (Node.js)
```
cd webhook-api
npm install
npm run dev
```

RAG API (Python)
```
cd rag-api
env\Scripts\activate  # Windows
fastapi run dev
```

## Automation Workflows

Workflows are defined as a series of steps that may include:
- HTTP calls
- Data transformations
- Integrations with external systems

## Communication Between Microsoft Emulator and Remote Bot

To exchange messages between the Microsoft Emulator (running on localhost:58950) and the Remote Bot (running on Render) we need to build a dev tunnel. It can be done with ngrok:

```
ngrok http 58950
```

The bot framework adapter from Microsoft will recognize which serviceURL is in the origin URL and, by this, will answer it back

## Resilience

At the moment, applied exponential backoff, node local dns cache and iterative timeout on services that interact with external APIs.

## Testing
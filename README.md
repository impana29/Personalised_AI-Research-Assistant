# Developing a Personalized AI Research Assistant with Memory

An intelligent and adaptable AI assistant that can analyze documents, conduct independent research, and remember past interactions to provide personalized, contextually relevant support.

## Overview
This project is a full-stack AI research assistant application built to provide an engaging and personalized experience. The assistant is capable of:

- Parsing and summarizing documents (PDF, DOCX, DOC) using Langchain and document loaders.
- Conducting independent research via external tools (e.g., Bing Search via SerpAPI).
- Maintaining conversational context and memory to tailor its responses.
- Adapting its personality based on user preferences (e.g., factual, friendly, humorous).

The backend is developed using **FastAPI** (Python) and integrates with Azure OpenAI and Langchain. The frontend is built with **Next.js** (TypeScript) and styled with **TailwindCSS**, ensuring a minimal yet modern UI.

## Features
- **Document Processing:**
  - Parse various document formats using libraries like PyMuPDF and python-docx.
  - Generate summaries with Langchain’s summarization chain.
  - Store document data in a vector database (e.g., FAISS) for efficient retrieval.

- **AI Assistant:**
  - Integrates with Azure OpenAI using Langchain’s chat models.
  - Maintains session history to provide memory and context.
  - Customizable personality settings (factual, friendly, humorous).
  - Capable of answering questions based on the document summary and previous interactions.

- **Research Tool Integration:**
  - Uses SerpAPI (via Langchain’s `SerpAPIWrapper`) to conduct external research.
  - Seamlessly incorporates research findings into the AI assistant’s responses.

- **Frontend UI:**
  - Built with Next.js, TypeScript, and TailwindCSS.
  - Minimal, stylish, and responsive design.
  - Displays uploaded document content, summary, and research findings.
  - Provides a personality selector for customizing the assistant’s communication style.

## Setup Instructions
### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/harshithmanjunath22/AI-Research-Assistant.git
   cd AI-Research-Assistant/backend

2. Create and activate a Python virtual environment:

       python -m venv .venv

   On Windows:

       .\.venv\Scripts\activate

   On macOS/Linux:

       source .venv/bin/activate

3. Install Python dependencies:

       pip install -r requirements.txt

4. Run the backend server:**
   uvicorn main:app --host 0.0.0.0 --port 8000

5. Navigate to the frontend directory:

       cd frontend

6. Install Node dependencies:

       npm install

7. Run the Next.js development server:

       npm run dev

8. Open your browser and visit http://localhost:3000 to interact with the assistant.

### Usage
## 1. Upload a Document:

  - Use the Document Uploader to select and upload a document (PDF, DOCX, or DOC).
  - The backend will parse and summarize the document, storing relevant information and print the summarised information in the UI.

## 2. Customize the Assistant:

  - Select the assistant’s personality (factual, friendly, humorous) from the Personality Selector.

## 3. Chat Interface:

  - Ask questions about the document.

  - Use the deep research button (magnifying glass icon) to have the assistant fetch additional information online using SerpAPI.

  - The assistant will respond you with accurate answer

#

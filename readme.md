# R30.db Resume Search

R30.db is a local semantic search application for resume-related guidance. The frontend lets a user type a question, the backend converts that question into an embedding with Google's Gemini embedding model, and ChromaDB returns the most relevant stored resume tips.

## Tech Stack

- React for the frontend UI
- TypeScript for frontend source code
- Vite for the frontend dev server and production build
- Python for the backend
- FastAPI for the REST API
- Uvicorn for running the FastAPI server
- ChromaDB for local vector database storage and similarity search
- Google GenAI SDK for creating Gemini embeddings
- Gemini `gemini-embedding-2-preview` model for query embeddings
- SQLite through ChromaDB persistence
- npm for frontend package management
- pip and Python virtual environments for backend dependency management

## Application Flow

1. The user opens the React app in the browser.
2. The user enters a resume-related question in the search box.
3. The React frontend sends the query to the backend endpoint:

   ```txt
   GET /search?query=your-search-text
   ```

4. The FastAPI backend receives the query.
5. The backend sends the query text to Google's Gemini embedding model.
6. Gemini returns a vector embedding for the query.
7. The backend searches the ChromaDB collection named `resume_tips_collection`.
8. ChromaDB returns the top matching documents with distance scores and metadata.
9. The backend formats the top results and returns them as JSON.
10. The frontend displays the top three matching results with relevance scores.

## Project Structure

```txt
.
+-- backend/
|   +-- main.py
|   +-- requirements.txt
|   +-- .env.example
|   +-- chroma_db/              # Local ChromaDB data, ignored by Git by default
+-- frontend/
|   +-- src/
|   |   +-- App.tsx
|   |   +-- App.css
|   |   +-- main.tsx
|   +-- package.json
|   +-- package-lock.json
|   +-- .env.example
|   +-- vite.config.ts
+-- .gitignore
+-- readme.md
```

## Before Pushing to GitHub

Do not push private API keys, virtual environments, installed packages, build output, or local database files unless you intentionally want them public.

This repository is set up to ignore:

- `backend/venv/`
- `frontend/node_modules/`
- `frontend/dist/`
- `.env`
- `backend/chroma_db/`
- Python cache files
- zip archives

The Google API key should be stored locally in `backend/.env`, not inside `backend/main.py`.

Create the local environment file:

```bash
cd backend
copy .env.example .env
```

Then edit `backend/.env`:

```env
GOOGLE_API_KEY=your_real_google_api_key_here
```

## How to Download and Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Add your Google API key inside `backend/.env`.

Start the backend:

```bash
uvicorn main:app --reload
```

The backend should run at:

```txt
http://localhost:8000
```

Important: the backend expects a ChromaDB collection named `resume_tips_collection` inside `backend/chroma_db`. This folder is ignored by Git because it is generated/local data. For testing, either copy your local `chroma_db` folder into `backend/chroma_db`, or add an ingestion script that rebuilds the collection from a dataset file.

### 3. Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend should run at:

```txt
http://localhost:5173
```

### 4. Test the App

Open the frontend URL in your browser and search for a resume-related question, for example:

```txt
How can I improve my resume summary?
```

## How to Push This Project to GitHub

From the project root:

```bash
git init
git add .
git status
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repository-name.git
git push -u origin main
```

Before running `git commit`, check `git status` and make sure files like `.env`, `backend/venv/`, `frontend/node_modules/`, and `backend/chroma_db/` are not listed.

## Dataset Guidance

It is okay to share your dataset only if you have the right to publish it and it does not contain private or sensitive information.

Do not publish the dataset if it includes:

- Personal names, phone numbers, email addresses, addresses, or links to private profiles
- Real resumes without clear permission
- Company-confidential content
- API keys, credentials, or internal notes
- Data copied from paid or restricted sources

Good options for sharing the dataset:

- Add a small sample dataset in `data/sample/`
- Remove or anonymize personal information before publishing
- Keep the full dataset outside GitHub and provide instructions for users to add their own data
- Use GitHub Releases, Google Drive, Kaggle, Hugging Face Datasets, or another storage option for larger datasets

Recommended approach for this project:

```txt
data/
+-- sample_resume_tips.json
```

Keep the full local ChromaDB folder ignored, then provide a script or instructions to rebuild the ChromaDB collection from the dataset. That is cleaner than pushing the generated `chroma_db` files.

## Notes for Future Improvement

- Add a script to ingest dataset files into ChromaDB.
- Add a `/health` endpoint for backend checks.
- Add error handling for a missing `GOOGLE_API_KEY`.
- Add deployment instructions for services like Render, Railway, Vercel, or Netlify.

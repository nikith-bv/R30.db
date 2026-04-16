import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type SearchResult = {
  text: string
  score: number
  source: string
}

type SearchResponse = {
  results: SearchResult[]
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const PLACEHOLDER_SUGGESTIONS = [
  'Search for "Best ATS score."',
  'Search for common mistakes in Resume',
  'Search for "How to grab good attention"',
]

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [openIndex, setOpenIndex] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const hasResults = results.length > 0

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPlaceholderIndex((currentIndex) =>
        (currentIndex + 1) % PLACEHOLDER_SUGGESTIONS.length,
      )
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [])

  const helperText = useMemo(() => {
    if (isLoading) {
      return 'R30.db is responding....'
    }

    if (errorMessage) {
      return errorMessage
    }

    if (hasResults) {
      return `Showing the top ${results.length} matches for your query.`
    }

    return 'Search the database to surface the three most relevant matches.'
  }, [errorMessage, hasResults, isLoading, results.length])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setErrorMessage('Enter a query to search the database.')
      setResults([])
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/search?query=${encodeURIComponent(trimmedQuery)}`,
      )

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = (await response.json()) as SearchResponse
      const topResults = [...(data.results ?? [])]
        .sort((left, right) => right.score - left.score)
        .slice(0, 3)

      setResults(topResults)
      setOpenIndex(topResults.length > 0 ? 0 : -1)

      if (topResults.length === 0) {
        setErrorMessage('No matching results were returned for that query.')
      }
    } catch {
      setResults([])
      setOpenIndex(-1)
      setErrorMessage('Unable to reach R30.db right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function toggleResult(index: number) {
    setOpenIndex((currentIndex) => (currentIndex === index ? -1 : index))
  }

  return (
    <main className="page-shell">
      <div className="aurora aurora-left" aria-hidden="true" />
      <div className="aurora aurora-right" aria-hidden="true" />

      <section className="search-panel">
        <p className="eyebrow">R30 DATABASE SEARCH</p>
        <h1 className="brand-title" aria-label="R30.db">
          <span className="brand-mark">R30</span>
          <span className="brand-dot" aria-hidden="true">
            .
          </span>
          <span className="brand-suffix">db</span>
        </h1>
        <p className="intro intro-code">&lt;Having a query on resumes, Prompt it!!/&gt;</p>

        <form className="search-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="query">
            Ask your query
          </label>
          <div className="search-input-shell">
            <input
              id="query"
              className="search-input"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder=""
              autoComplete="off"
            />
            {query.length === 0 ? (
              <span
                key={placeholderIndex}
                className="search-suggestion"
                aria-hidden="true"
              >
                {PLACEHOLDER_SUGGESTIONS[placeholderIndex]}
              </span>
            ) : null}
          </div>
          <button className="search-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div
          className={`status-row ${isLoading ? 'status-row-active' : ''} ${
            errorMessage ? 'status-row-error' : ''
          }`}
          aria-live="polite"
        >
          <span className="status-dot" aria-hidden="true" />
          <span>{helperText}</span>
        </div>

        <section className="results-panel" aria-label="Search results">
          {hasResults ? (
            results.map((result, index) => {
              const isOpen = index === openIndex

              return (
                <article
                  key={`${result.source}-${index}`}
                  className={`result-card ${isOpen ? 'result-card-open' : ''}`}
                >
                  <button
                    type="button"
                    className="result-trigger"
                    onClick={() => toggleResult(index)}
                    aria-expanded={isOpen}
                  >
                    <div className="result-heading">
                      <span className="result-rank">#{index + 1}</span>
                      <div>
                        <h2>{result.source}</h2>
                        <p>Relevance score: {result.score.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="result-icon" aria-hidden="true">
                      {isOpen ? '-' : '+'}
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="result-body">
                      <p>{result.text}</p>
                    </div>
                  ) : null}
                </article>
              )
            })
          ) : (
            <div className="empty-state">
              <p>Results will appear here once you search.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default App

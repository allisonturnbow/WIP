import { useEffect, useState } from "react";

// FIX: centralise the column name so it's easy to change if your sheet header differs
const BOOK_TITLE_KEY = "Book"; // change to "Title" etc. if needed

function App() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [loading, setLoading] = useState(true);
  // FIX: track fetch errors so users see a meaningful message
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // FIX: use AbortController so in-flight requests are cancelled when
    // filter/showStats changes, preventing stale-data races
    const controller = new AbortController();
    const { signal } = controller;

    let query = "";
    if (filter === "owned") query = "?source=owned";
    else if (filter === "wishlist") query = "?source=wishlist";
    else if (filter === "read") query = "?read=Read";
    else if (filter === "not read") query = "?read=Not Read";
    else if (filter === "n/a") query = "?read=N/A";

    const booksUrl = "http://localhost:8000/books" + query;

    fetch(booksUrl, { signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // ignore cancelled requests
        console.error("Books fetch failed:", err);
        setError("Failed to load books. Is the backend running?");
        setLoading(false);
      });

    if (showStats) {
      const statsUrl = "http://localhost:8000/books/stats" + query;

      fetch(statsUrl, { signal })
        .then((res) => {
          if (!res.ok) throw new Error(`Server error: ${res.status}`);
          return res.json();
        })
        .then((data) => setStats(data))
        .catch((err) => {
          if (err.name === "AbortError") return;
          console.error("Stats fetch failed:", err);
          setStats(null);
        });
    } else {
      setStats(null);
    }

    return () => controller.abort();
  }, [filter, showStats]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Library</h1>

      <div style={{ marginBottom: "1rem" }}>
        {["all", "owned", "wishlist", "read", "not read", "n/a"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              marginRight: "0.5rem",
              fontWeight: filter === f ? "bold" : "normal",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button onClick={() => setShowStats(!showStats)}>
          {showStats ? "Hide Stats" : "Show Stats"}
        </button>
      </div>

      {showStats && stats && (
        <div style={{ marginBottom: "1rem" }}>
          <p>Total books: {stats.total_books}</p>
          <p>Read: {stats.number_read}</p>
          <p>Percentage read: {stats.percentage_read}%</p>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        // FIX: show a real error message instead of "No books found"
        <p style={{ color: "red" }}>{error}</p>
      ) : books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul>
          {books.map((book) => (
            // FIX: use a stable key (title + author) instead of array index
            <li key={`${book[BOOK_TITLE_KEY]}-${book.Author}`}>
              <strong>{book[BOOK_TITLE_KEY]}</strong> — {book.Author}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

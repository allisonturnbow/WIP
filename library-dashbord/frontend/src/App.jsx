import { useEffect, useState } from "react";

function App() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    let query = "";
    if (filter === "owned") query = "?source=owned";
    else if (filter === "wishlist") query = "?source=wishlist";
    else if (filter === "read") query = "?read=Read";
    else if (filter === "not read") query = "?read=Not Read";
    else if (filter === "n/a") query = "?read=N/A";

    const booksUrl = "http://127.0.0.1:8000/books" + query;

    fetch(booksUrl)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Books fetch failed:", err);
        setLoading(false);
      });

    if (showStats) {
      const statsUrl = "http://127.0.0.1:8000/books/stats" + query;

      fetch(statsUrl)
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => {
          console.error("Stats fetch failed:", err);
          setStats(null);
        });
    } else {
      setStats(null);
    }
  }, [filter, showStats]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Library</h1>

      <div style={{ marginBottom: "1rem" }}>
        {["all", "owned", "wishlist", "read", "not read", "n/a"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ marginRight: "0.5rem" }}
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
      ) : books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul>
          {books.map((book, index) => (
            <li key={index}>
              <strong>{book.Book}</strong> — {book.Author}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

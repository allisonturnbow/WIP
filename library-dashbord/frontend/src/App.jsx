import { useEffect, useState } from "react";

function App() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("all"); // all, owned, wishlist, read, not read, n/a
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(true); // toggle stats display

  useEffect(() => {
    // Build query params
    let query = "";
    if (filter === "owned") query = "?source=owned";
    else if (filter === "wishlist") query = "?source=wishlist";
    else if (filter === "read") query = "?read=Read";
    else if (filter === "not read") query = "?read=Not Read";
    else if (filter === "n/a") query = "?read=N/A";

    const booksUrl = "http://127.0.0.1:8000/books" + query;
    fetch(booksUrl)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error(err));

    if (showStats) {
      const statsUrl = "http://127.0.0.1:8000/books/stats" + query;
      fetch(statsUrl)
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error(err));
    } else {
      setStats(null);
    }
  }, [filter, showStats]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Library</h1>

      {/* Filter Buttons */}
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

      {/* Stats Display */}
      {showStats && stats && (
        <div style={{ marginBottom: "1rem" }}>
          <p>Total books: {stats.total_books}</p>
          <p>Read: {stats.number_read}</p>
          <p>Percentage read: {stats.percentage_read}%</p>
        </div>
      )}

      {/* Books List */}
      {books.length === 0 ? (
        <p>Loading...</p>
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

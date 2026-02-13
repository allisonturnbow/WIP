import { useEffect, useState } from "react";

function App() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/books")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
      })
      .catch((err) => {
        console.error("Error fetching books:", err);
      });
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Library</h1>

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

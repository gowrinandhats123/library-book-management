
import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/books';

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Load books from MongoDB
  const fetchBooks = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Could not load books');
      }

      const data = await response.json();
      setBooks(data);
    } catch (error) {
      setMessage('Unable to load books. Check whether the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Handle form input
  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  // Add or update a book
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const bookData = {
      ...form,
      quantity: Number(form.quantity)
    };

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save book');
      }

      setMessage(
        editingId
          ? 'Book updated successfully!'
          : 'Book added successfully!'
      );

      setForm({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: ''
      });

      setEditingId(null);
      await fetchBooks();
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    }
  };

  // Load book details into the form for editing
  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      quantity: String(book.quantity)
    });

    setEditingId(book._id);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete a book
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete book');
      }

      setMessage('Book deleted successfully!');

      if (editingId === id) {
        handleCancel();
      }

      await fetchBooks();
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setForm({
      title: '',
      author: '',
      isbn: '',
      category: '',
      quantity: ''
    });

    setEditingId(null);
    setMessage('');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Library Book Management System</h1>
        <p>Manage your library books easily</p>
      </header>

      <main className="main-content">
        <section className="form-section">
          <h2>{editingId ? 'Update Book' : 'Add New Book'}</h2>

          <form onSubmit={handleSubmit} className="book-form">
            <input
              type="text"
              name="title"
              placeholder="Book Title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="author"
              placeholder="Author Name"
              value={form.author}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={form.isbn}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              required
            />

            <button type="submit">
              {editingId ? 'Update Book' : 'Add Book'}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </form>

          {message && <p role="status">{message}</p>}
        </section>

        <section className="books-section">
          <h2>Book List</h2>

          {loading ? (
            <p>Loading books...</p>
          ) : books.length === 0 ? (
            <p>No books found. Add your first book above!</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>ISBN</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>{book.category}</td>
                      <td>{book.quantity}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleEdit(book)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDelete(book._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

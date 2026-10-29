import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "/api";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("todoUser")) || null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState({ email: "", username: "", password: "" });
  const [taskForm, setTaskForm] = useState({ title: "", body: "" });
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);

  const showMessage = (text) => {
    setMessage(text);
    setError("");
    window.setTimeout(() => setMessage(""), 2500);
  };

  const showError = (text) => {
    setError(text);
    setMessage("");
  };

  const apiRequest = async (url, options = {}) => {
    const response = await fetch(`${API}${url}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong");
    return data;
  };

  const loadTasks = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const data = await apiRequest(`/v2/getTask/${encodeURIComponent(user.email)}`);
      setTasks(data.tasks || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = authMode === "signin" ? "/v1/signin" : "/v1/register";
      const payload = authMode === "signin"
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (authMode === "signin") {
        localStorage.setItem("todoUser", JSON.stringify(data.user));
        setUser(data.user);
        showMessage("Signed in successfully.");
      } else {
        setAuthMode("signin");
        setAuthForm({ email: authForm.email, username: "", password: "" });
        showMessage("Account created. Please sign in.");
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openNewTask = () => {
    setEditingId(null);
    setTaskForm({ title: "", body: "" });
    setError("");
    setMessage("");
    setShowTaskForm(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.body.trim()) {
      showError("Please enter both title and description.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const data = await apiRequest(`/v2/updateTask/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({ ...taskForm, email: user.email }),
        });
        setTasks((current) =>
          current.map((task) => (task._id === editingId ? data.updatedList : task))
        );
        showMessage("Task updated successfully.");
      } else {
        const data = await apiRequest("/v2/addTask", {
          method: "POST",
          body: JSON.stringify({ ...taskForm, email: user.email }),
        });
        setTasks((current) => [data.list, ...current]);
        showMessage("Task created successfully.");
      }

      setTaskForm({ title: "", body: "" });
      setEditingId(null);
      setShowTaskForm(false);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editTask = (task) => {
    setEditingId(task._id);
    setTaskForm({ title: task.title, body: task.body });
    setError("");
    setMessage("");
    setShowTaskForm(true);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      setLoading(true);
      await apiRequest(`/v2/deleteTask/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ email: user.email }),
      });
      setTasks((current) => current.filter((task) => task._id !== id));
      showMessage("Task deleted.");
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("todoUser");
    setUser(null);
    setTasks([]);
    setTaskForm({ title: "", body: "" });
    setEditingId(null);
    setShowTaskForm(false);
  };

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) =>
      !query ||
      task.title?.toLowerCase().includes(query) ||
      task.body?.toLowerCase().includes(query)
    );
  }, [tasks, search]);

  const firstName = (user?.username || user?.email || "User").split(" ")[0];
  const initials = (user?.username || user?.email || "U")
    .slice(0, 2)
    .toUpperCase();

  if (!user) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">✓</div>
          
          <h1>{authMode === "signin" ? "Sign in" : "Create account"}</h1>


          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <form className="auth-form" onSubmit={handleAuth}>
            {authMode === "register" && (
              <label>
                Full name
                <input
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="name@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="Enter your password"
                required
                minLength="6"
              />
            </label>

            <button className="primary-btn auth-submit" disabled={loading}>
              {loading ? "Signing in..." : authMode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            className="switch-btn"
            onClick={() => {
              setAuthMode(authMode === "signin" ? "register" : "signin");
              setError("");
              setMessage("");
            }}
          >
            {authMode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">✓</div>
          <div>
            <strong>TaskFlow</strong>
            {/* <span>Workspace</span> */}
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active" >
            <span>▦</span> All tasks
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-profile">
            <div className="avatar">{initials}</div>
            <div>
              <strong>{user.username || "User"}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <section className="main-panel">
        <header className="dashboard-header">
          <div>
            
            <h1>Hello, {firstName}</h1>
            
          </div>
          <button className="primary-btn new-task-btn" onClick={openNewTask}>
            <span>+</span> New task
          </button>
        </header>

        <div className="dashboard-content">
          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <div className="stats-row">
            <div className="stat-card">
              {/* <span className="stat-icon blue">▦</span> */}
              <div><strong>{tasks.length}</strong><span>Total tasks</span></div>
            </div>
          </div>

          <div className="toolbar">
            <div className="section-heading">
              <h2>Your tasks</h2>
              <span>{filteredTasks.length} items</span>
            </div>
            <div className="toolbar-actions">
              <div className="search-box">
                <span>⌕</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." />
              </div>
            </div>
          </div>

          {loading && <div className="loading-line">Loading...</div>}

          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration">✓</div>
              <h3>{search ? "No matching tasks" : "No tasks yet"}</h3>
              <p>{search ? "Try another search." : "Add a task to get started."}</p>
              {!search && <button className="primary-btn" onClick={openNewTask}>Add task</button>}
            </div>
          ) : (
            <div className="task-grid">
              {filteredTasks.map((task) => (
                <article className="task-card" key={task._id}>
                  <div className="task-card-head">
                    <span className="task-status">TASK</span>
                    <span className="task-date">
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "Today"}
                    </span>
                  </div>
                  <h3>{task.title}</h3>
                  <p>{task.body}</p>
                  <div className="task-card-footer">
                    <span className="task-owner">{initials}</span>
                    <div className="task-actions">
                      <button className="edit-btn" onClick={() => editTask(task)}>Edit</button>
                      <button className="delete-btn" onClick={() => deleteTask(task._id)}>Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {showTaskForm && (
        <div className="modal-backdrop" onMouseDown={() => setShowTaskForm(false)}>
          <div className="task-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                
                <h2>{editingId ? "Edit task" : "Create a new task"}</h2>
              </div>
              <button className="close-btn" onClick={() => setShowTaskForm(false)}>×</button>
            </div>

            <form className="modal-form" onSubmit={handleTaskSubmit}>
              <label>
                Task title
                <input
                  autoFocus
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Prepare project presentation"
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={taskForm.body}
                  onChange={(e) => setTaskForm({ ...taskForm, body: e.target.value })}
                  placeholder="Add details about this task..."
                  rows="5"
                  required
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowTaskForm(false)}>Cancel</button>
                <button className="primary-btn" disabled={loading}>
                  {editingId ? "Save changes" : "Create task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;

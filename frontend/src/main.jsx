import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function App() {
  const [page, setPage] = useState("subscribe");

  return (
    <div className="app">

      <header className="header">
        <div>
          <h1>PERON TIPS</h1>
          <p>SMS Updates</p>
        </div>
      </header>

      <nav className="navigation">
        <button
          className={page === "subscribe" ? "active" : ""}
          onClick={() => setPage("subscribe")}
        >
          Subscribe
        </button>

        <button
          className={page === "admin" ? "active" : ""}
          onClick={() => setPage("admin")}
        >
          Admin
        </button>
      </nav>

      {page === "subscribe" && <Subscribe />}

      {page === "admin" && <Admin />}

      <footer>
        Peron Tips SMS
      </footer>

    </div>
  );
}


/* =========================
   SUBSCRIPTION PAGE
========================= */

function Subscribe() {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    consent: false
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((old) => ({
      ...old,
      [field]: value
    }));
  }

  async function submit(event) {

    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {

      if (!form.consent) {
        throw new Error(
          "Please accept SMS notifications."
        );
      }

      const response = await fetch(
        `${API}/subscribe`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Subscription failed."
        );
      }

      setMessage(
        "Thank you! Your Peron Tips SMS subscription has been recorded."
      );

      setForm({
        name: "",
        phone: "",
        consent: false
      });

    } catch (error) {

      setMessage(error.message);

    } finally {

      setLoading(false);

    }
  }

  return (
    <main className="card subscribe-card">

      <h2>
        Stay Connected With Peron Tips
      </h2>

      <p>
        Receive Peron Tips announcements and
        important updates by SMS.
      </p>

      <form onSubmit={submit}>

        <label>
          Full Name

          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              update("name", e.target.value)
            }
            placeholder="Enter your full name"
            required
          />

        </label>


        <label>
          Phone Number

          <input
            type="tel"
            value={form.phone}
            onChange={(e) =>
              update("phone", e.target.value)
            }
            placeholder="0712345678"
            required
          />

        </label>


        <label className="consent">

          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) =>
              update(
                "consent",
                e.target.checked
              )
            }
          />

          <span>
            I agree to receive SMS messages
            from Peron Tips.
          </span>

        </label>


        <button
          className="primary"
          disabled={loading}
        >
          {loading
            ? "SUBMITTING..."
            : "SUBSCRIBE"}
        </button>

      </form>


      {message && (
        <div className="message">
          {message}
        </div>
      )}

    </main>
  );
}


/* =========================
   ADMIN
========================= */

function Admin() {

  const [password, setPassword] =
    useState("");

  const [loggedIn, setLoggedIn] =
    useState(false);

  const [stats, setStats] =
    useState(null);

  const [sms, setSms] =
    useState("");

  const [result, setResult] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  async function login(event) {

    event.preventDefault();

    setResult("");

    try {

      const response = await fetch(
        `${API}/admin/stats`,
        {
          headers: {
            Authorization:
              `Bearer ${password}`
          }
        }
      );

      if (!response.ok) {

        throw new Error(
          "Invalid admin password."
        );

      }

      const data =
        await response.json();

      setStats(data);
      setLoggedIn(true);

    } catch (error) {

      setResult(error.message);

    }
  }


  async function sendSMS(event) {

    event.preventDefault();

    if (!sms.trim()) {
      setResult(
        "Please enter an SMS message."
      );
      return;
    }

    setLoading(true);
    setResult("");

    try {

      const response = await fetch(
        `${API}/admin/campaigns`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${password}`
          },

          body: JSON.stringify({
            message: sms
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "SMS campaign failed."
        );
      }

      setResult(
        `Campaign completed. Sent: ${data.sent}, Failed: ${data.failed}`
      );

      setSms("");

    } catch (error) {

      setResult(error.message);

    } finally {

      setLoading(false);

    }
  }


  if (!loggedIn) {

    return (
      <main className="card admin-login">

        <h2>Peron Tips Admin</h2>

        <form onSubmit={login}>

          <label>
            Admin Password

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </label>

          <button className="primary">
            LOGIN
          </button>

        </form>

        {result && (
          <div className="error">
            {result}
          </div>
        )}

      </main>
    );
  }


  return (
    <main className="admin">

      <section className="card">

        <h2>SMS Subscribers</h2>

        <div className="statistics">

          <div>
            <strong>
              {stats?.total || 0}
            </strong>

            <span>Total</span>
          </div>


          <div>
            <strong>
              {stats?.accepted || 0}
            </strong>

            <span>Accepted</span>
          </div>


          <div>
            <strong>
              {stats?.declined || 0}
            </strong>

            <span>Declined</span>
          </div>

        </div>

      </section>


      <section className="card">

        <h2>Send Bulk SMS</h2>

        <p className="small">
          Only active users who accepted
          SMS notifications will receive
          the message.
        </p>


        <form onSubmit={sendSMS}>

          <textarea
            value={sms}
            onChange={(e) =>
              setSms(e.target.value)
            }
            maxLength="480"
            placeholder="Write your SMS here..."
            required
          />


          <div className="sms-bottom">

            <span>
              {sms.length}/480
            </span>

            <button
              className="primary"
              disabled={loading}
            >
              {loading
                ? "SENDING..."
                : "SEND SMS"}
            </button>

          </div>

        </form>


        {result && (
          <div className="message">
            {result}
          </div>
        )}

      </section>

    </main>
  );
}


createRoot(
  document.getElementById("root")
).render(<App />);

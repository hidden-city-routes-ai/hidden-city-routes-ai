:root {
  --primary-color: #1e3a5f;
  --accent-color: #ff0066;
  --bg-light: #f9f9f9;
  --text-dark: #333333;
  --text-light: #ffffff;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-light);
  color: var(--text-dark);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}

header {
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

h1 {
  color: var(--primary-color);
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 1rem;
  color: var(--text-dark);
  opacity: 0.8;
}

main {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.form-section {
  background: var(--text-light);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

#form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: span 2;
}

label {
  margin-bottom: 0.25rem;
  font-weight: bold;
}

input,
select {
  padding: 0.5rem;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  background-color: var(--primary-color);
  color: var(--text-light);
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #163151;
}

.map-section {
  margin-bottom: 1.5rem;
}

#map {
  width: 100%;
  height: 60vh;
  min-height: 300px;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  background-color: #eaeaea;
}

.summary-section {
  background: var(--text-light);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.summary-section h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
  font-size: 1.25rem;
}

.route-list ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.route-list li {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

footer {
  text-align: center;
  padding: 1rem 0;
  background-color: #ffffff;
  border-top: 1px solid #eeeeee;
  font-size: 0.9rem;
  color: #666666;
}

@media (max-width: 600px) {
  #form {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
  h1 {
    font-size: 1.5rem;
  }
  #map {
    height: 50vh;
  }
}

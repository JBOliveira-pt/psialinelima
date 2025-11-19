# psi_alinelima — Instagram posts static site

Repository of Instagram posts and a static client for searching and browsing posts from the @psi_alinelima_ account.

Description
-----------
A lightweight static website that exposes a searchable collection of Instagram posts. Search/filter capabilities are implemented client-side (JavaScript) against a JSON dataset (posts.json). Intended as a simple content browser for posts, searchable by title, date and hashtags.

Live demo
---------
Hosted with GitHub Pages:
https://jboliveira-pt.github.io/psialinelima/

Repository structure (top-level)
-------------------------------
- index.html         — main entry / posts listing
- pesquisa.html      — search UI / results page
- sobre.html         — about page
- contato.html       — contact page
- meuperfil.html     — author / profile page
- meusecos.html      — sections / categories (or similar)
- posts.json         — dataset: array of post objects used by the client-side search
- src/               — JavaScript/CSS assets and client code
  (static frontend code for search, rendering and UI)

Technology stack
----------------
- Frontend: HTML, CSS, JavaScript (client-side rendering)
- Data: posts.json (static JSON file containing the posts dataset)
- Hosting: GitHub Pages (static site)
This project is a static SPA-style client; no backend/server-side application is required to serve the content.

Key features
------------
- Client-side search by title (substring), date and hashtags
- Static JSON dataset (posts.json) used as the single source of truth for content
- Responsive UI (CSS-driven) for browsing posts
- Easily deployable on any static hosting solution (GitHub Pages, Netlify, Vercel, S3 + CDN, etc.)

posts.json (dataset)
--------------------
- posts.json contains an array of post objects. Each object represents a single Instagram post and typically includes fields such as:
  - id (or unique identifier)
  - title
  - date (ISO 8601 or similar)
  - hashtags (array or string)
  - image URL or path
  - caption / description
- The client-side code loads posts.json and performs filtering and rendering in the browser.
- When editing or extending the dataset, keep JSON schema consistent to avoid runtime errors in the client.

How to run locally
------------------
Option A — Open as static files (development quick check)
1. Clone the repository:
   git clone https://github.com/JBOliveira-pt/psialinelima.git
2. Open `index.html` or `pesquisa.html` in a modern browser.

Note: Some browsers restrict fetching local JSON via file://. If fetching posts.json fails when opening files directly, use a local static server:

Option B — Serve with a minimal HTTP server
- Python 3:
  python -m http.server 8000
  then open http://localhost:8000/
- Node (serve package):
  npm install -g serve
  serve -s .

Development notes
-----------------
- All search and rendering logic is implemented in client-side JavaScript under src/.
- CSS files control layout, responsive breakpoints and visual presentation.
- posts.json is the authoritative data file. To add or update posts, edit posts.json and follow the existing object schema.
- Keep image file paths and URLs valid; ensure CORS or hosting constraints are considered when referencing external assets.

Recommendations & potential improvements
----------------------------------------
- Implement incremental loading / pagination for large datasets to improve performance.
- Add caching or indexedDB to reduce repeated downloads of posts.json for returning users.
- Add a build step (webpack/rollup/Vite) if you plan to modularize the code or use modern JS features with transpilation.
- Provide a small unit/integration test suite for search logic (e.g., Jest) to guard filtering correctness.
- Consider server-side search/indexing (Elasticsearch / Algolia / Typesense) if dataset grows or if full-text search performance is required.
- Add explicit JSON schema (JSON Schema) and validation step to prevent malformed posts.
- Improve accessibility (ARIA attributes, keyboard navigation, image alt text) and performance (image optimization, lazy-loading).

Security & privacy
------------------
- This repository is a static public mirror of Instagram content; ensure any personal data published complies with privacy expectations and consent.
- If adding remote resources or third-party scripts, validate the sources and audit for supply-chain/security risks.

Contributing
------------
- Contributions are welcome. Please open Issues or Pull Requests on the repository.
- Suggested workflow:
  1. Fork the repository
  2. Create a feature branch
  3. Edit or add files (keep consistent formatting/style)
  4. Submit a pull request describing the change

License
-------
- No license file is currently provided in the repository. If you want others to reuse or contribute under a specific license, add a LICENSE file (MIT, Apache-2.0, etc.).

Contact
-------
Repository owner: JBOliveira-pt
Project homepage (GitHub Pages): https://jboliveira-pt.github.io/psialinelima/
For technical questions about the implementation, open an issue in this repository.

Acknowledgements
----------------
- Built as a static client-side site for browsing/searching Instagram post archives.
- Uses standard web platform technologies (HTML/CSS/JS) to maximize portability and simplicity.

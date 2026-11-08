FAMILY SECRET SANTA — ONLINE VERSION

This version uses a Netlify Function and Netlify Blobs for shared online storage.
The static HTML alone is not enough: deploy the whole folder as a Netlify project.

DEPLOY
1. Create/sign in to a Netlify account.
2. Put this project folder in a GitHub repository (all files, including netlify/).
3. In Netlify choose Add new site > Import an existing project and connect that repository.
4. Build command: leave blank. Publish directory: .
5. Deploy. Netlify will install package.json dependencies and deploy the function.
6. Open your Netlify site URL and test with a small draw before sending links.

HOW IT WORKS
- The server creates a random assignment and stores it in Netlify Blobs.
- Each person receives a unique private URL.
- A reveal URL returns only that participant's recipient and that recipient's wishlist.
- A participant can update their own wishlist; it is shown to the person assigned to them.
- Do not post private reveal links in a group chat. Anyone holding a link can use it.

IMPORTANT LIMITATIONS
- The organizer's create screen returns the private links once. Save/copy them before closing the page.
- There is no organizer login or draw-management dashboard in this starter. Anyone who can access the public site can create a separate draw.
- For stronger administration, add an organizer password and rate limiting before using this for a large public event.
- The site uses Netlify's hosted storage; review Netlify's current account, age, and service terms with a parent/guardian if needed.

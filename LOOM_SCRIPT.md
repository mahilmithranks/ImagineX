# ImagineX - Loom Walkthrough Script

**Target Length:** ~3 Minutes
**Goal:** Show that you can build a slick UI, handle edge cases (like network errors), and structure code cleanly. 

---

## Scene 1: Introduction (0:00 - 0:25)
**Screen:** Show the ImagineX home page (Generation screen) with a clean, empty state.
**Action:** Move your mouse smoothly around the UI to show the glass-morphic design.

**What to say:**
> "Hi team! I'm [Your Name], and this is my submission for the Forward Deployed Engineer role. I built **ImagineX**, a minimal but premium web app for generative media. 
> My main focus for this assignment was to build a solid foundation with a great user experience—making sure it looks beautiful, feels responsive, and handles API errors gracefully behind the scenes."

---

## Scene 2: Core Generation & Native Text (0:25 - 1:15)
**Screen:** Still on the Home page.
**Action:** 
1. Type prompt: *"A neon-lit cyberpunk street market in Tokyo at midnight"*
2. Open **Advanced Settings**.
3. Set Style to **Cinematic**.
4. Set Aspect Ratio to **Wide**.
5. Set Text Overlay to *"NIGHT CITY"*.
6. Click **Generate**.

**What to say:**
> "Let’s start with a core generation. I’ve hooked this up to the Hugging Face Serverless Inference API, specifically using the FLUX.1 model. 
> For the 'canvas edit' bonus requirement, I didn't want to just stick an ugly HTML badge over the final image. Instead, I configured the backend to dynamically inject our 'Text Overlay' into the model's instructions.
> Because FLUX has incredible text capabilities, it actually renders our custom text *natively* into the pixels of the image, matching the scene's lighting perfectly."

---

## Scene 3: Handling Async & Errors (1:15 - 1:45)
**Screen:** Show the image loading state, and then the successful image appearing.
**Action:** Point out the loaded image. Briefly open your code editor (Cursor/VS Code) to show `route.ts` (lines 90-102 showing error handling).

**What to say:**
> "While that generates, I want to highlight async handling. Calling external models can be slow or fail. In my API route, I explicitly catch `QuotaErrors` (HTTP 429) and `TimeoutErrors` (HTTP 504). 
> If the model is cold and times out, the app doesn't crash—it gives the user a friendly error and a retry button. I even built a fallback mechanism using an open API (Pollinations.ai) so the UI never breaks and users still get an image if the primary API goes down."

---

## Scene 4: The Gallery & Tweak Flow (1:45 - 2:30)
**Screen:** Click over to the **Gallery** tab.
**Action:** 
1. Scroll through the gallery to show the locally saved images. 
2. Hover over the cyberpunk image you just made.
3. Click the **Tweak** button.
4. Watch it snap back to the Home screen with everything pre-filled.

**What to say:**
> "Every successful generation is asynchronously saved to a local SQLite database, so the UI never blocks waiting for a DB write. 
> Here in the Gallery, users can browse their history. To hit the 'Tweak' requirement, I added a quick action on hover. 
> When you click 'Tweak', it grabs the generation context from local storage and drops you right back into the editor. It pre-fills your exact prompt, your advanced settings, and even your text overlay, making it super easy to iterate on a design."

---

## Scene 5: Code Architecture & Outro (2:30 - 3:00)
**Screen:** Switch back to your Code Editor, show `useGenerate.ts` briefly.
**Action:** Highlight the separation of concerns.

**What to say:**
> "Finally, a quick note on architecture: I strictly separated business logic from the UI. 
> Presentation components are completely isolated. All state machine logic—idle, loading, error, success—lives in a custom hook called `useGenerate`. This makes the code highly scalable if we wanted to add a new provider like Fal.ai later.
> That’s ImagineX! A small slice, but built with robust error handling and clean architecture. Thanks for watching."

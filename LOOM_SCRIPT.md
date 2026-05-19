# ImagineX - Loom Walkthrough Script

**Target Length:** 3-4 Minutes
**Goal:** Show that you can build a slick UI, handle edge cases (like network errors), and structure code cleanly.

---

## 1. Introduction (0:00 - 0:30)
**Action:** Start with your screen sharing the ImagineX home page.
**Script Idea:**
> "Hi team, I'm [Your Name], and this is my submission for the Forward Deployed Engineer role. I built **ImagineX**, a minimal web app for generative media. 
> I focused heavily on building a solid foundation with a premium feel, making sure the user experience is smooth even when the AI models take a bit of time to respond."

## 2. Feature Demo: Generation & Bonus (0:30 - 1:15)
**Action:** Type a prompt into the input (e.g. *A cute fluffy monster wearing oversized headphones, sitting at a futuristic DJ booth*). Open "Advanced Settings", change the style to **3D Render**, and add a text overlay (e.g. *FEEL THE BEAT*). Hit Generate.
**Script Idea:**
> "Let me show you the core flow. You can type a prompt here. For the 'Bonus' requirement of a canvas edit, I didn't want to just stick an ugly HTML badge over the image. 
> Instead, I configured the backend to dynamically inject instructions into the FLUX.1 model so that it natively renders your custom text *directly* into the pixels of the image, perfectly matched to the scene's lighting and style!
> Notice the UI while it's generating—because image generation takes time, I wanted the loading state to feel deliberate and responsive rather than just a frozen screen."

## 3. Handling Async & Errors (1:15 - 1:45)
**Action:** While the image is generating (or just talking through it).
**Script Idea:**
> "A big focus for me was async handling. Under the hood, I'm calling the Hugging Face Serverless Inference API. I explicitly catch different types of errors—like `QuotaErrors` (HTTP 429) or `TimeoutErrors` (HTTP 504). 
> If the model is cold and times out, the app doesn't just crash. It gives the user a friendly message and a retry button. If I hit a quota limit, it tells the user immediately. I also built a fallback SVG mock so the app never totally breaks if the API key is missing."

## 4. Feature Demo: Gallery & Tweaking (1:45 - 2:30)
**Action:** Once the image is generated, navigate to the Gallery page. Scroll through it, then hover over a card and click "Tweak".
**Script Idea:**
> "Every successful generation is asynchronously saved to a local SQLite database, so the user doesn't have to wait for the DB write to see their image. 
> Here in the Gallery, you can see past generations along with the prompt, the model used, and the date. 
> To hit the 'Tweak' requirement, I added this action. When I click 'Tweak', it saves the generation context to `sessionStorage` and drops the user right back into the editor with all their settings, style presets, and prompt pre-filled, ready to iterate."

## 5. Code Architecture & Decisions (2:30 - 3:30)
**Action:** Open your code editor (Cursor/VS Code) and quickly show `useGenerate.ts` and `route.ts`.
**Script Idea:**
> "Briefly touching on the code—I wanted to make sure this could easily scale. 
> I separated the business logic from the UI. The presentation components like `PromptForm` are completely isolated. All the state machine logic for idle, loading, error, and success lives in a custom hook called `useGenerate`. 
> In the backend, the `/api/generate` route cleanly handles validation, calls the prompt enhancer, interfaces with Hugging Face, and handles the database inserts independently. This means adding a new provider like Fal.ai later would be a breeze."

## 6. Outro (3:30 - 3:45)
**Action:** Switch back to the web app.
**Script Idea:**
> "That’s ImagineX. It’s a small slice, but built with a solid foundation, robust API error handling, and a clean architecture. Thanks for your time, and I look forward to chatting more about it!"

---
### 💡 Tips for Recording
- **Use the provided prompts:** Keep a notepad open with the prompts I generated for you so you can just copy/paste them during the video.
- **Don't stress mistakes:** If something minor glitches or you hit an API timeout, just talk through it like you would to a coworker. "Ah, looks like the model was cold, but as you can see the error handling caught it."
- **Keep it moving:** Don't linger too long on one line of code. They can read the repo. Just highlight *why* you made a decision.

# Loom Walkthrough Script: ImagineX Generative Workspace

**Target Duration**: 2-3 minutes  
**Goal**: Demonstrate the premium visual identity, smooth UX, and functional generative AI capabilities of the finished ImagineX product.

---

### Segment 1: The First Impression (0:00 - 0:30)
**Action**: Start recording with the homepage loaded. Wait 1-2 seconds before speaking so the viewer takes in the design.  
**Visuals**: The animated `three.js` DottedSurface is gently undulating in the background. The "visuals" text has the sweeping emerald shine effect playing. 
**Script**: 
> "Hi everyone, I’m excited to show you the newly redesigned ImagineX. This is our generative media workspace. We recently transformed it from a basic MVP into a highly polished, production-grade tool. 
> 
> As you can see right off the bat, we moved to a deep, atmospheric midnight interface with a sleek emerald accent. We added this live, interactive 3D particle grid in the background using Three.js, and we're using a macOS-style floating frosted glass navbar to keep the workspace feeling premium and minimal."

### Segment 2: Generating an Image & Tweak Workflow (0:30 - 1:30)
**Action**: Click into the prompt box. Type: *"A solitary futuristic astronaut overlooking a neon-lit cyberpunk city, ultra realistic."* 
**Visuals**: Show the sleek input field focus state. Hit Generate.
**Script**: 
> "Let's run a quick generation. The input forms have been updated with this glass-morphic feel. While this is generating, under the hood, the app is routing this through the Hugging Face Inference API. 
>
> When the result comes back, the UI gives us these smooth, non-intrusive overlays. I can download the PNG instantly. But what's really powerful is our iteration loop. If I want to change this, I just hit 'Tweak', and it instantly populates my form again. We built an AI Prompt Enhancer server-side that takes these base queries and secretly injects style presets—like 'Cinematic' or 'Anime'—so users get diverse, incredible results without needing to be prompt engineers."

### Segment 3: The Gallery & Storage (1:30 - 2:00)
**Action**: Scroll down to the 'Recent outputs' section on the homepage, then click 'View all' or 'Gallery' in the navbar.
**Visuals**: The Gallery grid loads. Hover over a few cards to show the emerald glow and elevation effects.
**Script**: 
> "All of our generations are persisted using a local SQLite database and served via a clean repository pattern. If we jump into the Gallery, you can see all past generations safely stored. 
> 
> Notice the micro-interactions here—when I hover, the cards elevate with a soft emerald glow, giving it a very tactile feel. The data fetching handles async loading perfectly with these nice staggered shimmers, ensuring the UI always feels responsive."

### Segment 4: Wrap Up (2:00 - 2:30)
**Action**: Navigate back to the homepage. Scroll slightly to show the layout.
**Script**: 
> "Overall, by refining the typography, integrating Framer Motion and Three.js, and tightening the color palette to this Emerald theme, ImagineX now feels like a high-end tool you'd pay a subscription for. Everything from resolving React hydration mismatches on the server down to the customized CSS gradients has been completely optimized. 
> 
> Thanks for checking it out."

/**
 * Centralized personal profile configuration.
 * Modify this file to update your name, bio, social media profiles,
 * and contact links across the entire application instantly.
 *
 * These values act as fallbacks — anything set in the `site_cards` table via
 * the /console admin panel takes precedence over what is defined here.
 */
export const profile = {
  // Personal Details
  name: "Ali Hamza Sultan",
  title: "AI Automation Engineer",
  email: "alihamzasultan6@gmail.com",
  phone: "+92 370 3108724",
  location: "Karachi, Pakistan",

  // Typewriter phrases displayed on the home page hero section
  typewriterSentences: [
    "Hello, I'm Ali Hamza Sultan.",
    "AI Automation Engineer.",
    "I build agentic AI systems.",
    "Real-time voice agents that book appointments.",
    "RAG architectures and LLM orchestration.",
    "From prototype to production."
  ],

  // High-level profile summary / biography
  bio: "AI Automation Engineer and Computer Science Lecturer building production-grade agentic AI systems, real-time conversational voice agents, and full-stack automation pipelines. I work across voice AI, low-code orchestration, LLM integration and RAG architectures — turning models into systems that book appointments, move data between CRMs, and run without supervision.",

  // Social media and profile links
  socialLinks: {
    github: "https://github.com/alihamzasultan",
    linkedin: "https://www.linkedin.com/in/ali-hamza-sultan-ai-automation-engineer/",
    x: "",
    whatsapp: "https://wa.me/923703108724",
  },

  // The path to your CV PDF file (stored in the /public directory)
  cvPath: "/cv.pdf",
}

export default profile

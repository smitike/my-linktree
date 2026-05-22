import { FileText, Linkedin, Github, BookOpen, Rocket, type LucideIcon } from "lucide-react";

/**
 * A "facet" is one matchable angle of a link — e.g. one role on a resume,
 * one project on GitHub. The smart search scores facets, not whole links,
 * so the explanation we surface always carries real context like
 * "[Software Engineering Intern]: ...".
 *
 * To wire real data in later, just replace `links` with entries that point
 * at real URLs and describe real facets. The matcher is data-driven.
 */
export type LinkFacet = {
  /** Short context label shown before the explanation, e.g. a role title. */
  label: string;
  /** Concept tags this facet covers. Tags are matched by the concept graph. */
  concepts: string[];
  /** Descriptive sentence — one line, specific, accomplishment-oriented. */
  explanation: string;
};

export type LinkItem = {
  id: string;
  title: string;
  url: string;
  description: string;
  icon: LucideIcon;
  /** Facets the smart search can match against. */
  facets: LinkFacet[];
};

/**
 * Concept graph: maps a canonical concept to related words / synonyms / intent.
 * Searching for any term in a group will match facets tagged with the
 * canonical concept. Keep terms lowercase.
 *
 * This is what makes the search feel "AI-assisted" — "debugging" finds
 * "can-bus diagnostics" because both live in the debugging cluster.
 */
export const conceptGraph: Record<string, string[]> = {
  "can-bus": ["can bus", "canbus", "can", "vehicle network", "automotive", "ecu", "obd"],
  debugging: [
    "debug", "debugging", "diagnostics", "diagnostic", "troubleshoot",
    "troubleshooting", "error", "errors", "fault", "bug", "bugs", "fix", "fixing",
  ],
  kubernetes: ["k8s", "kubernetes", "kube", "container orchestration", "pods", "helm"],
  docker: ["docker", "containers", "containerization", "containerized"],
  devops: ["devops", "ci/cd", "ci", "cd", "pipelines", "infrastructure", "infra", "sre"],
  cloud: ["cloud", "aws", "gcp", "azure", "ec2", "s3", "lambda", "serverless"],
  frontend: [
    "frontend", "front-end", "front end", "ui", "ux", "interface", "react",
    "vite", "tailwind", "css", "design system", "animation", "animations",
  ],
  backend: ["backend", "back-end", "back end", "api", "apis", "node", "server", "rest", "graphql"],
  typescript: ["typescript", "ts", "type safety", "types"],
  python: ["python", "py", "data science", "scripting"],
  rust: ["rust", "systems programming", "memory safety"],
  ai: [
    "ai", "artificial intelligence", "ml", "machine learning", "model",
    "models", "llm", "llms", "deep learning", "neural network", "neural",
    "inference", "training",
  ],
  research: [
    "research", "paper", "academic", "publication", "study", "experiment",
    "aiea", "lab", "thesis",
  ],
  "virtual desktops": ["virtual desktop", "virtual desktops", "vdi", "remote desktop"],
  leadership: ["leadership", "lead", "led", "mentor", "mentoring", "manage", "management", "team"],
  internship: ["intern", "internship", "internships", "co-op", "coop"],
  hackathon: ["hackathon", "hackathons", "weekend build", "prototype", "demo day", "win", "winner", "award"],
  "open source": ["open source", "open-source", "oss", "contribution", "contributions", "pull request", "pr"],
  network: ["network", "networking", "connect", "connection", "recommendation", "recommendations", "endorsement"],
  career: ["career", "experience", "work history", "background", "resume", "cv"],
};

export const links: LinkItem[] = [
  {
    id: "resume",
    title: "Resume",
    url: "https://example.com/resume.pdf",
    description: "Full work history, skills, and education",
    icon: FileText,
    facets: [
      {
        label: "Software Engineering Intern · Automotive",
        concepts: ["can-bus", "debugging", "backend", "typescript", "internship"],
        explanation:
          "Reduced CAN-bus debugging time by building an automatic error diagnostic and reporting service that flags faults in real time.",
      },
      {
        label: "AIEA Research Member",
        concepts: ["research", "kubernetes", "docker", "virtual desktops", "devops", "ai"],
        explanation:
          "Deployed AI research virtual desktops on Kubernetes, containerizing workloads with Docker and shipping a self-serve provisioning flow.",
      },
      {
        label: "Frontend Internship",
        concepts: ["frontend", "typescript", "internship", "leadership"],
        explanation:
          "Shipped a production React + TypeScript design system and mentored two incoming interns through their first PRs.",
      },
      {
        label: "Cloud Infrastructure",
        concepts: ["cloud", "devops", "backend"],
        explanation:
          "Owned AWS infra (EC2, S3, Lambda) and CI/CD pipelines across two roles — see the resume for the full timeline.",
      },
      {
        label: "Career Overview",
        concepts: ["career"],
        explanation:
          "Complete professional history, education, and skills with dates and impact metrics.",
      },
    ],
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    url: "https://linkedin.com/in/example",
    description: "linkedin.com/in/example",
    icon: Linkedin,
    facets: [
      {
        label: "Professional Network",
        concepts: ["network", "career"],
        explanation:
          "Best place to connect, see mutual contacts, and browse the high-level career timeline.",
      },
      {
        label: "Recommendations",
        concepts: ["network", "leadership"],
        explanation:
          "Public recommendations and skill endorsements from past managers and teammates.",
      },
    ],
  },
  {
    id: "github",
    title: "GitHub",
    url: "https://github.com/example",
    description: "github.com/example",
    icon: Github,
    facets: [
      {
        label: "Open-Source Contributions",
        concepts: ["open source", "typescript", "frontend"],
        explanation:
          "Merged PRs into popular TypeScript and React libraries — all pinned on the GitHub profile.",
      },
      {
        label: "Side Projects",
        concepts: ["python", "rust", "backend"],
        explanation:
          "Personal experiments in Python and Rust, including CLI tools and a small key-value store.",
      },
      {
        label: "Frontend Playground",
        concepts: ["frontend", "ui", "animation"],
        explanation:
          "Animation and design-system experiments built with React, Vite, and Tailwind.",
      },
    ],
  },
  {
    id: "research",
    title: "Research Paper",
    url: "#",
    description: "Unpublished · AI-Empowered Cybersecurity · UMKC-NSF",
    icon: BookOpen,
    facets: [
      {
        label: "AIEA Research (Unpublished)",
        concepts: ["research", "ai", "kubernetes", "virtual desktops"],
        explanation:
          "Co-authored draft exploring how ML workloads run on Kubernetes-backed virtual desktops — reach out for a copy.",
      },
      {
        label: "Methodology",
        concepts: ["debugging", "devops"],
        explanation:
          "Includes a section on diagnosing failure modes in distributed GPU workloads.",
      },
    ],
  },
  {
    id: "hackathon",
    title: "Hackathon Project",
    url: "https://example.com/hackathon",
    description: "24 hour NVIDIA x ASUS · NemoClaw",
    icon: Rocket,
    facets: [
      {
        label: "48-Hour Build · Category Winner",
        concepts: ["hackathon", "frontend", "ai", "leadership"],
        explanation:
          "Led a 3-person team to a category prize with a polished React + AI demo shipped end-to-end in a weekend.",
      },
      {
        label: "AI Assistant Prototype",
        concepts: ["ai", "backend"],
        explanation:
          "Integrated an LLM-backed natural-language query layer over a real-time data feed.",
      },
    ],
  },
];

export const profile = {
  name: "Alex Chen",
  bio: "Software engineer · AIEA researcher · building thoughtful interfaces.",
  location: "San Jose, CA",
  status: "CS student @UCSC",
  graduation: "Graduating June 2026",
  /** Set to null/undefined to render an initial-letter avatar instead. */
  image: null as string | null,
};
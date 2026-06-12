// ============================================================
// Tech Stack Detector
// ============================================================
// Scans job titles and descriptions to identify technologies.
// Uses pattern matching with aliases to normalize tech names.
// ============================================================

import type { TechCategory } from '@/types/job';

interface TechPattern {
  name: string;
  displayName: string;
  category: TechCategory;
  patterns: RegExp[];
  demandScore: number;
  salaryScore: number;
  difficulty: number;
  futureScore: number;
  mobilityScore: number;
}

const TECH_PATTERNS: TechPattern[] = [
  // ── Languages ──
  {
    name: 'python', displayName: 'Python', category: 'LANGUAGE',
    patterns: [/\bpython\b/i, /\bpy\b/i],
    demandScore: 9, salaryScore: 7, difficulty: 4, futureScore: 9, mobilityScore: 9,
  },
  {
    name: 'java', displayName: 'Java', category: 'LANGUAGE',
    patterns: [/\bjava\b(?!\s*script)/i, /\bjdk\b/i, /\bjvm\b/i],
    demandScore: 8, salaryScore: 7, difficulty: 6, futureScore: 7, mobilityScore: 9,
  },
  {
    name: 'go', displayName: 'Go', category: 'LANGUAGE',
    patterns: [/\bgolang\b/i, /\bgo\s*(?:lang|programming)\b/i, /\bgo\b(?=\s*[,/]|\s+and\b|\s+or\b|\s+developer|\s+engineer)/i],
    demandScore: 7, salaryScore: 9, difficulty: 5, futureScore: 9, mobilityScore: 8,
  },
  {
    name: 'rust', displayName: 'Rust', category: 'LANGUAGE',
    patterns: [/\brust\b(?!\s*(?:belt|proof|color|stain))/i],
    demandScore: 5, salaryScore: 10, difficulty: 9, futureScore: 9, mobilityScore: 6,
  },
  {
    name: 'typescript', displayName: 'TypeScript', category: 'LANGUAGE',
    patterns: [/\btypescript\b/i, /\bts\b(?=\s*[,/])/i],
    demandScore: 9, salaryScore: 7, difficulty: 4, futureScore: 8, mobilityScore: 9,
  },
  {
    name: 'javascript', displayName: 'JavaScript', category: 'LANGUAGE',
    patterns: [/\bjavascript\b/i, /\bjs\b/i, /\becmascript\b/i],
    demandScore: 9, salaryScore: 6, difficulty: 3, futureScore: 7, mobilityScore: 9,
  },
  {
    name: 'csharp', displayName: 'C#', category: 'LANGUAGE',
    patterns: [/\bc#\b/i, /\bcsharp\b/i, /\bc\s*sharp\b/i],
    demandScore: 6, salaryScore: 7, difficulty: 5, futureScore: 6, mobilityScore: 7,
  },
  {
    name: 'cpp', displayName: 'C++', category: 'LANGUAGE',
    patterns: [/\bc\+\+\b/i, /\bcpp\b/i],
    demandScore: 5, salaryScore: 8, difficulty: 8, futureScore: 6, mobilityScore: 6,
  },
  {
    name: 'ruby', displayName: 'Ruby', category: 'LANGUAGE',
    patterns: [/\bruby\b/i],
    demandScore: 4, salaryScore: 7, difficulty: 4, futureScore: 5, mobilityScore: 6,
  },
  {
    name: 'scala', displayName: 'Scala', category: 'LANGUAGE',
    patterns: [/\bscala\b/i],
    demandScore: 4, salaryScore: 9, difficulty: 8, futureScore: 6, mobilityScore: 5,
  },
  {
    name: 'kotlin', displayName: 'Kotlin', category: 'LANGUAGE',
    patterns: [/\bkotlin\b/i],
    demandScore: 5, salaryScore: 7, difficulty: 5, futureScore: 7, mobilityScore: 6,
  },
  {
    name: 'swift', displayName: 'Swift', category: 'LANGUAGE',
    patterns: [/\bswift\b/i],
    demandScore: 4, salaryScore: 8, difficulty: 5, futureScore: 6, mobilityScore: 5,
  },

  // ── Frameworks ──
  {
    name: 'spring', displayName: 'Spring Boot', category: 'FRAMEWORK',
    patterns: [/\bspring\s*boot\b/i, /\bspring\s*framework\b/i, /\bspring\s*cloud\b/i],
    demandScore: 8, salaryScore: 7, difficulty: 6, futureScore: 7, mobilityScore: 9,
  },
  {
    name: 'nodejs', displayName: 'Node.js', category: 'FRAMEWORK',
    patterns: [/\bnode\.?js\b/i, /\bnode\b/i, /\bexpress\.?js\b/i],
    demandScore: 9, salaryScore: 7, difficulty: 4, futureScore: 8, mobilityScore: 9,
  },
  {
    name: 'react', displayName: 'React', category: 'FRAMEWORK',
    patterns: [/\breact\.?js\b/i, /\breact\b(?!\s*native)/i],
    demandScore: 9, salaryScore: 7, difficulty: 5, futureScore: 8, mobilityScore: 9,
  },
  {
    name: 'nextjs', displayName: 'Next.js', category: 'FRAMEWORK',
    patterns: [/\bnext\.?js\b/i],
    demandScore: 7, salaryScore: 7, difficulty: 5, futureScore: 8, mobilityScore: 8,
  },
  {
    name: 'fastapi', displayName: 'FastAPI', category: 'FRAMEWORK',
    patterns: [/\bfastapi\b/i, /\bfast\s*api\b/i],
    demandScore: 6, salaryScore: 7, difficulty: 4, futureScore: 9, mobilityScore: 7,
  },
  {
    name: 'django', displayName: 'Django', category: 'FRAMEWORK',
    patterns: [/\bdjango\b/i],
    demandScore: 6, salaryScore: 7, difficulty: 4, futureScore: 6, mobilityScore: 7,
  },
  {
    name: 'flask', displayName: 'Flask', category: 'FRAMEWORK',
    patterns: [/\bflask\b/i],
    demandScore: 5, salaryScore: 6, difficulty: 3, futureScore: 5, mobilityScore: 6,
  },
  {
    name: 'dotnet', displayName: '.NET', category: 'FRAMEWORK',
    patterns: [/\.net\b/i, /\basp\.?net\b/i, /\bdotnet\b/i],
    demandScore: 6, salaryScore: 7, difficulty: 5, futureScore: 6, mobilityScore: 7,
  },
  {
    name: 'rails', displayName: 'Ruby on Rails', category: 'FRAMEWORK',
    patterns: [/\brails\b/i, /\bruby\s*on\s*rails\b/i],
    demandScore: 4, salaryScore: 7, difficulty: 4, futureScore: 5, mobilityScore: 6,
  },
  {
    name: 'graphql', displayName: 'GraphQL', category: 'FRAMEWORK',
    patterns: [/\bgraphql\b/i],
    demandScore: 6, salaryScore: 7, difficulty: 5, futureScore: 7, mobilityScore: 7,
  },
  {
    name: 'grpc', displayName: 'gRPC', category: 'FRAMEWORK',
    patterns: [/\bgrpc\b/i],
    demandScore: 5, salaryScore: 8, difficulty: 6, futureScore: 8, mobilityScore: 7,
  },

  // ── Cloud ──
  {
    name: 'aws', displayName: 'AWS', category: 'CLOUD',
    patterns: [/\baws\b/i, /\bamazon\s*web\s*services\b/i, /\bec2\b/i, /\bs3\b/i, /\blambda\b/i],
    demandScore: 9, salaryScore: 8, difficulty: 5, futureScore: 8, mobilityScore: 9,
  },
  {
    name: 'gcp', displayName: 'GCP', category: 'CLOUD',
    patterns: [/\bgcp\b/i, /\bgoogle\s*cloud\b/i],
    demandScore: 6, salaryScore: 8, difficulty: 5, futureScore: 8, mobilityScore: 8,
  },
  {
    name: 'azure', displayName: 'Azure', category: 'CLOUD',
    patterns: [/\bazure\b/i, /\bmicrosoft\s*cloud\b/i],
    demandScore: 7, salaryScore: 8, difficulty: 5, futureScore: 8, mobilityScore: 8,
  },

  // ── Infrastructure ──
  {
    name: 'docker', displayName: 'Docker', category: 'INFRASTRUCTURE',
    patterns: [/\bdocker\b/i, /\bcontainer(?:s|ization)\b/i],
    demandScore: 9, salaryScore: 7, difficulty: 3, futureScore: 8, mobilityScore: 9,
  },
  {
    name: 'kubernetes', displayName: 'Kubernetes', category: 'INFRASTRUCTURE',
    patterns: [/\bkubernetes\b/i, /\bk8s\b/i, /\bhelm\b/i],
    demandScore: 8, salaryScore: 9, difficulty: 7, futureScore: 9, mobilityScore: 9,
  },
  {
    name: 'terraform', displayName: 'Terraform', category: 'INFRASTRUCTURE',
    patterns: [/\bterraform\b/i, /\biac\b/i, /\binfra\w*\s*as\s*code\b/i],
    demandScore: 8, salaryScore: 9, difficulty: 6, futureScore: 9, mobilityScore: 8,
  },
  {
    name: 'linux', displayName: 'Linux', category: 'INFRASTRUCTURE',
    patterns: [/\blinux\b/i, /\bubuntu\b/i, /\bdebian\b/i, /\bcentos\b/i],
    demandScore: 8, salaryScore: 7, difficulty: 4, futureScore: 7, mobilityScore: 9,
  },
  {
    name: 'cicd', displayName: 'CI/CD', category: 'INFRASTRUCTURE',
    patterns: [/\bci\s*\/?\s*cd\b/i, /\bjenkins\b/i, /\bgithub\s*actions\b/i, /\bgitlab\s*ci\b/i, /\bcircle\s*ci\b/i],
    demandScore: 8, salaryScore: 7, difficulty: 4, futureScore: 7, mobilityScore: 8,
  },
  {
    name: 'ansible', displayName: 'Ansible', category: 'INFRASTRUCTURE',
    patterns: [/\bansible\b/i],
    demandScore: 5, salaryScore: 7, difficulty: 5, futureScore: 5, mobilityScore: 7,
  },

  // ── Databases ──
  {
    name: 'postgresql', displayName: 'PostgreSQL', category: 'DATABASE',
    patterns: [/\bpostgres(?:ql)?\b/i, /\bpg\b/i],
    demandScore: 9, salaryScore: 7, difficulty: 4, futureScore: 8, mobilityScore: 9,
  },
  {
    name: 'mysql', displayName: 'MySQL', category: 'DATABASE',
    patterns: [/\bmysql\b/i, /\bmariadb\b/i],
    demandScore: 7, salaryScore: 6, difficulty: 3, futureScore: 6, mobilityScore: 8,
  },
  {
    name: 'redis', displayName: 'Redis', category: 'DATABASE',
    patterns: [/\bredis\b/i],
    demandScore: 7, salaryScore: 7, difficulty: 3, futureScore: 7, mobilityScore: 8,
  },
  {
    name: 'mongodb', displayName: 'MongoDB', category: 'DATABASE',
    patterns: [/\bmongo(?:db)?\b/i],
    demandScore: 6, salaryScore: 6, difficulty: 3, futureScore: 6, mobilityScore: 7,
  },
  {
    name: 'elasticsearch', displayName: 'Elasticsearch', category: 'DATABASE',
    patterns: [/\belastic\s*search\b/i, /\belastic\b/i, /\bopensearch\b/i],
    demandScore: 5, salaryScore: 7, difficulty: 5, futureScore: 6, mobilityScore: 7,
  },
  {
    name: 'dynamodb', displayName: 'DynamoDB', category: 'DATABASE',
    patterns: [/\bdynamo\s*db\b/i],
    demandScore: 5, salaryScore: 7, difficulty: 4, futureScore: 6, mobilityScore: 6,
  },
  {
    name: 'cassandra', displayName: 'Cassandra', category: 'DATABASE',
    patterns: [/\bcassandra\b/i],
    demandScore: 3, salaryScore: 8, difficulty: 7, futureScore: 5, mobilityScore: 5,
  },

  // ── AI/ML ──
  {
    name: 'llm', displayName: 'LLM Engineering', category: 'AI_ML',
    patterns: [/\bllm\b/i, /\blarge\s*language\s*model\b/i, /\bgpt\b/i, /\bclaude\b/i, /\bgemini\b(?!\s*(?:zodiac|sign))/i],
    demandScore: 8, salaryScore: 10, difficulty: 7, futureScore: 10, mobilityScore: 7,
  },
  {
    name: 'rag', displayName: 'RAG', category: 'AI_ML',
    patterns: [/\brag\b/i, /\bretrieval[\s-]*augmented/i],
    demandScore: 7, salaryScore: 10, difficulty: 8, futureScore: 10, mobilityScore: 6,
  },
  {
    name: 'ai_agents', displayName: 'AI Agents', category: 'AI_ML',
    patterns: [/\bai\s*agents?\b/i, /\bagent(?:ic)?\s*(?:ai|framework|system)\b/i, /\blangchain\b/i, /\bautogen\b/i],
    demandScore: 7, salaryScore: 10, difficulty: 8, futureScore: 10, mobilityScore: 6,
  },
  {
    name: 'mlops', displayName: 'MLOps', category: 'AI_ML',
    patterns: [/\bmlops\b/i, /\bml\s*ops\b/i, /\bml\s*pipeline\b/i, /\bmlflow\b/i, /\bkubeflow\b/i],
    demandScore: 6, salaryScore: 9, difficulty: 7, futureScore: 9, mobilityScore: 7,
  },
  {
    name: 'ml', displayName: 'Machine Learning', category: 'AI_ML',
    patterns: [/\bmachine\s*learning\b/i, /\bml\b/i, /\bdeep\s*learning\b/i, /\btensorflow\b/i, /\bpytorch\b/i],
    demandScore: 7, salaryScore: 9, difficulty: 7, futureScore: 9, mobilityScore: 8,
  },
  {
    name: 'nlp', displayName: 'NLP', category: 'AI_ML',
    patterns: [/\bnlp\b/i, /\bnatural\s*language\b/i],
    demandScore: 6, salaryScore: 9, difficulty: 7, futureScore: 8, mobilityScore: 7,
  },
  {
    name: 'computer_vision', displayName: 'Computer Vision', category: 'AI_ML',
    patterns: [/\bcomputer\s*vision\b/i, /\bcv\b(?=\s*[,/]|\s+engineer)/i, /\bimage\s*recognition\b/i],
    demandScore: 5, salaryScore: 9, difficulty: 8, futureScore: 7, mobilityScore: 6,
  },

  // ── Tools ──
  {
    name: 'git', displayName: 'Git', category: 'TOOL',
    patterns: [/\bgit\b(?!hub|lab)/i],
    demandScore: 9, salaryScore: 5, difficulty: 2, futureScore: 7, mobilityScore: 9,
  },
  {
    name: 'kafka', displayName: 'Apache Kafka', category: 'TOOL',
    patterns: [/\bkafka\b/i],
    demandScore: 6, salaryScore: 8, difficulty: 7, futureScore: 8, mobilityScore: 7,
  },
  {
    name: 'rabbitmq', displayName: 'RabbitMQ', category: 'TOOL',
    patterns: [/\brabbitmq\b/i],
    demandScore: 4, salaryScore: 7, difficulty: 5, futureScore: 5, mobilityScore: 6,
  },
  {
    name: 'microservices', displayName: 'Microservices', category: 'TOOL',
    patterns: [/\bmicro\s*services?\b/i],
    demandScore: 7, salaryScore: 8, difficulty: 6, futureScore: 7, mobilityScore: 8,
  },
  {
    name: 'distributed_systems', displayName: 'Distributed Systems', category: 'TOOL',
    patterns: [/\bdistributed\s*systems?\b/i],
    demandScore: 6, salaryScore: 9, difficulty: 8, futureScore: 9, mobilityScore: 8,
  },
];

/**
 * Detect technologies mentioned in a text.
 * Returns a deduplicated array of technology names.
 */
export function detectTechStack(text: string): string[] {
  const found = new Set<string>();
  for (const tech of TECH_PATTERNS) {
    for (const pattern of tech.patterns) {
      if (pattern.test(text)) {
        found.add(tech.name);
        break;
      }
    }
  }
  return Array.from(found);
}

/**
 * Get full tech info by name
 */
export function getTechInfo(name: string): TechPattern | undefined {
  return TECH_PATTERNS.find((t) => t.name === name);
}

/**
 * Get all tech patterns
 */
export function getAllTechPatterns(): TechPattern[] {
  return TECH_PATTERNS;
}

/**
 * Calculate Jaccard similarity between candidate skills and required skills
 */
export function calculateSkillMatch(candidateSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 50; // Default match if no skills required
  const candidateSet = new Set(candidateSkills.map((s) => s.toLowerCase()));
  const requiredSet = new Set(requiredSkills.map((s) => s.toLowerCase()));
  const intersection = new Set([...candidateSet].filter((s) => requiredSet.has(s)));
  const union = new Set([...candidateSet, ...requiredSet]);
  return Math.round((intersection.size / union.size) * 100);
}

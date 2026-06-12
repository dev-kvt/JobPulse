import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🌱 Seeding technology taxonomy into the database...');

  const technologies = [
    // Languages
    { name: 'python', displayName: 'Python', category: 'LANGUAGE', demandScore: 9, salaryScore: 7, difficulty: 4, futureScore: 9, mobilityScore: 9 },
    { name: 'java', displayName: 'Java', category: 'LANGUAGE', demandScore: 8, salaryScore: 7, difficulty: 6, futureScore: 7, mobilityScore: 9 },
    { name: 'go', displayName: 'Go', category: 'LANGUAGE', demandScore: 7, salaryScore: 9, difficulty: 5, futureScore: 9, mobilityScore: 8 },
    { name: 'rust', displayName: 'Rust', category: 'LANGUAGE', demandScore: 5, salaryScore: 10, difficulty: 9, futureScore: 9, mobilityScore: 6 },
    { name: 'typescript', displayName: 'TypeScript', category: 'LANGUAGE', demandScore: 9, salaryScore: 7, difficulty: 4, futureScore: 8, mobilityScore: 9 },
    { name: 'javascript', displayName: 'JavaScript', category: 'LANGUAGE', demandScore: 9, salaryScore: 6, difficulty: 3, futureScore: 7, mobilityScore: 9 },
    { name: 'csharp', displayName: 'C#', category: 'LANGUAGE', demandScore: 6, salaryScore: 7, difficulty: 5, futureScore: 6, mobilityScore: 7 },
    { name: 'cpp', displayName: 'C++', category: 'LANGUAGE', demandScore: 5, salaryScore: 8, difficulty: 8, futureScore: 6, mobilityScore: 6 },
    { name: 'ruby', displayName: 'Ruby', category: 'LANGUAGE', demandScore: 4, salaryScore: 7, difficulty: 4, futureScore: 5, mobilityScore: 6 },
    { name: 'scala', displayName: 'Scala', category: 'LANGUAGE', demandScore: 4, salaryScore: 9, difficulty: 8, futureScore: 6, mobilityScore: 5 },
    { name: 'kotlin', displayName: 'Kotlin', category: 'LANGUAGE', demandScore: 5, salaryScore: 7, difficulty: 5, futureScore: 7, mobilityScore: 6 },
    { name: 'swift', displayName: 'Swift', category: 'LANGUAGE', demandScore: 4, salaryScore: 8, difficulty: 5, futureScore: 6, mobilityScore: 5 },

    // Frameworks
    { name: 'spring', displayName: 'Spring Boot', category: 'FRAMEWORK', demandScore: 8, salaryScore: 7, difficulty: 6, futureScore: 7, mobilityScore: 9 },
    { name: 'nodejs', displayName: 'Node.js', category: 'FRAMEWORK', demandScore: 9, salaryScore: 7, difficulty: 4, futureScore: 8, mobilityScore: 9 },
    { name: 'react', displayName: 'React', category: 'FRAMEWORK', demandScore: 9, salaryScore: 7, difficulty: 5, futureScore: 8, mobilityScore: 9 },
    { name: 'nextjs', displayName: 'Next.js', category: 'FRAMEWORK', demandScore: 7, salaryScore: 7, difficulty: 5, futureScore: 8, mobilityScore: 8 },
    { name: 'fastapi', displayName: 'FastAPI', category: 'FRAMEWORK', demandScore: 6, salaryScore: 7, difficulty: 4, futureScore: 9, mobilityScore: 7 },
    { name: 'django', displayName: 'Django', category: 'FRAMEWORK', demandScore: 6, salaryScore: 7, difficulty: 4, futureScore: 6, mobilityScore: 7 },
    { name: 'flask', displayName: 'Flask', category: 'FRAMEWORK', demandScore: 5, salaryScore: 6, difficulty: 3, futureScore: 5, mobilityScore: 6 },
    { name: 'dotnet', displayName: '.NET', category: 'FRAMEWORK', demandScore: 6, salaryScore: 7, difficulty: 5, futureScore: 6, mobilityScore: 7 },
    { name: 'rails', displayName: 'Ruby on Rails', category: 'FRAMEWORK', demandScore: 4, salaryScore: 7, difficulty: 4, futureScore: 5, mobilityScore: 6 },
    { name: 'graphql', displayName: 'GraphQL', category: 'FRAMEWORK', demandScore: 6, salaryScore: 7, difficulty: 5, futureScore: 7, mobilityScore: 7 },
    { name: 'grpc', displayName: 'gRPC', category: 'FRAMEWORK', demandScore: 5, salaryScore: 8, difficulty: 6, futureScore: 8, mobilityScore: 7 },

    // Cloud
    { name: 'aws', displayName: 'AWS', category: 'CLOUD', demandScore: 9, salaryScore: 8, difficulty: 5, futureScore: 8, mobilityScore: 9 },
    { name: 'gcp', displayName: 'GCP', category: 'CLOUD', demandScore: 6, salaryScore: 8, difficulty: 5, futureScore: 8, mobilityScore: 8 },
    { name: 'azure', displayName: 'Azure', category: 'CLOUD', demandScore: 7, salaryScore: 8, difficulty: 5, futureScore: 8, mobilityScore: 8 },

    // Infrastructure
    { name: 'docker', displayName: 'Docker', category: 'INFRASTRUCTURE', demandScore: 9, salaryScore: 7, difficulty: 3, futureScore: 8, mobilityScore: 9 },
    { name: 'kubernetes', displayName: 'Kubernetes', category: 'INFRASTRUCTURE', demandScore: 8, salaryScore: 9, difficulty: 7, futureScore: 9, mobilityScore: 9 },
    { name: 'terraform', displayName: 'Terraform', category: 'INFRASTRUCTURE', demandScore: 8, salaryScore: 9, difficulty: 6, futureScore: 9, mobilityScore: 8 },
    { name: 'linux', displayName: 'Linux', category: 'INFRASTRUCTURE', demandScore: 8, salaryScore: 7, difficulty: 4, futureScore: 7, mobilityScore: 9 },
    { name: 'cicd', displayName: 'CI/CD', category: 'INFRASTRUCTURE', demandScore: 8, salaryScore: 7, difficulty: 4, futureScore: 7, mobilityScore: 8 },
    { name: 'ansible', displayName: 'Ansible', category: 'INFRASTRUCTURE', demandScore: 5, salaryScore: 7, difficulty: 5, futureScore: 5, mobilityScore: 7 },

    // Databases
    { name: 'postgresql', displayName: 'PostgreSQL', category: 'DATABASE', demandScore: 9, salaryScore: 7, difficulty: 4, futureScore: 8, mobilityScore: 9 },
    { name: 'mysql', displayName: 'MySQL', category: 'DATABASE', demandScore: 7, salaryScore: 6, difficulty: 3, futureScore: 6, mobilityScore: 8 },
    { name: 'redis', displayName: 'Redis', category: 'DATABASE', demandScore: 7, salaryScore: 7, difficulty: 3, futureScore: 7, mobilityScore: 8 },
    { name: 'mongodb', displayName: 'MongoDB', category: 'DATABASE', demandScore: 6, salaryScore: 6, difficulty: 3, futureScore: 6, mobilityScore: 7 },
    { name: 'elasticsearch', displayName: 'Elasticsearch', category: 'DATABASE', demandScore: 5, salaryScore: 7, difficulty: 5, futureScore: 6, mobilityScore: 7 },
    { name: 'dynamodb', displayName: 'DynamoDB', category: 'DATABASE', demandScore: 5, salaryScore: 7, difficulty: 4, futureScore: 6, mobilityScore: 6 },
    { name: 'cassandra', displayName: 'Cassandra', category: 'DATABASE', demandScore: 3, salaryScore: 8, difficulty: 7, futureScore: 5, mobilityScore: 5 },

    // AI/ML
    { name: 'llm', displayName: 'LLM Engineering', category: 'AI_ML', demandScore: 8, salaryScore: 10, difficulty: 7, futureScore: 10, mobilityScore: 7 },
    { name: 'rag', displayName: 'RAG', category: 'AI_ML', demandScore: 7, salaryScore: 10, difficulty: 8, futureScore: 10, mobilityScore: 6 },
    { name: 'ai_agents', displayName: 'AI Agents', category: 'AI_ML', demandScore: 7, salaryScore: 10, difficulty: 8, futureScore: 10, mobilityScore: 6 },
    { name: 'mlops', displayName: 'MLOps', category: 'AI_ML', demandScore: 6, salaryScore: 9, difficulty: 7, futureScore: 9, mobilityScore: 7 },
    { name: 'ml', displayName: 'Machine Learning', category: 'AI_ML', demandScore: 7, salaryScore: 9, difficulty: 7, futureScore: 9, mobilityScore: 8 },
    { name: 'nlp', displayName: 'NLP', category: 'AI_ML', demandScore: 6, salaryScore: 9, difficulty: 7, futureScore: 8, mobilityScore: 7 },
    { name: 'computer_vision', displayName: 'Computer Vision', category: 'AI_ML', demandScore: 5, salaryScore: 9, difficulty: 8, futureScore: 7, mobilityScore: 6 },

    // Tools / Methodologies
    { name: 'git', displayName: 'Git', category: 'TOOL', demandScore: 9, salaryScore: 5, difficulty: 2, futureScore: 7, mobilityScore: 9 },
    { name: 'kafka', displayName: 'Apache Kafka', category: 'TOOL', demandScore: 6, salaryScore: 8, difficulty: 7, futureScore: 8, mobilityScore: 7 },
    { name: 'rabbitmq', displayName: 'RabbitMQ', category: 'TOOL', demandScore: 4, salaryScore: 7, difficulty: 5, futureScore: 5, mobilityScore: 6 },
    { name: 'microservices', displayName: 'Microservices', category: 'TOOL', demandScore: 7, salaryScore: 8, difficulty: 6, futureScore: 7, mobilityScore: 8 },
    { name: 'distributed_systems', displayName: 'Distributed Systems', category: 'TOOL', demandScore: 6, salaryScore: 9, difficulty: 8, futureScore: 9, mobilityScore: 8 }
  ];

  for (const tech of technologies) {
    await prisma.technology.upsert({
      where: { name: tech.name },
      update: {
        displayName: tech.displayName,
        category: tech.category as any,
        demandScore: tech.demandScore,
        salaryScore: tech.salaryScore,
        difficulty: tech.difficulty,
        futureScore: tech.futureScore,
        mobilityScore: tech.mobilityScore,
      },
      create: {
        name: tech.name,
        displayName: tech.displayName,
        category: tech.category as any,
        demandScore: tech.demandScore,
        salaryScore: tech.salaryScore,
        difficulty: tech.difficulty,
        futureScore: tech.futureScore,
        mobilityScore: tech.mobilityScore,
      },
    });
  }

  console.log('✅ Technology taxonomy seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

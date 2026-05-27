import SectionTitle from '../components/SectionTitle'
import ProjectCard from '../components/ProjectCard'

const projects = [
  {
    name: 'Portfolio Website',
    description: 'A modern personal portfolio built with React, Tailwind CSS, and Express backend services.',
    tags: ['React', 'Tailwind', 'Express', 'Prisma'],
    githubUrl: 'https://github.com/Okkar06/okkar_profolio',
    liveUrl: 'https://example.com',
  },
  {
    name: 'Task Manager API',
    description: 'A RESTful task management API with authentication, database persistence, and deployment-ready setup.',
    tags: ['Node.js', 'Express', 'PostgreSQL'],
    githubUrl: 'https://github.com/Okkar06',
    liveUrl: 'https://example.com',
  },
  {
    name: 'Realtime Chat App',
    description: 'A responsive chat interface supporting real-time messaging and clean mobile-first UI patterns.',
    tags: ['React', 'WebSocket', 'Tailwind'],
    githubUrl: 'https://github.com/Okkar06',
    liveUrl: 'https://example.com',
  },
]

function ProjectsSection() {
  return (
    <section id="projects" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle title="Projects" subtitle="Selected work and experiments" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.name} {...project} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProjectsSection

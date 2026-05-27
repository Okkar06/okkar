import SectionTitle from '../components/SectionTitle'
import SkillGroup from '../components/SkillGroup'

const skillGroups = [
  {
    title: 'Frontend',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'Vite'],
  },
  {
    title: 'Backend',
    skills: ['Node.js', 'Express', 'Prisma', 'PostgreSQL / Supabase'],
  },
  {
    title: 'Tools',
    skills: ['Git & GitHub', 'Render', 'VS Code', 'Postman'],
  },
]

function SkillsSection() {
  return (
    <section id="skills" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionTitle title="Skills" subtitle="Technologies I work with" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {skillGroups.map((group) => (
            <SkillGroup key={group.title} {...group} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SkillsSection

function SkillGroup({ title, skills }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-card p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-2 text-gray-300">
        {skills.map((skill) => (
          <li key={skill} className="rounded-md bg-gray-800 px-3 py-2">
            {skill}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkillGroup

import SectionHeader from '../components/SectionHeader'

export default function SimplePage({ title, description }) {
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="MedArchive" title={title} description={description} />
    </div>
  )
}

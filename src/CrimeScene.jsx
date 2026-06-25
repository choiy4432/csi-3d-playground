import EvidenceObject from './EvidenceObject'

export default function CrimeScene({ evidences, hoveredId, inRange }) {
  return (
    <>
      {evidences.map((ev) => (
        <EvidenceObject
          key={ev.id}
          id={ev.id}
          file={ev.file}
          position={ev.position}
          colliderSize={ev.colliderSize}
          collected={ev.collected}
          hovered={ev.id === hoveredId}
          inRange={ev.id === hoveredId && inRange}
        />
      ))}
    </>
  )
}

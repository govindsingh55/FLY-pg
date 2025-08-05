type Params = Promise<{ slug: string }>

export default async function PropertiesPage({ params }: { params: Params }) {
  const { slug } = await params
  return (
    <div>
      <h1>Properties</h1>
      <p>Slug: {slug}</p>
    </div>
  )
}

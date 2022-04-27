import { useRouter } from 'next/router'

const LessonDetails = () => {
  const { query: { id } }= useRouter()

  return <h1>Lesson {id}</h1>
}

export default LessonDetails
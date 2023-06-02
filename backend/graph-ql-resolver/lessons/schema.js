
export const lesson = {
  testStr: 'test string'
}

export const typeDefs = `#graphql
  type Lesson {
    testStr: String
  }

  type Query {
    lessons: [lesson]
  }
`;
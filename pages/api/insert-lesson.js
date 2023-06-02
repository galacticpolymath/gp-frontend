import { ApolloServer } from '@apollo/server';

const schema = await buildSchema({
    resolvers: [LessonSchemaResolver],
  });
  
  const server = new ApolloServer({
    schema,
  });
  
  export const config = {
    api: {
      bodyParser: false,
    },
  };


export default function handler(req, res) {
    if (req.method === 'GET') {
        res.status(200).json({ msg: 'The lessons route is live!' })
        return;
    }

    res.status(404).json({ error: 'Not Found' })
}
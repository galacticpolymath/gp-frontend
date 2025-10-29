export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ msg: "Incorrect request method. Must be a 'GET'." });
  }

  return response.json({ environment: process.env.NEXT_PUBLIC_VERCEL_ENV });
}
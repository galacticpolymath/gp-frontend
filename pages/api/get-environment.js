export default function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ msg: "Incorrect request method. Must be a 'GET'." });
  }

  return response.status(200).json({ environment: process.env.NEXT_PUBLIC_VERCEL_ENV });
}
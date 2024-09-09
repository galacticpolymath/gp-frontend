export default function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ msg: "Incorrect request method. Must be a 'GET'." });
  }

  return response.json({ environment: process.env.NEXT_PUBLIC_VERCEL_ENV, emailUser: process.env.EMAIL_USER, password: process.env.EMAIL_PASSWORD });
}

export default async function handler(request, response) {
  try {
    console.log('request: ', request)

    // GOAL: serve the index.html files here
    // get the name of the app
    // by virtue of the name, get its corresponding index.html file. 

    response.status(200).json({ msg: "This route is live." })
  } catch(error){
    console.error('An error has occurred in serving html of apps: ', error);
  }
}
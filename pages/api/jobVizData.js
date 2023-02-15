import path from 'path';
import { promises as fileSystem } from 'fs';

export default async function handler(req, res) {
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), 'data/Jobviz');
  //Read the json data file data.json
  const targetFile = `${jsonDirectory}/jobVizData.json`;
  const fileContents = await fileSystem.readFile(targetFile, 'utf8');
  //Return the content of the data file in json format
  res.status(200).json(fileContents);
}

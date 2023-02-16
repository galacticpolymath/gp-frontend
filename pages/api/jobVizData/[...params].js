/* eslint-disable no-console */
import path from 'path';
import { promises as fileSystem } from 'fs';

// create a function that will get all of the elements depending on the hierarch level
// filter based on the following criteria:
// level 1 === target hierarchy level
// hierarchy number === target hierarchy number
// show the details of the specific field in the top card 

export default async function handler(req, res) {
  //Find the absolute path of the json directory
  console.log('req.query: ', req.query);

  const jsonDirectory = path.join(process.cwd(), 'data/Jobviz');
  //Read the json data file data.json
  const targetFile = `${jsonDirectory}/jobVizData.json`;
  const fileContents = await fileSystem.readFile(targetFile, 'utf8');
  // const _fileContents = fileContents.filter(content => {
  //   const { level1, hierarchy } = content;

  //   return ((level1 === '17-0000') && hierarchy === 2);
  // });

  //Return the content of the data file in json format
  res.status(200).json(fileContents);
}

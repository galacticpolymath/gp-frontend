/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable no-multiple-empty-lines */
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
  const { params } = req.query ?? {};

  if (!params){
    res.status(404).json({ message: 'No params found' });
  }
  
  const[targetHierarchy, targetLevel1] = JSON.parse(params);
  const targetHierarchyNum = parseInt(targetHierarchy);

  if(isNaN(targetHierarchyNum)){
    res.status(404).json({ message: 'Invalid value for hierarchy params.' });
  }

  const jsonDirectory = path.join(process.cwd(), 'data/Jobviz');
  const targetFile = `${jsonDirectory}/jobVizData.json`;
  const fileContents = JSON.parse(await fileSystem.readFile(targetFile, 'utf8'));
  const fileContentsFiltered = fileContents.filter(file => {
    const { hierarchy, level1 } = file; 

    return ((hierarchy === targetHierarchyNum) && (level1 === targetLevel1));
  });

  res.status(200).json(fileContentsFiltered);
}

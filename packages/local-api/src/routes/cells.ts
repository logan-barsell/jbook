import express from 'express';
import fs from 'fs/promises';
import path from 'path';

interface Cell {
  id: string;
  content: string;
  type: 'text' | 'code';
}

export const createCellsRouter = (filename: string, dir: string) => {


  const router = express.Router();
  router.use(express.json());

  const fullPath = path.join(dir, filename);

  router.get('/cells', async (req, res) => {
    try{
      // read file
      const result = await fs.readFile(fullPath, { encoding: 'utf-8' });
      // parse a list of cells out of it
      // send list of cells back to browser
      res.send(JSON.parse(result));
    } catch (err:any) {
       // if read throws an error, see if it says that the file doesnt exist
      if (err.code === 'ENOENT') {
        // add code to create a file with default cells
        await fs.writeFile(fullPath, '[]', 'utf-8');
        res.send([]);
      } else {
        throw err;
      }
    }
 
  });

  router.post('/cells', async (req, res) => {
    // take list of cells from req object
    // serialize them
    const { cells }: { cells: Cell[] } = req.body;

    // write the cells into the file
    await fs.writeFile(fullPath, JSON.stringify(cells), 'utf-8');

    res.send({ status: 'ok' });
  });

  return router;

};

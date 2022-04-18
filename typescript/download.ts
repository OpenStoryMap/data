import fs from 'fs';
import path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';

import axios from 'axios';
import { Extract } from 'unzipper';


const finished = promisify(stream.finished);

export async function downloadAndExtract(url: string, outputDir: string): Promise<void> {
  fs.rmSync(outputDir, { recursive: true, force: true });

  const tempZipFileName = `tempfile-${+new Date()}.zip`;

  await downloadFile(url, tempZipFileName);

  try {
    await new Promise((resolve: Function) => {
      fs.createReadStream(tempZipFileName)
        .pipe(Extract({path: outputDir}))
        .on('close', () => resolve('close'));
    });
  } finally {
    fs.rmSync(tempZipFileName, { force: true });
  }
}

export async function downloadFile(fileUrl: string, outputLocationPath: string): Promise<void> {
  ensureDirExists(outputLocationPath);
  
  const writer = fs.createWriteStream(outputLocationPath);

  await axios({
    method: 'GET',
    url: fileUrl,
    responseType: 'stream',
    timeout: 60000
  }).then(async response => {
    response.data.pipe(writer);
    return finished(writer);
  });
}

function ensureDirExists(filePath: string): void {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
}

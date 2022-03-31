import { createWriteStream, createReadStream, rmSync } from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';

import axios from 'axios';
import { Extract } from 'unzipper';


const finished = promisify(stream.finished);

export async function downloadAndExtract(url: string, outputDir: string): Promise<void> {
  rmSync(outputDir, { recursive: true, force: true });

  const tempZipFileName = `tempfile-${+new Date()}.zip`;

  await downloadFile(url, tempZipFileName);

  try {
    await new Promise((resolve: Function) => {
      createReadStream(tempZipFileName)
        .pipe(Extract({path: outputDir}))
        .on('close', () => resolve('close'));
    });
  } finally {
    rmSync(tempZipFileName, { force: true });
  }
}

async function downloadFile(fileUrl: string, outputLocationPath: string): Promise<void> {
  const writer = createWriteStream(outputLocationPath);

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

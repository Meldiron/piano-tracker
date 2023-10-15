import { Client, Storage } from 'node-appwrite';
import * as csv from 'csv-string';

export default async ({ req, res, log, error }) => {
  const client = new Client()
     .setEndpoint('https://cloud.appwrite.io/v1')
     .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
     .setKey(process.env.APPWRITE_API_KEY);

    const fileId = req.body;

    const storage = new Storage(client);
    const file = await storage.getFileDownload('imports', fileId);

    const rows = csv.parse(file);

    return res.send({
      output: rows
    });
};

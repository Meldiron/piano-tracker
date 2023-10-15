import { Client, Databases, Query, Storage } from 'node-appwrite';
import * as csv from 'csv-string';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const storage = new Storage(client);
  const databases = new Databases(client);

  const fileId = req.body;

  const file = (await storage.getFileDownload('imports', fileId)).toString('utf-8');

  const rows = csv.parse(file);

  for (const row of rows) {
    let [name, urlPatreon, urlYoutube] = row;

    name = name.split("'(NEW)").join('').trim();

    const existingSong = await databases.listDocuments('main', 'song', [
      Query.equal('name', name),
      Query.limit(1)
    ]);

    if (existingSong.documents.length <= 0) {
      await databases.createDocument(
        'main',
        'songs',
        {
          name,
          urlPatreon,
          urlYoutube
        }
      );
    }
  }

  return res.send(rows);
};

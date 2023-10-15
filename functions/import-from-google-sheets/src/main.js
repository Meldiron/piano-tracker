import { Client, Databases, ID, Query, Storage } from 'node-appwrite';
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

  let rows = csv.parse(file);
  rows = rows.sort((a, b) => {
    let aArr = (a[1] ?? '').split('-') ?? [];
    let aId = +(aArr[aArr.length - 1] ?? '0');

    let bArr = (b[1] ?? '').split('-') ?? [];
    let bId = +(bArr[bArr.length - 1] ?? '0');

    return aId > bId ? 1 : -1;
  });

  for (const row of rows) {
    let [name, urlPatreon, urlYoutube] = row;

    if(name === 'Artist/Song (Alphabetical Order)') {
      continue;
    }

    name = name.split("(NEW)").join('').trim();

    const existingSong = await databases.listDocuments('main', 'songs', [
      Query.equal('name', name),
      Query.limit(1)
    ]);

    if (existingSong.documents.length <= 0) {
      await databases.createDocument(
        'main',
        'songs',
        ID.unique(),
        {
          name,
          urlPatreon,
          urlYoutube
        }
      );
    }
  }

  return res.send('OK');
};

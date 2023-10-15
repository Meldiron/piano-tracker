import { Client, Databases, Account, Query } from 'appwrite';

const client = new Client();

client.setEndpoint('https://cloud.appwrite.io/v1');
client.setProject('piano-tracker');

export const databases = new Databases(client);
export const account = new Account(client);

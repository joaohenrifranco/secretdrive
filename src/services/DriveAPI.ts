import { chunkedStreamGenerator } from '@/utils/chunkedStream';
import { GoogleAuth } from './GoogleAuthAPI';

type ListFilesReturnType = {
  id: string | undefined;
  name: string | undefined;
}[];

export class DriveAPI {
  static async listFiles(): Promise<ListFilesReturnType> {
    if (!GoogleAuth.access_token) {
      throw new Error('[GoogleAuth] No access token available');
    }

    const response = await gapi.client.drive.files.list({
      pageSize: 20,
      fields: 'files(id, name)',
    });

    return response.result.files?.map((f) => ({ id: f.id, name: f.name })) ?? [];
  }

  static async uploadFile(name: string, stream: ReadableStream): Promise<void> {
    const createResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GoogleAuth.access_token}`,
          'Content-Type': 'application/json',
          'Content-Length': '0',
        },
        body: JSON.stringify({
          name,
        }),
      },
    );

    const sessionUri = createResponse.headers.get('Location');

    if (!sessionUri) {
      throw new Error('[DRIVE_API] Drive API did not return a session URI');
    }

    const reader = stream.getReader();
    const chunkSize = 256 * 1024; // 256 KB in bytes
    let offset = 0;

    for await (const chunk of chunkedStreamGenerator(reader, chunkSize)) {
      const totalLengthIndicator = chunk.byteLength === chunkSize ? '*' : offset + chunk.byteLength;

      await fetch(sessionUri, {
        method: 'PUT',
        headers: {
          'Content-Length': chunk.byteLength.toString(),
          'Content-Range': `bytes ${offset}-${offset + chunk.byteLength - 1}/${totalLengthIndicator}`,
        },
        body: chunk,
      });
      offset += chunk.byteLength;
    }
  }

  static downloadFile(id: string): Promise<ReadableStream> {
    return fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
      headers: {
        Authorization: `Bearer ${GoogleAuth.access_token}`,
      },
    }).then((response) => response.body!);
  }
}

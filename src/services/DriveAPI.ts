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

    let offset = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      await fetch(sessionUri, {
        method: 'PUT',
        headers: {
          'Content-Length': value.byteLength.toString(),
          'Content-Range': `bytes ${offset}-${offset + value.byteLength - 1}/12`,
        },
        body: value,
      });

      offset += value.byteLength;
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

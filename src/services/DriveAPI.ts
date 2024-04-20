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
    const createResponse = await gapi.client.drive.files.create({
      resource: {
        name: name,
        mimeType: 'application/octet-stream',
      },
    });

    // Only works on Chrome as of 2024-04
    // await fetch(
    //   `https://www.googleapis.com/upload/drive/v3/files/${createResponse.result.id}?uploadType=resumable`,
    //   {
    //     method: 'PATCH',
    //     headers: {
    //       Authorization: `Bearer ${gapi.auth.getToken().access_token}`,
    //     },
    //     body: stream,
    //     duplex: 'half',
    //   },
    // );

    const reader = stream.getReader();

    let offset = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      // multipart upload
      await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${createResponse.result.id}?uploadType=media`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${GoogleAuth.access_token}`,
            'Content-Length': value.byteLength.toString(),
            'Content-Range': `bytes ${offset}-${offset + value.byteLength - 1}/*`,
          },
        },
      );

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

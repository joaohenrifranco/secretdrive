import { chunkedStreamGenerator } from '@/utils/chunkedStream';
import { GoogleAuth } from './GoogleAuthAPI';

type ListFilesReturnType = {
  id: string | undefined;
  name: string | undefined;
}[];

const RESPONSE_CODES = {
  resumeIncomplete: 308,
  ok: 200,
  created: 201,
  notFound: 404,
};

const REQUEST_CHUNK_SIZE = 256 * 1024; // 256 KB in bytes

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

  private static async uploadStream(
    sessionUri: string,
    reader: ReadableStreamDefaultReader,
    readOffset: number,
    unsentBuffer: ArrayBuffer | null,
  ) {
    if (!unsentBuffer) {
      unsentBuffer = new ArrayBuffer(0);
    }

    const askedChunkSize = REQUEST_CHUNK_SIZE - unsentBuffer.byteLength;
    console.log(`Asking for ${askedChunkSize} bytes`);
    const readResult = await chunkedStreamGenerator(reader, askedChunkSize).next();

    if (readResult.done) {
      return;
    }

    const readChunk = readResult.value;
    const bytesRead = readOffset + readChunk.byteLength;
    console.log(`Read ${readChunk.byteLength} bytes`);
    console.log(`Total read ${bytesRead} bytes`);

    const unknown = '*';
    const isLast = readChunk.byteLength !== REQUEST_CHUNK_SIZE;
    const contentRangeTotal = isLast ? bytesRead.toString() : unknown;

    const requestBuffer = new Uint8Array(unsentBuffer.byteLength + readChunk.byteLength);
    requestBuffer.set(new Uint8Array(unsentBuffer), 0);
    requestBuffer.set(new Uint8Array(readChunk), unsentBuffer.byteLength);

    console.log(`Uploading chunk ${readOffset}-${bytesRead - 1}/${contentRangeTotal}`);

    const chunkResponse = await fetch(sessionUri, {
      method: 'PUT',
      headers: {
        'Content-Length': readChunk.byteLength.toString(),
        'Content-Range': `bytes ${readOffset}-${bytesRead - 1}/${contentRangeTotal}`,
      },
      body: requestBuffer,
    });

    if (chunkResponse.status === RESPONSE_CODES.resumeIncomplete) {
      const lastByte = parseInt(chunkResponse.headers.get('Range')?.split('-')[1] ?? '0', 10);
      const bytesSent = lastByte + 1;

      console.log(`Upload incomplete, resuming from ${bytesSent}`);

      const unsent = bytesRead - bytesSent;
      const unsentBuffer = requestBuffer.slice(requestBuffer.length - unsent);

      await this.uploadStream(sessionUri, reader, bytesRead, unsentBuffer);
    }

    await this.uploadStream(sessionUri, reader, bytesRead, null);
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
    await this.uploadStream(sessionUri, reader, 0, null);
  }

  static downloadFile(id: string): Promise<ReadableStream> {
    return fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
      headers: {
        Authorization: `Bearer ${GoogleAuth.access_token}`,
      },
    }).then((response) => response.body!);
  }
}

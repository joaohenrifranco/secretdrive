import { getFixedSizeChunk } from '@/utils/fixedSizeChunk';
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
    unsentBuffer: Uint8Array | null,
  ) {
    if (!unsentBuffer) {
      unsentBuffer = new Uint8Array(0);
    }

    const askedChunkSize = REQUEST_CHUNK_SIZE - unsentBuffer.byteLength;
    console.log(`Asking for ${askedChunkSize} bytes`);
    const readResult = await getFixedSizeChunk(reader, askedChunkSize).next();

    if (readResult.done) {
      console.log('READER DONE');
      return;
    }

    const readChunk = readResult.value;
    const totalBytesRead = readOffset + readChunk.byteLength;
    console.log(`Read ${readChunk.byteLength} bytes`);
    console.log(`Total read ${totalBytesRead} bytes`);

    const requestBuffer = new Uint8Array(unsentBuffer.byteLength + readChunk.byteLength);
    requestBuffer.set(unsentBuffer, 0);
    requestBuffer.set(readChunk, unsentBuffer.byteLength);

    const unknown = '*';
    const isLast = readChunk.byteLength !== REQUEST_CHUNK_SIZE;
    const contentRangeTotal = isLast ? totalBytesRead.toString() : unknown;
    console.log(`Uploading chunk ${readOffset}-${totalBytesRead - 1}/${contentRangeTotal}`);
    const chunkResponse = await fetch(sessionUri, {
      method: 'PUT',
      headers: {
        'Content-Length': readChunk.byteLength.toString(),
        'Content-Range': `bytes ${readOffset}-${totalBytesRead - 1}/${contentRangeTotal}`,
      },
      body: requestBuffer,
    });

    let unsentBytes = 0;
    if (chunkResponse.status === RESPONSE_CODES.resumeIncomplete) {
      const lastByte = parseInt(chunkResponse.headers.get('Range')?.split('-')[1] ?? '0', 10);
      const bytesSent = lastByte + 1;
      console.log(`Upload incomplete, resuming from ${bytesSent}`);
      unsentBytes = totalBytesRead - bytesSent;
    }
    if (unsentBytes > 0) {
      console.log('USING REQUEST BUFFER');
      const unsentBuffer = requestBuffer.subarray(requestBuffer.length - unsentBytes);
      await this.uploadStream(sessionUri, reader, totalBytesRead, unsentBuffer);
      return;
    }
    await this.uploadStream(sessionUri, reader, totalBytesRead, null);
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

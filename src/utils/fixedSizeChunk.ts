export async function* getFixedSizeChunk(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  targetChuckSize: number,
): AsyncGenerator<Uint8Array, void> {
  let buffer = new Uint8Array(targetChuckSize);
  let bufferOffset = 0;

  while (true) {
    const { done, value: chuck } = await reader.read();
    if (done) {
      if (bufferOffset > 0) {
        yield buffer.subarray(0, bufferOffset);
      }
      return;
    }

    let chunkOffset = 0;
    while (chunkOffset < chuck.byteLength) {
      const spaceLeft = buffer.byteLength - bufferOffset;
      const bytesToCopy = Math.min(spaceLeft, chuck.byteLength - chunkOffset);

      buffer.set(chuck.subarray(chunkOffset, chunkOffset + bytesToCopy), bufferOffset);
      bufferOffset += bytesToCopy;
      chunkOffset += bytesToCopy;

      if (bufferOffset === targetChuckSize) {
        yield buffer;
        buffer = new Uint8Array(targetChuckSize);
        bufferOffset = 0;
      }
    }
  }
}

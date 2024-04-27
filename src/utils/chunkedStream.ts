export async function* chunkedStreamGenerator(
  reader: ReadableStreamDefaultReader,
  chunkSize: number,
): AsyncGenerator<Uint8Array, void, undefined> {
  let buffer = new Uint8Array(chunkSize); // Buffer to accumulate data
  let bufferLength = 0; // Current length of the buffer

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // If there's any data left in the buffer at the end, yield it
      if (bufferLength > 0) {
        yield buffer.subarray(0, bufferLength);
      }
      return; // Exit the generator
    }

    let valueOffset = 0; // Start index of unprocessed data in value

    while (valueOffset < value.byteLength) {
      const spaceLeft = chunkSize - bufferLength;
      const bytesToCopy = Math.min(spaceLeft, value.byteLength - valueOffset);

      // Copy data to buffer
      buffer.set(value.subarray(valueOffset, valueOffset + bytesToCopy), bufferLength);
      bufferLength += bytesToCopy;
      valueOffset += bytesToCopy;

      // If buffer is full, yield it and reset the buffer
      if (bufferLength === chunkSize) {
        yield buffer;
        buffer = new Uint8Array(chunkSize);
        bufferLength = 0;
      }
    }
  }
}

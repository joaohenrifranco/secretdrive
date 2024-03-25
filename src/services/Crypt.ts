import * as openpgp from 'openpgp'

const COMPRESSION_ALGORITHM = openpgp.enums.compression.zlib

export class Crypt {
  static async encrypt(inputStream: ReadableStream, password: string): Promise<ReadableStream> {
    const message = await openpgp.createMessage({ binary: inputStream })

    const encrypted = await openpgp.encrypt({
      message,
      passwords: password,
      format: 'binary',
      config: { preferredCompressionAlgorithm: COMPRESSION_ALGORITHM }
    })

    return webToReadableStream(encrypted)
  }

  static async decrypt(inputStream: ReadableStream, password: string): Promise<ReadableStream> {
    const message = await openpgp.readMessage({
      binaryMessage: inputStream
    })

    const decrypted = await openpgp.decrypt({
      message,
      passwords: password,
      format: 'binary',
      config: { preferredCompressionAlgorithm: COMPRESSION_ALGORITHM }
    })

    return webToReadableStream(decrypted.data)
  }
}

function webToReadableStream(webStream: openpgp.WebStream<Uint8Array>): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      const reader = webStream.getReader()
      read()

      async function read() {
        const { done, value } = await reader.read()
        if (done) {
          controller.close()
          return
        }
        controller.enqueue(value)
        read()
      }
    }
  })
}

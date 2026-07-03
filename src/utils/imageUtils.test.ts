import test from 'node:test'
import assert from 'node:assert/strict'
import { buildReceiptValue, normalizeImageUrls } from './imageUtils'

test('normalizeImageUrls handles array and JSON string input', () => {
  assert.deepEqual(normalizeImageUrls(['a', 'b']), ['a', 'b'])
  assert.deepEqual(normalizeImageUrls(JSON.stringify(['a', 'b'])), ['a', 'b'])
})

test('buildReceiptValue returns a single string or JSON array', () => {
  assert.equal(buildReceiptValue(['one']), 'one')
  assert.equal(buildReceiptValue(['one', 'two']), JSON.stringify(['one', 'two']))
})

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const deflate = require('./src/deflator');
const inflate = require('./src/inflator');

admin.initializeApp();


exports.zlibConvert = functions.https.onCall((data, context) => {
  if(!data.value){ throw new functions.https.HttpsError('invalid-argument', 'Empty value')}
  const regHex = /^(0x|0X)?[a-fA-F0-9]+$/;
  const regB64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  let values = {};
  let buffer;
  try {
    switch (data.type) {
      case 'deflatedHex':
        if(!regHex.test(data.value)){ throw new functions.https.HttpsError('invalid-argument', 'Invalid hex string ') }
        regHex.lastIndex = 0;
        try { buffer = new Buffer(data.value, 'hex') }
        catch(err) { throw new functions.https.HttpsError('invalid-argument', err) }
        values = {
          deflatedHex: data.value,
          deflatedBase64: buffer.toString('base64'),
          inflatedAscii:  inflate.toAscii(buffer),
          inflatedHex: inflate.toHex(buffer),
        }
        break;
      case 'deflatedBase64':
        if(!regB64.test(data.value)){ throw new functions.https.HttpsError('invalid-argument', 'Invalid base64 string') }
        regB64.lastIndex = 0;
        try { buffer = new Buffer(data.value, 'base64') }
        catch(err) { throw new functions.https.HttpsError('invalid-argument', err) }
        values = {
          deflatedHex: buffer.toString('hex'),
          deflatedBase64: data.value,
          inflatedAscii:  inflate.toAscii(buffer),
          inflatedHex: inflate.toHex(buffer),
        }
        break;
      case 'inflatedAscii':
        try { buffer = new Buffer(data.value, 'ascii') }
        catch(err) { throw new functions.https.HttpsError('invalid-argument', err) }
        values = {
          deflatedHex: deflate.toHex(buffer),
          deflatedBase64: deflate.toBase64(buffer),
          inflatedAscii: data.value,
          inflatedHex: buffer.toString('hex'),
        }
        break;
      case 'inflatedHex':
        if(!regHex.test(data.value)){ throw new functions.https.HttpsError('invalid-argument', 'Invalid hex string') }
        regHex.lastIndex = 0;
        try { buffer = new Buffer(data.value, 'hex') }
        catch(err) { throw new functions.https.HttpsError('invalid-argument', err) }
        values = {
          deflatedHex: deflate.toHex(buffer),
          deflatedBase64: deflate.toBase64(buffer),
          inflatedAscii: buffer.toString('ascii'),
          inflatedHex: data.value,
        }
        break;
      default:
        throw new functions.https.HttpsError('invalid-argument', 'No valid type found in request');
    }
  } catch(err) {
    throw new functions.https.HttpsError(err.code, err.message, err.details) }
  return { values }
});

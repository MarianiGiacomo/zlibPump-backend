/*Inflates base64 and hex encoded strings*/

const  pako = require('pako');
const functions = require('firebase-functions');

const inflateBinData = (deflatedBinData) => {
  try{
    var binValue = pako.inflate(deflatedBinData);
  }catch(err){ throw new functions.https.HttpsError('invalid-argument', err) }
  return binValue;
}

const inflateToHex = buffer => 
  new Buffer(inflateBinData(buffer,'binary')).toString('hex')

const inflateToAscii = buffer => 
  new Buffer(inflateBinData(buffer,'binary')).toString('ascii')

module.exports = {
  toAscii: inflateToAscii,
  toHex: inflateToHex,
}

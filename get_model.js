const https = require('https');
const fs = require('fs');

const url = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxTextured/glTF/BoxTextured.gltf";

https.get(url, (res) => {
  const path = "public/models/test.gltf";
  const filePath = fs.createWriteStream(path);
  res.pipe(filePath);
  filePath.on('finish',() => {
      filePath.close();
      console.log('Download Completed');
  })
})

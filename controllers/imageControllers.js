const AWS = require("aws-sdk");
const multer = require("multer");

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
});

const spacesEndpoint = new AWS.Endpoint("https://fatstogies.nyc3.digitaloceanspaces.com");
const spacesCDNURL = 'https://fatstogies.nyc3.digitaloceanspaces.com/fatstogies';


const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  s3ForcePathStyle: true,
  sslEnabled: true,
});



exports.uploadImage = async (req, res) => {
  try {
    const { originalname, buffer } = req.file;


    const fileExtension = originalname.split('.').pop();
    const newFileName = `${Date.now()}.${fileExtension}`;

    const key = `images/${newFileName}`;

    const params = {
      Bucket: 'fatstogies',
      Key: key,
      Body: buffer,
      ACL: 'public-read', 
    };

    await s3.upload(params).promise();


    const imageURL = `${spacesCDNURL}/${key}`;

    console.log(imageURL);

    res.json({ success: true, imageURL });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, error: "Image upload failed" });
  }
};

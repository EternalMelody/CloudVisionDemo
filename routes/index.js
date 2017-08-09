const express = require('express');
const router = express.Router();

const formidable = require('formidable');
const Storage = require('@google-cloud/storage');
const Vision = require('@google-cloud/vision');
const vision = Vision();
const storage = Storage();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/', function (req, res, next) {
    console.log("POST request received");

    const form = new formidable.IncomingForm();
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });

    form.parse(req, function (err, fields, files) {
        let storagePath;

        const uploadOptions = {
            public:true
        };

        storage
            .bucket('strong-hue-175505.appspot.com')
            .upload(files.imageFile.path, uploadOptions)
            .then((result)=>{
                storagePath = result[0].metadata.mediaLink;
                console.log(result[0].name + 'uploaded to bucket');
            })
            .catch((err)=>{
                console.error('ERROR:', err);
            });

        // Prepare the request object
        const requests = {
            image: {
                source: {
                    filename: files.imageFile.path
                }
            },
            features: [
                {
                    type: "LABEL_DETECTION"
                },
                {
                    type: "FACE_DETECTION"
                },
                {
                    type: "TEXT_DETECTION"
                },
                {
                    type: "IMAGE_PROPERTIES"
                },
                {
                    type: "CROP_HINTS"
                },
                {
                    type: "WEB_DETECTION"
                }
            ]
        };

        // Performs requested annotations on the image file
        vision.annotateImage(requests)
            .then((results) => {
                let locals = {
                    file: files.imageFile,
                    fileUrl: storagePath,
                    result: results[0]
                };
                res.render('index', locals);
            })
            .catch((err) => {
                console.error('ERROR:', err);
            });
    });
});

module.exports = router;

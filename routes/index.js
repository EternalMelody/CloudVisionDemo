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

    // Parse form
    form.parse(req, function (err, fields, files) {
        let storagePath;

        const uploadOptions = {
            public:true
        };

        // Save uploaded file to bucket
        storage
            .bucket('strong-hue-175505.appspot.com')
            .upload(files.imageFile.path, uploadOptions)
            .then((result)=>{
                storagePath = result[0].metadata.mediaLink;
                console.log(result[0].name + ' uploaded to bucket');
            })
            .catch((err)=>{
                console.error('ERROR:', err);
            });

        // Prepare the cloud vision request object
        const cloudVisionRequests = {
            image: {
                source: {
                    filename: files.imageFile.path
                }
            },
            features: [
                {
                    type: "LABEL_DETECTION",
                    maxResults: 10
                },
                {
                    type: "SAFE_SEARCH_DETECTION",
                    maxResults: 10
                },
                {
                    type: "TEXT_DETECTION",
                    maxResults: 10
                },
                {
                    type: "IMAGE_PROPERTIES",
                    maxResults: 10
                },
                {
                    type: "CROP_HINTS",
                    maxResults: 10
                },
                {
                    type: "WEB_DETECTION",
                    maxResults: 10
                }
            ]
        };

        // Ask cloud vision to perform requested annotations on the image file
        vision.annotateImage(cloudVisionRequests)
            .then((results) => {
                let locals = {
                    file: files.imageFile,
                    fileUrl: storagePath,
                    result: results[0]
                };

                // Render the index page, this time with results
                res.render('index', locals);
            })
            .catch((err) => {
                console.error('ERROR:', err);
            });
    });
});

module.exports = router;

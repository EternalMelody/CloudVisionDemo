const express = require('express');
const router = express.Router();
const path = require('path');
const formidable = require('formidable');
const http = require('http');
const fs = require('fs');

// Imports the Google Cloud client library
const Vision = require('@google-cloud/vision');

// Instantiates a client
const vision = Vision();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/', function (req, res, next) {
    const form = new formidable.IncomingForm();

    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });

    form.parse(req, function (err, fields, files) {
        // Prepare the request object
        const request = {
            source: {
                filename: files.imageFile.path
            }
        };

        // Performs label detection on the image file
        vision.labelDetection(request)
            .then((results) => {
                const labels = results[0].labelAnnotations;

                console.log('Labels:');
                labels.forEach((label) => console.log(label.description));

                res.render('index', {title: files.imageFile.name});
            })
            .catch((err) => {
                console.error('ERROR:', err);
            });

        // TODO Perform more actions on the image
        // TODO Render the output page
    });
});

module.exports = router;

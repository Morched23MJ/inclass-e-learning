const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const config = require('./config/database');
// Storage
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const crypto = require('crypto');

const storage = new GridFsStorage({
    url: config.database,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage: storage });

// Mongo DB
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () => console.log(`Connected to database ${config.database}`));
mongoose.connection.on('error', (err) => console.log(`Error connecting to ${config.database}, ${err}`));

let gfs;

mongoose.connection.once('open', () => {
    // Init stream
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Config
const app = express();
const port = process.env.PORT || 8080;
app.use(cors());
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Auth Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Routes
app.get("/", (req, res) => {
    res.send("Angular index.js");
});

const users = require('./routes/user');
app.use('/user', users);

const courses = require('./routes/course');
app.use('/course', courses);

const Image = require('./models/image');

// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
    console.log("Uploading an image");
    res.json({
        filename: req.file.filename,
        imageUrl: '/image/' + req.file.filename
    });
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        // Files exist
        return res.json(files);
    });
});

// @route GET /files/:filename
// @desc  Display single file object
app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        // File exists
        return res.json(file);
    });
});

// @route GET /image/:filename
// @desc Display Image
app.get('/image/:filename', (req, res) => {
    console.log("Getting an image");
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ err: err });
        }
        res.redirect('/');
    });
});



/**
 * 
app.post('/file', upload.single('file'), (req, res, next) => {
    Image.findOne({ filename: req.body.filename })
        .then(image => {
            if (image) res.status(200).json({
                success: false,
                message: "Image already exists"
            })
            else {
                let newImage = new Image({
                    filename: req.body.filename,
                    fileID: req.file.id
                })

                newImage.save()
                    .then(image => res.status(200).json({
                        success: true,
                        image
                    }))
                    .catch(err => res.status(500).json(err));
            }
        })
        .catch(err => res.status(500).json(err));
});

app.get('/file/:id', (req, res, next) => {
    gfs.find({_id: req.params.id})
        .toArray((err, files) => {
            if (err) res.status(500).json(err);
            else if (!files[0] || files.length === 0) {
                res.status(404).json({
                    success: false,
                    message: "No files found"
                });
            } else {
                res.status(200).json({
                    success: true,
                    file: files[0]
                })
            }
        });
});

 */

// Start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})

module.exports.upload = upload;
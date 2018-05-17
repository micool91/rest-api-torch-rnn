const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const TrainedModelsController = require('../controllers/trainedModels');

Date.prototype.withoutTime = function () {
    var d = new Date(this);
    d.setHours(0, 0, 0, 0);
    return d;
}

// pobieranie plików - multer ----
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './modelUploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/json' ||
        file.mimetype === 'application/octet-stream' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }

};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10000
    },
    fileFilter: fileFilter
});
// -----------------------------


router.get('/', TrainedModelsController.get_models_all);

const cpUpload = upload.fields([
    { name: 'pathJson', maxCount: 1 },
    { name: 'pathT7', maxCount: 1 },
    { name: 'pathImage', maxCount: 1 }
]);
router.post('/', checkAuth, cpUpload, TrainedModelsController.post_model);

router.get('/:trainedModelId', TrainedModelsController.get_model);

router.patch('/:trainedModelId', checkAuth, TrainedModelsController.edit_model)

router.delete('/:trainedModelId', checkAuth, TrainedModelsController.delete_model);

router.get('/my/models', checkAuth, TrainedModelsController.get_models_by_user);

module.exports = router;

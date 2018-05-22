const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const SamplesController = require('../controllers/samples');


router.get('/', /*checkAuth,*/ SamplesController.get_samples_all);

router.post('/', checkAuth, SamplesController.post_sample);

router.get('/:sampleId', /*checkAuth,*/ SamplesController.get_sample);

router.get('/byModel/:trainedModelId', /*checkAuth,*/ SamplesController.get_samples_by_model);

router.delete('/:sampleId', checkAuth, SamplesController.delete_sample);

router.get('/my/samples', checkAuth, SamplesController.get_samples_by_userId)


module.exports = router;

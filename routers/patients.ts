import { Router } from 'express';
const router: Router = Router();
import controller from '../controllers/patient';
import controllerAll from '../controllers/patients';
import middleware from '../middleware/patients';

router.get('/', controllerAll.readAll);

router.get('/appointments', controllerAll.readAllConnexion);

router.get('/:id', controller.read);
router.delete('/:id', controller.delete);

router.post('/add', middleware.create, controller.create);

router.put('/:id', middleware.update, controller.update);

export default router;

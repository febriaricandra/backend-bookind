import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth';
import router from './user.routes';

const ProfileRoutes = Router();

ProfileRoutes.use(authenticate);
ProfileRoutes.get('/', profileController.getProfile);
ProfileRoutes.put('/', profileController.updateProfile);

export default ProfileRoutes;

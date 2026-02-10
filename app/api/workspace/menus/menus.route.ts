import { Router } from 'express';
import { verifyUserToken } from '@/middleware/authMiddleware';
import { MenusController } from './menus.controller';

const router = Router();
const controller = new MenusController();

router.get('/', verifyUserToken, controller.getMenus.bind(controller));

export { router as menusRoutes };


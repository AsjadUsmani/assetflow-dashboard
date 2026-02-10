import { Router } from 'express';
import { menusRoutes } from './menus/menus.route';

const router = Router();

router.use('/menus', menusRoutes);

export { router as workspaceRoutes };


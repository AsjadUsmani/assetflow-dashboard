import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { MenusService } from './menus.service';

const menusService = new MenusService();

export class MenusController {
  /**
   * GET /workspace/menus
   * Returns all allowed menus for the authenticated user.
   */
  async getMenus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.unauthorized('User not found on request');
        return;
      }

      const groups = await menusService.getAllowedMenusForRole(user.role.id);
      res.success(groups, 'Allowed menus fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}


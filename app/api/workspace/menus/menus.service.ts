import { prisma } from '@/config/prisma';

export interface WorkspaceMenu {
  id: number;
  path: string;
  label: string | null;
  icon: string | null;
  sort_order: number;
  children: WorkspaceMenu[];
}

export interface WorkspaceMenuGroup {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
  menus: WorkspaceMenu[];
}

export class MenusService {
  /**
   * Returns all menu groups and menus allowed for the given role.
   */
  async getAllowedMenusForRole(roleId: number): Promise<WorkspaceMenuGroup[]> {
    const accesses = await prisma.role_menu_access.findMany({
      where: {
        role_id: roleId,
        is_deleted: false,
        is_active: true,
        is_allowed: true,
      },
      include: {
        menu: {
          include: {
            menu_group: true,
          },
        },
      },
    });

    const menus = accesses
      .map(a => a.menu)
      .filter(m => m && !m.is_deleted && m.is_active);

    const menuById = new Map<number, WorkspaceMenu>();
    const groupsMap = new Map<number, WorkspaceMenuGroup>();

    for (const m of menus) {
      const group = m.menu_group;
      if (!groupsMap.has(group.id)) {
        groupsMap.set(group.id, {
          id: group.id,
          name: group.name,
          description: group.description,
          sort_order: group.sort_order,
          menus: [],
        });
      }

      if (!menuById.has(m.id)) {
        menuById.set(m.id, {
          id: m.id,
          path: m.path,
          label: m.label ?? null,
          icon: m.icon ?? null,
          sort_order: m.sort_order,
          children: [],
        });
      }
    }

    for (const m of menus) {
      const menuNode = menuById.get(m.id)!;
      if (m.parent_id) {
        const parent = menuById.get(m.parent_id);
        if (parent) {
          parent.children.push(menuNode);
        }
      } else {
        const group = groupsMap.get(m.menu_group_id);
        if (group) {
          group.menus.push(menuNode);
        }
      }
    }

    const groups = Array.from(groupsMap.values())
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(g => ({
        ...g,
        menus: g.menus
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(menu => ({
            ...menu,
            children: menu.children.sort((a, b) => a.sort_order - b.sort_order),
          })),
      }));

    return groups;
  }
}


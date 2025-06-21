import { Role } from 'src/users/enums/role.enum';
import { Permission } from 'src/users/enums/permission.enum';

export const RolePermissionsMap: Record<Role, Permission[]> = {
  [Role.Admin]: Object.values(Permission),
  [Role.Manager]: [
    Permission.FileUpload,
    Permission.FileRead,
    Permission.FileUpdateMetadata,
    Permission.FileDelete,
    Permission.FileShare,
    Permission.UserManage,
  ],
  [Role.Employee]: [Permission.FileUpload, Permission.FileRead],
  [Role.Guest]: [Permission.FileRead],
};

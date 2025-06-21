import { Role } from 'src/users/enums/role.enum';
import { Permission } from 'src/users/enums/permission.enum';

export interface ActiveUserData {
  sub: number;
  email: string;
  role: Role;
  permissions: Permission[];
}

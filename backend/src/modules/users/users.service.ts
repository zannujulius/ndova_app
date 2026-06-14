import { ForeignKeyConstraintError } from 'sequelize';
import { User, UserRole, Role } from '../../models';
import { sanitizeUser } from '../../utils/sanitizeUser';
import { ApiError } from '../../utils/ApiError';
import { UpdateUserInput } from './users.validation';

const withRoles = {
  include: [
    {
      model: UserRole,
      as: 'userRoles',
      include: [{ model: Role, as: 'role' }],
    },
  ],
};

export async function listUsers() {
  const users = await User.findAll({
    ...withRoles,
    order: [['createdAt', 'DESC']],
  });
  return users.map(sanitizeUser);
}

export async function getUserById(id: string) {
  const user = await User.findByPk(id, withRoles);
  if (!user) throw ApiError.notFound('User not found');
  return sanitizeUser(user);
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound('User not found');

  await user.update(input);

  const updated = await User.findByPk(id, withRoles);
  return sanitizeUser(updated!);
}

export async function deleteUser(id: string, requestingUserId: string) {
  if (id === requestingUserId) {
    throw ApiError.badRequest('You cannot delete your own account');
  }

  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound('User not found');

  try {
    await user.destroy();
  } catch (err) {
    if (err instanceof ForeignKeyConstraintError) {
      throw ApiError.conflict(
        'Cannot delete this user — they have existing appointments. Remove or reassign those first.'
      );
    }
    throw err;
  }
}

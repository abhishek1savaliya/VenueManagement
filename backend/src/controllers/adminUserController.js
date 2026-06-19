const userService = require('../services/userService');

function parseListQuery(query) {
  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 20;
  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const status = typeof query.status === 'string' ? query.status.trim() : undefined;

  if (Number.isNaN(page) || page < 1) {
    return { error: 'Invalid page number' };
  }

  if (Number.isNaN(limit) || limit < 1) {
    return { error: 'Invalid limit' };
  }

  return { page, limit, search, status };
}

async function listUsers(req, res, next) {
  try {
    const parsed = parseListQuery(req.query);
    if (parsed.error) {
      return res.status(400).json({ success: false, message: parsed.error });
    }

    const result = await userService.findPaginated(parsed);
    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

async function getUserStats(req, res, next) {
  try {
    const totalUsers = await userService.countAll();
    res.json({ success: true, data: { totalUsers } });
  } catch (err) {
    next(err);
  }
}

async function deactivateUser(req, res, next) {
  try {
    const user = await userService.deactivateUser(req.userId);
    res.json({ success: true, data: user, message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
}

async function activateUser(req, res, next) {
  try {
    const user = await userService.activateUser(req.userId);
    res.json({ success: true, data: user, message: 'User activated' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  getUserStats,
  deactivateUser,
  activateUser,
};

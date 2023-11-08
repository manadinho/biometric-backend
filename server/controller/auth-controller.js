const client = require("../config/database");

module.exports = {
  async login(req) {
    const query = `
        SELECT * FROM users WHERE email = $1 AND password = $2
        `;
    const records = await client.query(query, [
      req.body.username,
      req.body.password,
    ]);

    if (!records.rows.length) {
      return {
        success: false,
        message: "Invalid credentials",
        method: "login",
        data: {},
        total: 0,
      };
    }

    const userWithPassword = records.rows[0];

    // Remove password from user object
    const { password, ...user } = userWithPassword;

    const permissions_query = `
      SELECT p.*
      FROM users u
      JOIN role_user ru ON u.id = ru.user_id
      JOIN roles r ON ru.role_id = r.id
      JOIN permission_role pr ON r.id = pr.role_id
      JOIN permissions p ON pr.permission_id = p.id
      WHERE u.id = $1;
    `;

    const permissions = await client.query(permissions_query, [user.id]);

    return {
      success: true,
      message: "Login successfully",
      method: "login",
      data: {
        user,
        permissions: permissions.rows,
        token: "abcdef1234manadinho1122abcd",
      },
      total: 1,
    };
  },
};

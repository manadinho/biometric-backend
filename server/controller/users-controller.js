// CREATE TABLE users (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     created_at TIMESTAMP DEFAULT NOW(),
//     updated_at TIMESTAMP DEFAULT NOW()
// );

const client = require("../config/database");

module.exports = {
  async all() {
    const query = `
    SELECT users.id, users.email, users.name AS user_name, roles.name AS role_name
    FROM users
    LEFT JOIN role_user ON users.id = role_user.user_id
    LEFT JOIN roles ON role_user.role_id = roles.id
  `;
    const records = await client.query(query);

    return {
      success: true,
      message: "All users",
      method: "all",
      data: records.rows,
      total: records.rowCount,
    };
  },

  async findById(req) {
    const query = `
    SELECT users.id, users.email, users.name AS user_name, roles.name AS role_name, roles.id AS role_id
    FROM users
    LEFT JOIN role_user ON users.id = role_user.user_id
    LEFT JOIN roles ON role_user.role_id = roles.id
    WHERE users.id = $1
  `;
    const records = await client.query(query, [req.body.id]);

    return {
      success: true,
      message: "User found",
      method: "findById",
      data: records.rows[0],
      total: records.rowCount,
    };
  },

  async create(req) {
    try {
      await client.query("BEGIN");
      const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email
  `;
      const user = await client.query(query, [
        req.body.name,
        req.body.email,
        req.body.password,
      ]);

      const user_id = user.rows[0].id;

      const roleQuery = `INSERT INTO role_user (user_id, role_id) VALUES ($1, $2)`;
      await client.query(roleQuery, [user_id, req.body.role_id]);

      await client.query("COMMIT");

      const response = {
        success: true,
        message: "User created successfully",
        method: "create",
        data: {},
        total: 1,
      };

      return response;
    } catch (error) {
      await client.query("ROLLBACK");

      //TODO :: NEED TO RETURN ERROR TO CONTROLLER AND HANDLE IT GLOABALLY
    }
  },

  async update(req) {
    try {
      await client.query("BEGIN");
      const query = `
    UPDATE users SET name = $1, password = $2
    WHERE id = $3
    RETURNING id, name, email
  `;
      const user = await client.query(query, [
        req.body.name,
        req.body.password,
        req.body.id,
      ]);

      const user_id = user.rows[0].id;

      const roleQuery = `UPDATE role_user SET role_id = $1 WHERE user_id = $2`;
      await client.query(roleQuery, [req.body.role_id, user_id]);

      await client.query("COMMIT");

      const response = {
        success: true,
        message: "User updated successfully",
        method: "update",
        data: {},
        total: 1,
      };

      return response;
    } catch (error) {
      console.log("error", error.message);
      await client.query("ROLLBACK");

      //TODO :: NEED TO RETURN ERROR TO CONTROLLER AND HANDLE IT GLOABALLY
    }
  },

  async delete(req) {
    try {
      await client.query("BEGIN");

      const roleQuery = `DELETE FROM role_user WHERE user_id = $1`;
      await client.query(roleQuery, [req.body.id]);

      const query = `DELETE FROM users WHERE id = $1`;
      await client.query(query, [req.body.id]);

      await client.query("COMMIT");

      return {
        success: true,
        message: "User deleted successfully",
        method: "delete",
        data: [],
        total: 0,
      };
    } catch (error) {
      await client.query("ROLLBACK");

      //TODO :: NEED TO RETURN ERROR TO CONTROLLER AND HANDLE IT GLOABALLY
    }
  },
};

const client = require("../config/database");

module.exports = {
  async all() {
    const query = `
    SELECT 
    roles.id, 
    roles.name AS role_name,
    ARRAY_AGG(ROW_TO_JSON(permissions.*)) AS permissions
    FROM 
        roles
    LEFT JOIN 
        permission_role ON roles.id = permission_role.role_id
    LEFT JOIN 
        permissions ON permission_role.permission_id = permissions.id
    GROUP BY 
        roles.id, roles.name;
      `;
    const records = await client.query(query);

    return {
      success: true,
      message: "All roles",
      method: "all",
      data: records.rows,
      total: records.rowCount,
    };
  },
  async findById(req) {
    const query = `
    SELECT *
    FROM roles
    WHERE roles.id = $1
  `;
    const records = await client.query(query, [req.body.id]);

    const permissionsQuery = `
    SELECT permission_id FROM permission_role WHERE role_id = $1
    `;
    const permissions = await client.query(permissionsQuery, [req.body.id]);

    records.rows[0].permissions = permissions.rows.map(
      (permission) => permission.permission_id
    );

    return {
      success: true,
      message: "Role found",
      method: "findById",
      data: records.rows[0],
      total: records.rowCount,
    };
  },

  async find(id) {
    const query = `
        SELECT roles.id, roles.name AS role_name
        FROM roles
        WHERE roles.id = $1
      `;
    return await client.query(query, [id]);
  },

  async create(req) {
    const query = `
        INSERT INTO roles (name)
        VALUES ($1)
        RETURNING id, name
      `;
    const role = await client.query(query, [req.body.name]);

    const role_id = role.rows[0].id;

    const permissionIds = req.body.permissions;

    const insertPromises = permissionIds.map((permission_id) => {
      const pivotQuery = `
            INSERT INTO permission_role (role_id, permission_id)
            VALUES ($1, $2)
        `;
      return client.query(pivotQuery, [role_id, permission_id]);
    });

    await Promise.all(insertPromises);

    return {
      success: true,
      message: "Role created successfully",
      method: "create",
      data: {},
      total: 1,
    };
  },

  async update(req) {
    const query = `
        UPDATE roles
        SET name = $1
        WHERE id = $2
        RETURNING id, name
      `;
    await client.query(query, [req.body.name, req.body.id]);

    const permission_delete_query = `
        DELETE FROM permission_role
        WHERE role_id = $1
      `;

    await client.query(permission_delete_query, [req.body.id]);

    const permissionIds = req.body.permissions;

    const insertPromises = permissionIds.map((permission_id) => {
      const pivotQuery = `
            INSERT INTO permission_role (role_id, permission_id)
            VALUES ($1, $2)
        `;
      return client.query(pivotQuery, [req.body.id, permission_id]);
    });

    await Promise.all(insertPromises);

    return {
      success: true,
      message: "Role updated successfully",
      method: "update",
      data: {},
      total: 1,
    };
  },
  async delete(req) {
    const permission_role_delete_query = `
        DELETE FROM permission_role
        WHERE role_id = $1
      `;
    await client.query(permission_role_delete_query, [req.body.id]);

    const query = `
        DELETE FROM roles
        WHERE id = $1
      `;
    await client.query(query, [req.body.id]);

    return {
      success: true,
      message: "Role deleted successfully",
      method: "delete",
      data: [],
      total: 0,
    };
  },

  async allPermissions() {
    const query = `
    SELECT *
    FROM permissions
  `;
    const records = await client.query(query);

    return {
      success: true,
      message: "All permissions",
      method: "allPermissions",
      data: records.rows,
      total: records.rowCount,
    };
  },
};

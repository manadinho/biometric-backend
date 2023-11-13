const client = require("../config/database");

module.exports = {
    async all() {
        const query = `SELECT 
        departments.*, 
        COUNT(users.id) AS user_count
    FROM 
        departments
    LEFT JOIN 
        users ON users.department_id = departments.id
    GROUP BY 
        departments.id
    ORDER BY 
        CASE
            WHEN departments.parent_id IS NULL THEN departments.id
            ELSE departments.parent_id
        END,
        departments.parent_id IS NOT NULL,
        departments.id;`;

        const records = await client.query(query);

        return {
            success: true,
            message: "All departments",
            method: "all",
            data: records.rows,
            total: records.rowCount,
        };
    },

    async parentDepartments(req){
        const query = `SELECT * FROM departments WHERE parent_id IS NULL`;

        const records = await client.query(query);

        return {
            success: true,
            message: "All parent departments",
            method: "parentDepartments",
            data: records.rows,
            total: records.rowCount,
        };
        
    },

    async findById(req) {
        const query = `SELECT * FROM departments WHERE id = $1`;

        const records = await client.query(query, [req.body.id]);

        return {
            success: true,
            message: "Department found",
            method: "findById",
            data: records.rows[0],
            total: records.rowCount,
        };
    },

    async create(req) {
        const query = `
        INSERT INTO departments (name, parent_id)
        VALUES ($1, $2)
        RETURNING name
        `;

        const { name, parent_department } = req.body;
        const department = await client.query(query, [name, parent_department]);
        return {
            success: true,
            message: "Department created",
            method: "create",
            data: department.rows[0],
        };
    },

    async delete(req) {
        const query = `DELETE FROM departments WHERE id = $1`;

        const { id } = req.body;
        const department = await client.query(query, [id]);
        return {
            success: true,
            message: "Department deleted",
            method: "delete",
            data: department.rows[0],
        };
    },
    
    async update(req) {
        const query = `
        UPDATE departments
        SET name = $1, parent_id = $2
        WHERE id = $3
        RETURNING name
        `;

        const { name, parent_department, id } = req.body;
        const department = await client.query(query, [name, parent_department, id]);
        return {
            success: true,
            message: "Department updated",
            method: "update",
            data: department.rows[0],
        };
    },

    async getUsersByDepId(req){
        const query = `
        SELECT 
            users.*, 
            departments.name AS department_name
        FROM 
            users
        LEFT JOIN 
            departments ON users.department_id = departments.id
        WHERE 
            users.department_id = $1
        ORDER BY 
            users.id
        `;

        const { id } = req.body;
        const users = await client.query(query, [id]);
        return {
            success: true,
            message: "Users found",
            method: "getUsersByDepId",
            data: users.rows,
            total: users.rowCount,
        };
    },

    async transferUsers(req){
        const query = `
        UPDATE users SET department_id = $1 WHERE id = ANY($2)
        RETURNING *
        `;

        const { departmentId, users } = req.body;
        const _users = await client.query(query, [departmentId, users]);
        return {
            success: true,
            message: "Users transferred",
            method: "transferUsers",
            data: _users.rows,
            total: _users.rowCount,
        };
    }
}

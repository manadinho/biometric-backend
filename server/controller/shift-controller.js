const client = require("../config/database");

module.exports = {
  async all(req) {
    const query = `SELECT * FROM shifts`;
    const records = await client.query(query);
    return {
      success: true,
      message: "All shifts",
      method: "all",
      data: records.rows,
      total: records.rowCount,
    };
  },

  async create(req) {
    const timetables = {
      MONDAY: null,
      TUESDAY: null,
      WEDNESDAY: null,
      THURSDAY: null,
      FRIDAY: null,
      SATURDAY: null,
      SUNDAY: null,
    };

    const query = `INSERT INTO shifts (name, timetables) VALUES ($1, $2) RETURNING *`;

    const records = await client.query(query, [req.body.name, timetables]);

    return {
      success: true,
      message: "Shift created",
      method: "create",
      data: records.rows[0],
      total: records.rowCount,
    };
  },

  async findById(req) {
    const query = `SELECT * FROM shifts WHERE id = $1`;
    const records = await client.query(query, [req.body.id]);
    return {
      success: true,
      message: "Shift found",
      method: "findById",
      data: records.rows[0],
      total: records.rowCount,
    };
  },

  async update(req) {
    const query = `UPDATE shifts SET name = $1 WHERE id = $2 RETURNING *`;
    const records = await client.query(query, [req.body.name, req.body.id]);
    return {
      success: true,
      message: "Shift updated",
      method: "update",
      data: records.rows[0],
      total: records.rowCount,
    };
  },

  async delete(req) {
    const query = `DELETE FROM shifts WHERE id = $1`;
    const records = await client.query(query, [req.body.id]);
    return {
      success: true,
      message: "Shift deleted",
      method: "delete",
      data: records.rows[0],
      total: records.rowCount,
    };
  },

  async saveTimetable(req) {
    const query = `UPDATE shifts SET timetables = $1 WHERE id = $2 RETURNING *`;
    const records = await client.query(query, [
      req.body.timetables,
      req.body.id,
    ]);
    return {
      success: true,
      message: "Shift timetable updated",
      method: "saveTimetable",
      data: records.rows[0],
      total: records.rowCount,
    };
  },

  async employeeSchedule(req) {
    try {
      let query = `INSERT INTO shift_user (user_id, shift_id, start_date, end_date, created_by) VALUES `;
      const values = [];

      req.body.forEach((user, index) => {
        values.push(
          user.user_id,
          user.shift_id,
          user.start_date,
          user.end_date,
          1 // HERE WOULD BE THE LOGGEDIN USER ID
        );
        query += `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${
          index * 5 + 4
        }, $${index * 5 + 5}),`;
      });

      query = query.slice(0, -1); // Remove the last comma

      const records = await client.query(query, values);

      return {
        success: true,
        message: "Insertion successful",
        method: "employeeSchedule",
        data: records.rows,
        total: records.rowCount,
      };
    } catch (err) {
      return {
        success: false,
        message: "Error executing query",
        method: "employeeSchedule",
        data: err.message,
        total: 0,
      };
    }
  },

  async getSelectedUsersShift(req) {
    const query = `SELECT * FROM shift_user WHERE user_id = ANY($1)`;

    const records = await client.query(query, [req.body.users]);
    return {
      success: true,
      message: "Shifts found",
      method: "getSelectedUsersShift",
      data: records.rows,
      total: records.rowCount,
    };
  },

  async getShiftByUserId(req) {
    const query = `SELECT * FROM shift_user WHERE user_id = $1`;

    const records = await client.query(query, [req.body.user_id]);
    return {
      success: true,
      message: "Shifts found",
      method: "getShiftByUserId",
      data: { cell_id: req.body.cell_id, shifts: records.rows },
      total: records.rowCount,
    };
  },

  async deleteUserShift(req) {
    const query = `DELETE FROM shift_user WHERE id = $1`;

    const records = await client.query(query, [req.body.id]);
    return {
      success: true,
      message: "Shift deleted",
      method: "deleteUserShift",
      data: records.rows[0],
      total: records.rowCount,
    };
  },
};

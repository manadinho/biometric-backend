const client = require("../config/database");

module.exports = {
  async all(req) {
    const query = `SELECT * FROM timetables`;

    const records = await client.query(query);

    return {
      success: true,
      message: "All timetables",
      method: "all",
      data: records.rows,
      total: records.rowCount,
    };
  },

  async findById(req) {
    const query = `SELECT * FROM timetables WHERE id = $1`;

    const records = await client.query(query, [req.body.id]);

    return {
      success: true,
      message: "Timetable found",
      method: "findById",
      data: records.rows[0],
      total: records.rowCount,
    };
  },

  async create(req) {
    console.log("req.body: ", req.body);
    try {
      const query = `
        INSERT INTO timetables (name, late_time, leave_early_time, on_time, off_time, checkin_start, checkin_end, checkout_start, checkout_end)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING name, late_time, leave_early_time, on_time, off_time, checkin_start, checkin_end, checkout_start, checkout_end
    `;
      const {
        name,
        late_time,
        leave_early_time,
        on_time,
        off_time,
        checkin_start,
        checkin_end,
        checkout_start,
        checkout_end,
      } = req.body;

      const timetable = await client.query(query, [
        name,
        late_time,
        leave_early_time,
        on_time,
        off_time,
        checkin_start,
        checkin_end,
        checkout_start,
        checkout_end,
      ]);

      return {
        success: true,
        message: "Timetable created",
        method: "create",
        data: timetable.rows[0],
        total: timetable.rowCount,
      };
    } catch (error) {
      return {
        success: false,
        message: "Timetable not created",
        method: "create",
        error: error.message,
      };
    }
  },

  async update(req) {
    try {
      const query = `
        UPDATE timetables
        SET name = $1, late_time = $2, leave_early_time = $3, on_time = $4, off_time = $5, checkin_start = $6, checkin_end = $7, checkout_start = $8, checkout_end = $9
        WHERE id = $10
        RETURNING name, late_time, leave_early_time, on_time, off_time, checkin_start, checkin_end, checkout_start, checkout_end
    `;
      const {
        name,
        late_time,
        leave_early_time,
        on_time,
        off_time,
        checkin_start,
        checkin_end,
        checkout_start,
        checkout_end,
      } = req.body;

      const timetable = await client.query(query, [
        name,
        late_time,
        leave_early_time,
        on_time,
        off_time,
        checkin_start,
        checkin_end,
        checkout_start,
        checkout_end,
        req.body.id,
      ]);

      return {
        success: true,
        message: "Timetable updated",
        method: "update",
        data: timetable.rows[0],
        total: timetable.rowCount,
      };
    } catch (error) {
      return {
        success: false,
        message: "Timetable not updated",
        method: "update",
        error: error.message,
      };
    }
  },

  async delete(req) {
    try {
      const query = `
        DELETE FROM timetables
        WHERE id = $1
        RETURNING name, late_time, leave_early_time, on_time, off_time, checkin_start, checkin_end, checkout_start, checkout_end
    `;

      const timetable = await client.query(query, [req.body.id]);

      return {
        success: true,
        message: "Timetable deleted",
        method: "delete",
        data: timetable.rows[0],
        total: timetable.rowCount,
      };
    } catch (error) {
      return {
        success: false,
        message: "Timetable not deleted",
        method: "delete",
        error: error.message,
      };
    }
  }
};

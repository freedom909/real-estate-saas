import { Pool,ResultSetHeader } from 'mysql2/promise';

class OrderRepository {
  constructor(private pool: Pool) {
    if (!pool) {
      throw new Error('DB pool is required');
    }
  }

  async connect() {
    await this.pool.getConnection();
  }

async findById(id: string) {
    const [rows]: any = await this.pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    return rows[0] || null;
  }

  async findAll(where = {}) {
    const keys = Object.keys(where);
    const values = Object.values(where)　as any[];

    console.log(values);

    const whereClause = keys.length
      ? 'WHERE ' + keys.map(k => `${k} = ?`).join(' AND ')
      : '';

    const sql = `SELECT * FROM orders ${whereClause}`;

    const [rows] = await this.pool.execute(sql, values);//
    return rows;
  }

  async create(orderData) {
    const fields = Object.keys(orderData).join(', ');
    const placeholders = Object.keys(orderData).map(() => '?').join(', ');
    const values = Object.values(orderData)　as any[];

    const sql = `INSERT INTO orders (${fields}) VALUES (${placeholders})`;
    const [result] = await this.pool.execute<ResultSetHeader>(sql, values);

    return { ...orderData, id: result.insertId };
  }

  async update(id, updateData) {
    const setClause = Object.keys(updateData)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = [...Object.values(updateData), id];

    const sql = `UPDATE orders SET ${setClause} WHERE id = ?`;
    const [result] = await this.pool.execute<ResultSetHeader>(sql, values);

    return result.affectedRows > 0;
  }

  async delete(id) {
    const sql = 'DELETE FROM orders WHERE id = ?';
    const [result] = await this.pool.execute<ResultSetHeader>(sql, [id]);

    return result.affectedRows > 0;
  }
}

export default OrderRepository;
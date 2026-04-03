import mysql from 'mysql2/promise';


class OrderRepository {
  constructor(dbConfig) {
    if (!dbConfig || typeof dbConfig !== 'object') {
      throw new Error('Invalid dbConfig object');
    }
    this.dbConfig = dbConfig;
  }

  async getConnection() {
    return await mysql.createConnection(this.dbConfig);
  }

  async findOne(query) {
    const connection = await this.getConnection();
    try {
      const queryKeys = Object.keys(query.where);
      const queryValues = Object.values(query.where);
      const whereClause = queryKeys.map(key => `${key} = ?`).join(' AND ');
      const sql = `SELECT * FROM orders${queryKeys.length ? ` WHERE ${whereClause}` : ''}`;

      const [rows] = await connection.execute(sql, queryValues);
      return rows[0];
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async findAll(query = {}) {
    const connection = await this.getConnection();
    try {
      const queryKeys = Object.keys(query);
      const queryValues = Object.values(query);
      const whereClause = queryKeys.map(key => `${key} = ?`).join(' AND ');
      const sql = `SELECT * FROM orders${queryKeys.length ? ` WHERE ${whereClause}` : ''}`;
      
      const [rows] = await connection.execute(sql, queryValues);
      return rows;
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async create(orderData) {
    const connection = await this.getConnection();
    try {
      const fields = Object.keys(orderData).join(', ');
      const placeholders = Object.keys(orderData).map(() => '?').join(', ');
      const values = Object.values(orderData);
      
      const sql = `INSERT INTO orders (${fields}) VALUES (${placeholders})`;
      const [result] = await connection.execute(sql, values);
      
      return { ...orderData, id: result.insertId };
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async update(id, updateData) {
    const connection = await this.getConnection();
    try {
      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), id];
      
      const sql = `UPDATE orders SET ${setClause} WHERE id = ?`;
      const [result] = await connection.execute(sql, values);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  async delete(id) {
    const connection = await this.getConnection();
    try {
      const sql = 'DELETE FROM orders WHERE id = ?';
      const [result] = await connection.execute(sql, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }
}

export default OrderRepository;
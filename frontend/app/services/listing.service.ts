// src/wisdom-web/app/services/listing.service.ts
import axios from "axios";

const API_URL = "/api/listings";

export const listingService = {
  // 1. 获取列表
  async getAll() {
    const res = await axios.get(API_URL);
    return res.data;
  },

  // 2. 获取单个
  async getById(id: string) {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  // 3. 创建房源
  async create(data: {
    title: string;
    description: string;
    price: number;
    
  }) {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  // 4. 更新房源
  async update(id: string, data: any) {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  // 5. 删除房源
  async remove(id: string) {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },
};
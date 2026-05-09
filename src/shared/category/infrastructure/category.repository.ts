// category.repository.ts

import { inject, injectable } from 'tsyringe';
import CategoryModel from './category.model';
import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";
import { Op } from 'sequelize';

@injectable()
export class CategoryRepository {
  async findByIds(ids: string[]) {
    console.log(ids); //no output in the terminal
    return CategoryModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
  }

  async getIdsByNames(names: string[]): Promise<string[]> {
    const categories = await CategoryModel.findAll({
      where: {
        name: {
          [Op.in]: names,
        },
      },
      attributes: ['id'], // Only fetch the 'id' attribute
    });
    return categories.map(category => category.id);
  }
}

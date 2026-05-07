// FILE: src/subgraphs/amenity/domain/entities/amenity.ts

// domain/entities/Amenity.ts

import { AmenityCategory, isValidAmenityCategory } from "../value-objects/AmenityCategory";

export interface AmenityProps {
  id: string;
  name: string;
  category: AmenityCategory;
}

export class Amenity {
  private props: AmenityProps;

  constructor(props: AmenityProps) {
    this.validate(props);
    this.props = props;
  }

  // ===== getters =====
  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get category() {
    return this.props.category;
  }

  // ===== behavior（领域行为）=====
  updateName(name: string) {
    if (!name || name.trim().length < 2) {
      throw new Error("Amenity name must be at least 2 characters");
    }
    this.props.name = name;
  }

  updateCategory(category: AmenityCategory) {
    if (!isValidAmenityCategory(category)) {
      throw new Error("Invalid amenity category");
    }
    this.props.category = category;
  }

  // ===== validation（构造时校验）=====
  private validate(props: AmenityProps) {
    if (!props.id) {
      throw new Error("Amenity must have id");
    }

    if (!props.name || props.name.trim().length < 2) {
      throw new Error("Amenity name too short");
    }

    if (!isValidAmenityCategory(props.category)) {
      throw new Error("Invalid Amenity category");
    }
  }
}
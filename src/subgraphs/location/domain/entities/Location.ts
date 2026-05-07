// src/subgraphs/location/domain/entities/Location.ts

// src/subgraphs/location/domain/entities/Location.ts

import { v4 as uuidv4 } from 'uuid';

export interface LocationProps {
  province?: string;
  country?: string;
  city?: string;
  id?: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export class Location {
  private props: LocationProps;

  constructor(props: LocationProps) {
    if (!props.id) {
      props.id = uuidv4();
    }
    this.validate(props);
    this.props = props;
  }

  get id(): string {
    return this.props.id!;
  }

  get name(): string {
    return this.props.name;
  }

  get address(): string {
    return this.props.address;
  }

  get latitude(): number | undefined {
    return this.props.latitude;
  }

  get longitude(): number | undefined {
    return this.props.longitude;
  }
  get province(): string | undefined {
    return this.props.province;
  }
  get country(): string | undefined {
    return this.props.country;
  }
  get city(): string | undefined {
    return this.props.city;
  }


  // 领域行为示例
  updateAddress(newAddress: string): void {
    this.props.address = newAddress;
    this.validate(this.props); // 重新验证
  }

  private validate(props: LocationProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Location name cannot be empty.");
    }
    if (!props.address || props.address.trim().length === 0) {
      throw new Error("Location address cannot be empty.");
    }
    if (!props.province || props.province.trim().length === 0) {
      throw new Error("Location province cannot be empty.");
    }
    if (!props.country || props.country.trim().length === 0) {
      throw new Error("Location country cannot be empty.");
    }
    if (!props.city || props.city.trim().length === 0) {
      throw new Error("Location city cannot be empty.");
    }
    // 可以在这里添加更多复杂的验证逻辑
  }
}

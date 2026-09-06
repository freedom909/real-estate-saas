//src/core/location/domain/entities/location.ts


import { v4 as uuidv4 } from "uuid";

export interface LocationProps {
  id?: string;

  name: string;

  postalCode: string;
  prefecture: string;
  city: string;
  town: string;
  address: string;

  latitude: number;
  longitude: number;

  radius: number;
  units: string;
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



  get postalCode(): string {
    return this.props.postalCode;
  }

  get prefecture(): string {
    return this.props.prefecture;
  }

  get city(): string {
    return this.props.city;
  }

  get town(): string {
    return this.props.town;
  }

  get address(): string {
    return this.props.address;
  }

  get latitude(): number {
    return this.props.latitude;
  }

  get longitude(): number {
    return this.props.longitude;
  }

  get radius(): number {
    return this.props.radius;
  }

  get units(): string {
    return this.props.units;
  }

  updateAddress(newAddress: string): void {
    if (!newAddress || newAddress.trim().length === 0) {
      throw new Error("Location address cannot be empty.");
    }

    this.props.address = newAddress;
    this.validate(this.props);
  }

  private validate(props: LocationProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Location name cannot be empty.");
    }

    if (!props.postalCode || props.postalCode.trim().length === 0) {
      throw new Error("Location postal code cannot be empty.");
    }

    if (!props.prefecture || props.prefecture.trim().length === 0) {
      throw new Error("Location prefecture cannot be empty.");
    }

    if (!props.city || props.city.trim().length === 0) {
      throw new Error("Location city cannot be empty.");
    }

    if (!props.town || props.town.trim().length === 0) {
      throw new Error("Location town cannot be empty.");
    }

    if (!props.address || props.address.trim().length === 0) {
      throw new Error("Location address cannot be empty.");
    }

    if (props.radius <= 0) {
      throw new Error("Location radius must be greater than 0.");
    }

    if (!props.units || props.units.trim().length === 0) {
      throw new Error("Location units cannot be empty.");
    }
  }
}


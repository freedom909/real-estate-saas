// src/core/location/infrastructure/persistence/location.repository.ts

import {  injectable } from "tsyringe";
import { ILocationRepository } from "../../domain/repos/ILocationRepository";
import { Location } from "../../domain/entities/location";
import LocationModel from "./location.model";


@injectable()
export class LocationRepository implements ILocationRepository {
async findById(id: string): Promise<Location | null> {
    const model = await LocationModel.findByPk(id);

    if (!model) {
      return null;
    }

    return new Location({
      id: model.get("id") as string,
      name: model.get("name") as string,
      address: model.get("address") as string,
      city: model.get("city") as string,
      town: model.get("town") as string,
      prefecture: model.get("prefecture") as string,
      postalCode: model.get("postalCode") as string,
      radius: model.get("radius") as number,
      units: model.get("units") as string,
      
      latitude: model.get("latitude") as number,
      longitude: model.get("longitude") as number,
    });
  }

  async save(location: Location): Promise<Location> {
    await LocationModel.upsert({
      id: location.id,
      name: location.name,
      address: location.address,
      city: location.city,
      town: location.town,
      prefecture: location.prefecture,
      postalCode: location.postalCode,
      radius: location.radius,
      units: location.units,
  
      latitude: location.latitude,
      longitude: location.longitude,
    });

    console.log(
      `Location saved: ${location.id} - ${location.name}`
    );

    return location;
  }

  async findAll(): Promise<Location[]> {
    const models = await LocationModel.findAll();

    return models.map(
      (model) =>
        new Location({
          id: model.get("id") as string,
          name: model.get("name") as string,
          address: model.get("address") as string,
          city: model.get("city") as string,
          town: model.get("town") as string,
          prefecture: model.get("prefecture") as string,
          postalCode: model.get("postalCode") as string,
          radius: model.get("radius") as number,
          units: model.get("units") as string,
 
          latitude: model.get("latitude") as number,
          longitude: model.get("longitude") as number,
        })
    );
  }
}
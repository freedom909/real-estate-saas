// src/core/admin/domain/entities/systemSettings.ts

export interface SystemSettingsProps {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  updatedBy?: string;
  updatedAt: Date;
  createdAt: Date;
}

export class SystemSettings {
  private props: SystemSettingsProps;

  constructor(props: SystemSettingsProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get key() { return this.props.key; }
  get value() { return this.props.value; }
  get category() { return this.props.category; }
  get description() { return this.props.description; }
  get updatedBy() { return this.props.updatedBy; }
  get updatedAt() { return this.props.updatedAt; }
  get createdAt() { return this.props.createdAt; }

  updateValue(value: string, updatedBy?: string) {
    this.props.value = value;
    this.props.updatedBy = updatedBy;
    this.props.updatedAt = new Date();
  }
}

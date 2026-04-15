export class Listing {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    private _title: string,
    private _description: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  get title() {
    return this._title;
  }

  get description() {
    return this._description;
  }

  updateTitle(title: string) {
    if (!title || title.trim().length === 0) {
      throw new Error("Invalid title");
    }
    this._title = title.trim();
    this.updatedAt = new Date();
  }

  updateDescription(desc: string) {
    if (!desc || desc.trim().length === 0) {
      throw new Error("Invalid description");
    }
    this._description = desc.trim();
    this.updatedAt = new Date();
  }

  applySuggestedTitle(suggested: string) {
    this.updateTitle(suggested);
  }

  applySuggestedDescription(suggested: string) {
    this.updateDescription(suggested);
  }
}
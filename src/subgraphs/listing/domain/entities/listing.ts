import { Title } from "../value-objects/Title";
import { Description } from "../value-objects/Description";

export interface ListingProps {
  id: string;
  tenantId: string;

  title: Title;
  description: Description;

  address: string;

  categories: string[];
  amenityIds: string[];

  createdAt: Date;
  updatedAt: Date;
}

export class Listing {
  private props: ListingProps;

  constructor(props: ListingProps) {
    this.validate(props);
    this.props = props;
  }

  // getters
  get id() { return this.props.id; }
  get tenantId() { return this.props.tenantId; }
  get title() { return this.props.title.getValue(); }
  get description() { return this.props.description.getValue(); }

  // ======================
  // Business Logic
  // ======================

  updateTitle(title: string) {
    this.props.title = new Title(title);
    this.touch();
  }

  updateDescription(desc: string) {
    this.props.description = new Description(desc);
    this.touch();
  }

  // 🔥 AI行为（核心）
  generateTitlePrompt() {
    return this.props.title.buildAIPrompt({
      description: this.description,
    });
  }

  generateDescriptionPrompt() {
    return this.props.description.buildAIPrompt({
      title: this.title,
    });
  }

  applySuggestedTitle(title: string) {
    this.updateTitle(title);
  }

  applySuggestedDescription(desc: string) {
    this.updateDescription(desc);
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  private validate(props: ListingProps) {
    if (!props.tenantId) throw new Error("tenantId required");
    if (!props.address) throw new Error("address required");
    if (!props.categories.length) throw new Error("categories required");
  }
}
// listingAISuggestion.ts

import { SuggestionStatus } from "./suggestionStatus";

export interface ListingAISuggestionProps {
  id: string;

  listingId: string;

  type: "TITLE" | "DESCRIPTION";

  prompt: string;

  suggestion: string;
  status: SuggestionStatus;
  model?: string;

  createdAt: Date;
}

export class ListingAISuggestion {
  constructor(
    private props: ListingAISuggestionProps
  ) {}

  get id() {
    return this.props.id;
  }

  get listingId() {
    return this.props.listingId;
  }

  get type() {
    return this.props.type;
  }

  get suggestion() {
    return this.props.suggestion;
  }
  get status() {
    return this.props.status;
  }
  get prompt() {
    return this.props.prompt;
  }

  get model() {
    return this.props.model;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
// category.ts
export interface CategoryProps {
  id?: string;
  name: string;
  type: string;
}

export class Category { 
constructor(
    private props: CategoryProps) {}
 get id() { return this.props.id; }
 get name() { return this.props.name; }
 get type() { return this.props.type; } 
} 
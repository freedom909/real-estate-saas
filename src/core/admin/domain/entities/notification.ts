// src/core/admin/domain/entities/notification.ts

export interface NotificationProps {
  id: string;
  adminId: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  title: string;
  message: string;
  target?: string;
  targetId?: string;
  isRead: boolean;
  createdAt: Date;
}

export class Notification {
  private props: NotificationProps;

  constructor(props: NotificationProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get adminId() { return this.props.adminId; }
  get type() { return this.props.type; }
  get title() { return this.props.title; }
  get message() { return this.props.message; }
  get target() { return this.props.target; }
  get targetId() { return this.props.targetId; }
  get isRead() { return this.props.isRead; }
  get createdAt() { return this.props.createdAt; }

  markAsRead() {
    this.props.isRead = true;
  }

  markAsUnread() {
    this.props.isRead = false;
  }
}

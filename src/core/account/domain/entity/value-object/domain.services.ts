
export interface DomainService {
    // 房源是否超售
    isOverSold: boolean;
    // 用户今天是否预约超过 3 次
    isOverBooked: number;
    isZeroPrice: boolean;
    // 入住日期 < 退房日期
    isCheckInBeforeCheckOut: boolean;
    // 用户是否已取消预约
    isCancelled: boolean;
    name: string;
    description: string;
    tags: string[];
    dependencies: string[];
}

export interface DomainServiceFactory {
    create(): DomainService;
}
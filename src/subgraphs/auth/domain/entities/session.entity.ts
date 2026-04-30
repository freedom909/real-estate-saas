//src/subgraphs/auth/domain/entities/session.entity.ts

export class Session{
  constructor(
    public id: String,
    public userId: String,
    public deviceId:String,
    public ip:String,
    public userAgent:String,
    public createAt:Date=new Date(),
    public lastSeenAt:Date,
  ){}
  touch(){
    this.lastSeenAt=new Date()
  
  }
}
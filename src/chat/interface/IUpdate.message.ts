import { IsString } from 'class-validator'

export class IUpdateMessage {
  @IsString()
  id: string
  @IsString()
  message: string
}

// export type IUpdateMessage = {
//   id: string
//   message: string
// }

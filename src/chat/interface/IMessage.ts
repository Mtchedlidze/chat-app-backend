import { IClient } from './Iclient'

export interface IMessage {
  id: string
  text: string
  by: IClient
}

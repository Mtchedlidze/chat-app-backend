import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { randomBytes } from 'crypto'
import { Socket, Server } from 'socket.io'
import { IClient } from './interface/Iclient'
import { IMessage } from './interface/IMessage'
import { IUpdateMessage } from './interface/IUpdate.message'
import { WsExceptionFilter } from './filters/update.filter'
import { IDeleteMessage } from './interface/IDeleteMessage'

@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server

  handleConnection(client: Socket) {
    const { from } = client.handshake.headers

    if (!from) {
      client.emit('error', 'no username provided')
      return
    }
    const clientData: IClient = {
      username: from,
      id: client.id,
    }
    console.log(clientData)

    return this.server.emit('connection', clientData)
  }

  handleDisconnect(client: Socket) {
    const { from } = client.handshake.headers

    const clientData: IClient = {
      id: client.id,
      username: from,
    }
    this.server.emit('disconnected', clientData)
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, message: string) {
    const { from } = client.handshake.headers
    const messageData: IMessage = {
      id: randomBytes(10).toString('hex'),
      text: message,
      by: {
        id: client.id,
        username: from,
      },
    }

    this.server.send(messageData)
  }

  @UsePipes(ValidationPipe)
  @SubscribeMessage('edit')
  handleEditMessage(client: Socket, updateOpts: IUpdateMessage) {
    const { from } = client.handshake.headers
    this.server.send({
      message: `${from} updated message`,
      id: updateOpts.id,
    })

    this.server.emit('edit', updateOpts)
  }

  @UsePipes(ValidationPipe)
  @SubscribeMessage('delete')
  handleDeleteMessage(client: Socket, deleteOpts: IDeleteMessage) {
    const { from } = client.handshake.headers
    this.server.send({
      message: `${from} deleted message`,
      id: deleteOpts.id,
    })

    this.server.emit('delete', deleteOpts)
  }
}

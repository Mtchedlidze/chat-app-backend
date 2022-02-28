import { ArgumentsHost, Catch, HttpException } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@Catch(WsException, HttpException)
export class WsExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient()
    this.handleError(client, exception)
  }

  handleError(client: Socket, exception: HttpException | WsException) {
    if (exception instanceof HttpException) {
      client.send(exception.getResponse())
      return
    }
    client.send(exception.getError())
  }
}

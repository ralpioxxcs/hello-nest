import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessagesDto } from './messages/dto/create-messages.dto';
import { ChatMessagesService } from './messages/messages.service';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-catch-http.exception-filter';
import { SocketBearerTokenGuard } from 'src/auth/guard/socket/socket-bearer.token.guard';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  // ws://127.0.0.1/chats 웹소켓 엔드포인트 생성
  namespace: 'chats',
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesSerivice: ChatMessagesService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  // gateway 시작 후 실행
  afterInit(server: any) {
    console.log('after gateway init');
  }

  // 웹소켓이 연결 되었을 때 실행
  handleDisconnect(socket: Socket) {
    console.log(`on disconnect called (id:${socket.id})`);
  }

  // 웹소켓이 연결 되었을 때 실행
  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called (id:${socket.id})`);

    //
    // 연결시점에 socket에 user정보를 넣는다
    //
    // 1. header에서 access token 가져옴
    // 2. raw token 검증 및 user정보 획득
    // 3. socket에 삽입
    //
    const headers = socket.handshake.headers;

    // Bearer xxxxx
    const rawToken = headers['authorization'];
    if (!rawToken) {
      socket.disconnect();
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      console.debug(`user: ${JSON.stringify(user)}`);

      socket.user = user;
    } catch (err) {
      socket.disconnect();
    }
  }

  // main.ts에 있는 global pipe는 REST API에만 적용이되므로 별도의 선언이 필요
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    // 채팅방 생성
    const chat = await this.chatsService.createChat(data);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('enter_chat')
  async enterChat(
    // 방의 chat ID를 리스트로 받음
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    // 배열로 받은 채팅방 ID를 순회하며 존재여부를 체크
    // 존재하는경우 -> 현재 연결된 user를 채팅방에 join
    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);
      if (!exists) {
        throw new WsException({
          code: 100,
          message: `Not exists chat (chatId: ${chatId})`,
        });
      }
    }
    socket.join(data.chatIds.map((x) => x.toString()));
  }

  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    // 채팅방 존재 여부 확인
    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId);
    if (!chatExists) {
      throw new WsException(`Not exists chat room Chat ID: (${dto.chatId})`);
    }

    // 메시지 생성 (chatId, message)
    const message = await this.messagesSerivice.createMessage(
      dto,
      socket.user.id,
    );

    // broadcast message
    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);

    // this.server
    //   .in(message.chatId.toString())
    //   .emit('receive_message', message.message);
    // console.log(message);
  }
}

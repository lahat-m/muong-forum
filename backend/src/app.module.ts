import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { ParticipantModule } from './participant/participant.module';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from './mail/mail.module';
import { TasksModule } from './tasks/tasks.module';
import { StudentsModule } from './students/students.module';
import { FilesModule } from './files/files.module';


@Module({
  imports: [
    ConfigModule.forRoot ({
      isGlobal: true,         // Make env variables available everywhere
      envFilePath: ['.env'],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    EventModule,
    ParticipantModule,
    HealthModule,
    MailerModule,
    TasksModule,
    StudentsModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaService } from './kafka.service';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';

@Module({
  imports: [ConfigModule],
  providers: [KafkaService, KafkaProducerService, KafkaConsumerService],
  exports: [KafkaService, KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {} 
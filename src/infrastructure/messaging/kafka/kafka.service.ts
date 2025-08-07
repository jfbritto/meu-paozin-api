import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, KafkaConfig } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(private configService: ConfigService) {
    const kafkaConfig: KafkaConfig = {
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'meupaozin-api'),
      brokers: this.configService.get<string>('KAFKA_BROKERS', 'kafka:29092').split(','),
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    };

    this.kafka = new Kafka(kafkaConfig);
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: this.configService.get<string>('KAFKA_CONSUMER_GROUP_ID', 'meupaozin-consumer-group'),
    });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      console.log('✅ Produtor Kafka conectado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao conectar produtor Kafka:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      console.log('✅ Conexões Kafka desconectadas');
    } catch (error) {
      console.error('❌ Erro ao desconectar Kafka:', error);
    }
  }

  getProducer(): Producer {
    return this.producer;
  }

  getConsumer(): Consumer {
    return this.consumer;
  }

  getKafka(): Kafka {
    return this.kafka;
  }
} 
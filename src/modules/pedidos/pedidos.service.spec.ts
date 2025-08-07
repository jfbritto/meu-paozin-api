import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PedidosService } from './application/services/pedidos.service';
import { Pedido, StatusPedido } from '../../infrastructure/database/entities/pedido.entity';
import { CreatePedidoDto } from './application/dto/create-pedido.dto';
import { UpdatePedidoDto } from './application/dto/update-pedido.dto';
import { Cliente } from '../../infrastructure/database/entities/cliente.entity';
import { TipoPao } from '../../infrastructure/database/entities/tipo-pao.entity';
import { KafkaProducerService } from '../../infrastructure/messaging/kafka/kafka-producer.service';

describe('PedidosService', () => {
  let service: PedidosService;
  let pedidoRepository: Repository<Pedido>;
  let clienteRepository: Repository<Cliente>;
  let tipoPaoRepository: Repository<TipoPao>;
  let kafkaProducer: KafkaProducerService;

  const mockPedido: Pedido = {
    id: 1,
    clienteId: 1,
    tipoPaoId: 1,
    quantidade: 5,
    precoTotal: 17.50,
    status: StatusPedido.REALIZADO,
    dataPedido: new Date(),
    dataAtualizacao: new Date(),
    observacoes: 'Sem sal',
    cliente: null,
    tipoPao: null
  };

  const mockCliente: Cliente = {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Flores, 123',
    ativo: true,
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
    pedidos: []
  };

  const mockTipoPao: TipoPao = {
    id: 1,
    nome: 'Pão de Queijo',
    descricao: 'Pão de queijo tradicional',
    precoBase: 3.50,
    ativo: true,
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
    pedidos: []
  };

  const mockPedidoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockClienteRepository = {
    findOne: jest.fn(),
  };

  const mockTipoPaoRepository = {
    findOne: jest.fn(),
  };

  const mockKafkaProducer = {
    sendPedidoCreated: jest.fn(),
    sendAnalyticsEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        {
          provide: getRepositoryToken(Pedido),
          useValue: mockPedidoRepository,
        },
        {
          provide: getRepositoryToken(Cliente),
          useValue: mockClienteRepository,
        },
        {
          provide: getRepositoryToken(TipoPao),
          useValue: mockTipoPaoRepository,
        },
        {
          provide: KafkaProducerService,
          useValue: mockKafkaProducer,
        },
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
    pedidoRepository = module.get<Repository<Pedido>>(getRepositoryToken(Pedido));
    clienteRepository = module.get<Repository<Cliente>>(getRepositoryToken(Cliente));
    tipoPaoRepository = module.get<Repository<TipoPao>>(getRepositoryToken(TipoPao));
    kafkaProducer = module.get<KafkaProducerService>(KafkaProducerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new pedido successfully', async () => {
      const createPedidoDto: CreatePedidoDto = {
        clienteId: 1,
        tipoPaoId: 1,
        quantidade: 5,
        observacoes: 'Sem sal'
      };

      mockClienteRepository.findOne.mockResolvedValue(mockCliente);
      mockTipoPaoRepository.findOne.mockResolvedValue(mockTipoPao);
      mockPedidoRepository.create.mockReturnValue(mockPedido);
      mockPedidoRepository.save.mockResolvedValue(mockPedido);
      mockKafkaProducer.sendPedidoCreated.mockResolvedValue(undefined);
      mockKafkaProducer.sendAnalyticsEvent.mockResolvedValue(undefined);

      const result = await service.create(createPedidoDto);

      expect(mockClienteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockTipoPaoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, ativo: true }
      });
      expect(mockPedidoRepository.create).toHaveBeenCalledWith({
        ...createPedidoDto,
        status: StatusPedido.REALIZADO,
        precoTotal: 17.50
      });
      expect(mockPedidoRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockPedido);
    });

    it('should throw NotFoundException when cliente not found', async () => {
      const createPedidoDto: CreatePedidoDto = {
        clienteId: 999,
        tipoPaoId: 1,
        quantidade: 5,
      };

      mockClienteRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createPedidoDto)).rejects.toThrow(
        new NotFoundException('Cliente com ID 999 não encontrado')
      );
    });

    it('should throw NotFoundException when tipo de pão not found', async () => {
      const createPedidoDto: CreatePedidoDto = {
        clienteId: 1,
        tipoPaoId: 999,
        quantidade: 5,
      };

      mockClienteRepository.findOne.mockResolvedValue(mockCliente);
      mockTipoPaoRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createPedidoDto)).rejects.toThrow(
        new NotFoundException('Tipo de pão com ID 999 não encontrado ou inativo')
      );
    });
  });

  describe('findAll', () => {
    it('should return all pedidos ordered by dataPedido DESC', async () => {
      const pedidos = [mockPedido];
      mockPedidoRepository.find.mockResolvedValue(pedidos);

      const result = await service.findAll();

      expect(mockPedidoRepository.find).toHaveBeenCalledWith({
        relations: ['cliente', 'tipoPao'],
        order: { dataPedido: 'DESC' }
      });
      expect(result).toEqual(pedidos);
    });
  });

  describe('findOne', () => {
    it('should return a pedido by id', async () => {
      mockPedidoRepository.findOne.mockResolvedValue(mockPedido);

      const result = await service.findOne(1);

      expect(mockPedidoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['cliente', 'tipoPao']
      });
      expect(result).toEqual(mockPedido);
    });

    it('should throw NotFoundException when pedido not found', async () => {
      mockPedidoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Pedido com ID 999 não encontrado')
      );
    });
  });

  describe('update', () => {
    it('should update a pedido successfully', async () => {
      const updatePedidoDto: UpdatePedidoDto = {
        status: StatusPedido.ACEITO,
        quantidade: 6,
      };

      const updatedPedido = { ...mockPedido, ...updatePedidoDto, precoTotal: 21.00 };

      mockPedidoRepository.findOne.mockResolvedValue(mockPedido);
      mockPedidoRepository.save.mockResolvedValue(updatedPedido);
      mockKafkaProducer.sendPedidoUpdated.mockResolvedValue(undefined);
      mockKafkaProducer.sendAnalyticsEvent.mockResolvedValue(undefined);

      const result = await service.update(1, updatePedidoDto);

      expect(mockPedidoRepository.save).toHaveBeenCalledWith(updatedPedido);
      expect(result).toEqual(updatedPedido);
    });

    it('should throw NotFoundException when pedido not found', async () => {
      mockPedidoRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { status: StatusPedido.FINALIZADO })).rejects.toThrow(
        new NotFoundException('Pedido com ID 999 não encontrado')
      );
    });
  });

  describe('remove', () => {
    it('should remove a pedido successfully', async () => {
      mockPedidoRepository.findOne.mockResolvedValue(mockPedido);
      mockPedidoRepository.remove.mockResolvedValue(mockPedido);
      mockKafkaProducer.sendPedidoCancelled.mockResolvedValue(undefined);
      mockKafkaProducer.sendAnalyticsEvent.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockPedidoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['cliente', 'tipoPao']
      });
      expect(mockPedidoRepository.remove).toHaveBeenCalledWith(mockPedido);
    });

    it('should throw NotFoundException when pedido not found', async () => {
      mockPedidoRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('Pedido com ID 999 não encontrado')
      );
    });
  });

  describe('findByStatus', () => {
    it('should return pedidos by status', async () => {
      const pedidos = [mockPedido];
      mockPedidoRepository.find.mockResolvedValue(pedidos);

      const result = await service.findByStatus(StatusPedido.REALIZADO);

      expect(mockPedidoRepository.find).toHaveBeenCalledWith({
        where: { status: StatusPedido.REALIZADO },
        relations: ['cliente', 'tipoPao'],
        order: { dataPedido: 'DESC' }
      });
      expect(result).toEqual(pedidos);
    });
  });

  describe('findByCliente', () => {
    it('should return pedidos by cliente', async () => {
      const pedidos = [mockPedido];
      mockPedidoRepository.find.mockResolvedValue(pedidos);

      const result = await service.findByCliente(1);

      expect(mockPedidoRepository.find).toHaveBeenCalledWith({
        where: { clienteId: 1 },
        relations: ['cliente', 'tipoPao'],
        order: { dataPedido: 'DESC' }
      });
      expect(result).toEqual(pedidos);
    });
  });

  describe('findByTipoPao', () => {
    it('should return pedidos by tipo de pão', async () => {
      const pedidos = [mockPedido];
      mockPedidoRepository.find.mockResolvedValue(pedidos);

      const result = await service.findByTipoPao(1);

      expect(mockPedidoRepository.find).toHaveBeenCalledWith({
        where: { tipoPaoId: 1 },
        relations: ['cliente', 'tipoPao'],
        order: { dataPedido: 'DESC' }
      });
      expect(result).toEqual(pedidos);
    });
  });

  describe('getPedidosRecentes', () => {
    it('should return recent pedidos with limit', async () => {
      const pedidos = [mockPedido];
      mockPedidoRepository.find.mockResolvedValue(pedidos);

      const result = await service.getPedidosRecentes(5);

      expect(mockPedidoRepository.find).toHaveBeenCalledWith({
        relations: ['cliente', 'tipoPao'],
        order: { dataPedido: 'DESC' },
        take: 5
      });
      expect(result).toEqual(pedidos);
    });

    it('should return recent pedidos with default limit', async () => {
      const pedidos = [mockPedido];
      mockPedidoRepository.find.mockResolvedValue(pedidos);

      const result = await service.getPedidosRecentes();

      expect(mockPedidoRepository.find).toHaveBeenCalledWith({
        relations: ['cliente', 'tipoPao'],
        order: { dataPedido: 'DESC' },
        take: 10
      });
      expect(result).toEqual(pedidos);
    });
  });
});

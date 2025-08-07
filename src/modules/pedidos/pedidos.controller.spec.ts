import { Test, TestingModule } from '@nestjs/testing';
import { PedidosController } from './application/controllers/pedidos.controller';
import { PedidosService } from './application/services/pedidos.service';
import { Pedido, StatusPedido } from '../../infrastructure/database/entities/pedido.entity';
import { CreatePedidoDto } from './application/dto/create-pedido.dto';
import { UpdatePedidoDto } from './application/dto/update-pedido.dto';
import { NotFoundException } from '@nestjs/common';

describe('PedidosController', () => {
  let controller: PedidosController;
  let service: PedidosService;

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

  const mockPedidosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByStatus: jest.fn(),
    findByCliente: jest.fn(),
    findByTipoPao: jest.fn(),
    getPedidosRecentes: jest.fn(),
    getStatusOptions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [
        {
          provide: PedidosService,
          useValue: mockPedidosService,
        },
      ],
    }).compile();

    controller = module.get<PedidosController>(PedidosController);
    service = module.get<PedidosService>(PedidosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new pedido', async () => {
      const createPedidoDto: CreatePedidoDto = {
        clienteId: 1,
        tipoPaoId: 1,
        quantidade: 5,
        observacoes: 'Sem sal'
      };

      mockPedidosService.create.mockResolvedValue(mockPedido);

      const result = await controller.create(createPedidoDto);

      expect(service.create).toHaveBeenCalledWith(createPedidoDto);
      expect(result).toEqual(mockPedido);
    });
  });

  describe('findAll', () => {
    it('should return all pedidos', async () => {
      const pedidos = [mockPedido];
      mockPedidosService.findAll.mockResolvedValue(pedidos);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(pedidos);
    });
  });

  describe('getStatusOptions', () => {
    it('should return all status options', async () => {
      const statusOptions = Object.values(StatusPedido);
      mockPedidosService.getStatusOptions.mockResolvedValue(statusOptions);

      const result = await controller.getStatusOptions();

      expect(service.getStatusOptions).toHaveBeenCalled();
      expect(result).toEqual(statusOptions);
    });
  });

  describe('findRecent', () => {
    it('should return recent pedidos', async () => {
      const pedidos = [mockPedido];
      mockPedidosService.getPedidosRecentes.mockResolvedValue(pedidos);

      const result = await controller.findRecent(10);

      expect(service.getPedidosRecentes).toHaveBeenCalledWith(10);
      expect(result).toEqual(pedidos);
    });
  });

  describe('findOne', () => {
    it('should return a pedido by id', async () => {
      mockPedidosService.findOne.mockResolvedValue(mockPedido);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPedido);
    });

    it('should throw NotFoundException when pedido not found', async () => {
      mockPedidosService.findOne.mockRejectedValue(
        new NotFoundException('Pedido com ID 999 não encontrado')
      );

      await expect(controller.findOne(999)).rejects.toThrow(
        new NotFoundException('Pedido com ID 999 não encontrado')
      );
    });
  });

  describe('findByStatus', () => {
    it('should return pedidos by status', async () => {
      const pedidos = [mockPedido];
      mockPedidosService.findByStatus.mockResolvedValue(pedidos);

      const result = await controller.findByStatus(StatusPedido.REALIZADO);

      expect(service.findByStatus).toHaveBeenCalledWith(StatusPedido.REALIZADO);
      expect(result).toEqual(pedidos);
    });
  });

  describe('findByCliente', () => {
    it('should return pedidos by cliente', async () => {
      const pedidos = [mockPedido];
      mockPedidosService.findByCliente.mockResolvedValue(pedidos);

      const result = await controller.findByCliente(1);

      expect(service.findByCliente).toHaveBeenCalledWith(1);
      expect(result).toEqual(pedidos);
    });
  });

  describe('findByTipoPao', () => {
    it('should return pedidos by tipo de pão', async () => {
      const pedidos = [mockPedido];
      mockPedidosService.findByTipoPao.mockResolvedValue(pedidos);

      const result = await controller.findByTipoPao(1);

      expect(service.findByTipoPao).toHaveBeenCalledWith(1);
      expect(result).toEqual(pedidos);
    });
  });

  describe('update', () => {
    it('should update a pedido', async () => {
      const updatePedidoDto: UpdatePedidoDto = {
        status: StatusPedido.ACEITO,
        quantidade: 6,
      };

      const updatedPedido = { ...mockPedido, ...updatePedidoDto };
      mockPedidosService.update.mockResolvedValue(updatedPedido);

      const result = await controller.update(1, updatePedidoDto);

      expect(service.update).toHaveBeenCalledWith(1, updatePedidoDto);
      expect(result).toEqual(updatedPedido);
    });

    it('should throw NotFoundException when pedido not found', async () => {
      const updatePedidoDto: UpdatePedidoDto = {
        status: StatusPedido.FINALIZADO,
      };

      mockPedidosService.update.mockRejectedValue(
        new NotFoundException('Pedido com ID 999 não encontrado')
      );

      await expect(controller.update(999, updatePedidoDto)).rejects.toThrow(
        new NotFoundException('Pedido com ID 999 não encontrado')
      );
    });
  });

  describe('remove', () => {
    it('should remove a pedido', async () => {
      mockPedidosService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when pedido not found', async () => {
      mockPedidosService.remove.mockRejectedValue(
        new NotFoundException('Pedido com ID 999 não encontrado')
      );

      await expect(controller.remove(999)).rejects.toThrow(
        new NotFoundException('Pedido com ID 999 não encontrado')
      );
    });
  });
});

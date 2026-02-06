/**
 * Admin Settlements Controller
 * Endpoints for managing VND settlements of matched orders
 */
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { AdminSettlementsService } from './admin-settlements.service';
import {
  PendingSettlementDto,
  SettlementHistoryQueryDto,
  SettlementsListResponseDto,
  SettleMatchResponseDto,
} from './dto/admin-settlements.dto';

@Controller('admin/settlements')
@UseGuards(AdminAuthGuard)
export class AdminSettlementsController {
  constructor(private settlementsService: AdminSettlementsService) {}

  /**
   * List pending VND settlements
   * GET /admin/settlements/pending
   */
  @Get('pending')
  async listPending(): Promise<PendingSettlementDto[]> {
    return this.settlementsService.listPendingSettlements();
  }

  /**
   * Settle a single match (mark VND as disbursed)
   * POST /admin/settlements/:matchId/settle
   */
  @Post(':matchId/settle')
  async settleMatch(
    @Param('matchId') matchId: string,
    @Request() req: any,
  ): Promise<SettleMatchResponseDto> {
    const adminId = req.user?.userId || 'admin';
    return this.settlementsService.settleMatch(matchId, adminId);
  }

  /**
   * List settlement history
   * GET /admin/settlements/history
   */
  @Get('history')
  async listHistory(
    @Query() query: SettlementHistoryQueryDto,
  ): Promise<SettlementsListResponseDto> {
    return this.settlementsService.listSettlementHistory(query);
  }
}

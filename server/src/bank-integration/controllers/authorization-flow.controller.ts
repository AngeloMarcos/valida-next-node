import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { AuthorizationFlowService } from '../services/authorization-flow.service';
import { StartAuthorizationDto } from '../dto/bank-integration.dto';

@Controller('authorization-flow')
export class AuthorizationFlowController {
  constructor(private readonly flowService: AuthorizationFlowService) {}

  @Post('start/:proposalId')
  async start(
    @Param('proposalId') proposalId: string,
    @Body() body: StartAuthorizationDto,
  ) {
    const result = await this.flowService.start(
      parseInt(proposalId, 10),
      body.bankCode,
    );
    return result;
  }

  @Get(':proposalId/summary')
  async getSummary(@Param('proposalId') proposalId: string) {
    const summary = await this.flowService.getSummary(
      parseInt(proposalId, 10),
    );
    return summary;
  }

  @Delete(':proposalId/cancel')
  async cancel(@Param('proposalId') proposalId: string) {
    const result = await this.flowService.cancel(parseInt(proposalId, 10));
    return result;
  }
}

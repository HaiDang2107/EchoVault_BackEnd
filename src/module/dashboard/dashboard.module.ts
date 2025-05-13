import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { NotificationModule } from "../notification/notification.module";

@Module({
    imports: [PrismaModule, NotificationModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
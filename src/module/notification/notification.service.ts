import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApiResponseDto } from "./dto/response.dto";
import { NewNotificationDto, NotificationType } from "./dto/capsuleNoti.dto";

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) {}

    async createScheduledNotificationsForCapsule(
        capsuleId: string,
        userId: string,
        openingTime: Date,
        notificationInterval: number
    ): Promise<void> {
        if (typeof openingTime === 'string') {
            console.log('Date is a string:', openingTime);
            // Attempt to parse the string into a Date object
            openingTime = new Date(openingTime);
          }
        if (!(openingTime instanceof Date) || isNaN(openingTime.getTime())) {
            console.log('Invalid openingTime:', openingTime);
            throw new Error('Invalid openingTime. It must be a valid Date object.');
          }

        console.log('Capsule ID althogh not created:', capsuleId);
        const notifications: NewNotificationDto[] = [];
        const now = new Date();
        for (let i = 0; i < notificationInterval; i++) {
            const notiTime = new Date(openingTime);
            notiTime.setDate(notiTime.getDate() - i);           
            if (notiTime > now) {
                notifications.push({
                    userId: userId,
                    capsuleId: capsuleId,
                    notificationType: NotificationType.CapsuleOpening,
                    message: `Your capsule will be openable on ${openingTime.toISOString()}`,
                    notiTime: notiTime,
                    isSent: false,
                    isRead: false,
                });
            }
        }
        if (notifications.length > 0) {
            await this.prisma.notifications.createMany({
                data: notifications,
                skipDuplicates: true,
            });
        }
    }

    async createImmediateNotification(
        userId: string,
        notificationType: NotificationType,
        message: string,
        capsuleId?: string,
    ): Promise<void> {
        const now = new Date();
        await this.prisma.notifications.create({
            data: {
                userId,
                capsuleId: capsuleId || null,
                notificationType,
                message,
                notiTime: now,
                isSent: true,
                isRead: false,
            },
        });
        console.log(`Notification created for user ${userId}: ${message}`);
    }

    

    async getPendingNotifications(): Promise<any[]> {
        const now = new Date();
        return this.prisma.notifications.findMany({
            where: {
                notiTime: { lte: now },
                isSent: false,
            },
        });
    }

    async markNotificationAsSent(notificationId: string): Promise<void> {
        await this.prisma.notifications.update({
            where: { notificationId: notificationId },
            data: { isSent: true },
        });
    }

    async getUserNotifications(userId: string): Promise<ApiResponseDto> {
        // Mark pending notifications as sent for this user
        const pendingNotifications = await this.getPendingNotifications();
        for (const notification of pendingNotifications) {
            if (notification.userId === userId) {
                await this.markNotificationAsSent(notification.notificationId);
            }
        }

        // Fetch unread and sent notifications for the user, limited to 10 latest
        const notifications = await this.prisma.notifications.findMany({
            where: { userId: userId, isSent: true },
            orderBy: { notiTime: 'desc' },
            take: 10,
        });

        // Mark all fetched notifications as read
        const notificationIds = notifications.map((notification) => notification.notificationId);
        if (notificationIds.length > 0) {
            await this.prisma.notifications.updateMany({
                where: { notificationId: { in: notificationIds } },
                data: { isRead: true },
            });
        }

        return {
            statusCode: 200,
            message: 'Success',
            data: notifications,
        } as ApiResponseDto;
    }
}

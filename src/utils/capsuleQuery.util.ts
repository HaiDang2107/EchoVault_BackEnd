import { PrismaService } from 'src/module/prisma/prisma.service';

export async function getYourViewCapsuleQuery(
  prisma: PrismaService,
  userId: string,
  page: number,
  limit: number,
  statusFilter?: string | null,
): Promise<any[]> {
  const capsules = await prisma.$queryRaw<any[]>`
    SELECT * FROM get_capsule_dashboard(
      ${userId}::uuid,
      ${page}::int,
      ${limit}::int,
      ${statusFilter ?? null}::text
    );
  `;
  return capsules;
}

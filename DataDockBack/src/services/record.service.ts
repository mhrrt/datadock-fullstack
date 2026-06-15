import prisma from "../config/prisma";

interface SearchParams {
  page: number;
  limit: number;
  search?: string;
  interest?: string;
}

export async function searchRecords(params: SearchParams) {
  const { page, limit, search, interest } = params;

  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        remark: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        note: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (interest) {
    whereClause.interest = interest;
  }

  const [rows, total] = await Promise.all([
    prisma.customer.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.customer.count({
      where: whereClause,
    }),
  ]);

  return {
    rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getNextCodeName(): Promise<string> {
  const customer = await prisma.customer.findFirst({
    where: {
      codeName: {
        not: null,
      },
    },
    orderBy: {
      codeName: "desc",
    },
    select: {
      codeName: true,
    },
  });

  return String(Number(customer?.codeName || 0) + 1);
}

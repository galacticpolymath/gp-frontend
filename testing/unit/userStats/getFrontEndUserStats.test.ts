import { getFrontEndUserStats } from "../../../backend/services/userStatsService";
import { connectToMongodb } from "../../../backend/utils/connection";
import { getUsers } from "../../../backend/services/userServices";

jest.mock("../../../backend/utils/connection", () => ({
  connectToMongodb: jest.fn(),
}));

jest.mock("../../../backend/services/userServices", () => ({
  getUsers: jest.fn(),
}));

const mockedConnectToMongodb = connectToMongodb as jest.MockedFunction<
  typeof connectToMongodb
>;
const mockedGetUsers = getUsers as jest.MockedFunction<typeof getUsers>;

describe("getFrontEndUserStats", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.GP_STATS_DB_TYPE;
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses the env-selected database without switching to the larger fallback dataset", async () => {
    process.env.VERCEL_ENV = "production";

    mockedConnectToMongodb.mockResolvedValueOnce({ wasSuccessful: true });
    mockedGetUsers.mockResolvedValueOnce({
      users: [
        {
          country: "United States",
          zipCode: "60601",
          classSize: 25,
        },
      ],
    } as Awaited<ReturnType<typeof getUsers>>);

    const stats = await getFrontEndUserStats();

    expect(mockedConnectToMongodb).toHaveBeenCalledTimes(1);
    expect(mockedConnectToMongodb).toHaveBeenCalledWith(
      10_000,
      0,
      true,
      "production"
    );
    expect(mockedGetUsers).toHaveBeenCalledTimes(1);
    expect(stats.totalUsers).toBe(1);
    expect(stats.totalStudents).toBe(25);
    expect(stats.debug?.dbType).toBe("production");
  });

  it("honors an explicit preferred database for callers that must always read production", async () => {
    process.env.VERCEL_ENV = "preview";

    mockedConnectToMongodb.mockResolvedValueOnce({ wasSuccessful: true });
    mockedGetUsers.mockResolvedValueOnce({
      users: [
        {
          country: "United States",
          zipCode: "73301",
          classSize: 120,
        },
      ],
    } as Awaited<ReturnType<typeof getUsers>>);

    const stats = await getFrontEndUserStats("production");

    expect(mockedConnectToMongodb).toHaveBeenCalledTimes(1);
    expect(mockedConnectToMongodb).toHaveBeenCalledWith(
      10_000,
      0,
      true,
      "production"
    );
    expect(stats.totalUsers).toBe(1);
    expect(stats.totalStudents).toBe(120);
    expect(stats.debug?.dbType).toBe("production");
  });

  it("falls back to the env-selected database when a preferred production read is unavailable", async () => {
    process.env.VERCEL_ENV = "preview";

    mockedConnectToMongodb
      .mockResolvedValueOnce({ wasSuccessful: false })
      .mockResolvedValueOnce({ wasSuccessful: true });
    mockedGetUsers.mockResolvedValueOnce({
      users: [
        {
          country: "United States",
          zipCode: "60601",
          classSize: 40,
        },
      ],
    } as Awaited<ReturnType<typeof getUsers>>);

    const stats = await getFrontEndUserStats("production");

    expect(mockedConnectToMongodb).toHaveBeenCalledTimes(2);
    expect(mockedConnectToMongodb).toHaveBeenNthCalledWith(
      1,
      10_000,
      0,
      true,
      "production"
    );
    expect(mockedConnectToMongodb).toHaveBeenNthCalledWith(
      2,
      10_000,
      0,
      true,
      "dev"
    );
    expect(stats.totalUsers).toBe(1);
    expect(stats.totalStudents).toBe(40);
    expect(stats.debug?.dbType).toBe("dev");
  });

  it("falls back to the secondary database only when the primary database cannot be read", async () => {
    process.env.VERCEL_ENV = "production";

    mockedConnectToMongodb
      .mockResolvedValueOnce({ wasSuccessful: false })
      .mockResolvedValueOnce({ wasSuccessful: true });
    mockedGetUsers.mockResolvedValueOnce({
      users: [
        {
          country: "Canada",
          classSize: 31,
        },
        {
          country: "United States",
          zipCode: "10001",
          classSize: 18,
        },
      ],
    } as Awaited<ReturnType<typeof getUsers>>);

    const stats = await getFrontEndUserStats();

    expect(mockedConnectToMongodb).toHaveBeenCalledTimes(2);
    expect(mockedConnectToMongodb).toHaveBeenNthCalledWith(
      1,
      10_000,
      0,
      true,
      "production"
    );
    expect(mockedConnectToMongodb).toHaveBeenNthCalledWith(
      2,
      10_000,
      0,
      true,
      "dev"
    );
    expect(mockedGetUsers).toHaveBeenCalledTimes(1);
    expect(stats.totalUsers).toBe(2);
    expect(stats.totalStudents).toBe(49);
    expect(stats.debug?.dbType).toBe("dev");
  });
});

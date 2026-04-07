using StackExchange.Redis;

public class RedisService
{
    private readonly ConnectionMultiplexer _redis;

    public RedisService(string connectionString)
    {
        _redis = ConnectionMultiplexer.Connect(connectionString);
    }

    public IDatabase GetDb() => _redis.GetDatabase();
}
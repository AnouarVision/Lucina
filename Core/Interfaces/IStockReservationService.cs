namespace Core.Interfaces;

public interface IStockReservationService
{
    Task ReserveAsync(string userId, int productId, int quantity);

    Task ReleaseAsync(string userId, int productId);

    Task<int> GetTotalReservedAsync(int productId);

    Task<int> GetUserReservedAsync(string userId, int productId);

    Task RefreshForUserAsync(string userId, IEnumerable<int> productIds);
}
